import {PromiseNode} from "./PromiseNode";

export interface NodeAction {
    execute(node: PromiseNode): void;
}

export class HandleRejectionWarning implements NodeAction {
    execute(node: PromiseNode): void {
        node.flags.rejectable = true;
    }
}

export class HandleFulfillmentWarning implements NodeAction {
    execute(node: PromiseNode): void {
        node.flags.fulfillable = true;
    }
}