import {AdjacencyList, Node, NodeId} from "../types/Graph.type";

export class Graph {
    nodes: Map<NodeId, Node> = new Map<NodeId, Node>();
    adjacencyList: AdjacencyList = new Map();

    constructor(nodes?: Map<NodeId, Node>) {
        if (nodes) {
            this.addNodes(nodes);
        }
    }


    addNode(node: Node) {
        this.nodes.set(node.id, node);

        if (!this.adjacencyList.has(node.id)) {
            this.adjacencyList.set(node.id, []);
        }

    }

    addNodes(nodes: Map<NodeId, Node>) {
        nodes.forEach(node => {
            this.addNode(node)
        });
    }


    addEdge(from: NodeId, to: NodeId) {
        if (!this.adjacencyList.has(from)) {
            throw new Error(`Node with id ${from} does not exist.`);
        }

        if (!this.nodes.has(to)) {
            throw new Error(`Node with id ${to} does not exist.`);
        }

        this.adjacencyList.get(from)?.push(this.nodes.get(to)!);
    }


    getNode(id: NodeId): Node | undefined {
        return this.nodes.get(id);
    }


    getEdges(id: NodeId): Node[] {
        return this.adjacencyList.get(id) || [];
    }

}