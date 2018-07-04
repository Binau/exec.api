export class Test {

    // Infos generale
    public id: string;
    public groupTitle: string;
    public title: string;

    //
    public tags: {
        code: string,
        template: string
    }[];


    public tests: {
        param: string,
        result: string
    }[];

}