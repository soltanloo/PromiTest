import {assert} from "chai";
import {PromiseGraphConstructor} from "../src/components/PromiseGraphConstructor";
import {readJson} from "./common";
import {PromiseCoverageReport} from "../src/types/CoverageAnalyzer.type";
import {PromiseGraphTestabilityMarker} from "../src/components/PromiseGraphTestabilityMarker";

function runUnitTest(testName: string): void {
    describe(testName, () => {
        it("graph should be correctly marked", async () => {
            let expectedRefinedCoverageReport = await readJson(`./fixtures/${testName}/expected-refined-coverage-report.json`) as PromiseCoverageReport;
            let promiseGraphConstructor = new PromiseGraphConstructor(expectedRefinedCoverageReport);
            promiseGraphConstructor.constructGraph();

            let promiseGraphTestabilityMarker = new PromiseGraphTestabilityMarker();
            promiseGraphTestabilityMarker.markGraph(promiseGraphConstructor.promiseGraph);

            let expectedPromiseGraph = await readJson(`./fixtures/${testName}/expected-marked-promise-graph.json`);
            let actualPromiseGraph = promiseGraphConstructor.getNodeDirectoryAsObject();
            assert.deepEqual(actualPromiseGraph, expectedPromiseGraph);
        });
    })
}

describe("PromiseGraphTestabilityMarker ", () => {
    describe("unit tests", () => {
        runUnitTest("new-promise-never-rejected-and-rejectable");
    })
});
