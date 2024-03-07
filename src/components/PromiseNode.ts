import {PromiseInfo} from "./CoverageAnalyzer";

export class PromiseNode {
    promiseInfo: PromiseInfo;
    identifier: number;

    constructor(identifier: number, info: PromiseInfo) {
        this.identifier = identifier;
        this.promiseInfo = info;
    }
}