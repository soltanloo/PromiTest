import { assert } from 'chai';
import { readJson } from './common';
import RuntimeConfig from '../src/components/configuration/RuntimeConfig';
import path from 'path';
import CallgraphGenerator from '../src/components/call-graph/CallgraphGenerator';
import { PromiseCoverageReport } from '../src/types/CoverageAnalyzer.type';
import { PromiseGraphConstructor } from '../src/components/promise-graph/PromiseGraphConstructor';
import { PromiseGraphTestabilityMarker } from '../src/components/candidate-promise-finder/PromiseGraphTestabilityMarker';
import { PromptGenerator } from '../src/components/prompt-generation/PromptGenerator';

export function runUnitTest(testName: string): void {
    describe(testName, function () {
        before(async function () {
            let projectPath = path.resolve(
                __dirname,
                `fixtures/code/${testName}`,
            );
            RuntimeConfig.getInstance(projectPath);
        });
        it('callgraph should be correctly generated', async function () {
            let callgraphGenerator = new CallgraphGenerator();
            let expectedCallgraph = await readJson(
                `./fixtures/expected-outputs/${testName}/expected-callgraph.json`,
            );
            let actualCallgraph =
                callgraphGenerator.callgraph.getNodesAsObject();

            let expectedRefinedCoverageReport = (await readJson(
                `./fixtures/expected-outputs/${testName}/expected-refined-coverage-report.json`,
            )) as PromiseCoverageReport;
            let promiseGraph = new PromiseGraphConstructor(
                expectedRefinedCoverageReport,
            ).constructGraph();

            let promiseGraphTestabilityMarker =
                new PromiseGraphTestabilityMarker();
            let markedPromiseGraph =
                promiseGraphTestabilityMarker.markGraph(promiseGraph);

            let promptGenerator = new PromptGenerator(
                callgraphGenerator.callgraph,
            );
            promptGenerator.generatePrompts(markedPromiseGraph);

            assert.deepEqual(actualCallgraph, expectedCallgraph);
        });
    });
}
