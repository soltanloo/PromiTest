import { NodeMarkingStrategy } from './NodeMarkingStrategy';
import { PromiseNode } from '../promise-graph/PromiseNode';
import { isPromiseCalling } from '../../utils/AST';
import LLMController from '../apis/LLMController';
import logger from '../../utils/logger';
import { P_TYPE } from '../../types/JScope.type';
import { LLM } from '../../types/LLM.type';
import { ThrowBypassSystemPrompt } from '../../prompt-templates/ThrowBypassSystemPrompt';

export class RootNodeMarkingStrategy implements NodeMarkingStrategy {
    public async markNode(node: PromiseNode): Promise<void> {
        logger.info(`Marking node ${node.id} as root node.`);

        const _isRejectable = this.isRejectable(node);
        const _isResolvable = this.isResolvable(node);

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
        if (node.promiseInfo.isApiCall) return true;
        if (
            node.promiseInfo.type === P_TYPE.AsyncFunction &&
            !node.promiseInfo.asyncFunctionDefinition?.sourceCode
        )
            return false;

        let sourceCode =
            node.promiseInfo.type === P_TYPE.AsyncFunction
                ? node.promiseInfo.asyncFunctionDefinition!.sourceCode.replace(
                      /^async(?!\s+function)(?=\s+\w+\s*\(|\s*\()(?!(.*)=>)/,
                      'async function ',
                  )
                : node.promiseInfo.code;

        sourceCode =
            node.promiseInfo.type === P_TYPE.AsyncFunction
                ? sourceCode.replace(
                      /^async function\s*\((?!.*=>)/, // Avoids matching arrow functions
                      'async function foo(', // Temporary name for the function
                  )
                : node.promiseInfo.code;

        try {
            let isPromiseCallingResult = isPromiseCalling(sourceCode, 'reject');
            logger.debug('isRejectable', { message: isPromiseCallingResult });
            return isPromiseCallingResult;
        } catch (e) {
            logger.error('isRejectable', { message: e });
            return false;
        }
    }

    private isResolvable(node: PromiseNode): boolean {
        if (node.promiseInfo.isApiCall) return true;
        if (
            node.promiseInfo.type === P_TYPE.AsyncFunction &&
            !node.promiseInfo.asyncFunctionDefinition?.sourceCode
        )
            return false;

        let sourceCode =
            node.promiseInfo.type === P_TYPE.AsyncFunction
                ? node.promiseInfo.asyncFunctionDefinition!.sourceCode.replace(
                      /^async(?!\s+function)(?=\s+\w+\s*\(|\s*\()(?!(.*)=>)/,
                      'async function ',
                  )
                : node.promiseInfo.code;

        sourceCode =
            node.promiseInfo.type === P_TYPE.AsyncFunction
                ? sourceCode.replace(
                      /^async function\s*\((?!.*=>)/, // Avoids matching arrow functions
                      'async function foo(', // Temporary name for the function
                  )
                : node.promiseInfo.code;

        try {
            let isPromiseCallingResult = isPromiseCalling(
                sourceCode,
                'resolve',
            );
            logger.debug('isResolvable', { message: isPromiseCallingResult });
            return isPromiseCallingResult;
        } catch (e) {
            logger.error('isResolvable', { message: e });
            return false;
        }
    }

    private async canThrowBeBypassed(node: PromiseNode): Promise<boolean> {
        let messages: LLM.Message[] = [
            { role: LLM.Role.SYSTEM, content: ThrowBypassSystemPrompt },
            {
                role: LLM.Role.USER,
                content: node.promiseInfo.asyncFunctionDefinition!.sourceCode,
            },
        ];
        return (await LLMController.ask(messages)) === 'T';
    }
}
