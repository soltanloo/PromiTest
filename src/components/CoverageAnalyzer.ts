import {PromiseCoverageReport} from "../types/CoverageAnalyzer.type";
import RuntimeConfig from "./RuntimeConfig";
import {Configuration} from "../types/Configuration.type";
import * as process from "node:process";
import {sh} from "../utils/sh";

export class CoverageAnalyzer {
    coverageData?: PromiseCoverageReport;
    projectName: string;
    projectPath: string;
    rawCoverageReport: any;
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

    private async runJScope(): Promise<void> {
        let cmd = `node ${this.JSCOPE_PATH} ${this.projectPath} ${this.projectName} --relativePaths`;
        try {
            return await sh(cmd);
        } catch (error) {
            throw new Error("Error occurred while running JScope on the project");
        }
    }

    private async readReport(): Promise<any> {
        try {
            let filePath = `${this.projectPath}/async-coverage-report.json`;
            let {
                default: rawCoverageReport
            } = await import(filePath);
            return rawCoverageReport;
        } catch (error) {
            throw new Error("Error occurred while fetching Coverage Report");
        }
    }

    private refineReport(): PromiseCoverageReport {
        //TODO: Do the refinement on the raw coverage report
        return this.rawCoverageReport;
    }
}
