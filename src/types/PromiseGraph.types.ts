import {PromiseIdentifier} from "./CoverageAnalyzer.type";
import {PromiseNode} from "../components/PromiseNode";

export type NodeDirectory = Map<PromiseIdentifier, PromiseNode>;
export type PromiseAdjacencyMap = Map<PromiseIdentifier, PromiseNode[]>;

export enum IncomingEdges {
    NONE = "NONE",
    ONE_CHAIN = "ONE_CHAIN",
    ONE_LINK = "ONE_LINK",
    LINK_AND_CHAIN = "LINK_AND_CHAIN",
    MULTIPLE_BUNDLE = "MULTIPLE_BUNDLE"
}