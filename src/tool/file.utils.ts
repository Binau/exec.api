
import {BufferUtils} from "./buffer.utils";
import * as Fs from "fs";

export class FileUtils {


    public static async loadConf<T>(path: string): Promise<T> {
        return BufferUtils.bufferOrStrToObj(await Fs.promises.readFile(path));
    }


}