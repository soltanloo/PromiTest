import {assert} from "chai";
import {readJson} from "./common";
import RuntimeConfig from "../src/components/RuntimeConfig";
import path from 'path';
import CallgraphGenerator from "../src/components/CallgraphGenerator";
import {PromiseCoverageReport} from "../src/types/CoverageAnalyzer.type";
import {PromiseGraphConstructor} from "../src/components/PromiseGraphConstructor";
import {PromiseGraphTestabilityMarker} from "../src/components/PromiseGraphTestabilityMarker";
import {PromptGenerator} from "../src/components/PromptGenerator";

export function runUnitTest(testName: string): void {
    describe(testName, function () {
        before(async function () {
            let projectPath = path.resolve(__dirname, `fixtures/code/${testName}`);
            console.log(projectPath)
            RuntimeConfig.getInstance(projectPath)
        })
        it("callgraph should be correctly generated", async function () {
            let callgraphGenerator = new CallgraphGenerator();
            let expectedCallgraph = await readJson(`./fixtures/expected-outputs/${testName}/expected-callgraph.json`);
            let actualCallgraph = callgraphGenerator.callgraph.getNodesAsObject();

            let expectedRefinedCoverageReport = await readJson(`./fixtures/expected-outputs/${testName}/expected-refined-coverage-report.json`) as PromiseCoverageReport;
            let promiseGraph = new PromiseGraphConstructor(expectedRefinedCoverageReport).constructGraph();

            let promiseGraphTestabilityMarker = new PromiseGraphTestabilityMarker();
            let markedPromiseGraph = promiseGraphTestabilityMarker.markGraph(promiseGraph);

            let promptGenerator = new PromptGenerator(callgraphGenerator.callgraph);
            promptGenerator.generatePrompts(markedPromiseGraph);

            assert.deepEqual(actualCallgraph, expectedCallgraph);
        });
    })
}

describe("CallgraphGenerator ", function () {
    describe("unit tests", function () {
        runUnitTest("new-promise/nested-never-rejected-and-rejectable");
    })
});
