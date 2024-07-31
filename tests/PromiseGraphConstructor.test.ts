import {assert} from "chai";
import {PromiseGraphConstructor} from "../src/components/promise-graph/PromiseGraphConstructor";
import {readJson} from "./common";
import {PromiseCoverageReport} from "../src/types/CoverageAnalyzer.type";

export function runUnitTest(testName: string): void {
    describe(testName, function () {
        it("graph adjacency map should be correctly built", async function () {
            let expectedRefinedCoverageReport = await readJson(`./fixtures/expected-outputs/${testName}/expected-refined-coverage-report.json`) as PromiseCoverageReport;
            let promiseGraphConstructor = new PromiseGraphConstructor(expectedRefinedCoverageReport);
            let promiseGraph = promiseGraphConstructor.constructGraph();

            let expectedPromiseGraph = await readJson(`./fixtures/expected-outputs/${testName}/expected-promise-graph.json`);
            let actualPromiseGraph = promiseGraph.getAdjacencyListAsObject()
            assert.deepEqual(actualPromiseGraph, expectedPromiseGraph);
        });
    })
}
