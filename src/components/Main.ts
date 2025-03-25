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

        let graphStats = promiseGraph.getGraphStatistics();

        const promiseGraphTestabilityMarker =
            new PromiseGraphTestabilityMarker();
        const markedGraph =
            await promiseGraphTestabilityMarker.markGraph(promiseGraph);

        Main.calculateStats(markedGraph);

        let promptGenerator = new PromptGenerator();
        let prompts = promptGenerator.generatePrompts(markedGraph);
        const testGenerator = new TestGenerator();
        let tests = await testGenerator.generateTests(prompts);
        // testGenerator.augmentTestSuite(tests)
    }

    private static calculateStats(promiseGraph: PromiseGraph) {
        let stats: any = {};
        let totalRejectable = 0;
        let totalResolvable = 0;
        let totalPromises = 0;

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

            // Initialize stats for new types
            if (!stats[actualType]) {
                stats[actualType] = {
                    count: 1,
                    resolvable: node.isFulfillable ? 1 : 0,
                    rejectable: node.isRejectable ? 1 : 0,
                    unresolved: node.promiseInfo.warnings.fulfillment ? 1 : 0,
                    unrejected: node.promiseInfo.warnings.rejection ? 1 : 0,
                    resolvableIds: node.isFulfillable ? [node.id] : [],
                    rejectableIds: node.isRejectable ? [node.id] : [],
                    unresolvedIds: node.promiseInfo.warnings.fulfillment
                        ? [node.id]
                        : [],
                    unrejectedIds: node.promiseInfo.warnings.rejection
                        ? [node.id]
                        : [],
                };

                // Count for total promises, resolvable, and rejectable
                totalPromises++;
                if (node.isRejectable) totalRejectable++;
                if (node.isFulfillable) totalResolvable++;
            } else {
                stats[actualType].count++;
                if (node.isRejectable) {
                    stats[actualType].rejectable++;
                    stats[actualType].rejectableIds.push(node.id);
                    totalRejectable++;
                }
                if (node.isFulfillable) {
                    stats[actualType].resolvable++;
                    stats[actualType].resolvableIds.push(node.id);
                    totalResolvable++;
                }
                if (node.promiseInfo.warnings.fulfillment) {
                    stats[actualType].unresolved++;
                    stats[actualType].unresolvedIds.push(node.id);
                }
                if (node.promiseInfo.warnings.rejection) {
                    stats[actualType].unrejected++;
                    stats[actualType].unrejectedIds.push(node.id);
                }

                // Increment total promises count
                totalPromises++;
            }
        });

        // Add the totals to the stats object
        stats.total = {
            totalRejectable,
            totalResolvable,
            totalPromises,
        };

        return stats;
    }
}
