import {FileDetails, FunctionDefinition, JSCallgraphOutput} from "../types/Callgraph.type";
// @ts-ignore
import JCG from '@persper/js-callgraph';
import RuntimeConfig from "./RuntimeConfig";
import {CallGraph} from "./CallGraph";
import {parseFunctionDefinitions} from "../utils/AST";


export default class CallgraphGenerator {

    private _jscallgraph: JSCallgraphOutput;
    private _refinedCallgraph: CallGraph;
    private functionDefinitions: Map<string, FunctionDefinition[]> = new Map();

    constructor() {
        const RC = RuntimeConfig.getInstance();

        const args = {strategy: "FULL", output: null, cg: 'cg'};
        JCG.setArgs(args);
        JCG.setFiles([RC.config.projectPath + '/']);
        JCG.setFilter(['+^.*\\.js$', '-^.*node_modules\\/.*\\.js$',]);
        JCG.setConsoleOutput(false);
        this._jscallgraph = JCG.build();

        // Replaces the start and end point of source nodes with their enclosing function's start and end points
        // (we don't need the call site; we need the enclosing function)
        this._jscallgraph.forEach(edge => {
            let sourceNode = edge.source;
            this.parseFileForFunctions(sourceNode.file);
            let enclosingFunction = this.getEnclosingFunction(sourceNode);
            if (enclosingFunction) {
                sourceNode.start = enclosingFunction.start;
                sourceNode.end = enclosingFunction.end;
            }
        })

        this._refinedCallgraph = new CallGraph(this._jscallgraph)
    }

    get callgraph(): CallGraph {
        return this._refinedCallgraph;
    }

    parseFileForFunctions(filePath: string) {
        if (!this.functionDefinitions.has(filePath)) {
            const functionDefinitions = parseFunctionDefinitions(filePath);
            this.functionDefinitions.set(filePath, functionDefinitions);
        }
    }

    private getEnclosingFunction(fileDetails: FileDetails): FunctionDefinition | undefined {
        const functions = this.functionDefinitions.get(fileDetails.file) || [];
        let enclosingFunction: FunctionDefinition | undefined;

        functions.forEach(func => {
            const isStartBeforeOrEqual = (func.start.row < fileDetails.start.row) ||
                (func.start.row === fileDetails.start.row && func.start.column <= fileDetails.start.column);
            const isEndAfterOrEqual = (func.end.row > fileDetails.end.row) ||
                (func.end.row === fileDetails.end.row && func.end.column >= fileDetails.end.column);


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
}