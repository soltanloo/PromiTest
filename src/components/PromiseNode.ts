import {PromiseIdentifier, PromiseInfo} from "../types/CoverageAnalyzer.type";
import {IncomingEdges} from "../types/PromiseGraph.types";
import {Prompt} from "./Prompt";

export class PromiseNode {
    promiseInfo: PromiseInfo;
    identifier: PromiseIdentifier;
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


    constructor(identifier: PromiseIdentifier, info: PromiseInfo) {
        this.identifier = identifier;
        this.promiseInfo = info;
        this.incomingEdges = this.calculateIncomingEdges();
    }

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
