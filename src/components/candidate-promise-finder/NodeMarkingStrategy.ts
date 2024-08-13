import { PromiseNode } from '../promise-graph/PromiseNode';

export interface NodeMarkingStrategy {
    markNode(node: PromiseNode): void;
}
