import {PromiseIdentifier} from "./CoverageAnalyzer.type";
import {PromiseNode} from "../components/PromiseNode";

export type NodeDirectory = Map<PromiseIdentifier, PromiseNode>;
export type PromiseAdjacencyMap = Map<PromiseIdentifier, PromiseNode[]>;