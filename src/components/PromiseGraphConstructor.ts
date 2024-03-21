import {PromiseNode} from "./PromiseNode";
import {PromiseGraph} from "./PromiseGraph";
import {PromiseCoverageReport, PromiseIdentifier} from "../types/CoverageAnalyzer.type";
import * as console from "node:console";

export class PromiseGraphConstructor {
    promiseCoverageData: PromiseCoverageReport;
    promiseGraph!: PromiseGraph;

    constructor(_promiseCoverageData: PromiseCoverageReport) {
        this.promiseCoverageData = _promiseCoverageData;
    }

    public constructGraph(): PromiseGraph {
        const nodeDirectory = new Map<PromiseIdentifier, PromiseNode>();
        this.promiseCoverageData.forEach((promise) => {
                nodeDirectory.set(
                    promise.identifier,
                    new PromiseNode(promise.identifier, promise),
                )
            }
        );

        this.promiseGraph = new PromiseGraph(nodeDirectory);

        nodeDirectory.forEach((node) => {
            this.promiseGraph.addNode(node.identifier, node);
        });

        return this.promiseGraph;
    }

    public getAdjacencyMapAsObject(): Object {
        return Object.fromEntries(this.promiseGraph.adjacencyMap)
    }
}
