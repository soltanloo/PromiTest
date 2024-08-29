import { CoverageAnalyzer } from './coverage-analysis/CoverageAnalyzer';
import { PromiseGraphConstructor } from './promise-graph/PromiseGraphConstructor';
import { PromiseGraphTestabilityMarker } from './candidate-promise-finder/PromiseGraphTestabilityMarker';
import CallgraphGenerator from './call-graph/CallgraphGenerator';
import { PromptGenerator } from './prompt-generation/PromptGenerator';
import TestGenerator from './test-generation/TestGenerator';

export class Main {
    public static async run() {
        const coverageAnalyzer = new CoverageAnalyzer();
        let coverageReport = await coverageAnalyzer.analyze();

        const promiseGraphConstructor = new PromiseGraphConstructor(
            coverageReport,
        );
        let promiseGraph = promiseGraphConstructor.constructGraph();

        const promiseGraphTestabilityMarker = new PromiseGraphTestabilityMarker();
        const markedGraph = await promiseGraphTestabilityMarker.markGraph(promiseGraph)

        const callGraph = new CallgraphGenerator().callgraph;
        let promptGenerator = new PromptGenerator(callGraph);
        let prompts = promptGenerator.generatePrompts(markedGraph);
        const testGenerator = new TestGenerator();
        let tests = testGenerator.generateTests(prompts);
        // testGenerator.augmentTestSuite(tests)
    }
}
