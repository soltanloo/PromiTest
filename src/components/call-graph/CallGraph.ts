import { Graph } from '../data-structures/Graph';
import { NodeId } from '../../types/Graph.type';
import { FileDetails, JSCallgraphOutput } from '../../types/Callgraph.type';
import RuntimeConfig from '../configuration/RuntimeConfig';
import logger from '../../utils/logger';

export class CallGraph extends Graph {
    constructor(callgraphOutput?: JSCallgraphOutput) {
        super();
        if (callgraphOutput) {
            logger.info('Loading call graph from output.');
            this.loadCallgraph(callgraphOutput);
        }
    }

    findPathsFromTestsTo(
        target: NodeId,
    ): { start: NodeId; path: NodeId[]; distance: number }[] {
        logger.debug(`Finding paths from tests to target: ${target}`);
        return this.entryPoints.map((start) => {
            const { path, distance } = this.bfsShortestPath(start, target);
            logger.debug(
                `Found path from ${start} to ${target} with distance ${distance}:`,
                { message: path },
            );
            return { start, path, distance };
        });
    }

    findShortestPathFromTestsTo(target: NodeId): NodeId[] {
        const shortestPath = this.findPathsFromTestsTo(target).sort(
            (a, b) => a.distance - b.distance,
        )[0].path;
        logger.info(`Shortest path from test to ${target}:`, {
            message: shortestPath,
        });
        return shortestPath;
    }

    private loadCallgraph(callgraphOutput: JSCallgraphOutput) {
        logger.info('Loading call graph edges and nodes.');
        let isNativeFunction = (node: FileDetails) => {
            return [
                node.start.row,
                node.start.column,
                node.end.row,
                node.end.column,
            ].some((value) => isNaN(value));
        };

        callgraphOutput.forEach((edge) => {
            if (!isNativeFunction(edge.source)) {
                const node_id = this.generateNodeId(edge.source);
                this.addNode({
                    id: node_id,
                    fileDetails: edge.source,
                });
                logger.debug(
                    `Adding node (id: ${node_id}, edge.source: ${JSON.stringify(edge.source)})`,
                );
            }

            if (!isNativeFunction(edge.target)) {
                const node_id = this.generateNodeId(edge.target);
                this.addNode({
                    id: node_id,
                    fileDetails: edge.target,
                });
                logger.debug(
                    `Adding node (id: ${node_id}, edge.target: ${JSON.stringify(edge.target)})`,
                );
            }
        });

        callgraphOutput.forEach((edge) => {
            if (
                !isNativeFunction(edge.source) &&
                !isNativeFunction(edge.target)
            ) {
                const source_node_id = this.generateNodeId(edge.source);
                const target_node_id = this.generateNodeId(edge.target);
                this.addEdge(source_node_id, target_node_id);
                logger.debug(
                    `Adding edge (source: ${source_node_id}, target: ${target_node_id})`,
                );
            }
        });

        this.pruneGraph();
        logger.info('Call graph loading complete.');
    }

    private generateNodeId(fileDetails: FileDetails) {
        return `${fileDetails.file}:${fileDetails.label}:${fileDetails.start.row}:${fileDetails.start.column}:${fileDetails.end.row}:${fileDetails.end.column}`;
    }

    private pruneGraph() {
        const rc = RuntimeConfig.getInstance().config;
        const testNodes = Array.from(this.nodes.values()).filter((node) =>
            (node.fileDetails as FileDetails).file.includes(
                `${rc.testDirectory}`,
            ),
        );

        logger.info(
            `Pruning graph to include only reachable nodes from test cases. Test nodes found: ${testNodes.length}`,
        );

        logger.info(`Pruning graph to include only reachable nodes from test cases. Test nodes found: ${testNodes.length}`);

        const visited = new Set<NodeId>();

        const dfs = (nodeId: NodeId) => {
            if (visited.has(nodeId)) return;
            visited.add(nodeId);
            const neighbors = this.adjacencyList.get(nodeId) || [];
            neighbors.forEach((neighbor) => dfs(neighbor.id));
        };

        testNodes.forEach((node) => dfs(node.id));

        this.nodes.forEach((_, nodeId) => {
            if (!visited.has(nodeId)) {
                logger.debug(
                    `Removing node (id: ${nodeId}) as it is not reachable from tests.`,
                );
                this.nodes.delete(nodeId);
                this.adjacencyList.delete(nodeId);
            }
        });

        this.adjacencyList.forEach((neighbors, nodeId) => {
            const filteredNeighbors = neighbors.filter((neighbor) =>
                visited.has(neighbor.id),
            );
            if (filteredNeighbors.length < neighbors.length) {
                logger.debug(
                    `Updating neighbors for node (id: ${nodeId}). Before: ${neighbors.length}, After: ${filteredNeighbors.length}`,
                );
            }
            this.adjacencyList.set(nodeId, filteredNeighbors);
        });

        logger.info('Graph pruning complete.');
    }
}
