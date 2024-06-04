import {FileDetails, JSCallgraphOutput} from "../types/Callgraph.type";
// @ts-ignore
import JCG from '@persper/js-callgraph';
import RuntimeConfig from "./RuntimeConfig";
import {CallGraph} from "./CallGraph";
import FileRepository from "./FileRepository";


export default class CallgraphGenerator {

    RC = RuntimeConfig.getInstance();
    private _jscallgraph: JSCallgraphOutput;
    private _refinedCallgraph: CallGraph;

    constructor() {

        const args = {strategy: "DEMAND", output: null, cg: 'cg'};
        JCG.setArgs(args);
        JCG.setFiles([this.RC.config.projectPath]);
        JCG.setFilter(['+^.*\\.js$', '-^.*node_modules\\/.*\\.js$',]);
        JCG.setConsoleOutput(false);
        this._jscallgraph = JCG.build();

        // Replaces the start and end point of source nodes with their enclosing function's start and end points
        // (we don't need the call site; we need the enclosing function)
        this._jscallgraph.forEach(edge => {
            edge.source = this.fillEnclosingFunctionOfNode(edge.source);
            edge.target = this.fillEnclosingFunctionOfNode(edge.target);
        })

        this._refinedCallgraph = new CallGraph(this._jscallgraph)
    }

    get callgraph(): CallGraph {
        return this._refinedCallgraph;
    }

    fillEnclosingFunctionOfNode(node: FileDetails) {
        let enclosingFunction = FileRepository.getEnclosingFunction(node.file, {
            startPosition: node.start,
            endPosition: node.end
        });

        return Object.assign({}, node, enclosingFunction, {file: node.file.replace(this.RC.config.projectPath, '')});
    }
}