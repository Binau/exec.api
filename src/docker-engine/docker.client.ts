import * as Fs from "fs";
import * as Https from "https";
import {Pack} from 'tar';
import {StreamUtils} from "../tool/stream.utils";
import {BufferUtils} from "../tool/buffer.utils";
import {IncomingMessage} from "http";

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

    /**
     * Active les inforamtions de debug
     * @returns {this}
     */
    public debug(): this {
        this._debug = true;
        return this;
    }

    /**
     * Active la configuration du ssl pour l'echange avec le docker engine
     * @param {string} keyFile
     * @param {string} certFile
     * @param {string} caFile
     * @param {string} rootDir
     * @returns {this}
     */
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


    /* BUILD IMAGE */
    public async build(imgName: string, tarBuffer: string | Buffer): Promise<void> {

        this.logDebug(`[DOCKER CLIENT] (POST) /build?t=${imgName} ...`);
        return new Promise<void>((res, rej) => {
            let opts = this.commonOpts();

            opts.path = `/build?t=${imgName}`;
            opts.method = `POST`;
            opts.headers = {'Content-type': 'application/x-tar'};

            const req = Https.request(opts, (resp) => {

                resp.on('data', d => this.logDebug(d));
                resp.on('end', (d) => {
                    this.logDebug(`[DOCKER CLIENT] (FIN) /build?t=${imgName}`);
                    this.logDebugResp(resp);
                    this.logDebug(` `);
                    res();
                });
            });

            req.on('error', (e) => {
                this.logError(`[DOCKER CLIENT] (ERR) /build?t=${imgName}`, e);
                this.logErrorStatus(opts);
                rej(e);
            });
            req.write(tarBuffer);
            req.end();

        });
    }

    /* SEARCH IMAGE */
    public async getImage(imgName: string): Promise<string> {

        // /images/{name}/json

        this.logDebug(`[DOCKER CLIENT] (GET) /images/${imgName}/json ...`);
        return new Promise<string>((res, rej) => {
            let opts = this.commonOpts();

            opts.path = `/images/${imgName}/json`;
            opts.method = `GET`;

            const req = Https.request(opts, async (resp) => {

                this.logDebug(`[DOCKER CLIENT] (FIN) /images/${imgName}/json`);
                this.logDebugResp(resp);

                if (resp.statusCode == 200 ) {
                    let result: any = await StreamUtils.readToObj<any>(resp);
                    this.logDebug(`[DOCKER CLIENT] - Resultat : `, result);
                    res(result.Id);
                } else if (resp.statusCode == 404 ) {
                    this.logDebug(`[DOCKER CLIENT] - Resultat : Introuvable`);
                    res(null);
                } else {
                    let result: String = await StreamUtils.readToString(resp);
                    this.logError(`[DOCKER CLIENT] (ERR) /images/${imgName}/json`);
                    this.logErrorStatus(opts, resp, result);
                    rej();
                }

            });

            req.on('error', (e) => {
                this.logError(`[DOCKER CLIENT] (ERR) /images/${imgName}/json`, e);
                this.logErrorStatus(opts);
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

            const req = Https.request(opts, async (resp) => {

                this.logDebug(`[DOCKER CLIENT] (FIN) /containers/create`);
                this.logDebugResp(resp);

                if (resp.statusCode == 201) {
                    let result: any = await StreamUtils.readToObj<any>(resp);
                    this.logDebug(`[DOCKER CLIENT] - Resultat : `, result);
                    res(result.Id);
                } else {
                    let result: String = await StreamUtils.readToString(resp);
                    this.logError(`[DOCKER CLIENT] (ERR) /containers/create`);
                    this.logErrorStatus(opts, resp, result);
                    rej();
                }
            });

            req.on('error', (e) => {
                this.logError(`[DOCKER CLIENT] (ERR) /containers/create`, e);
                this.logErrorStatus(opts);
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

            const req = Https.request(opts, async (resp) => {
                this.logDebug(`[DOCKER CLIENT] (FIN) /containers/${idContainer}/start`);
                this.logDebugResp(resp);

                let logs: any = await StreamUtils.readToString(resp);
                if (resp.statusCode == 204) {
                    this.logDebug(`[DOCKER CLIENT] - Resultat : `, logs);
                    res();
                } else {
                    this.logError(`[DOCKER CLIENT] (ERR) /containers/${idContainer}/start`);
                    this.logErrorStatus(opts, resp, logs);
                    rej();
                }

            });

            req.on('error', (e) => {
                this.logError(`[DOCKER CLIENT] (ERR) /containers/${idContainer}/start`, e);
                this.logErrorStatus(opts);
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

            const req = Https.request(opts, async (resp) => {
                this.logDebug(`[DOCKER CLIENT] (FIN) /containers/${idContainer}/stop`);
                this.logDebugResp(resp);

                let logs: any = await StreamUtils.readToString(resp);
                if (resp.statusCode == 204) {
                    this.logDebug(`[DOCKER CLIENT] - Resultat : `, logs);
                    res();
                } else {
                    this.logError(`[DOCKER CLIENT] (ERR) /containers/${idContainer}/stop`);
                    this.logErrorStatus(opts, resp, logs);
                    rej();
                }
            });

            req.on('error', (e) => {
                this.logError(`[DOCKER CLIENT] (ERR) /containers/${idContainer}/stop`, e);
                this.logErrorStatus(opts);
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

            const req = Https.request(opts, async (resp) => {
                this.logDebug(`[DOCKER CLIENT] (FIN) /containers/${idContainer}`);
                this.logDebugResp(resp);

                let logs: any = await StreamUtils.readToString(resp);
                if (resp.statusCode == 204) {
                    this.logDebug(`[DOCKER CLIENT] - Resultat : `, logs);
                    res();
                } else {
                    this.logError(`[DOCKER CLIENT] (ERR) /containers/${idContainer}`);
                    this.logErrorStatus(opts, resp, logs);
                    rej();
                }
            });

            req.on('error', (e) => {
                this.logError(`[DOCKER CLIENT] (ERR) /containers/${idContainer}`, e);
                this.logErrorStatus(opts);
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

            const req = Https.request(opts, async (resp) => {
                this.logDebug(`[DOCKER CLIENT] (FIN) /containers/${idContainer}/exec`);
                this.logDebugResp(resp);

                if (resp.statusCode == 201) {
                    let result: any = await StreamUtils.readToObj<any>(resp);
                    this.logDebug(`[DOCKER CLIENT] - Resultat : `, result);
                    res(result.Id);
                } else {
                    let result: String = await StreamUtils.readToString(resp);
                    this.logError(`[DOCKER CLIENT] (ERR) /containers/${idContainer}/exec`);
                    this.logErrorStatus(opts, resp, result);
                    rej();
                }
            });

            req.on('error', (e) => {
                this.logError(`[DOCKER CLIENT] (ERR) /containers/${idContainer}/exec`, e);
                this.logErrorStatus(opts);
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

    public async startExec(idExec: string, logCb?: (log: string) => void): Promise<void> {

        this.logDebug(`[DOCKER CLIENT] (POST) /exec/${idExec}/start ...`);
        return new Promise<void>((res, rej) => {
            let opts = this.commonOpts();

            opts.path = `/exec/${idExec}/start`;
            opts.method = `POST`;
            opts.headers = {'Content-type': 'application/json'};

            const req = Https.request(opts, (resp) => {
                this.logDebug(`[DOCKER CLIENT] (FIN) /exec/${idExec}/start`);
                this.logDebugResp(resp);
                if (resp.statusCode == 200) {
                    resp.on('data', d => {
                        this.logDebug(d);
                        logCb && logCb(BufferUtils.bufferOrStrToStr(d));
                    });
                    resp.on('end', (d) => {
                        res();
                    });
                } else {
                    this.logErrorStatus(opts, resp);
                    rej();
                }
            });

            req.on('error', (e) => {
                this.logError(`[DOCKER CLIENT] (ERR) /exec/${idExec}/start`, e);
                this.logErrorStatus(opts);
                rej(e);
            });

            req.write(JSON.stringify({
                "Detach": false,
                "Tty": true
            }));
            req.end();

        });
    };


    /**
     * Methode permettant de creer les options communes d'appels au docker
     * @returns {any}
     */
    private commonOpts(): any {
        return {
            hostname: this.hostname,
            port: this.port,

            key: this.ssl.key,
            cert: this.ssl.cert,
            ca: this.ssl.ca,
        };
    }

    /**
     * Methode permettant de logger
     * @param {string | Buffer} log
     * @param e
     */
    private logDebug(log: string | Buffer, e?: any) {

        if (!this._debug) return;
        if (!e) e = '';

        if (typeof log === 'string') console.log(log, e);
        else process.stdout.write(log);
    }

    private logDebugResp(resp: IncomingMessage) {
        if (!this._debug) return;
        console.log(`[DOCKER CLIENT] - Réponse : [${resp.statusCode}]`, resp.headers);
    }


    private logError(log: string | Buffer, e?: any) {

        if (!e) e = '';

        if (typeof log === 'string') console.error(log, e);
        else process.stderr.write(log);
    }

    private logErrorStatus(httpOpts: any, resp?: IncomingMessage, data?: any) {
        console.error('[DOCKER CLIENT] - Options de requete : ', httpOpts);
        !!resp && console.error(`[DOCKER CLIENT] - Réponse : [${resp.statusCode}]`, resp.headers);
        !!data && console.error('[DOCKER CLIENT] - Données : ', data);
    }

}