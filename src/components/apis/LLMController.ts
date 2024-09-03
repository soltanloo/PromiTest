import { LLMControllerInterface } from './LLMControllerInterface';
import { GPTController } from './GPTController';
import { HfInferenceController } from './HfInferenceController';

const controllerType = process.env.LLM_CONTROLLER || 'GPT';

let LLMController: LLMControllerInterface;

if (controllerType === 'GPT') {
    LLMController = GPTController.getInstance();
} else if (controllerType === 'HF') {
    LLMController = new HfInferenceController();
} else {
    throw new Error('Unsupported LLM Controller');
}

export default LLMController;
