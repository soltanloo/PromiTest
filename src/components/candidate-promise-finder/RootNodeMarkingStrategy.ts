import {NodeMarkingStrategy} from "./NodeMarkingStrategy";
import {PromiseNode} from "../promise-graph/PromiseNode";
import {isPromiseCalling} from "../../utils/AST";
import logger from "../../logging/logger";

export class RootNodeMarkingStrategy implements NodeMarkingStrategy {
    public markNode(node: PromiseNode): void {
        if (node.promiseInfo.warnings.rejection && this.isRejectable(node)) {
            node.flags.rejectable = true;
        }
        if (node.promiseInfo.warnings.fulfillment && this.isResolvable(node)) {
            node.flags.fulfillable = true;
        }
    }

    private isRejectable(node: PromiseNode): boolean {
        var out = isPromiseCalling(node.promiseInfo.code, "reject")
        logger.debug("isRejectable", {message: out})
        return out;
        // if (node.promiseInfo.type === "NewPromise") {
        //     const rejectablePatterns = [/reject\(/, /throw /];
        //     return rejectablePatterns.some(pattern => pattern.test(node.promiseInfo.code));
        // } else if (node.promiseInfo.type === "AsyncFunction") {
        //     return /throw /.test(node.promiseInfo.code);
        // }
        //
        // return false;
    }


    private isResolvable(node: PromiseNode): boolean {
        var out = isPromiseCalling(node.promiseInfo.code, "resolve")
        logger.debug("isResolvable", {message: out})
        return out;
        // if (node.promiseInfo.type === "NewPromise") {
        //     const resolvablePatterns = [/resolve\(/];
        //     return resolvablePatterns.some(pattern => pattern.test(node.promiseInfo.code));
        // } else if (node.promiseInfo.type === "AsyncFunction") {
        //     return /return /.test(node.promiseInfo.code);
        // }
        //
        // return false;
    }
}