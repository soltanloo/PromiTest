import {PromiseCoverageReport, PromiseIdentifier} from "./CoverageAnalyzer";
import {PromiseNode} from "./PromiseNode";

export class PromiseGraphConstructor {
    promiseCoverageData: PromiseCoverageReport;
    nodesList: Map<PromiseIdentifier, PromiseNode> = new Map;

    constructor(_promiseCoverageData: PromiseCoverageReport) {
        this.promiseCoverageData = _promiseCoverageData;
    }

    public constructGraph() {
        this.promiseCoverageData.forEach(promise => this.nodesList.set(promise.identifier, new PromiseNode(promise.identifier, promise)))
    }

}