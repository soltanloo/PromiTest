import { PromiseNode } from '../promise-graph/PromiseNode';
import RuntimeConfig from '../configuration/RuntimeConfig';
import { Configuration } from '../../types/Configuration.type';
import { P_TYPE } from '../../types/JScope.type';
import { PromiseFlagTypes } from '../../types/PromiseGraph.type';

export abstract class Prompt {
    promiseNode: PromiseNode;
    rc: Configuration;
    testPath?: string;
    flag?: PromiseFlagTypes;

    constructor(promiseNode: PromiseNode) {
        this.promiseNode = promiseNode;
        this.rc = RuntimeConfig.getInstance().config;
    }

    private _string: string = '';

    get string(): string {
        return this._string;
    }

    set string(value: string) {
        this._string = value;
    }

    get candidacyReason() {
        if (this.promiseNode.isFulfillable && this.flag === 'fulfillable') {
            switch (this.promiseNode.promiseInfo.type) {
                case P_TYPE.NewPromise:
                    if (this.promiseNode.promiseInfo.isApiCall)
                        return 'is an call to a function outside the program and may be able to resolve';
                    else return 'contains a call to resolve() function';
                case P_TYPE.AsyncFunction:
                    return 'the error throwing of the function can be bypassed';
                default:
                    return '';
            }
        }
        if (this.promiseNode.isRejectable && this.flag === 'rejectable') {
            switch (this.promiseNode.promiseInfo.type) {
                case P_TYPE.NewPromise:
                    if (this.promiseNode.promiseInfo.isApiCall)
                        return 'is an call to a function outside the program and may be able to reject';
                    return 'contains a call to reject() or assert() functions, or a throw keyword';
                case P_TYPE.AsyncFunction:
                    return 'contains a throw statement, or a call to assert()';
                default:
                    return '';
            }
        }
    }

    static replacePlaceholders(
        template: string,
        data: { [key: string]: string },
    ): string {
        return template.replace(/{{(.*?)}}/g, (_, key) => data[key.trim()]);
    }

    abstract getPromptText(): string;
}
