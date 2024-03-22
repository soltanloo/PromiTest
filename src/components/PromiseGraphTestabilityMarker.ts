import {IncomingEdges, PromiseAdjacencyMap} from "../types/PromiseGraph.types";
import {PromiseIdentifier} from "../types/CoverageAnalyzer.type";
import {PromiseNode} from "./PromiseNode";

export class PromiseGraphTestabilityMarker {
    public markGraph(promiseGraph: PromiseAdjacencyMap) {
        const sortedNodes = this.topologicalSort(promiseGraph);

        for (const pid of sortedNodes) {
            let node = promiseGraph.get(pid)
            //TODO: calculate incoming edges
        }
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

    public calculateIncomingEdges(node: PromiseNode): IncomingEdges | undefined {
        return
    }
}