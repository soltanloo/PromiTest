// @ts-ignore
import {parse} from 'espree';
import {FunctionDefinition, Position} from '../types/Callgraph.type';
import * as fs from 'fs';
// @ts-ignore
import * as estraverse from 'estraverse';
import * as path from 'path';


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

export function parseFunctionDefinitions(filePath: string): FunctionDefinition[] {
    const code = fs.readFileSync(filePath, 'utf-8');
    const functionDefinitions: FunctionDefinition[] = [];

    const ast = parse(code, {
        ecmaVersion: 2021,
        sourceType: 'module',
        loc: true
    });

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

                functionDefinitions.push({
                    name,
                    start: toPosition(node.loc!.start),
                    end: toPosition(node.loc!.end),
                    file: filePath
                });
            }
        }
    })

    return functionDefinitions;
}