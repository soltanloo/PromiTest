import { PromiseNode } from './PromiseNode';
import { PromiseNodeId } from '../../types/PromiseGraph.type';
import { Graph } from '../data-structures/Graph';

export class PromiseGraph extends Graph {
    constructor(nodes?: Map<PromiseNodeId, PromiseNode>) {
        super(nodes);
    }

    addNode(newNode: PromiseNode) {
        super.addNode(newNode);
        this.addIncomingEdges(newNode);
    }

    private addIncomingEdges(newNode: PromiseNode) {
        const { parent: chainedParentId, links: linkedParentsIds } =
            newNode.promiseInfo;

        if (chainedParentId && chainedParentId !== newNode.id) {
            newNode.chainedParent = this.getNode(
                chainedParentId,
            ) as PromiseNode;
            this.addEdge(chainedParentId, newNode.id);
        }

        if (linkedParentsIds)
            linkedParentsIds.forEach((linkedParentId) => {
                if (!linkedParentId || newNode.id === linkedParentId) return;

                newNode.linkedParents.push(
                    this.getNode(linkedParentId) as PromiseNode,
                );
                this.addEdge(linkedParentId, newNode.id);
            });

        newNode.calculateIncomingEdges();
    }
}
