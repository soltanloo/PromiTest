export type Location = `${string}:${string}:${string}:${string}:${string}`;
export type PromiseType =
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