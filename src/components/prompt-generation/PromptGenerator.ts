import { PromiseGraph } from '../promise-graph/PromiseGraph';
import { PromiseNode } from '../promise-graph/PromiseNode';
import { IncomingEdges, PromiseFlagTypes } from '../../types/PromiseGraph.type';
import { PromptGenerationStrategy } from './PromptGenerationStrategy';
import { RootNodePromptGenerationStrategy } from './RootNodePromptGenerationStrategy';
import { Prompt } from './Prompt';
import { CallGraph } from '../call-graph/CallGraph';
import { NodeId } from '../../types/Graph.type';
import { Prompts } from '../../types/Prompt.type';
import logger from '../../utils/logger';

export class PromptGenerator {
    constructor() {}

    public generatePrompts(promiseGraph: PromiseGraph) {
        const sortedNodes = promiseGraph.sortedNodes;
        if (!sortedNodes) throw new Error('No sorted nodes found.');
        let prompts = new Map<NodeId, Prompts>();

        for (const pid of sortedNodes) {
            const node = promiseGraph.getNode(pid) as PromiseNode;
            if (node) {
                Object.entries(node.flags).forEach(([key, flag]) => {
                    if (flag) {
                        logger.debug(
                            `Generating a prompt for node ${node.id} that is ${key}`,
                        );
                        node.prompts[key as PromiseFlagTypes] =
                            this.generatePrompt(node as PromiseNode);
                    }
                });
                prompts.set(pid, node.prompts);
            }
        }
        return prompts;
    }

    public generatePrompt(node: PromiseNode): Prompt {
        let strategy: PromptGenerationStrategy;

        switch (node.incomingEdges) {
            case IncomingEdges.NONE:
                strategy = new RootNodePromptGenerationStrategy();
                break;

            default:
                throw new Error('Unhandled node type');
        }

        return strategy.generatePrompt(node);
    }

    public getPromptsAsObject(promptsMap: Map<NodeId, Prompts>) {
        let promptsObject: { [promiseId: NodeId]: { [flag: string]: string } } =
            {};
        for (const [promiseId, promisePrompts] of promptsMap.entries()) {
            const promisePromptsFlat: { [flag: string]: string } = {};

            for (const [flag, prompt] of Object.entries(promisePrompts)) {
                promisePromptsFlat[flag] = prompt.string;
            }

            promptsObject[promiseId] = promisePromptsFlat;
        }
        return promptsObject;
    }
}
