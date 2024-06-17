import {PromiseNode} from "./PromiseNode";
import {PromiseNodeId} from "../../types/PromiseGraph.type";
import {Graph} from "../data-structures/Graph";

export class PromiseGraph extends Graph {
    constructor(nodes?: Map<PromiseNodeId, PromiseNode>) {
        super(nodes);
    }

    addNode(newNode: PromiseNode) {
        super.addNode(newNode);
        this.addIncomingEdges(newNode);
    }

    private addIncomingEdges(newNode: PromiseNode) {
        const {
            parent: chainedParentId,
            links: linkedParentsIds,
            inputs: bundledParentsIds,
        } = newNode.promiseInfo;

        const parents = [
            ...(chainedParentId ? [chainedParentId] : []),
            ...(linkedParentsIds ?? []),
            ...(bundledParentsIds ?? [])
        ];

        parents.forEach((parentId) => {
            this.addEdge(parentId, newNode.id)
        })
    }


}
