import {Readable} from "stream";

export class StreamUtils {


    public static async readToString(stream: Readable): Promise<string> {

        return new Promise<string>((res, rej) => {
            let buffer: string = '';
            stream.on('data', c => buffer += c);
            stream.on('end', () => {
                res(buffer);
            });
        });
    }


}