import {Code} from "./test.ws.api";

export class TestInfos {

    // Infos generale
    public id: string;
    public groupTitle: string;
    public title: string;
    public descriptif: string;

    //
    public codes: Code[];


    public tests: {
        param: string,
        result: string
    }[];

}