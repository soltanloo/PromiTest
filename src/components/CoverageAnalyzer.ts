import * as console from "node:console";
import { PromiseCoverageReport } from "../types/CoverageAnalyzer.type";

export class CoverageAnalyzer {
    static REPORTS_PATH = "../../coverage-reports";
    coverageData?: PromiseCoverageReport;
    projectName: string;
    projectPath: string;
    rawCoverageReport: any;

    constructor(projectName: string, projectPath: string) {
        this.projectName = projectName;
        this.projectPath = projectPath;
    }

    public async analyze(): Promise<PromiseCoverageReport> {
        // Run JScope on the specified projectPath, process the output, and return the results
        this.rawCoverageReport = await this.readReport();
        this.coverageData = this.refineReport()

        return this.coverageData;
    }

    private async readReport(): Promise<any> {
        try {
            let filePath = `${CoverageAnalyzer.REPORTS_PATH}/${this.projectName}.json`;
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
