import {
    PromiseCoverageReport,
    PromiseIdentifier,
    PromiseInfo,
    PromiseLocation,
    PromiseType
} from "../../types/CoverageAnalyzer.type";
import RuntimeConfig from "../configuration/RuntimeConfig";
import {Configuration} from "../../types/Configuration.type";
import * as process from "node:process";
import {sh} from "../../utils/sh";
import {JScopeCoverageReport, Pid} from "../../types/JScope.type";
import FileRepository from "../apis/FileRepository";
import path from "path";
import logger from "../../utils/logger"; // Import logger

export class CoverageAnalyzer {
    coverageData?: PromiseCoverageReport;
    projectName: string;
    projectPath: string;
    rawCoverageReport!: JScopeCoverageReport;
    RC: Configuration;
    readonly JSCOPE_PATH = process.env.JSCOPE_PATH;

    constructor() {
        logger.debug("Initializing CoverageAnalyzer");
        this.RC = RuntimeConfig.getInstance().config;
        this.projectName = this.RC.projectName;
        this.projectPath = this.RC.projectPath;
        logger.info(`Initialized CoverageAnalyzer for project: ${this.projectName}, path: ${this.projectPath}`);
    }

    public async analyze(): Promise<PromiseCoverageReport> {
        logger.info("Starting analysis with JScope");
        await this.runJScope();
        logger.debug("JScope execution completed");

        this.rawCoverageReport = await this.readReport();
        logger.debug("Coverage report read successfully");

        this.coverageData = this.refineReport();
        logger.info("Refined coverage report generated");

        return this.coverageData;
    }

    refineReport(report: JScopeCoverageReport = this.rawCoverageReport): PromiseCoverageReport {
        logger.debug("Refining coverage report");
        let promiseMap = report.promiseMap;
        let functionsMap = report.functionsMap;
        let refinedCoverageReport: PromiseCoverageReport = [];

        Object.entries(promiseMap).forEach(([key, value]) => {
            let decodedLocation = this.decodeLocation(value.location);
            logger.debug(`Decoded location for promise ${key}: ${JSON.stringify(decodedLocation)}`);

            let enclosingFunction = FileRepository.getEnclosingFunction(path.join(this.projectPath, decodedLocation.file), {
                startPosition: decodedLocation.start,
                endPosition: decodedLocation.end
            });

            if (enclosingFunction) {
                logger.debug(`Enclosing function found for promise ${key}: ${enclosingFunction.name}`);
            } else {
                logger.warn(`No enclosing function found for promise ${key}`);
            }

            let warnings = {
                fulfillment: (value.coverage.settle_fulfill === false),
                fulfillReactionRegistration: (value.coverage.register_fulfill === false),
                fulfillReactionExecution: (value.coverage.execute_fulfill === false),
                rejection: (value.coverage.settle_reject === false),
                rejectReactionRegistration: (value.coverage.register_reject === false),
                rejectReactionExecution: (value.coverage.execute_reject === false),
            };
            logger.debug(`Warnings for promise ${key}: ${JSON.stringify(warnings)}`);

            let refinedPromiseInfo: PromiseInfo = {
                identifier: Number(key),
                enclosingFunction: enclosingFunction!,
                location: decodedLocation,
                type: value.type as PromiseType,
                warnings,
                code: value.code ?? '',
            };

            if (value.parent) {
                refinedPromiseInfo.parent = this.extractPromiseIdFromString(value.parent);
                logger.debug(`Parent promise id for ${key}: ${refinedPromiseInfo.parent}`);
            }

            refinedCoverageReport.push(refinedPromiseInfo);
            logger.info(`Promise ${key} refined and added to the report`);
        });

        return refinedCoverageReport;
    }

    async readReport(filePath: string = `${this.projectPath}/async-coverage-report.json`): Promise<JScopeCoverageReport> {
        logger.debug(`Reading coverage report from ${filePath}`);
        try {
            let { default: rawCoverageReport } = await import(filePath);
            logger.info("Coverage report loaded successfully");
            return rawCoverageReport as JScopeCoverageReport;
        } catch (error) {
            logger.error("Error occurred while fetching Coverage Report:", { message: error });
            throw new Error("Error occurred while fetching Coverage Report");
        }
    }

    private async runJScope(): Promise<void> {
        let cmd = `node ${this.JSCOPE_PATH} ${this.projectPath} ${this.projectName} --relativePaths`;
        logger.debug(`Running JScope with command: ${cmd}`);
        try {
            await sh(cmd);
            logger.info("JScope run completed successfully");
        } catch (error) {
            logger.error("Error occurred while running JScope on the project:", { message: error });
            throw new Error("Error occurred while running JScope on the project");
        }
    }

    private decodeLocation(location: string): PromiseLocation {
        logger.debug(`Decoding location: ${location}`);
        const parts = location.split(':');

        return {
            encoded: location,
            file: parts[0],
            start: {
                row: parseInt(parts[1], 10),
                column: parseInt(parts[2], 10),
            },
            end: {
                row: parseInt(parts[3], 10),
                column: parseInt(parts[4], 10),
            }
        };
    }

    private extractPromiseIdFromString(pid: Pid | null): PromiseIdentifier | undefined {
        if (pid === null || pid === undefined) {
            logger.debug("Promise ID is null or undefined, skipping extraction");
            return;
        }
        const match = pid.match(/\d+/);
        const extractedId = match ? parseInt(match[0], 10) : undefined;
        logger.debug(`Extracted Promise ID: ${extractedId}`);
        return extractedId;
    }
}