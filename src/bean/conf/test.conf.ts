export class TestConf {
    public groupTitle: string;
    public title: string;
    public imgName: string;
    public files: {
        file: string,
        copyTo: string,
        tags: {
            code: string,
            templateFile: string
        }[]
    }[];
    public tests: {
        param: any,
        result: any
    }[];
}