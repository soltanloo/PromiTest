import * as console from "node:console";
import {PromiseCoverageReport} from "../types/CoverageAnalyzer.type";
import RuntimeConfig from "./RuntimeConfig";
import {Configuration} from "../types/Configuration.type";

export class CoverageAnalyzer {
    coverageData?: PromiseCoverageReport;
    projectName: string;
    projectPath: string;
    rawCoverageReport: any;
    RC: Configuration;

    constructor() {
        this.RC = RuntimeConfig.getInstance().config;
        this.projectName = this.RC.projectName;
        this.projectPath = this.RC.projectPath;
    }

    public async analyze(): Promise<PromiseCoverageReport> {
        // Run JScope on the specified projectPath, process the output, and return the results
        this.rawCoverageReport = await this.readReport();
        this.coverageData = this.refineReport()

        return this.coverageData;
    }

    private async readReport(): Promise<any> {
        try {
            let filePath = `${this.projectPath}/jscope-report.json`;
            let {
                default: rawCoverageReport
            } = await import(filePath);
            return rawCoverageReport;
        } catch (error) {
            console.log(error)
            throw new Error("Error occurred while fetching Coverage Report");
        }
    }

    private refineReport(): PromiseCoverageReport {
        //TODO: Do the refinement on the raw coverage report
        return this.rawCoverageReport;
    }
}
