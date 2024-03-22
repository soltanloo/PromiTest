import {PromiseIdentifier, PromiseInfo} from "../types/CoverageAnalyzer.type";

export class PromiseNode {
    promiseInfo: PromiseInfo;
    identifier: PromiseIdentifier;
    chainedParent?: PromiseNode;
    linkedParents?: PromiseNode[];
    bundledParents?: PromiseNode[];

    flags?: {
        rejectable?: boolean;
        fulfillable?: boolean;
        nonSettlable?: boolean;
    }


    constructor(identifier: PromiseIdentifier, info: PromiseInfo) {
        this.identifier = identifier;
        this.promiseInfo = info;
    }
}
