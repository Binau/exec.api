export class TestConf {
    public imgName: string;
    public groupTitle: string;
    public title: string;
    public descriptif: string;
    public files: {
        file: string,
        copyTo: string,
        tags: {
            title : string,
            code: string,
            templateFile: string
        }[]
    }[];
    public tests: {
        param: any,
        result: any
    }[];
}