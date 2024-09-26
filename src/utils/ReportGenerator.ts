import { NodeId } from '../types/Graph.type';
import { LLM } from '../types/LLM.type';
import {
    LLMSummary,
    ProjectSummary,
    PromiseSummary,
    Report,
} from '../types/Report.type';
import * as fs from 'fs';
import * as path from 'path';
import logger from './logger';
import { PromiseGraph } from '../components/promise-graph/PromiseGraph';
import { PromiseNode } from '../components/promise-graph/PromiseNode';
import { PromiseFlagTypes } from '../types/PromiseGraph.type';
import RuntimeConfig from '../components/configuration/RuntimeConfig';
import { json } from 'stream/consumers';
import { PromiseLocationToString } from '../types/CoverageAnalyzer.type';

export class ReportGenerator {
    private _report: Report[];
    private static instance: ReportGenerator;
    constructor() {
        this._report = [];
    }

    public static getInstance() {
        if (ReportGenerator.instance == null) {
            ReportGenerator.instance = new ReportGenerator();
        }
        return ReportGenerator.instance;
    }

    get report() {
        return this._report;
    }
    public addData(
        projectName: string,
        model: LLM.Model,
        promiseId: NodeId,
        flag: PromiseFlagTypes,
        passed: boolean,
    ) {
        if (RuntimeConfig.getInstance().config.generateReport == false) {
            return;
        }
        let report = this._report;
        logger.info(
            `Adding data for ${projectName}, ${model}, ${promiseId}, ${flag}, ${passed}`,
        );
        // Find or create the project entry
        let projectEntry = report.find((r) => r.projectName === projectName);
        if (!projectEntry) {
            projectEntry = { projectName, promises: [] };
            report.push(projectEntry);
        }

        // Find or create the LLM report within the project
        let llmReport = projectEntry.promises.find((lr) => lr.LLM === model);
        if (!llmReport) {
            llmReport = { LLM: model, promises: [] };
            projectEntry.promises.push(llmReport);
        }

        // Find or create the promise report within the LLM report
        let promiseReport = llmReport.promises.find(
            (pr) => pr.promiseId === promiseId,
        );
        if (!promiseReport) {
            promiseReport = {
                promiseId,
                location: null,
                flags: [],
            };
            llmReport.promises.push(promiseReport);
        }
    }
    public processData(promiseGraph: PromiseGraph, projectName: string) {
        if (RuntimeConfig.getInstance().config.generateReport == false) {
            return;
        }
        //attach location and code to each promise using the promiseGraph
        logger.info(`Processing data for ${projectName}`);
        this._report
            .find((r) => r.projectName === projectName)
            ?.promises.forEach((llmReport) => {
                llmReport.promises.forEach((promiseReport) => {
                    const promiseNode = promiseGraph.getNode(
                        promiseReport.promiseId,
                    ) as PromiseNode;
                    promiseReport.location = promiseNode.promiseInfo.location;
                });
            });
    }
    public generateReport() {
        if (RuntimeConfig.getInstance().config.generateReport == false) {
            return;
        }
        const report = this._report;

        const detailedCsvData: string[] = [];
        const llmSummaryData: {
            llm: LLM.Model;
            successRate: number;
            successes: number;
            total: number;
        }[] = [];
        const projectSummaryData: {
            projectName: string;
            successRate: number;
        }[] = [];
        const promiseSummaryData: string[] = [];

        // CSV headers
        detailedCsvData.push('Project Name,LLM,Promise Location,Flag,Passed');
        promiseSummaryData.push('Project Name,Location,Flag,Percentage (%)');

        // Initialize totals for project success calculation
        const projectTotals: ProjectSummary = {};
        const llmTotals: LLMSummary = {};
        const promiseLocationTotals: PromiseSummary = {};

        // Collect data for each project
        report.forEach((project) => {
            projectTotals[project.projectName] = projectTotals[
                project.projectName
            ] || { passed: 0, total: 0 };

            project.promises.forEach((llmReport) => {
                const llmKey = `${llmReport.LLM}`;
                llmTotals[llmKey] = llmTotals[llmKey] || {
                    passed: 0,
                    total: 0,
                };

                llmReport.promises.forEach((promise) => {
                    let totalFlagsForPromise = 0;
                    let passedFlagsForPromise = 0;

                    // Retrieve the promise node to get the location and code
                    let location: string = PromiseLocationToString(
                        promise.location!,
                    );
                    logger.info(
                        `Processing promise ${promise.promiseId} at location ${location}`,
                    );

                    // Calculate success rate for the promise
                    promise.flags.forEach((flag) => {
                        const flagType = flag.flag;
                        detailedCsvData.push(
                            `${project.projectName},${llmReport.LLM},${location},${flagType},${flag.passed}`,
                        );
                        totalFlagsForPromise++;
                        if (flag.passed) passedFlagsForPromise++;

                        // Update totals for this specific location and flag
                        let uniqueLocationWithFlag = `${project.projectName}|${location}|${flagType}`;
                        promiseLocationTotals[uniqueLocationWithFlag] =
                            promiseLocationTotals[uniqueLocationWithFlag] || {
                                passed: 0,
                                total: 0,
                                code: '',
                            };
                        promiseLocationTotals[uniqueLocationWithFlag].passed +=
                            flag.passed ? 1 : 0;
                        promiseLocationTotals[uniqueLocationWithFlag].total +=
                            1;
                    });

                    // Update totals for LLM and Project
                    llmTotals[llmKey].passed += passedFlagsForPromise;
                    llmTotals[llmKey].total += totalFlagsForPromise;

                    projectTotals[project.projectName].passed +=
                        passedFlagsForPromise;
                    projectTotals[project.projectName].total +=
                        totalFlagsForPromise;
                });
            });
        });

        // Calculate LLM success rates (only considering LLM, not project name)
        for (const [llmKey, { passed, total }] of Object.entries(llmTotals)) {
            const successRate = total > 0 ? (passed / total) * 100 : 0;
            const llm: LLM.Model = llmKey as LLM.Model; // Type assertion to LLM.Model
            llmSummaryData.push({
                llm,
                successRate: parseFloat(successRate.toFixed(2)),
                successes: passed,
                total,
            });
        }

        // Calculate Project success rates
        for (const [projectName, { passed, total }] of Object.entries(
            projectTotals,
        )) {
            const successRate = total > 0 ? (passed / total) * 100 : 0;
            projectSummaryData.push({
                projectName,
                successRate: parseFloat(successRate.toFixed(2)),
            });
        }

        // Calculate Promise success rates (grouped by location and flag)
        for (const [
            uniqueLocationWithFlag,
            { passed, total, code },
        ] of Object.entries(promiseLocationTotals)) {
            const successRate = total > 0 ? (passed / total) * 100 : 0;
            const [projectName, location, flag] =
                uniqueLocationWithFlag.split('|'); // Extract projectName, location, and flag
            promiseSummaryData.push(
                `${projectName},${location},${flag},${successRate.toFixed(2)}`,
            );
        }

        const directory = path.join(__dirname, '../../../reports');

        // Ensure the reports directory exists
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }

        // Write detailed report to CSV
        const detailedReportPath = path.join(directory, 'detailed_report.csv');
        fs.writeFileSync(
            detailedReportPath,
            detailedCsvData.join('\n'),
            'utf8',
        );
        logger.info(`Detailed report exported to ${detailedReportPath}`);

        // Write LLM success summary to CSV (with number of successes and total promises)
        const llmSummaryCsvData = ['LLM,Success Rate (%),Successes,Total'];
        llmSummaryData.forEach((entry) => {
            llmSummaryCsvData.push(
                `${entry.llm},${entry.successRate},${entry.successes},${entry.total}`,
            );
        });

        const llmSummaryPath = path.join(directory, 'llm_success_summary.csv');
        fs.writeFileSync(llmSummaryPath, llmSummaryCsvData.join('\n'), 'utf8');
        logger.info(`LLM success summary exported to ${llmSummaryPath}`);

        // Write Project success summary to CSV
        const projectSummaryCsvData = ['Project Name,Success Rate (%)'];
        projectSummaryData.forEach((entry) => {
            projectSummaryCsvData.push(
                `${entry.projectName},${entry.successRate}`,
            );
        });

        const projectSummaryPath = path.join(
            directory,
            'project_success_summary.csv',
        );
        fs.writeFileSync(
            projectSummaryPath,
            projectSummaryCsvData.join('\n'),
            'utf8',
        );
        logger.info(
            `Project success summary exported to ${projectSummaryPath}`,
        );

        // Write Promise success summary to CSV (grouped by location and flag)
        const promiseSummaryPath = path.join(
            directory,
            'promise_success_summary.csv',
        );
        fs.writeFileSync(
            promiseSummaryPath,
            promiseSummaryData.join('\n'),
            'utf8',
        );
        logger.info(
            `Promise success summary exported to ${promiseSummaryPath}`,
        );
    }
}
