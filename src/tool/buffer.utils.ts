

export class BufferUtils {

    public static bufferOrStrToStr(val: Buffer | string): string {
        if(Buffer.isBuffer(val)) return val.toString();
        return val;
    }

    public static bufferOrStrToObj(val: Buffer | string): any {
        return JSON.parse(BufferUtils.bufferOrStrToStr(val));
    }



}