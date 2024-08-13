import { NodeMarkingStrategy } from './NodeMarkingStrategy';
import { PromiseNode } from '../promise-graph/PromiseNode';
import { isPromiseCalling } from '../../utils/AST';
import logger from '../../utils/logger';

export class RootNodeMarkingStrategy implements NodeMarkingStrategy {
    public markNode(node: PromiseNode): void {
        logger.info(`Marking node ${node.id} as root node.`);

        let _isRejectable = this.isRejectable(node);
        let _isResolvable = this.isResolvable(node);

        logger.debug(`Warnings: ${JSON.stringify(node.promiseInfo.warnings)}`);

        if (node.promiseInfo.warnings.rejection && _isRejectable) {
            logger.info(`Node ${node.id} is flagged as rejectable.`);
            node.flags.rejectable = true;
        }
        if (node.promiseInfo.warnings.fulfillment && _isResolvable) {
            logger.info(`Node ${node.id} is flagged as resolvable.`);
            node.flags.fulfillable = true;
        }
    }

    private isRejectable(node: PromiseNode): boolean {
        let isPromiseCallingResult = isPromiseCalling(
            node.promiseInfo.code,
            'reject',
        );
        logger.debug('isRejectable', { message: isPromiseCallingResult });
        return isPromiseCallingResult;
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
        let isPromiseCallingResult = isPromiseCalling(
            node.promiseInfo.code,
            'resolve',
        );
        logger.debug('isResolvable', { message: isPromiseCallingResult });
        return isPromiseCallingResult;
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
