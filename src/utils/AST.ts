// @ts-ignore
import { parse } from 'espree';
import { FunctionDefinition } from '../types/Callgraph.type';
import * as fs from 'fs';
// @ts-ignore
import * as estraverse from 'estraverse';
import { Position } from '../types/File.type';
import RuntimeConfig from '../components/configuration/RuntimeConfig';
import logger from './logger';
// @ts-ignore
import * as escodegen from 'escodegen';
import { child } from 'winston';

interface EspreeNode {
    type: string;
    id?: { name: string };
    loc?: {
        start: { line: number; column: number };
        end: { line: number; column: number };
    };
    parent?: EspreeNode;

    [key: string]: any; // Allow for other properties in Espree nodes
}

function toPosition({
    line,
    column,
}: {
    line: number;
    column: number;
}): Position {
    return {
        row: line,
        column: column + 1, // Since it's zero based!
    };
}

interface ExportInfo {
    exports: Set<string>;
    defaultExport: string | null;
    renamedExports: Map<string, string>; // Mapping from local name to exported name
}

export function detectExports(ast: EspreeNode): ExportInfo {
    const exportedFunctions: Set<string> = new Set();
    let defaultExport: string | null = null;
    const renamedExports: Map<string, string> = new Map();

    estraverse.traverse(ast, {
        enter: (node: EspreeNode) => {
            if (node.type === 'ExportNamedDeclaration') {
                if (
                    node.declaration &&
                    (node.declaration.type === 'FunctionDeclaration' ||
                        node.declaration.type === 'VariableDeclaration')
                ) {
                    if (node.declaration.type === 'FunctionDeclaration') {
                        exportedFunctions.add(node.declaration.id.name);
                    } else if (
                        node.declaration.type === 'VariableDeclaration'
                    ) {
                        node.declaration.declarations.forEach(
                            (declarator: any) => {
                                if (declarator.id.type === 'Identifier') {
                                    exportedFunctions.add(declarator.id.name);
                                }
                            },
                        );
                    }
                } else if (node.specifiers) {
                    node.specifiers.forEach((specifier: any) => {
                        exportedFunctions.add(specifier.exported.name);
                        if (specifier.exported.name !== specifier.local.name) {
                            renamedExports.set(
                                specifier.local.name,
                                specifier.exported.name,
                            );
                        }
                    });
                }
            } else if (node.type === 'ExportDefaultDeclaration') {
                if (node.declaration.type === 'FunctionDeclaration') {
                    defaultExport = node.declaration.id
                        ? node.declaration.id.name
                        : 'default';
                } else if (node.declaration.type === 'Identifier') {
                    defaultExport = node.declaration.name;
                } else {
                    defaultExport = 'default';
                }
            } else if (
                node.type === 'AssignmentExpression' &&
                node.left.type === 'MemberExpression' &&
                node.left.object.type === 'Identifier' &&
                node.left.object.name === 'module' &&
                node.left.property.type === 'Identifier' &&
                node.left.property.name === 'exports'
            ) {
                if (node.right.type === 'Identifier') {
                    exportedFunctions.add(node.right.name);
                    defaultExport = node.right.name;
                } else if (node.right.type === 'ObjectExpression') {
                    node.right.properties.forEach((property: any) => {
                        if (
                            property.key.type === 'Identifier' &&
                            property.value.type === 'Identifier'
                        ) {
                            exportedFunctions.add(property.value.name);
                            if (property.key.name !== property.value.name) {
                                renamedExports.set(
                                    property.value.name,
                                    property.key.name,
                                );
                            }
                        }
                    });
                }
            } else if (
                node.type === 'AssignmentExpression' &&
                node.left.type === 'MemberExpression' &&
                node.left.object.type === 'Identifier' &&
                node.left.object.name === 'exports'
            ) {
                if (
                    node.left.property.type === 'Identifier' &&
                    node.right.type === 'Identifier'
                ) {
                    exportedFunctions.add(node.right.name);
                    renamedExports.set(
                        node.right.name,
                        node.left.property.name,
                    );
                } else if (
                    node.left.property.type === 'Identifier' &&
                    node.right.type === 'FunctionExpression'
                ) {
                    exportedFunctions.add(node.left.property.name);
                } else if (
                    node.left.property.type === 'Identifier' &&
                    node.right.type === 'ObjectExpression'
                ) {
                    node.right.properties.forEach((property: any) => {
                        if (
                            property.key.type === 'Identifier' &&
                            property.value.type === 'Identifier'
                        ) {
                            exportedFunctions.add(property.value.name);
                            if (property.key.name !== property.value.name) {
                                renamedExports.set(
                                    property.value.name,
                                    property.key.name,
                                );
                            }
                        }
                    });
                }
            }
        },
    });

    return {
        exports: exportedFunctions,
        defaultExport: defaultExport,
        renamedExports: renamedExports,
    };
}

export function parseFunctionDefinitions(
    filePath: string,
): FunctionDefinition[] {
    const code = fs.readFileSync(filePath, 'utf-8');
    const functionDefinitions: FunctionDefinition[] = [];
    const RC = RuntimeConfig.getInstance().config;

    // Get the lines of code
    const lines = code.split('\n');

    // Add the entire file as a function definition
    const fileDefinition: FunctionDefinition = {
        location: `${filePath}:file:1:1:${lines.length}:${lines[lines.length - 1].length + 1}`, // Correct end position
        name: 'entireFile',
        start: { row: 1, column: 1 }, // Starting at the beginning of the file
        end: { row: lines.length, column: lines[lines.length - 1].length + 1 }, // Correct end: last line, last character
        file: filePath.replace(RC.projectPath, ''),
        exportInfo: {
            exported: false,
            defaultExport: false,
            exportedAs: '',
        },
        sourceCode: code,
    };
    functionDefinitions.push(fileDefinition);
    const ast = parse(code, {
        ecmaVersion: 2021,
        sourceType: 'module',
        loc: true,
    });

    const exportedFunctions = detectExports(ast);

    estraverse.traverse(ast, {
        enter: (node: EspreeNode, parent: EspreeNode) => {
            if (
                node.type === 'FunctionDeclaration' ||
                node.type === 'FunctionExpression' ||
                node.type === 'ArrowFunctionExpression' ||
                (node.type === 'MethodDefinition' &&
                    node.key.type === 'Identifier')
            ) {
                const functionNode = node;
                let name = 'anonymous';

                if (functionNode.id) {
                    name = functionNode.id.name;
                } else if (
                    node.type === 'ArrowFunctionExpression' &&
                    parent?.type === 'VariableDeclarator'
                ) {
                    name = parent!.id!.name;
                } else if (node.type === 'MethodDefinition') {
                    name = functionNode.key.name;
                }

                const exported = exportedFunctions.exports.has(name);
                const defaultExport = exportedFunctions.defaultExport === name;
                const exportedAs = exported
                    ? exportedFunctions.renamedExports.has(name)
                        ? exportedFunctions.renamedExports.get(name)
                        : name
                    : '';

                const exportInfo = {
                    exported,
                    defaultExport,
                    exportedAs,
                };

                // Extract the source code of the function
                const start = functionNode.loc!.start;
                const end = functionNode.loc!.end;
                const functionCode = code
                    .split('\n')
                    .slice(start.line - 1, end.line)
                    .map((line, index) => {
                        if (end.line === start.line) {
                            return line.slice(start.column, end.column);
                        }
                        if (index === 0) {
                            return line.slice(start.column);
                        } else if (index === end.line - start.line) {
                            return line.slice(0, end.column);
                        }
                        return line;
                    })
                    .join('\n');

                filePath = filePath.replace(RC.projectPath, '');

                let functionDefinition = {
                    location: `${filePath}:${name}:${node.loc!.start.line}:${node.loc!.start.column + 1}:${node.loc!.end.line}:${node.loc!.end.column + 1}`,
                    name,
                    start: toPosition(node.loc!.start),
                    end: toPosition(node.loc!.end),
                    file: filePath,
                    exportInfo,
                    sourceCode: functionCode,
                };
                functionDefinitions.push(functionDefinition);
            }
        },
    });

    return functionDefinitions;
}

export function isPromiseCalling(code: string, functionName: string): boolean {
    try {
        const ast = parse(code, {
            ecmaVersion: 2021,
            sourceType: 'module',
            loc: true,
        });

        let isUsingFunction = false;

        estraverse.traverse(ast, {
            enter(node: EspreeNode, parent: EspreeNode) {
                if (
                    node.type === 'NewExpression' &&
                    node.callee.name === 'Promise'
                ) {
                    let funcVariableNames = new Set();

                    estraverse.traverse(node, {
                        enter(innerNode: EspreeNode, innerParent: EspreeNode) {
                            if (
                                innerNode.type === 'FunctionExpression' ||
                                innerNode.type === 'ArrowFunctionExpression'
                            ) {
                                estraverse.traverse(innerNode, {
                                    enter(
                                        nestedNode: EspreeNode,
                                        nestedParent: EspreeNode,
                                    ) {
                                        // Track assignments of the function (resolve or reject)
                                        if (
                                            nestedNode.type ===
                                                'AssignmentExpression' &&
                                            nestedNode.right.type ===
                                                'Identifier' &&
                                            nestedNode.right.name ===
                                                functionName
                                        ) {
                                            if (
                                                nestedNode.left.type ===
                                                'Identifier'
                                            ) {
                                                funcVariableNames.add(
                                                    nestedNode.left.name,
                                                );
                                                isUsingFunction = true; //Because we just check the assignment and not if it's actually called later
                                            } else if (
                                                nestedNode.left.type ===
                                                    'MemberExpression' &&
                                                nestedNode.left.object.type ===
                                                    'ThisExpression'
                                            ) {
                                                funcVariableNames.add(
                                                    `this.${nestedNode.left.property.name}`,
                                                );
                                                isUsingFunction = true;
                                            }
                                        }

                                        // Check for direct or deferred use of the function
                                        if (
                                            nestedNode.type === 'CallExpression'
                                        ) {
                                            const callee = nestedNode.callee;
                                            if (
                                                callee.type === 'Identifier' &&
                                                callee.name === functionName
                                            ) {
                                                isUsingFunction = true;
                                            } else if (
                                                callee.type ===
                                                    'MemberExpression' &&
                                                funcVariableNames.has(
                                                    `this.${callee.property.name}`,
                                                )
                                            ) {
                                                isUsingFunction = true;
                                            } else if (
                                                callee.type === 'Identifier' &&
                                                funcVariableNames.has(
                                                    callee.name,
                                                )
                                            ) {
                                                isUsingFunction = true;
                                            }
                                        }

                                        // Check for throw statements if the function is 'reject'
                                        if (
                                            functionName === 'reject' &&
                                            nestedNode.type === 'ThrowStatement'
                                        ) {
                                            isUsingFunction = true;
                                        }
                                    },
                                });
                            }
                        },
                    });

                    if (isUsingFunction) {
                        return estraverse.VisitorOption.Break; // Stop traversal early if found
                    }
                }
                if (
                    (node.type === 'FunctionDeclaration' ||
                        node.type === 'FunctionExpression' ||
                        node.type === 'ArrowFunctionExpression') &&
                    node.async
                ) {
                    estraverse.traverse(node, {
                        enter(nestedNode: EspreeNode) {
                            // Check for throw statements if the function is 'reject'
                            if (
                                functionName === 'reject' &&
                                nestedNode.type === 'ThrowStatement'
                            ) {
                                isUsingFunction = true;
                            }
                        },
                    });

                    if (isUsingFunction) {
                        return estraverse.VisitorOption.Break; // Stop traversal early if found
                    }
                }
            },
        });

        return isUsingFunction;
    } catch (e) {
        logger.error(e);
        throw e;
    }
}

export function detectModuleSystem(filePath: string): string {
    const data = fs.readFileSync(filePath, 'utf8');

    const hasRequire = data.includes('require(');
    const hasModuleExports = data.includes('module.exports');
    const hasExports = data.includes('exports');
    const hasImport = data.includes('import ');
    const hasExport = data.includes('export ');
    const hasDefine = data.includes('define(');
    const hasSystemImport = data.includes('System.import');
    const hasSystemRegister = data.includes('System.register');

    if (hasRequire || hasModuleExports || hasExports) {
        return 'CommonJS';
    } else if (hasImport || hasExport) {
        return 'ES Modules (ESM)';
    } else if (hasDefine) {
        return 'AMD';
    } else if (hasSystemImport || hasSystemRegister) {
        return 'SystemJS';
    } else {
        return 'Unknown or unsupported module system';
    }
}

export function extractTestMetaData(
    filePath: string,
    titlePath: string[],
): string {
    const code = fs.readFileSync(filePath, 'utf-8');
    const ast = parse(code, {
        ecmaVersion: 2021,
        sourceType: 'module',
        range: true,
        loc: true,
    });

    // Recursive function to match nodes against the title path
    function matchTitlePath(node: EspreeNode, titles: string[]): boolean {
        if (titles.length === 0) {
            // All titles have been matched
            return true;
        }

        if (
            !node ||
            node.type !== 'CallExpression' ||
            (node.callee.name !== 'describe' && node.callee.name !== 'it')
        ) {
            // Node is not a valid 'describe' or 'it' call
            return false;
        }

        const [firstArg] = node.arguments;
        if (firstArg.type !== 'Literal' || firstArg.value !== titles[0]) {
            // Title does not match
            return false;
        }

        if (titles.length === 1) {
            // Last title matched
            return true;
        }

        // Recursively search in the child 'describe' or 'it' blocks
        const bodyNodes = node.arguments[1]?.body?.body || [];
        for (const childNode of bodyNodes) {
            if (
                childNode.type === 'ExpressionStatement' &&
                childNode.expression.type === 'CallExpression' &&
                (childNode.expression.callee.name === 'describe' ||
                    childNode.expression.callee.name === 'it')
            ) {
                if (matchTitlePath(childNode.expression, titles.slice(1))) {
                    return true;
                }
            }
        }

        // No matching child found
        return false;
    }

    // Function to recursively filter the AST
    function filterAST(node: EspreeNode, titles: string[]) {
        if (node.type === 'Program') {
            node.body = node.body.filter((child: EspreeNode) =>
                filterAST(child, titles),
            );
        } else if (
            node.type === 'ExpressionStatement' &&
            node.expression.type === 'CallExpression'
        ) {
            const expr = node.expression;
            const isHook = [
                'beforeEach',
                'afterEach',
                'before',
                'after',
            ].includes(expr?.callee?.name);
            if (isHook) return true;

            if (matchTitlePath(expr, titles)) {
                if (titles.length === 1) {
                    // Keep this node
                    return true;
                } else {
                    // Recursively filter the child nodes
                    expr.arguments[1].body.body =
                        expr.arguments[1].body.body.filter(
                            (childNode: EspreeNode) => {
                                return filterAST(childNode, titles.slice(1));
                            },
                        );
                    return true;
                }
            }

            // For unmatched nodes at other levels
            return false;
        }

        // Keep other nodes (e.g., import statements)
        return true;
    }

    // Apply the filter to the AST
    filterAST(ast, titlePath);

    // Generate the new code using escodegen
    const outputCode = escodegen.generate(ast);
    return outputCode;
}
