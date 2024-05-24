import {AdjacencyList, Node, NodeId} from "../types/Graph.type";

export class Graph {
    constructor(nodes?: Map<NodeId, Node>) {
        if (nodes) {
            this.addNodes(nodes);
        }
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

    }

    addNodes(nodes: Map<NodeId, Node>) {
        nodes.forEach(node => {
            this.addNode(node)
        });
    }

    // Adds edge even if source node does not exist yet
    addEdge(from: NodeId, to: NodeId) {
        let destinationNode = this._nodes.get(to);


        if (destinationNode) {
            if (!this._adjacencyList.get(from)) this._adjacencyList.set(from, []);
            this._adjacencyList.get(from)?.push(destinationNode);
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
            if (inStack.has(pid)) {
                throw new Error('Graph is not a DAG - detected a cycle!');
            }

            if (!visited.has(pid)) {
                visited.add(pid);
                inStack.add(pid);

                const edges = nodesAdjacencyList.get(pid) || [];
                edges.forEach(node => visit(node.identifier));

                inStack.delete(pid);
                stack.push(pid);
            }
        };

        nodesAdjacencyList.forEach((_, id) => {
            if (!visited.has(id)) {
                visit(id);
            }
        });

        this._sortedNodes = stack.reverse()
        return this._sortedNodes;
    }

    getAdjacencyListAsObject(): Object {
        return Object.fromEntries(this._adjacencyList);
    }

    getNodesAsObject(): Object {
        return Object.fromEntries(this._nodes)
    }

}