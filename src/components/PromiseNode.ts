import {PromiseIdentifier, PromiseInfo} from "../types/CoverageAnalyzer.type";

export class PromiseNode {
    promiseInfo: PromiseInfo;
    identifier: PromiseIdentifier;
    chainedParent?: PromiseNode;
    linkedParents?: PromiseNode[];
    bundledParents?: PromiseNode[];


    constructor(identifier: PromiseIdentifier, info: PromiseInfo) {
        this.identifier = identifier;
        this.promiseInfo = info;
    }
}
