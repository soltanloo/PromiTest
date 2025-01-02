import { PromiseInfo } from '../../types/CoverageAnalyzer.type';
import {
    IncomingEdges,
    PromiseFlags,
    PromiseNodeId,
} from '../../types/PromiseGraph.type';
import { Node } from '../../types/Graph.type';
import { Prompts } from '../../types/Prompt.type';
import logger from '../../utils/logger';
import { FunctionDefinition } from '../../types/Callgraph.type';
import { Pid } from '../../types/JScope.type';

//TODO: Define PromiseNode interface that extends Node and then define a new class that implements PromiseNode interface
export class PromiseNode implements Node {
    promiseInfo: PromiseInfo;
    id: PromiseNodeId;
    incomingEdges: IncomingEdges;
    chainedParent?: PromiseNode;
    linkedParents: PromiseNode[] = [];
    bundledParents: PromiseNode[] = [];

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
        let incomingEdges: IncomingEdges;
        if (hasBundledInputs) {
            incomingEdges = IncomingEdges.MULTIPLE_BUNDLE;
        } else if (hasChainedParent && hasLinkedParent) {
            incomingEdges = IncomingEdges.LINK_AND_CHAIN;
        } else if (hasChainedParent) {
            incomingEdges = IncomingEdges.ONE_CHAIN;
        } else if (hasLinkedParent) {
            incomingEdges = IncomingEdges.ONE_LINK;
        } else {
            incomingEdges = IncomingEdges.NONE;
        }
        logger.debug(`Incoming edges for node ${this.id}: ${incomingEdges}`);
        return incomingEdges;
    }

    public findPidWithShortestExecutionPath(): Pid {
        let shortestPathPid: Pid | null = null;
        let shortestLength = Infinity;

        for (const pid in this.promiseInfo.stackTraces) {
            const arrayLength = this.promiseInfo.stackTraces[pid].length;

            if (arrayLength < shortestLength) {
                shortestLength = arrayLength;
                shortestPathPid = pid as Pid;
            }
        }

        if (shortestPathPid) {
            return shortestPathPid;
        } else {
            throw new Error(
                `Unable to find an execution path for node ${this.id}`,
            );
        }
    }
}
