import {PromiseGraphConstructor} from "../src/components/PromiseGraphConstructor";
import {readJson} from "./common";
import {PromiseCoverageReport} from "../src/types/CoverageAnalyzer.type";
import {PromiseGraphTestabilityMarker} from "../src/components/PromiseGraphTestabilityMarker";
import {PromptGenerator} from "../src/components/PromptGenerator";
import path from "path";
import RuntimeConfig from "../src/components/RuntimeConfig";
import CallgraphGenerator from "../src/components/CallgraphGenerator";

export function runUnitTest(testName: string): void {
    describe(testName, function () {
        before(async function () {
            let projectPath = path.resolve(__dirname, `fixtures/code/${testName}`);
            RuntimeConfig.getInstance(projectPath)
        })

        it("prompts should be correctly generated", async function () {
            let expectedRefinedCoverageReport = await readJson(`./fixtures/expected-outputs/${testName}/expected-refined-coverage-report.json`) as PromiseCoverageReport;
            let promiseGraphConstructor = new PromiseGraphConstructor(expectedRefinedCoverageReport);
            promiseGraphConstructor.constructGraph();

            let promiseGraphTestabilityMarker = new PromiseGraphTestabilityMarker();
            promiseGraphTestabilityMarker.markGraph(promiseGraphConstructor.promiseGraph);

            let callgraphGenerator = new CallgraphGenerator();

            let promptGenerator = new PromptGenerator(callgraphGenerator.callgraph);
            promptGenerator.generatePrompts(promiseGraphConstructor.promiseGraph);

            // let expectedPrompts = await readJson(`./fixtures/expected-outputs/${testName}/expected-prompts.json`);
            // let actualPrompts =
            // assert.deepEqual(actualPrompts, expectedPrompts);
        });
    })
}

describe("PromptGenerator ", function () {
    describe("unit tests", function () {
        runUnitTest("new-promise/nested-never-rejected-and-rejectable");
    })
});
