import { LLMControllerInterface } from './LLMControllerInterface';
import { GPTController } from './GPTController';
import { HfInferenceController } from './HfInferenceController';
import { LLM } from 'src/types/LLM.type';

// const controllerType = process.env.LLM_CONTROLLER || 'GPT';

// let LLMController: LLMControllerInterface;

// if (controllerType === 'GPT') {
//     LLMController = GPTController.getInstance();
// } else if (controllerType === 'HF') {
//     LLMController = HfInferenceController.getInstance();
// } else {
//     throw new Error('Unsupported LLM Controller');
// }

// export default LLMController;

export class LLMController implements LLMControllerInterface {
    private static model: LLM.Model;
    private static instance: LLMControllerInterface;

    constructor() {
        LLMController.instance = new GPTController();
    }

    public static getInstance(): LLMControllerInterface {
        if (!LLMController.instance) {
            LLMController.instance = new LLMController();
            this.model = LLM.Model.GPT35TURBO;
        }

        return LLMController.instance;
    }

    setModel(model: LLM.Model) {
        LLMController.model = model;
        if (LLM.GPTModels.has(model)) {
            GPTController.setModel(model);
            LLMController.instance = GPTController.getInstance();
        } else if (LLM.HFModels.has(model)) {
            HfInferenceController.setModel(model);
            LLMController.instance = HfInferenceController.getInstance();
        } else {
            throw new Error('Unsupported Model');
        }
    }

    ask(userMessages: LLM.Message[]): Promise<string> {
        return LLMController.instance.ask(userMessages);
    }
}
