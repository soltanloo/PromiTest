import { PromiseFlagTypes } from './PromiseGraph.type';
import { Prompt } from '../components/prompt-generation/Prompt';

export type Prompts = { [flag in PromiseFlagTypes]?: Prompt };
export type Responses = { [flag in PromiseFlagTypes]?: string };
