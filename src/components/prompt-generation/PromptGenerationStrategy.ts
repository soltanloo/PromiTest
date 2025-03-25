import { PromiseNode } from '../promise-graph/PromiseNode';
import { Prompt } from './Prompt';
import { CallGraph } from '../call-graph/CallGraph';
import { PromiseFlagTypes } from '../../types/PromiseGraph.type';

export interface PromptGenerationStrategy {
    generatePrompt(
        node: PromiseNode,
        flag: PromiseFlagTypes,
    ): Prompt | undefined;
}
