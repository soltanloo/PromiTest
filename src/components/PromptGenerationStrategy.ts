import {PromiseNode} from "./PromiseNode";
import {Prompt} from "./Prompt";
import {CallGraph} from "./CallGraph";

export interface PromptGenerationStrategy {
    generatePrompt(node: PromiseNode, callgraph: CallGraph): Prompt;
}