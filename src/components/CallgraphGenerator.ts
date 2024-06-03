import {JSCallgraphOutput} from "../types/Callgraph.type";
// @ts-ignore
import JCG from '@persper/js-callgraph';
import RuntimeConfig from "./RuntimeConfig";
import {CallGraph} from "./CallGraph";
import FileRepository from "./FileRepository";


export default class CallgraphGenerator {

    private _jscallgraph: JSCallgraphOutput;
    private _refinedCallgraph: CallGraph;

    constructor() {
        const RC = RuntimeConfig.getInstance();

        const args = {strategy: "FULL", output: null, cg: 'cg'};
        JCG.setArgs(args);
        JCG.setFiles([RC.config.projectPath]);
        JCG.setFilter(['+^.*\\.js$', '-^.*node_modules\\/.*\\.js$',]);
        JCG.setConsoleOutput(false);
        this._jscallgraph = JCG.build();

        // Replaces the start and end point of source nodes with their enclosing function's start and end points
        // (we don't need the call site; we need the enclosing function)
        this._jscallgraph.forEach(edge => {
            let sourceNode = edge.source;
            let enclosingFunction = FileRepository.getEnclosingFunction(sourceNode.file, {
                startPosition: sourceNode.start,
                endPosition: sourceNode.end
            });
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
}