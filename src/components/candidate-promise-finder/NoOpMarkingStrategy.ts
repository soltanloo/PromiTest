import {NodeMarkingStrategy} from "./NodeMarkingStrategy";
import {PromiseNode} from "../promise-graph/PromiseNode";

export class NoOpMarkingStrategy implements NodeMarkingStrategy {
    markNode(node: PromiseNode): void {
        // No operation performed
    }
}