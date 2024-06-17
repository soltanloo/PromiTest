import {PromiseInfo} from "../../types/CoverageAnalyzer.type";
import {IncomingEdges, PromiseFlags, PromiseNodeId} from "../../types/PromiseGraph.type";
import {Node} from "../../types/Graph.type";
import {Prompts} from "../../types/Prompt.type";

//TODO: Define PromiseNode interface that extends Node and then define a new class that implements PromiseNode interface
export class PromiseNode implements Node {
    promiseInfo: PromiseInfo;
    id: PromiseNodeId;
    incomingEdges: IncomingEdges;
    chainedParent?: PromiseNode;
    linkedParents?: PromiseNode[];
    bundledParents?: PromiseNode[];

    prompts: Prompts = {};

    flags: PromiseFlags = {};


    constructor(id: PromiseNodeId, info: PromiseInfo) {
        this.id = id;
        this.promiseInfo = info;
        this.incomingEdges = this.calculateIncomingEdges();
    }

    get neverRejected(): boolean {
        return this.promiseInfo.warnings.rejection;
    }

    get neverResolved(): boolean {
        return this.promiseInfo.warnings.fulfillment;
    }

    get isFulfillable(): boolean {
        return !!this.flags.fulfillable;
    }

    get isRejectable(): boolean {
        return !!this.flags.rejectable;
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
