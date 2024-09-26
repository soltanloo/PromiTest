import { LLMControllerInterface } from './LLMControllerInterface';
import { GPTController } from './GPTController';
import { HfInferenceController } from './HfInferenceController';
import { LLM } from '../../types/LLM.type';

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

export class LLMController {
    private static model: LLM.Model = LLM.Model.GPT35TURBO;
    private static LLMInstance: LLMControllerInterface;

    public static setModel(model: LLM.Model) {
        LLMController.model = model;
        if (LLM.GPTModels.has(model)) {
            GPTController.getInstance().setModel(model);
            LLMController.LLMInstance = GPTController.getInstance();
        } else if (LLM.HFModels.has(model)) {
            HfInferenceController.getInstance().setModel(model);
            LLMController.LLMInstance = HfInferenceController.getInstance();
        } else {
            throw new Error('Unsupported Model');
        }
    }

    public static getModel(): LLM.Model {
        return LLMController.model;
    }

    public static ask(userMessages: LLM.Message[]): Promise<string> {
        if (!LLMController.LLMInstance) {
            LLMController.setModel(LLMController.model);
        }
        return LLMController.LLMInstance.ask(userMessages);
    }
}
