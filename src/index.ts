import dotenv from "dotenv";
import {Main} from "./components/Main";

dotenv.config();

(async () => {
    await Main.run();
})();
