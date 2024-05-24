import {assert} from "chai";
import {PromiseGraphConstructor} from "../src/components/PromiseGraphConstructor";
import {readJson} from "./common";
import {PromiseCoverageReport} from "../src/types/CoverageAnalyzer.type";

function runUnitTest(testName: string): void {
    describe(testName, () => {
        it("graph adjacency map should be correctly built", async () => {
            let expectedRefinedCoverageReport = await readJson(`./fixtures/${testName}/expected-refined-coverage-report.json`) as PromiseCoverageReport;
            let promiseGraphConstructor = new PromiseGraphConstructor(expectedRefinedCoverageReport);
            let promiseGraph = promiseGraphConstructor.constructGraph();

            let expectedPromiseGraph = await readJson(`./fixtures/${testName}/expected-promise-graph.json`);
            let actualPromiseGraph = promiseGraph.getAdjacencyListAsObject()
            assert.deepEqual(actualPromiseGraph, expectedPromiseGraph);
        });
    })
}

describe("PromiseGraphConstructor ", () => {
    describe("unit tests", () => {
        runUnitTest("new-promise-never-rejected-and-rejectable");
    })
});
