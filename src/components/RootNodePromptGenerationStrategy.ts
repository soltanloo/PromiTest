import {PromiseNode} from "./PromiseNode";
import {PromptGenerationStrategy} from "./PromptGenerationStrategy";
import {Prompt} from "./Prompt";
import {RootNodePrompt} from "./RootNodePrompt";

export class RootNodePromptGenerationStrategy implements PromptGenerationStrategy {
    generatePrompt(node: PromiseNode): Prompt {
        return new RootNodePrompt(node);
    }
}