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

export class CoverageAnalyzer {
    coverageData?: PromiseCoverageReport;
    projectName: string;
    projectPath: string;
    rawCoverageReport!: JScopeCoverageReport;
    RC: Configuration;
    readonly JSCOPE_PATH = process.env.JSCOPE_PATH;

    constructor() {
        this.RC = RuntimeConfig.getInstance().config;
        this.projectName = this.RC.projectName;
        this.projectPath = this.RC.projectPath;
    }

    public async analyze(): Promise<PromiseCoverageReport> {
        // Run JScope on the specified projectPath, process the output, and return the results
        await this.runJScope();
        this.rawCoverageReport = await this.readReport();
        this.coverageData = this.refineReport()

        return this.coverageData;
    }

    refineReport(report: JScopeCoverageReport = this.rawCoverageReport): PromiseCoverageReport {
        let promiseMap = report.promiseMap;
        let functionsMap = report.functionsMap;
        let refinedCoverageReport: PromiseCoverageReport = [];
        Object.entries(promiseMap).forEach(([key, value]) => {
            let decodedLocation = this.decodeLocation(value.location);
            let enclosingFunction = FileRepository.getEnclosingFunction(path.join(this.projectPath, decodedLocation.file), {
                startPosition: decodedLocation.start,
                endPosition: decodedLocation.end
            });

            let warnings = {
                fulfillment: (value.coverage.settle_fulfill === false),
                fulfillReactionRegistration: (value.coverage.register_fulfill === false),
                fulfillReactionExecution: (value.coverage.execute_fulfill === false),
                rejection: (value.coverage.settle_reject === false),
                rejectReactionRegistration: (value.coverage.register_reject === false),
                rejectReactionExecution: (value.coverage.execute_reject === false),
            }

            let refinedPromiseInfo: PromiseInfo = {
                identifier: Number(key),
                enclosingFunction: enclosingFunction!,
                location: decodedLocation,
                type: value.type as PromiseType,
                warnings,
                code: value.code ?? '',
                //TODO: links, inputs, detached function/promise definitions
            }

            if (value.parent) {
                refinedPromiseInfo.parent = this.extractPromiseIdFromString(value.parent)
            }

            refinedCoverageReport.push(refinedPromiseInfo);
        });

        return refinedCoverageReport;
    }

    async readReport(filePath: string = `${this.projectPath}/async-coverage-report.json`): Promise<JScopeCoverageReport> {
        try {
            let {
                default: rawCoverageReport
            } = await import(filePath);
            return rawCoverageReport as JScopeCoverageReport;
        } catch (error) {
            throw new Error("Error occurred while fetching Coverage Report");
        }
    }

    private async runJScope(): Promise<void> {
        let cmd = `node ${this.JSCOPE_PATH} ${this.projectPath} ${this.projectName} --relativePaths`;
        try {
            return await sh(cmd);
        } catch (error) {
            throw new Error("Error occurred while running JScope on the project");
        }
    }

    private decodeLocation(location: string): PromiseLocation {

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
            return
        }
        const match = pid.match(/\d+/);
        return match ? parseInt(match[0], 10) : undefined;
    }
}
