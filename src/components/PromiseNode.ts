import {PromiseInfo} from "../types/CoverageAnalyzer.type";
import {IncomingEdges, PromiseNodeId} from "../types/PromiseGraph.type";
import {Prompt} from "./Prompt";
import {Node} from "../types/Graph.type";

//TODO: Define PromiseNode interface that extends Node and then define a new class that implements PromiseNode interface
export class PromiseNode implements Node {
    promiseInfo: PromiseInfo;
    id: PromiseNodeId;
    incomingEdges: IncomingEdges;
    chainedParent?: PromiseNode;
    linkedParents?: PromiseNode[];
    bundledParents?: PromiseNode[];
    prompt?: Prompt;

    flags: {
        rejectable?: boolean;
        fulfillable?: boolean;
        nonSettlable?: boolean;
    } = {}


    constructor(id: PromiseNodeId, info: PromiseInfo) {
        this.id = id;
        this.promiseInfo = info;
        this.incomingEdges = this.calculateIncomingEdges();
    }

    //FIXME: calculate based on the promise graph edges, not the properties of promiseInfo.
    public calculateIncomingEdges(): IncomingEdges {
        const hasBundledInputs = !!this.promiseInfo.inputs?.length;
        const hasChainedParent = !!this.promiseInfo.parent;
        const hasLinkedParent = !!this.promiseInfo.links?.length;

        if (hasBundledInputs) {
            return IncomingEdges.MULTIPLE_BUNDLE;
        }
        if (hasChainedParent && hasLinkedParent) {
            return IncomingEdges.LINK_AND_CHAIN;
        }
        if (hasChainedParent) {
            return IncomingEdges.ONE_CHAIN;
        }
        if (hasLinkedParent) {
            return IncomingEdges.ONE_LINK;
        }
        return IncomingEdges.NONE;
    }
}
