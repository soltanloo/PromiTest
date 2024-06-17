import {CLI_ARGS} from "./constants/constants";
import {Command} from 'commander';
import RuntimeConfig from "./components/configuration/RuntimeConfig";
import {Main} from "./components/Main";
import dotenv from "dotenv";

async function cli(projectPath: string) {
    dotenv.config();
    RuntimeConfig.getInstance(projectPath);

    await Main.run();
}

(async function () {
    const program = new Command();

    program
        .name('promitest')
        .description('Automated test generation for Asynchronous JavaScript')

    program
        .command('generate')
        .argument(`<${CLI_ARGS.projectPath}>`, 'path to project')

    program.parse(process.argv);


    try {
        await cli(program.args[1])
    } catch (err) {
        console.error(`Error in running cli():`)
        console.error(err)
    }
})()