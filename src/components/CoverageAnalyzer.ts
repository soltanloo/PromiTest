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
type PromiseIdentifier = number;

export interface PromiseCoverageWarnings {
  fulfillment?: boolean;
  rejection?: boolean;
  fulfillReactionRegistration?: boolean;
  rejectReactionRegistration?: boolean;
  fulfillReactionExecution?: boolean;
  rejectReactionExecution?: boolean;
}

export interface PromiseCoverageInfo {
  identifier: PromiseIdentifier;
  location: Location;
  type: PromiseType;
  warnings: PromiseCoverageWarnings;
  parent: PromiseIdentifier;
  code: string;
}

const mockPromiseCoverageData: PromiseCoverageInfo[] = [];

class AsyncCoverageAnalyzer {
  private coverageData?: PromiseCoverageInfo[];

  constructor() {}

  public analyze(): void {}
}
