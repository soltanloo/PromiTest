// @ts-ignore
import { parse } from 'espree';
import { FunctionDefinition } from '../types/Callgraph.type';
import * as fs from 'fs';
// @ts-ignore
import * as estraverse from 'estraverse';
import { Position } from '../types/File.type';
import RuntimeConfig from '../components/configuration/RuntimeConfig';

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
        column: column,
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
                node.type === 'ArrowFunctionExpression'
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
                    location: `${filePath}:${name}:${node.loc!.start.line}:${node.loc!.start.column}:${node.loc!.end.line}:${node.loc!.end.column}`,
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
                                        nestedNode.right.name === functionName
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
                                    if (nestedNode.type === 'CallExpression') {
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
                                            funcVariableNames.has(callee.name)
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
        },
    });

    return isUsingFunction;
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
