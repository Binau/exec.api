import {ExecLog} from "./exec.ws.api";

export class Code {
    title: string;
    tag: string;
    template: string;
}



export class TestCode {
    tag: string;
    code: string;
}

export class TestParam {
    // Id du tests
    id: string;
    // Codes à injecter
    codes: TestCode[];
}

export class TestInfo {
    idTest: number;

    result?: TestResult;
    log?: ExecLog;

}

export class TestResult {
    in: any;
    expectedOut: any;
    out?: any;
    randomTest: boolean;

    success: boolean;
}


