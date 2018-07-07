export class TestInfos {

    // Infos generale
    public id: string;
    public groupTitle: string;
    public title: string;
    public descriptif: string;

    //
    public tags: {
        title: string,
        code: string,
        template: string
    }[];


    public tests: {
        param: string,
        result: string
    }[];

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

export class ExecLog {
    isInfo?: true;
    isError?: true;

    message?: string;
}

