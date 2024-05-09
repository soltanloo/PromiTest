import {IncomingEdges, PromiseAdjacencyMap} from "../types/PromiseGraph.types";
import {PromiseIdentifier} from "../types/CoverageAnalyzer.type";
import {PromiseNode} from "./PromiseNode";
import {RootNodeMarkingStrategy} from "./RootNodeMarkingStrategy";
import {NodeMarkingStrategy} from "./NodeMarkingStrategy";
import {PromiseGraph} from "./PromiseGraph";

export class PromiseGraphTestabilityMarker {
    public markGraph(promiseGraph: PromiseGraph) {
        const sortedNodes = this.topologicalSort(promiseGraph.adjacencyMap);
        promiseGraph.setSortedNodes(sortedNodes);

        for (const pid of sortedNodes) {
            const node = promiseGraph.nodeDirectory.get(pid);
            if (node) {
                this.markNode(node);
            }
        }
    }

    public markNode(node: PromiseNode): void {
        let strategy: NodeMarkingStrategy;

        switch (node.incomingEdges) {
            case IncomingEdges.NONE:
                strategy = new RootNodeMarkingStrategy();
                break;

            default:
                throw new Error("Unhandled node type");
        }

        strategy.markNode(node);
    }

    public topologicalSort(nodes: PromiseAdjacencyMap): PromiseIdentifier[] {
        let stack: PromiseIdentifier[] = [];
        let visited = new Set<PromiseIdentifier>();
        let inStack = new Set<PromiseIdentifier>();

        const visit = (pid: PromiseIdentifier) => {
            if (inStack.has(pid)) {
                throw new Error('Graph is not a DAG - detected a cycle!');
            }

            if (!visited.has(pid)) {
                visited.add(pid);
                inStack.add(pid);

                const edges = nodes.get(pid) || [];
                edges.forEach(node => visit(node.identifier));

                inStack.delete(pid);
                stack.push(pid);
            }
        };

        nodes.forEach((_, id) => {
            if (!visited.has(id)) {
                visit(id);
            }
        });

        return stack.reverse();
    }
}