type Location = `${string}:${string}:${string}:${string}:${string}`;
type PromiseType =
    | "NewPromise"
    | "AsyncFunction"
    | "PromiseThen"
    | "PromiseCatch"
    | "PromiseResolve"
    | "PromiseReject"
    | "PromiseAll"
    | "PromiseRace";
export type PromiseIdentifier = number;

export interface PromiseCoverageWarnings {
    fulfillment?: boolean;
    rejection?: boolean;
    fulfillReactionRegistration?: boolean;
    rejectReactionRegistration?: boolean;
    fulfillReactionExecution?: boolean;
    rejectReactionExecution?: boolean;
}

export interface PromiseInfo {
    identifier: PromiseIdentifier;
    location: Location;
    type: PromiseType;
    warnings: PromiseCoverageWarnings;
    parent?: PromiseIdentifier;
    links?: PromiseIdentifier[];
    inputs?: PromiseIdentifier[]; // Keeps track of the input promises to .all() and .race()
    code: string;
}

export type PromiseCoverageReport = PromiseInfo[];

export class CoverageAnalyzer {
    static REPORTS_PATH = "../coverage-reports";
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
        let rawCoverageReport;
        try {
            rawCoverageReport = await fetch(`${CoverageAnalyzer.REPORTS_PATH}/${this.projectName}.json`);
            if (rawCoverageReport.ok) {
                return await rawCoverageReport.json() as any;
            } else {
                throw new Error();
            }
        } catch (error) {
            throw new Error("Error occurred while fetching Coverage Report");
        }
    }

    private refineReport(): PromiseCoverageReport {
        //TODO: Do the refinement on the raw coverage report
        return this.rawCoverageReport;
    }
}
