import {assert} from "chai";
import {PromiseGraphConstructor} from "../src/components/promise-graph/PromiseGraphConstructor";
import {readJson} from "./common";
import {PromiseCoverageReport} from "../src/types/CoverageAnalyzer.type";
import {PromiseGraphTestabilityMarker} from "../src/components/candidate-promise-finder/PromiseGraphTestabilityMarker";

export function runUnitTest(testName: string): void {
    describe(testName, function () {
        it("graph should be correctly marked", async function () {
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

describe("PromiseGraphTestabilityMarker ", function () {
    describe("unit tests", function () {
        runUnitTest("new-promise/nested-never-rejected-and-rejectable");
    })
});
