// @ts-ignore
import {parse} from 'espree';
import {FunctionDefinition} from '../types/Callgraph.type';
import * as fs from 'fs';
// @ts-ignore
import * as estraverse from 'estraverse';
import {Position} from "../types/File.type";
import RuntimeConfig from "../components/configuration/RuntimeConfig";

interface EspreeNode {
    type: string;
    id?: { name: string };
    loc?: {
        start: { line: number, column: number },
        end: { line: number, column: number }
    };
    parent?: EspreeNode;

    [key: string]: any; // Allow for other properties in Espree nodes
}

function toPosition({line, column}: { line: number, column: number }): Position {
    return {
        row: line,
        column: column
    };
}

function detectExports(ast: any): Set<string> {
    const exportedFunctions: Set<string> = new Set();

    estraverse.traverse(ast, {
        enter: (node: EspreeNode) => {
            if (node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration') {
                if (node.declaration && (node.declaration.type === 'FunctionDeclaration' || node.declaration.type === 'VariableDeclaration')) {
                    if (node.declaration.type === 'FunctionDeclaration') {
                        exportedFunctions.add(node.declaration.id.name);
                    } else if (node.declaration.type === 'VariableDeclaration') {
                        node.declaration.declarations.forEach((declarator: any) => {
                            if (declarator.id.type === 'Identifier') {
                                exportedFunctions.add(declarator.id.name);
                            }
                        });
                    }
                } else if (node.specifiers) {
                    node.specifiers.forEach((specifier: any) => {
                        exportedFunctions.add(specifier.exported.name);
                    });
                }
            } else if (node.type === 'AssignmentExpression' && node.left.type === 'MemberExpression' &&
                node.left.object.type === 'Identifier' && node.left.object.name === 'module' &&
                node.left.property.type === 'Identifier' && node.left.property.name === 'exports') {

                if (node.right.type === 'Identifier') {
                    exportedFunctions.add(node.right.name);
                } else if (node.right.type === 'ObjectExpression') {
                    node.right.properties.forEach((property: any) => {
                        if (property.value.type === 'Identifier') {
                            exportedFunctions.add(property.value.name);
                        }
                    });
                }
            }
        }
    });

    return exportedFunctions;
}

export function parseFunctionDefinitions(filePath: string): FunctionDefinition[] {
    const code = fs.readFileSync(filePath, 'utf-8');
    const functionDefinitions: FunctionDefinition[] = [];
    const RC = RuntimeConfig.getInstance().config;


    const ast = parse(code, {
        ecmaVersion: 2021,
        sourceType: 'module',
        loc: true
    });

    const exportedFunctions = detectExports(ast);

    estraverse.traverse(ast, {
        enter: (node: EspreeNode, parent: EspreeNode) => {
            if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
                const functionNode = node;
                let name = 'anonymous';

                if (functionNode.id) {
                    name = functionNode.id.name;
                } else if (node.type === 'ArrowFunctionExpression' && parent?.type === 'VariableDeclarator') {
                    name = parent!.id!.name;
                }

                const exported = exportedFunctions.has(name);

                // Extract the source code of the function
                const start = functionNode.loc!.start;
                const end = functionNode.loc!.end;
                const functionCode = code.split('\n').slice(start.line - 1, end.line)
                    .map((line, index) => {
                        if (index === 0) {
                            return line.slice(start.column);
                        } else if (index === (end.line - start.line)) {
                            return line.slice(0, end.column);
                        }
                        return line;
                    }).join('\n');

                filePath = filePath.replace(RC.projectPath, '');

                let functionDefinition = {
                    location: `${filePath}:${name}:${node.loc!.start.line}:${node.loc!.start.column}:${node.loc!.end.line}:${node.loc!.end.column}`,
                    name,
                    start: toPosition(node.loc!.start),
                    end: toPosition(node.loc!.end),
                    file: filePath,
                    exported,
                    sourceCode: functionCode,
                }
                functionDefinitions.push(functionDefinition);
            }
        }
    });

    return functionDefinitions;
}