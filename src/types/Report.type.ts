import { PromiseLocation } from './CoverageAnalyzer.type';
import { NodeId } from './Graph.type';
import { LLM } from './LLM.type';
import { PromiseFlagTypes } from './PromiseGraph.type';
export type Report = {
    projectName: string;
    promises: LLMReport[];
};
type LLMReport = {
    LLM: LLM.Model;
    promises: PromiseReport[];
};
type PromiseReport = {
    promiseId: NodeId;
    location: PromiseLocation | null;
    flags: FlagReport[];
};
type FlagReport = {
    flag: PromiseFlagTypes;
    passed: boolean;
};

export type ProjectSummary = {
    [key: string]: {
        passed: number;
        total: number;
    };
};

export type LLMSummary = {
    [key: string]: {
        passed: number;
        total: number;
    };
};

export type PromiseSummary = {
    [key: string]: {
        passed: number;
        total: number;
        code: string;
    };
};
