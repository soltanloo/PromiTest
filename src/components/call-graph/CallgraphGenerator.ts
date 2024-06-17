import {FileDetails, JSCallgraphOutput} from "../../types/Callgraph.type";
// @ts-ignore
import JCG from '@persper/js-callgraph';
import RuntimeConfig from "../configuration/RuntimeConfig";
import {CallGraph} from "./CallGraph";
import FileRepository from "../apis/FileRepository";


export default class CallgraphGenerator {

    RC = RuntimeConfig.getInstance();
    private _jscallgraph!: JSCallgraphOutput;
    private _refinedCallgraph!: CallGraph;

    constructor() {
        this.constructGraph();
    }

    get callgraph(): CallGraph {
        return this._refinedCallgraph;
    }

    constructGraph(projectPath = this.RC.config.projectPath): CallGraph {
        const args = {strategy: "DEMAND", output: null, cg: 'cg'};
        JCG.setArgs(args);
        JCG.setFiles([projectPath]);
        JCG.setFilter(['+^.*\\.js$', '-^.*node_modules\\/.*\\.js$',]);
        JCG.setConsoleOutput(false);
        this._jscallgraph = JCG.build();

        this._jscallgraph = this._jscallgraph.filter(edge => {
            return edge.source.file !== "Native" && edge.target.file !== "Native";
        })

        // Replaces the start and end point of source nodes with their enclosing function's start and end points
        // (we don't need the call site; we need the enclosing function)
        this._jscallgraph.forEach(edge => {
            edge.source = this.fillEnclosingFunctionOfNode(edge.source);
            edge.target = this.fillEnclosingFunctionOfNode(edge.target);
        })

        return this._refinedCallgraph = new CallGraph(this._jscallgraph)
    }

    fillEnclosingFunctionOfNode(node: FileDetails) {
        if (node.file === "Native") return node;
        let enclosingFunction = FileRepository.getEnclosingFunction(node.file, {
            startPosition: node.start,
            endPosition: node.end
        });

        return Object.assign({}, node, enclosingFunction);
    }
}