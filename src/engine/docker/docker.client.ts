import * as Fs from "fs";
import * as Https from "https";
import {Pack} from 'tar';
import {StreamUtils} from "../../tool/stream.utils";
import {BufferUtils} from "../../tool/buffer.utils";

export class DockerClient {

    private _debug: boolean = false;
    public ssl: {
        key?: Buffer,
        cert?: Buffer,
        ca?: Buffer
    } = {};

    constructor(
        private hostname: string,
        private port: number
    ) {

    }

    public debug(): this {
        this._debug = true;
        return this;
    }

    public activeSsl(keyFile: string, certFile: string, caFile: string, rootDir?: string): this {

        if (!!rootDir) {
            keyFile = `${rootDir}/${keyFile}`;
            certFile = `${rootDir}/${certFile}`;
            caFile = `${rootDir}/${caFile}`;
        }


        this.ssl.key = Fs.readFileSync(keyFile);
        this.ssl.cert = Fs.readFileSync(certFile);
        this.ssl.ca = Fs.readFileSync(caFile);

        return this;
    }

    private commonOpts(): any {
        return {
            hostname: this.hostname,
            port: this.port,

            key: this.ssl.key,
            cert: this.ssl.cert,
            ca: this.ssl.ca,
        };
    }

    private logDebug(log: string | Buffer, e?: any) {

        if (!this._debug) return;
        if (!e) e = '';

        if (typeof log === 'string') console.log(log, e);
        else process.stdout.write(log);
    }

    /* BUILD IMAGE */
    public async buildFromTar(imgName: string, tarPath: string): Promise<void> {
        return this.build(imgName, Fs.readFileSync(tarPath));
    }

    public async buildFromDir(imgName: string, tarPath: string): Promise<void> {


        let pack = new Pack({cwd: tarPath});

        let filesPromise: string[] = await Fs.promises.readdir(tarPath);

        filesPromise.forEach((f) => {
            pack.write(f);
        });
        pack.end();

        let val = await StreamUtils.readToString(pack);

        // build de l'image
        return this.build(imgName, val);
    }

    public async build(imgName: string, tarBuffer: string | Buffer): Promise<void> {

        this.logDebug(`[DOCKER CLIENT] (POST) /build?t=${imgName} ...`);
        return new Promise<void>((res, rej) => {
            let opts = this.commonOpts();

            opts.path = `/build?t=${imgName}`;
            opts.method = `POST`;
            opts.headers = {'Content-type': 'application/x-tar'};

            const req = Https.request(opts, (resp) => {
                this.logDebug('statusCode:', resp.statusCode);
                this.logDebug('headers:', resp.headers);

                resp.on('data', d => this.logDebug(d));
                resp.on('end', (d) => {
                    this.logDebug(`[DOCKER CLIENT] (FIN) /build?t=${imgName}`);
                    this.logDebug(` `);
                    res();
                });
            });

            req.on('error', (e) => {
                this.logDebug(`[DOCKER CLIENT] (ERR) /build?t=${imgName}`, e);
                this.logDebug(` `);
                rej(e);
            });
            req.write(tarBuffer);
            req.end();

        });
    }

    /* SEARCH IMAGE */
    public async getImage(imgName: string): Promise<any> {

        // /images/{name}/json

        this.logDebug(`[DOCKER CLIENT] (GET) /images/${imgName}/json ...`);
        return new Promise<any>((res, rej) => {
            let opts = this.commonOpts();

            opts.path = `/images/${imgName}/json`;
            opts.method = `GET`;

            const req = Https.request(opts, (resp) => {
                this.logDebug('statusCode:', resp.statusCode);
                this.logDebug('headers:', resp.headers);

                StreamUtils.readToString(resp).then((v) => {
                    this.logDebug(`[DOCKER CLIENT] (FIN) /images/${imgName}/json`);
                    this.logDebug(` `);
                    res(JSON.parse(v));
                });
            });

            req.on('error', (e) => {
                this.logDebug(`[DOCKER CLIENT] (ERR) /images/${imgName}/json`, e);
                this.logDebug(` `);
                rej(e);
            });
            req.end();

        });
    }

    /* CONTAINER */
    public async createContainers(imgName: string): Promise<string> {

        this.logDebug(`[DOCKER CLIENT] (POST) /containers/create ${imgName} ...`);
        return new Promise<string>((res, rej) => {
            let opts = this.commonOpts();

            opts.path = `/containers/create`;
            opts.method = `POST`;
            opts.headers = {'Content-type': 'application/json'};

            const req = Https.request(opts, (resp) => {
                this.logDebug('statusCode:', resp.statusCode);
                this.logDebug('headers:', resp.headers);

                let chunk = '';
                resp.on('data', d => {
                    this.logDebug(d);
                    chunk += d;
                });
                resp.on('end', (d) => {
                    this.logDebug(`[DOCKER CLIENT] (FIN) /containers/create`);
                    this.logDebug(` `);
                    res(JSON.parse(chunk).Id);
                });
            });

            req.on('error', (e) => {
                this.logDebug(`[DOCKER CLIENT] (ERR) /containers/create`, e);
                this.logDebug(` `);
                rej(e);
            });
            req.write(JSON.stringify({
                Image: imgName,
                StopTimeout: 0,
                OpenStdin: true,
                NetworkDisabled: true,
            }));

            req.end();

        });
    };

    public async startContainer(idContainer: string): Promise<void> {

        this.logDebug(`[DOCKER CLIENT] (POST) /containers/${idContainer}/start ...`);
        return new Promise<void>((res, rej) => {
            let opts = this.commonOpts();

            opts.path = `/containers/${idContainer}/start`;
            opts.method = `POST`;
            opts.headers = {'Content-type': 'application/json'};

            const req = Https.request(opts, (resp) => {
                this.logDebug('statusCode:', resp.statusCode);
                this.logDebug('headers:', resp.headers);

                resp.on('data', d => {
                    this.logDebug(d);
                });
                resp.on('end', (d) => {
                    this.logDebug(`[DOCKER CLIENT] (FIN) /containers/${idContainer}/start`);
                    this.logDebug(` `);
                    res();
                });
            });

            req.on('error', (e) => {
                this.logDebug(`[DOCKER CLIENT] (ERR) /containers/${idContainer}/start`, e);
                this.logDebug(` `);
                rej(e);
            });

            req.end();

        });
    };


    public async stopContainer(idContainer: string): Promise<void> {

        this.logDebug(`[DOCKER CLIENT] (POST) /containers/${idContainer}/stop ...`);
        return new Promise<void>((res, rej) => {
            let opts = this.commonOpts();

            opts.path = `/containers/${idContainer}/stop`;
            opts.method = `POST`;

            const req = Https.request(opts, (resp) => {
                this.logDebug('statusCode:', resp.statusCode);
                this.logDebug('headers:', resp.headers);

                resp.on('data', d => {
                    this.logDebug(d);
                });
                resp.on('end', (d) => {
                    this.logDebug(`[DOCKER CLIENT] (FIN) /containers/${idContainer}/stop`);
                    this.logDebug(` `);
                    res();
                });
            });

            req.on('error', (e) => {
                this.logDebug(`[DOCKER CLIENT] (ERR) /containers/${idContainer}/stop`, e);
                this.logDebug(` `);
                rej(e);
            });

            req.end();

        });
    };


    public async deleteContainer(idContainer: string): Promise<void> {

        this.logDebug(`[DOCKER CLIENT] (DELETE) /containers/${idContainer} ...`);
        return new Promise<void>((res, rej) => {
            let opts = this.commonOpts();

            opts.path = `/containers/${idContainer}`;
            opts.method = `DELETE`;

            const req = Https.request(opts, (resp) => {
                this.logDebug('statusCode:', resp.statusCode);
                this.logDebug('headers:', resp.headers);

                resp.on('data', d => {
                    this.logDebug(d);
                });
                resp.on('end', (d) => {
                    this.logDebug(`[DOCKER CLIENT] (FIN) /containers/${idContainer}`);
                    this.logDebug(` `);
                    res();
                });
            });

            req.on('error', (e) => {
                this.logDebug(`[DOCKER CLIENT] (ERR) /containers/${idContainer}`, e);
                this.logDebug(` `);
                rej(e);
            });

            req.end();

        });
    };


    /* EXEC */

    public async createExec(idContainer: string, cmd: string[]): Promise<string> {

        this.logDebug(`[DOCKER CLIENT] (POST) /containers/${idContainer}/exec ...`);
        return new Promise<string>((res, rej) => {
            let opts = this.commonOpts();

            opts.path = `/containers/${idContainer}/exec`;
            opts.method = `POST`;
            opts.headers = {'Content-type': 'application/json'};

            const req = Https.request(opts, (resp) => {
                this.logDebug('statusCode:', resp.statusCode);
                this.logDebug('headers:', resp.headers);

                let chunk = '';
                resp.on('data', d => {
                    this.logDebug(d);
                    chunk += d;
                });
                resp.on('end', (d) => {
                    this.logDebug(`[DOCKER CLIENT] (FIN) /containers/${idContainer}/exec`);
                    this.logDebug(` `);
                    res(JSON.parse(chunk).Id);
                });
            });

            req.on('error', (e) => {
                this.logDebug(`[DOCKER CLIENT] (ERR) /containers/${idContainer}/exec`, e);
                this.logDebug(` `);
                rej(e);
            });
            req.write(JSON.stringify({
                AttachStdin: true,
                AttachStdout: true,
                AttachStderr: true,
                Cmd: cmd,
            }));

            req.end();

        });
    };

    public async startExec(idExec: string, logCb? : (log:string)=>void): Promise<void> {

        this.logDebug(`[DOCKER CLIENT] (POST) /exec/${idExec}/start ...`);
        return new Promise<void>((res, rej) => {
            let opts = this.commonOpts();

            opts.path = `/exec/${idExec}/start`;
            opts.method = `POST`;
            opts.headers = {'Content-type': 'application/json'};

            const req = Https.request(opts, (resp) => {
                this.logDebug('statusCode:', resp.statusCode);
                this.logDebug('headers:', resp.headers);

                resp.on('data', d => {
                    this.logDebug(d);
                    logCb && logCb(BufferUtils.bufferOrStrToStr(d));
                });
                resp.on('end', (d) => {
                    this.logDebug(`[DOCKER CLIENT] (FIN) /exec/${idExec}/start`);
                    this.logDebug(` `);
                    res();
                });
            });

            req.on('error', (e) => {
                this.logDebug(`[DOCKER CLIENT] (ERR) /exec/${idExec}/start`, e);
                this.logDebug(` `);
                rej(e);
            });

            req.write(JSON.stringify({
                "Detach": false,
                "Tty": true
            }));
            req.end();

        });
    };


}