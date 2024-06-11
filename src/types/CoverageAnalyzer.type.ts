import {Position} from "./File.type";
import {FunctionDefinition} from "./Callgraph.type";

export interface PromiseLocation {
    encoded: string,
    file: string,
    start: Position,
    end: Position,
}

export type PromiseType =
    | "NewPromise"
    | "AsyncFunction"
    | "PromiseThen"
    | "PromiseCatch"
    | "PromiseResolve"
    | "PromiseReject"
    | "PromiseAll"
    | "PromiseRace"
    | "Await";
export type PromiseIdentifier = number;

export interface PromiseCoverageWarnings {
    fulfillment: boolean;
    rejection: boolean;
    fulfillReactionRegistration: boolean;
    rejectReactionRegistration: boolean;
    fulfillReactionExecution: boolean;
    rejectReactionExecution: boolean;
}

export interface PromiseInfo {
    identifier: PromiseIdentifier;
    location: PromiseLocation;
    enclosingFunction: FunctionDefinition;
    type: PromiseType;
    warnings: PromiseCoverageWarnings;
    parent?: PromiseIdentifier;
    links?: PromiseIdentifier[];
    inputs?: PromiseIdentifier[]; // Keeps track of the input promises to .all() and .race()
    code: string;
}

export type PromiseCoverageReport = PromiseInfo[];