export class TestConf {
    public imgName: string;
    public files: {
        file: string,
        copyTo: string,
        tags: string[]
    }[];
    public tests: {
        param: any,
        result: any
    }[];
}