import {Graph} from "./Graph";
import {Node} from "../types/Graph.type";
import {FileDetails, JSCallgraphOutput} from "../types/Callgraph.type";

interface CallNode extends Node {
    fileDetails: FileDetails
}

export class CallGraph extends Graph {
    constructor(callgraphOutput?: JSCallgraphOutput) {
        super();
        if (callgraphOutput) {
            this.loadCallgraph(callgraphOutput);
        }
    }

    private loadCallgraph(callgraphOutput: JSCallgraphOutput) {
        callgraphOutput.forEach(edge => {
            this.addNode({
                id: this.generateNodeId(edge.source),
                fileDetails: edge.source
            })
            this.addNode({
                id: this.generateNodeId(edge.target),
                fileDetails: edge.target
            })
        })

        callgraphOutput.forEach(edge => {
            this.addEdge(this.generateNodeId(edge.source), this.generateNodeId(edge.target));
        })
    }

    private generateNodeId(fileDetails: FileDetails) {
        return `${fileDetails.file}:${fileDetails.label}:${fileDetails.start.row}:${fileDetails.start.column}:${fileDetails.end.row}:${fileDetails.end.column}`;
    }
}