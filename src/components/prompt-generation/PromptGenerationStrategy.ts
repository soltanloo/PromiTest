import {PromiseNode} from "../promise-graph/PromiseNode";
import {Prompt} from "./Prompt";
import {CallGraph} from "../call-graph/CallGraph";

export interface PromptGenerationStrategy {
    generatePrompt(node: PromiseNode, callgraph: CallGraph): Prompt;
}