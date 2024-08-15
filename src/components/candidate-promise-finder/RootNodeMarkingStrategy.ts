import { NodeMarkingStrategy } from './NodeMarkingStrategy';
import { PromiseNode } from '../promise-graph/PromiseNode';
import { isPromiseCalling } from '../../utils/AST';
import { GPTController } from '../apis/GPTController';
import logger from '../../utils/logger';

export class RootNodeMarkingStrategy implements NodeMarkingStrategy {
    public async markNode(node: PromiseNode): Promise<void> {
        logger.info(`Marking node ${node.id} as root node.`);
    
        const _isRejectable = this.isRejectable(node);
        const _isResolvable = await this.isResolvable(node);
    
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

    private async isResolvable(node: PromiseNode): Promise<boolean> {
        if (node.promiseInfo.type === "NewPromise") {
            const isPromiseCallingResult = isPromiseCalling(
                node.promiseInfo.code,
                'resolve',
            );
            logger.debug('isResolvable', { message: isPromiseCallingResult });
            return isPromiseCallingResult;
        } else if (node.promiseInfo.type === "AsyncFunction") {
            const canThrowBeBypassedResult = await this.canThrowBeBypassed(node);
            logger.debug('isResolvable', { message: canThrowBeBypassedResult });
            return canThrowBeBypassedResult;
        }
        return false;
    }

    //TODO: Implement this
    private async canThrowBeBypassed(node: PromiseNode): Promise<boolean> { // should be some aync node type
        return await GPTController.getInstance().verifyThrowCanBeBypassed(node.promiseInfo.code);
    }
}
