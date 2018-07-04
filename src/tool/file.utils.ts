import {BufferUtils} from "./buffer.utils";
import * as Fs from "fs";

export class FileUtils {


    public static async loadConf<T>(path: string): Promise<T> {
        return BufferUtils.bufferOrStrToObj(await Fs.promises.readFile(path));
    }

    public static async loadFile(path: string): Promise<string> {
        return BufferUtils.bufferOrStrToStr(await Fs.promises.readFile(path));
    }


}