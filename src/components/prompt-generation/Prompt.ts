import { PromiseNode } from '../promise-graph/PromiseNode';
import RuntimeConfig from '../configuration/RuntimeConfig';
import { Configuration } from '../../types/Configuration.type';

export abstract class Prompt {
    promiseNode: PromiseNode;
    rc: Configuration;

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

    get candidacyReason(): string | undefined {
        if (this.promiseNode.isFulfillable) {
            switch (this.promiseNode.promiseInfo.type) {
                case 'NewPromise':
                    return 'contains a call to resolve() function';
            }
        }
        if (this.promiseNode.isRejectable) {
            switch (this.promiseNode.promiseInfo.type) {
                case 'NewPromise':
                    return 'contains a call to reject() function or a throw keyword';
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
