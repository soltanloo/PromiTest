import {PromiseGraph} from "./PromiseGraph";
import {PromiseNode} from "./PromiseNode";
import {NodeMarkingStrategy} from "./NodeMarkingStrategy";
import {IncomingEdges} from "../types/PromiseGraph.types";
import {RootNodeMarkingStrategy} from "./RootNodeMarkingStrategy";
import {PromptGenerationStrategy} from "./PromptGenerationStrategy";
import {RootNodePromptGenerationStrategy} from "./RootNodePromptGenerationStrategy";
import {Prompt} from "./Prompt";

export class PromptGenerator {
    public generatePrompts(promiseGraph: PromiseGraph) {
        const sortedNodes = promiseGraph.sortedNodes;
        if (!sortedNodes) throw new Error("No sorted nodes found.");

        for (const pid of sortedNodes) {
            const node = promiseGraph.nodeDirectory.get(pid);
            if (node) {
                node.prompt = this.generatePrompt(node);
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