import { PromiseIdentifier } from './CoverageAnalyzer.type';
import { Node } from './Graph.type';

export type PromiseNodeId = PromiseIdentifier;

export interface PromiseNode extends Node {}

export enum IncomingEdges {
    NONE = 'NONE',
    ONE_CHAIN = 'ONE_CHAIN',
    ONE_LINK = 'ONE_LINK',
    LINK_AND_CHAIN = 'LINK_AND_CHAIN',
    MULTIPLE_BUNDLE = 'MULTIPLE_BUNDLE',
}

export type PromiseFlagTypes = 'rejectable' | 'fulfillable' | 'nonSettlable';

export type PromiseFlags = {
    [flag in PromiseFlagTypes]?: boolean;
};
