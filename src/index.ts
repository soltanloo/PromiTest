import dotenv from "dotenv";
import { GPTController } from "./components/GPTController";

dotenv.config();

async function main() {
  console.log(await GPTController.getInstance().ask("Say this is a test"));
}

main();
