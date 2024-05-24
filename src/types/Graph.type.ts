export type NodeId = string | number;

export interface Node {
    id: NodeId;

    [key: string]: any; // Allowing flexible properties for nodes
}

export type AdjacencyList = Map<NodeId, Node[]>;