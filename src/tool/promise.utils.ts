

export class PromiseUtils {

    public static TIMEOUT = 'Timeout';

    public static timeout<T>(promise: Promise<T>, timeout: number): Promise<T> {

        return Promise.race([
            promise,
            new Promise((res, rej) => {
                setTimeout(() => {
                    rej(PromiseUtils.TIMEOUT);
                }, timeout);
            })
        ]) as Promise<T>;
    }

}