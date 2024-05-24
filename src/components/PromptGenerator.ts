import {PromiseGraph} from "./PromiseGraph";
import {PromiseNode} from "./PromiseNode";
import {IncomingEdges} from "../types/PromiseGraph.type";
import {PromptGenerationStrategy} from "./PromptGenerationStrategy";
import {RootNodePromptGenerationStrategy} from "./RootNodePromptGenerationStrategy";
import {Prompt} from "./Prompt";

export class PromptGenerator {
    public generatePrompts(promiseGraph: PromiseGraph) {
        const sortedNodes = promiseGraph.sortedNodes;
        if (!sortedNodes) throw new Error("No sorted nodes found.");

        for (const pid of sortedNodes) {
            const node = promiseGraph.getNode(pid);
            if (node) {
                node.prompt = this.generatePrompt(node as PromiseNode);
            }
        }
    }

    public generatePrompt(node: PromiseNode): Prompt {
        let strategy: PromptGenerationStrategy;

        switch (node.incomingEdges) {
            case IncomingEdges.NONE:
                strategy = new RootNodePromptGenerationStrategy();
                break;

            default:
                throw new Error("Unhandled node type");
        }

        return strategy.generatePrompt(node);
    }
}