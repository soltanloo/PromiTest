import {assert} from "chai";
import {PromiseGraphConstructor} from "../src/components/PromiseGraphConstructor";
import {readJson} from "./common";
import {PromiseCoverageReport} from "../src/types/CoverageAnalyzer.type";
import {PromiseGraphTestabilityMarker} from "../src/components/PromiseGraphTestabilityMarker";

export function runUnitTest(testName: string): void {
    describe(testName, () => {
        it("graph should be correctly marked", async () => {
            let expectedRefinedCoverageReport = await readJson(`./fixtures/expected-outputs/${testName}/expected-refined-coverage-report.json`) as PromiseCoverageReport;
            let promiseGraphConstructor = new PromiseGraphConstructor(expectedRefinedCoverageReport);
            let promiseGraph = promiseGraphConstructor.constructGraph();

            let promiseGraphTestabilityMarker = new PromiseGraphTestabilityMarker();
            promiseGraph = promiseGraphTestabilityMarker.markGraph(promiseGraph);

            let expectedPromiseGraph = await readJson(`./fixtures/expected-outputs/${testName}/expected-marked-promise-graph.json`);
            let actualPromiseGraph = promiseGraph.getNodesAsObject()
            assert.deepEqual(actualPromiseGraph, expectedPromiseGraph);
        });
    })
}

describe("PromiseGraphTestabilityMarker ", () => {
    describe("unit tests", () => {
        runUnitTest("new-promise/nested-never-rejected-and-rejectable");
    })
});
