import {PromiseNode} from "./PromiseNode";

export interface NodeMarkingStrategy {
    markNode(node: PromiseNode): void;
}