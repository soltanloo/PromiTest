import { CoverageAnalyzer } from './coverage-analysis/CoverageAnalyzer';
import { PromiseGraphConstructor } from './promise-graph/PromiseGraphConstructor';
import { PromiseGraphTestabilityMarker } from './candidate-promise-finder/PromiseGraphTestabilityMarker';
import { PromptGenerator } from './prompt-generation/PromptGenerator';
import TestGenerator from './test-generation/TestGenerator';
import { P_TYPE } from '../types/JScope.type';
import { PromiseGraph } from './promise-graph/PromiseGraph';

export class Main {
    public static async run() {
        const coverageAnalyzer = new CoverageAnalyzer();
        let coverageReport = await coverageAnalyzer.analyze();

        const promiseGraphConstructor = new PromiseGraphConstructor(
            coverageReport,
        );
        let promiseGraph = promiseGraphConstructor.constructGraph();

        const promiseGraphTestabilityMarker =
            new PromiseGraphTestabilityMarker();
        const markedGraph =
            await promiseGraphTestabilityMarker.markGraph(promiseGraph);

        Main.calculateStats(markedGraph);

        // const callGraph = new CallgraphGenerator().callgraph;
        let promptGenerator = new PromptGenerator();
        let prompts = promptGenerator.generatePrompts(markedGraph);
        const testGenerator = new TestGenerator();
        let tests = await testGenerator.generateTests(prompts);
        // testGenerator.augmentTestSuite(tests)
    }

    private static calculateStats(promiseGraph: PromiseGraph) {
        let stats: any = {};
        promiseGraph.nodes.forEach((node) => {
            let actualType;
            if (
                node.promiseInfo.type === P_TYPE.NewPromise &&
                node.promiseInfo.isApiCall
            )
                actualType = 'API';
            else if (
                node.promiseInfo.type === P_TYPE.NewPromise &&
                !node.promiseInfo.isApiCall &&
                !node.promiseInfo.asyncFunctionDefinition
            )
                actualType = P_TYPE.NewPromise;
            else if (node.promiseInfo.asyncFunctionDefinition)
                actualType = P_TYPE.AsyncFunction;
            else actualType = node.promiseInfo.type;
            if (!stats[actualType]) {
                stats[actualType] = {
                    count: 1,
                    resolvable: node.isFulfillable ? 1 : 0,
                    rejectable: node.isRejectable ? 1 : 0,
                    unresolved: node.promiseInfo.warnings.fulfillment ? 1 : 0,
                    unrejected: node.promiseInfo.warnings.rejection ? 1 : 0,
                };
            } else {
                stats[actualType].count++;
                if (node.isRejectable) {
                    stats[actualType].rejectable++;
                }
                if (node.isFulfillable) {
                    stats[actualType].resolvable++;
                }
                if (node.promiseInfo.warnings.fulfillment) {
                    stats[actualType].unresolved++;
                }
                if (node.promiseInfo.warnings.rejection) {
                    stats[actualType].unrejected++;
                }
            }
        });
        return stats;
    }
}
