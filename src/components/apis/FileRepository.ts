import {FunctionDefinition} from "../../types/Callgraph.type";
import {parseFunctionDefinitions} from "../../utils/AST";
import {Position} from "../../types/File.type";

export default class FileRepository {
    private static readonly functionDefinitions: Map<string, FunctionDefinition[]> = new Map();

    //TODO: Could be modified to return the first enclosing non-anonymous function
    public static getEnclosingFunction(filePath: string, {startPosition, endPosition}: {
        startPosition: Position,
        endPosition: Position
    }): FunctionDefinition | undefined {
        FileRepository.parseFileForFunctions(filePath);

        const functions = FileRepository.functionDefinitions.get(filePath) || [];
        let enclosingFunction: FunctionDefinition | undefined;

        functions.forEach(func => {
            const isStartBeforeOrEqual = (func.start.row < startPosition.row) ||
                (func.start.row === startPosition.row && func.start.column <= startPosition.column);
            const isEndAfterOrEqual = (func.end.row > endPosition.row) ||
                (func.end.row === endPosition.row && func.end.column >= endPosition.column);


            if (isStartBeforeOrEqual && isEndAfterOrEqual) {
                const isMoreDeeplyNested = !enclosingFunction ||
                    (func.start.row > enclosingFunction.start.row ||
                        (func.start.row === enclosingFunction.start.row && func.start.column >= enclosingFunction.start.column)) &&
                    (func.end.row < enclosingFunction.end.row ||
                        (func.end.row === enclosingFunction.end.row && func.end.column <= enclosingFunction.end.column));


                if (isMoreDeeplyNested) {
                    enclosingFunction = func;
                }

            }
        });

        return enclosingFunction;
    }

    private static parseFileForFunctions(filePath: string) {
        if (!FileRepository.functionDefinitions.has(filePath)) {
            const functionDefinitions = parseFunctionDefinitions(filePath);
            FileRepository.functionDefinitions.set(filePath, functionDefinitions);
        }
    }
}