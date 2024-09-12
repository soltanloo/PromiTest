export interface Configuration {
    projectPath: string;
    projectName: string;
    testDirectory: string;
    testRunner: 'mocha' | 'tap';
    coverageReportPath?: string;
    generateReport: boolean;
}
