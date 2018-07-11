export class TestConf {
    public imgName: string;
    public groupTitle: string;
    public title: string;
    public descriptif: string;
    public files: {
        file: string,
        copyTo: string,
        codes: {
            title : string,
            tag: string,
            templateFile: string
        }[]
    }[];
    public tests: {
        param: any,
        result: any
    }[];
}