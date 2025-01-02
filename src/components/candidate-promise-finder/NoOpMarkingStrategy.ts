import { NodeMarkingStrategy } from './NodeMarkingStrategy';
import { PromiseNode } from '../promise-graph/PromiseNode';
import logger from '../../utils/logger';

export class NoOpMarkingStrategy implements NodeMarkingStrategy {
    async markNode(node: PromiseNode): Promise<void> {
        logger.debug(`NoOp marking strategy applied to node ${node.id}`);
    }
}
