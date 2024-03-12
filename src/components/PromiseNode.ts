import {PromiseIdentifier, PromiseInfo} from "./CoverageAnalyzer";

export class PromiseNode {
    promiseInfo: PromiseInfo;
    identifier: PromiseIdentifier;

    constructor(identifier: PromiseIdentifier, info: PromiseInfo) {
        this.identifier = identifier;
        this.promiseInfo = info;
    }
}