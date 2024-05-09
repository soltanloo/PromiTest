import {PromiseNode} from "./PromiseNode";
import {Prompt} from "./Prompt";

export interface PromptGenerationStrategy {
    generatePrompt(node: PromiseNode): Prompt;
}