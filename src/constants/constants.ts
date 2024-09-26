import { report } from 'node:process';
import { LLM } from '../types/LLM.type';

export const PROMITEST_CONFIG_FILE_NAME = 'promitest.config.json';

export const CLI_ARGS = {
    projectPath: 'projectPath',
    coverageReport: 'coverageReport',
    coverageReportShort: 'c',
    useAvailableCoverageReport: 'useAvailableCoverageReport',
    useAvailableCoverageReportShort: 'u',
    directoryPath: 'directoryPath',
    batch: 'batch',
    batchShort: 'b',
    report: 'report',
    reportShort: 'r',
    cycleLLMs: 'cycleLLMs',
    cycleLLMsShort: 'cl',
};
export const LLMS_FOR_CYCLE = [
    LLM.Model.GPT35TURBO,
    LLM.Model.GPT4OMINI,
    LLM.Model.MISTRAL_8X7B,
    LLM.Model.PHI_3_MINI_4k,
];
export const asyncCoverageReport = 'async-coverage-report.json';
