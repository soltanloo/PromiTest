import {PromiseNode} from "./PromiseNode";
import {PromiseGraph} from "./PromiseGraph";
import {PromiseCoverageReport, PromiseIdentifier} from "../../types/CoverageAnalyzer.type";
import logger from "../../utils/logger";

export class PromiseGraphConstructor {
    promiseCoverageData: PromiseCoverageReport;
    promiseGraph!: PromiseGraph;

    constructor(_promiseCoverageData: PromiseCoverageReport) {
        this.promiseCoverageData = _promiseCoverageData;
    }

    public constructGraph(): PromiseGraph {
        logger.info("Constructing promise graph");
        const nodeDirectory = new Map<PromiseIdentifier, PromiseNode>();
        this.promiseCoverageData.forEach((promise) => {
                nodeDirectory.set(
                    promise.identifier,
                    new PromiseNode(promise.identifier, promise),
                )
            }
        );

        this.promiseGraph = new PromiseGraph(nodeDirectory);
        logger.debug("Promise graph constructed successfully");
        return this.promiseGraph;
    }
}
