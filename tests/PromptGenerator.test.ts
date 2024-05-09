import {PromiseGraphConstructor} from "../src/components/PromiseGraphConstructor";
import {readJson} from "./common";
import {PromiseCoverageReport} from "../src/types/CoverageAnalyzer.type";
import {PromiseGraphTestabilityMarker} from "../src/components/PromiseGraphTestabilityMarker";
import {PromptGenerator} from "../src/components/PromptGenerator";

function runUnitTest(testName: string): void {
    describe(testName, () => {
        it("prompts should be correctly generated", async () => {
            let expectedRefinedCoverageReport = await readJson(`./fixtures/${testName}/expected-refined-coverage-report.json`) as PromiseCoverageReport;
            let promiseGraphConstructor = new PromiseGraphConstructor(expectedRefinedCoverageReport);
            promiseGraphConstructor.constructGraph();

            let promiseGraphTestabilityMarker = new PromiseGraphTestabilityMarker();
            promiseGraphTestabilityMarker.markGraph(promiseGraphConstructor.promiseGraph);

            let promptGenerator = new PromptGenerator();
            promptGenerator.generatePrompts(promiseGraphConstructor.promiseGraph);

            let expectedPrompts = await readJson(`./fixtures/${testName}/expected-prompts.json`);
            // let actualPromiseGraph = promiseGraphConstructor.getNodeDirectoryAsObject();
            // assert.deepEqual(actualPromiseGraph, expectedPromiseGraph);
        });
    })
}

describe("PromptGenerator ", () => {
    describe("unit tests", () => {
        runUnitTest("new-promise-never-rejected-and-rejectable");
    })
});
