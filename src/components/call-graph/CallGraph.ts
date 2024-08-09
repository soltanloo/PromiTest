import {Graph} from "../data-structures/Graph";
import {NodeId} from "../../types/Graph.type";
import {FileDetails, JSCallgraphOutput} from "../../types/Callgraph.type";
import RuntimeConfig from "../configuration/RuntimeConfig";
import logger from "src/logging/logger";
export class CallGraph extends Graph {
    constructor(callgraphOutput?: JSCallgraphOutput) {
        super();
        if (callgraphOutput) {
            this.loadCallgraph(callgraphOutput);
        }
    }

    findPathsFromTestsTo(target: NodeId): { start: NodeId, path: NodeId[], distance: number }[] {
        return this.entryPoints.map(start => {
            const {path, distance} = this.bfsShortestPath(start, target);
            return {start, path, distance};
        });
    }

    findShortestPathFromTestsTo(target: NodeId): NodeId[] {
        const shortestPath = this.findPathsFromTestsTo(target).sort((a, b) => a.distance - b.distance)[0].path;
        logger.debug(`Shortest path from test to ${target}:`, shortestPath);
        return shortestPath;
    }

    private loadCallgraph(callgraphOutput: JSCallgraphOutput) {
        let isNativeFunction = (node: FileDetails) => {
            return [node.start.row, node.start.column, node.end.row, node.end.column].some(value => isNaN(value))
        }

        callgraphOutput.forEach(edge => {
            if (!isNativeFunction(edge.source)) {
                this.addNode({
                    id: this.generateNodeId(edge.source),
                    fileDetails: edge.source
                })
            }

            if (!isNativeFunction(edge.target)) {
                this.addNode({
                    id: this.generateNodeId(edge.target),
                    fileDetails: edge.target
                })
            }
        })

        callgraphOutput.forEach(edge => {
            if (!isNativeFunction(edge.source) && !isNativeFunction(edge.target))
                this.addEdge(this.generateNodeId(edge.source), this.generateNodeId(edge.target));
        })

        this.pruneGraph()
    }

    private generateNodeId(fileDetails: FileDetails) {
        return `${fileDetails.file}:${fileDetails.label}:${fileDetails.start.row}:${fileDetails.start.column}:${fileDetails.end.row}:${fileDetails.end.column}`;
    }

    // Prunes the graph to only include functions that could be visited starting from test cases
    private pruneGraph() {
        const rc = RuntimeConfig.getInstance().config;
        const testNodes = Array.from(this.nodes.values()).filter(node =>
            //FIXME: use a better method
            (node.fileDetails as FileDetails).file.includes(`${rc.testDirectory}`)
        );

        const visited = new Set<NodeId>();

        const dfs = (nodeId: NodeId) => {
            if (visited.has(nodeId)) return;
            visited.add(nodeId);
            const neighbors = this.adjacencyList.get(nodeId) || [];
            neighbors.forEach(neighbor => dfs(neighbor.id));
        };

        testNodes.forEach(node => dfs(node.id));

        this.nodes.forEach((_, nodeId) => {
            if (!visited.has(nodeId)) {
                this.nodes.delete(nodeId);
                this.adjacencyList.delete(nodeId);
            }
        });

        this.adjacencyList.forEach((neighbors, nodeId) => {
            this.adjacencyList.set(nodeId, neighbors.filter(neighbor => visited.has(neighbor.id)));
        });

    }
}