import { IncomingEdges } from '../../types/PromiseGraph.type';
import { PromiseNode } from '../promise-graph/PromiseNode';
import { RootNodeMarkingStrategy } from './RootNodeMarkingStrategy';
import { NodeMarkingStrategy } from './NodeMarkingStrategy';
import { PromiseGraph } from '../promise-graph/PromiseGraph';
import { NoOpMarkingStrategy } from './NoOpMarkingStrategy';
import logger from '../../utils/logger';
import { P_TYPE } from '../../types/JScope.type';

export class PromiseGraphTestabilityMarker {
    public async markGraph(promiseGraph: PromiseGraph): Promise<PromiseGraph> {
        logger.info('Starting to mark the promise graph.');
        const sortedNodes = promiseGraph.topologicalSort();

        for (const pid of sortedNodes) {
            const node = promiseGraph.getNode(pid);
            if (node) {
                logger.debug(`Marking node with id: ${node.id}`);
                await this.markNode(node as PromiseNode);
            } else {
                logger.warn(
                    `Node with id: ${pid} not found in the promise graph.`,
                );
            }
        }

        logger.info('Finished marking the promise graph.');
        return promiseGraph;
    }

    public async markNode(node: PromiseNode): Promise<void> {
        let strategy: NodeMarkingStrategy = new NoOpMarkingStrategy();
        logger.debug(
            `Marking node ${node.id}, incoming edges: ${node.incomingEdges}`,
        );

        switch (node.incomingEdges) {
            case IncomingEdges.NONE:
                strategy = new RootNodeMarkingStrategy();
                logger.info(
                    `Using RootNodeMarkingStrategy for node ${node.id}`,
                );
                break;

            // case IncomingEdges.ONE_LINK:
            // case IncomingEdges.ONE_CHAIN:

            default:
                logger.error(
                    `Unhandled incoming edges type for node ${node.id}: ${node.incomingEdges}`,
                );
                break;
        }

        // switch (node.promiseInfo.type) {
        //     case P_TYPE.AsyncFunction:
        // }

        await strategy.markNode(node);
        logger.debug(
            `Node ${node.id} marked successfully with strategy: ${strategy.constructor.name}`,
        );
    }
}
