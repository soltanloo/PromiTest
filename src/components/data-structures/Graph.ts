import { AdjacencyList, Node, NodeId } from '../../types/Graph.type';

export class Graph {
    private _inDegrees: Map<NodeId, number> = new Map();

    constructor(nodes?: Map<NodeId, Node>) {
        if (nodes) {
            this.addNodes(nodes);
        }
    }

    private _entryPoints: Set<NodeId> = new Set();

    get entryPoints(): NodeId[] {
        return Array.from(this._entryPoints);
    }

    private _nodes: Map<NodeId, Node> = new Map<NodeId, Node>();

    get nodes(): Map<NodeId, Node> {
        return this._nodes;
    }

    private _adjacencyList: AdjacencyList = new Map();

    get adjacencyList(): AdjacencyList {
        return this._adjacencyList;
    }

    private _sortedNodes?: NodeId[];

    get sortedNodes(): NodeId[] | undefined {
        return this._sortedNodes;
    }

    addNode(node: Node) {
        this._nodes.set(node.id, node);

        if (!this._adjacencyList.has(node.id)) {
            this._adjacencyList.set(node.id, []);
        }

        if (!this._inDegrees.has(node.id)) {
            this._inDegrees.set(node.id, 0);
        }

        this._entryPoints.add(node.id);
    }

    addNodes(nodes: Map<NodeId, Node>) {
        nodes.forEach((node) => {
            this.addNode(node);
        });
    }

    // Adds edge even if source node does not exist yet
    addEdge(from: NodeId, to: NodeId) {
        let destinationNode = this._nodes.get(to);

        if (destinationNode) {
            if (!this._adjacencyList.get(from))
                this._adjacencyList.set(from, []);
            this._adjacencyList.get(from)?.push(destinationNode);
            this._inDegrees.set(to, (this._inDegrees.get(to) || 0) + 1);
            this._entryPoints.delete(to);
        } else throw new Error('destination node does not exist');
    }

    getNode(id: NodeId): Node | undefined {
        return this._nodes.get(id);
    }

    getEdges(id: NodeId): Node[] {
        return this._adjacencyList.get(id) || [];
    }

    topologicalSort(nodesAdjacencyList?: AdjacencyList): NodeId[] {
        if (!nodesAdjacencyList) {
            nodesAdjacencyList = this._adjacencyList;
        }

        let stack: NodeId[] = [];
        let visited = new Set<NodeId>();
        let inStack = new Set<NodeId>();

        const visit = (pid: NodeId) => {
            if (!pid) return;

            if (inStack.has(pid)) {
                throw new Error('Graph is not a DAG - detected a cycle!');
            }

            if (!visited.has(pid)) {
                visited.add(pid);
                inStack.add(pid);

                const edges = nodesAdjacencyList.get(pid) || [];
                edges.forEach((node) => visit(node.id));

                inStack.delete(pid);
                stack.push(pid);
            }
        };

        nodesAdjacencyList.forEach((_, id) => {
            if (!visited.has(id)) {
                visit(id);
            }
        });

        this._sortedNodes = stack.reverse();
        return this._sortedNodes;
    }

    getAdjacencyListAsObject(): Object {
        return Object.fromEntries(this._adjacencyList);
    }

    getNodesAsObject(): Object {
        return Object.fromEntries(this._nodes);
    }

    bfsShortestPath(
        start: NodeId,
        end: NodeId,
    ): { path: NodeId[]; distance: number } {
        let queue: { node: NodeId; path: NodeId[]; distance: number }[] = [];
        let visited = new Set<NodeId>();

        queue.push({ node: start, path: [start], distance: 0 });
        visited.add(start);

        while (queue.length > 0) {
            let { node, path, distance } = queue.shift()!;

            if (node === end) {
                return { path, distance };
            }

            this.getEdges(node).forEach((neighbor) => {
                if (!visited.has(neighbor.id)) {
                    visited.add(neighbor.id);
                    queue.push({
                        node: neighbor.id,
                        path: [...path, neighbor.id],
                        distance: distance + 1,
                    });
                }
            });
        }

        return { path: [], distance: Infinity }; // No path found
    }
}
