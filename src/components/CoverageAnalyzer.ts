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

// TODO: Read from a file
const mockPromiseCoverageData: PromiseCoverageReport = [
  {
    identifier: 116,
    location: "path/to/file.js:12:5:17:20",
    type: "NewPromise",
    warnings: {
      rejection: true,
    },
    links: [],
    code: `new Promise((resolve, reject) => {
                    if (num > 10) {
                        resolve("The number is greater than 10!");
                    } else {
                        reject("The number is not greater than 10.");
                    }
                });`,
  },
];

export class CoverageAnalyzer {
  private coverageData?: PromiseCoverageReport;

  constructor(projectPath: string) {}

  public analyze(): PromiseCoverageReport {
    // Run JScope on the specified projectPath, process the output, and return the results
    return mockPromiseCoverageData;
  }
}
