import {IncomingEdges} from "../../types/PromiseGraph.type";
import {PromiseNode} from "../promise-graph/PromiseNode";
import {RootNodeMarkingStrategy} from "./RootNodeMarkingStrategy";
import {NodeMarkingStrategy} from "./NodeMarkingStrategy";
import {PromiseGraph} from "../promise-graph/PromiseGraph";
import {NoOpMarkingStrategy} from "./NoOpMarkingStrategy";

export class PromiseGraphTestabilityMarker {
    public markGraph(promiseGraph: PromiseGraph) {
        const sortedNodes = promiseGraph.topologicalSort()

        for (const pid of sortedNodes) {
            const node = promiseGraph.getNode(pid);
            if (node) {
                this.markNode(node as PromiseNode);
            }
        }

        return promiseGraph;
    }

    public markNode(node: PromiseNode): void {
        let strategy: NodeMarkingStrategy = new NoOpMarkingStrategy();

        switch (node.incomingEdges) {
            case IncomingEdges.NONE:
                strategy = new RootNodeMarkingStrategy();
                break;

            default:
                // throw new Error("Unhandled node type"); //FIXME
                break;
        }

        strategy.markNode(node);
    }
}