import { NodeMarkingStrategy } from "./NodeMarkingStrategy";
import { PromiseNode } from "./PromiseNode";

export class RootNodeMarkingStrategy implements NodeMarkingStrategy {
   public markNode(node: PromiseNode): void {
        if (node.promiseInfo.warnings.rejection && this.isRejectable(node)) {
            node.flags.rejectable = true;
        }
        if (node.promiseInfo.warnings.fulfillment) {
            node.flags.fulfillable = true;
        }
    }

    private isRejectable(node: PromiseNode): boolean {
        if (node.promiseInfo.type === "NewPromise") {
            const rejectablePatterns = [/reject\(/, /throw /];
            return rejectablePatterns.some(pattern => pattern.test(node.promiseInfo.code));
        } else if (node.promiseInfo.type === "AsyncFunction") {
            return /throw /.test(node.promiseInfo.code);
        }

        return false;
    }
}