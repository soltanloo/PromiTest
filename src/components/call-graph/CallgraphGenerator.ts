import { FileDetails, JSCallgraphOutput } from "../../types/Callgraph.type";
// @ts-ignore
import JCG from 'jscg';
import RuntimeConfig from "../configuration/RuntimeConfig";
import { CallGraph } from "./CallGraph";
import FileRepository from "../apis/FileRepository";
import logger from '../../utils/logger'; // Import the logger

export default class CallgraphGenerator {

    RC = RuntimeConfig.getInstance();
    private _jscallgraph!: JSCallgraphOutput;
    private _refinedCallgraph!: CallGraph;

    constructor() {
        logger.info('Initializing CallgraphGenerator');
        this.constructGraph();
    }

    get callgraph(): CallGraph {
        logger.debug('Accessing callgraph');
        return this._refinedCallgraph;
    }

    constructGraph(projectPath = this.RC.config.projectPath): CallGraph {
        logger.info(`Constructing call graph for project at ${projectPath}`);

        const args = {strategy: "DEMAND", cg: 'cg'};
        JCG.setArgs(args);
        logger.debug(`JCG arguments set: ${JSON.stringify(args)}`);

        JCG.setFiles([projectPath]);
        logger.debug(`JCG files set: ${projectPath}`);

        JCG.setFilter(['+^.*\\.js$', '-^.*node_modules\\/.*\\.js$',]);
        logger.debug(`JCG filter set`);

        JCG.setConsoleOutput(false);
        logger.debug('JCG console output disabled');

        this._jscallgraph = JCG.build();
        logger.info('Initial JS call graph generated');

        this._jscallgraph = this._jscallgraph.filter(edge => {
            return edge.source.file !== "Native" && edge.target.file !== "Native";
        });
        logger.info('Filtered out native calls from the JS call graph');

        // Replaces the start and end point of source nodes with their enclosing function's start and end points
        this._jscallgraph.forEach(edge => {
            edge.source = this.fillEnclosingFunctionOfNode(edge.source);
            edge.target = this.fillEnclosingFunctionOfNode(edge.target);
        });
        logger.info('Enclosing function information filled for all nodes');

        this._refinedCallgraph = new CallGraph(this._jscallgraph);
        logger.info('Refined call graph constructed');
        
        return this._refinedCallgraph;
    }

    fillEnclosingFunctionOfNode(node: FileDetails) {
        if (node.file === "Native") return node;

        logger.debug(`Filling enclosing function for node in file ${node.file}`);
        let enclosingFunction = FileRepository.getEnclosingFunction(node.file, {
            startPosition: node.start,
            endPosition: node.end
        });

        return Object.assign({}, node, enclosingFunction);
    }
}