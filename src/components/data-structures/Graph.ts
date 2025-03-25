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

    getGraphStatistics(): {
        numVertices: number;
        numEdges: number;
        numComponents: number;
        maxDepth: number;
        pdd: number;
        graphString: string;
    } {
        const numVertices = this._nodes.size;
        const numEdges = Array.from(this._adjacencyList.values()).reduce(
            (sum, edges) => sum + edges.length,
            0,
        );

        // Store graph structure as a string
        let graphLines: string[] = [];

        // Add nodes and edges to graph representation
        for (let nodeId of this._nodes.keys()) {
            graphLines.push(nodeId.toString());

            for (let neighbor of this.getEdges(nodeId)) {
                graphLines.push(`${nodeId} ${neighbor.id}`);
            }
        }

        // Find root nodes (nodes with no incoming edges)
        const hasIncomingEdge = new Set<NodeId>();

        for (let nodeId of this._nodes.keys()) {
            for (let neighbor of this.getEdges(nodeId)) {
                hasIncomingEdge.add(neighbor.id);
            }
        }

        // Count components using BFS
        const visited = new Set<NodeId>();
        let numComponents = 0;

        // Simple BFS to explore a component
        const bfs = (startNode: NodeId) => {
            const queue: NodeId[] = [startNode];
            visited.add(startNode);

            while (queue.length > 0) {
                const node = queue.shift()!;

                for (const neighbor of this.getEdges(node)) {
                    if (!visited.has(neighbor.id)) {
                        visited.add(neighbor.id);
                        queue.push(neighbor.id);
                    }
                }
            }
        };

        // First, start from all root nodes
        for (let nodeId of this._nodes.keys()) {
            if (!hasIncomingEdge.has(nodeId) && !visited.has(nodeId)) {
                numComponents++;
                bfs(nodeId);
            }
        }

        // Then handle any remaining nodes (could be in cycles or isolated)
        for (let nodeId of this._nodes.keys()) {
            if (!visited.has(nodeId)) {
                numComponents++;
                bfs(nodeId);
            }
        }

        // Calculate node depths for PDD
        let maxDepth = 0;
        let totalDepth = 0;

        // Create a reversed graph for depth calculation
        const reversedGraph = new Map<NodeId, NodeId[]>();

        // Initialize reversed graph
        for (let nodeId of this._nodes.keys()) {
            reversedGraph.set(nodeId, []);
        }

        // Populate reversed graph
        for (let nodeId of this._nodes.keys()) {
            for (let neighbor of this.getEdges(nodeId)) {
                reversedGraph.get(neighbor.id)!.push(nodeId);
            }
        }

        // Calculate longest path to a node in the directed graph
        const calculateNodeDepth = (targetNode: NodeId): number => {
            const longestPath = new Map<NodeId, number>();

            for (let nodeId of this._nodes.keys()) {
                longestPath.set(nodeId, 0);
            }

            const dfs = (node: NodeId): number => {
                if (longestPath.get(node)! > 0) {
                    return longestPath.get(node)!;
                }

                let maxLength = 0;

                for (const predecessor of reversedGraph.get(node)!) {
                    const pathLength = dfs(predecessor) + 1;
                    maxLength = Math.max(maxLength, pathLength);
                }

                longestPath.set(node, maxLength);
                return maxLength;
            };

            return dfs(targetNode);
        };

        // Calculate depths for all nodes
        for (let nodeId of this._nodes.keys()) {
            const nodeDepth = calculateNodeDepth(nodeId);
            totalDepth += nodeDepth;
            maxDepth = Math.max(maxDepth, nodeDepth);
        }

        // Calculate PDD
        const pdd = numVertices > 0 ? totalDepth / numVertices : 0;

        return {
            numVertices,
            numEdges,
            numComponents,
            maxDepth,
            pdd,
            graphString: graphLines.join('\n'),
        };
    }
}
