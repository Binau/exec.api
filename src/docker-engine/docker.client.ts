import * as Fs from "fs";
import * as Https from "https";
import {Pack} from 'tar';
import {StreamUtils} from "../tool/stream.utils";
import {BufferUtils} from "../tool/buffer.utils";
import {IncomingMessage} from "http";

export class DockerClient {

    public ssl: {
        key?: Buffer,
        cert?: Buffer,
        ca?: Buffer
    } = {};

    constructor(
        private hostname: string,
        private port: number,
        private logger: Console = console
    ) {

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

        this.logger.info(`Création de l'image ${imgName}...`);
        this.logDebug(`(POST) /build?t=${imgName} DEBUT`);
        return new Promise<void>((res, rej) => {
            let opts = this.commonOpts();

            opts.path = `/build?t=${imgName}`;
            opts.method = `POST`;
            opts.headers = {'Content-type': 'application/x-tar'};

            const req = Https.request(opts, (resp) => {

                resp.on('data', d => this.logger.debug( BufferUtils.bufferOrStrToStr(d)));
                resp.on('end', (d) => {
                    this.logger.info(`Image ${imgName} créée...`);
                    this.logDebug(`(POST) /build?t=${imgName} FIN`);
                    this.logDebugResp(resp);
                    res();
                });
            });

            req.on('error', (e) => {
                this.logger.error(`Erreur à la création de l'image ${imgName}`, e);
                this.logErrorInfos(opts);
                rej(e);
            });
            req.write(tarBuffer);
            req.end();

        });
    }

    /* SEARCH IMAGE */
    public async getImage(imgName: string): Promise<string> {

        // /images/{name}/json

        this.logDebug(`(GET) /images/${imgName}/json ...`);
        return new Promise<string>((res, rej) => {
            let opts = this.commonOpts();

            opts.path = `/images/${imgName}/json`;
            opts.method = `GET`;

            const req = Https.request(opts, async (resp) => {

                this.logDebug(`(FIN) /images/${imgName}/json`);
                this.logDebugResp(resp);

                if (resp.statusCode == 200) {
                    let result: any = await StreamUtils.readToObj<any>(resp);
                    this.logDebug(`- Resultat : `, result);
                    res(result.Id);
                } else if (resp.statusCode == 404) {
                    this.logDebug(`- Resultat : Introuvable`);
                    res(null);
                } else {
                    let result: String = await StreamUtils.readToString(resp);
                    this.logError(`(ERR) /images/${imgName}/json`);
                    this.logErrorInfos(opts, resp, result);
                    rej();
                }

            });

            req.on('error', (e) => {
                this.logError(`(ERR) /images/${imgName}/json`, e);
                this.logErrorInfos(opts);
                rej(e);
            });
            /*req.once('socket', s => s.setTimeout(DockerClient.REQ_TIMEOUT, () => {
                s.destroy();
            }));*/
            req.end();


        });
    }

    /* CONTAINER */
    public async createContainers(imgName: string): Promise<string> {

        this.logDebug(`(POST) /containers/create ${imgName} ...`);
        return new Promise<string>((res, rej) => {
            let opts = this.commonOpts();

            opts.path = `/containers/create`;
            opts.method = `POST`;
            opts.headers = {'Content-type': 'application/json'};

            const req = Https.request(opts, async (resp) => {

                this.logDebug(`(FIN) /containers/create`);
                this.logDebugResp(resp);

                if (resp.statusCode == 201) {
                    let result: any = await StreamUtils.readToObj<any>(resp);
                    this.logDebug(`- Resultat : `, result);
                    res(result.Id);
                } else {
                    let result: String = await StreamUtils.readToString(resp);
                    this.logErrorInfos(opts, resp, result);
                    rej();
                }
            });

            req.on('error', (e) => {
                this.logError(`(ERR) /containers/create`, e);
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

        this.logDebug(`(POST) /containers/${idContainer}/start ...`);
        return new Promise<void>((res, rej) => {
            let opts = this.commonOpts();

            opts.path = `/containers/${idContainer}/start`;
            opts.method = `POST`;
            opts.headers = {'Content-type': 'application/json'};

            const req = Https.request(opts, async (resp) => {
                this.logDebug(`(FIN) /containers/${idContainer}/start`);
                this.logDebugResp(resp);

                let logs: string = await StreamUtils.readToString(resp);
                if (resp.statusCode == 204) {
                    this.logDebug(`- Resultat : `, logs);
                    res();
                } else {
                    this.logError(`(ERR) /containers/${idContainer}/start`);
                    this.logErrorInfos(opts, resp, logs);
                    rej();
                }

            });

            req.on('error', (e) => {
                this.logError(`(ERR) /containers/${idContainer}/start`, e);
                this.logErrorInfos(opts);
                rej(e);
            });
            req.end();

        });
    };


    public async stopContainer(idContainer: string): Promise<void> {

        this.logDebug(`(POST) /containers/${idContainer}/stop ...`);
        return new Promise<void>((res, rej) => {
            let opts = this.commonOpts();

            opts.path = `/containers/${idContainer}/stop`;
            opts.method = `POST`;

            const req = Https.request(opts, async (resp) => {
                this.logDebug(`(FIN) /containers/${idContainer}/stop`);
                this.logDebugResp(resp);

                let logs: any = await StreamUtils.readToString(resp);
                if (resp.statusCode == 204) {
                    res();
                } else {
                    this.logError(`(ERR) /containers/${idContainer}/stop`);
                    this.logErrorInfos(opts, resp, logs);
                    rej();
                }
            });

            req.on('error', (e) => {
                this.logError(`(ERR) /containers/${idContainer}/stop`, e);
                this.logErrorInfos(opts);
                rej(e);
            });
            req.end();

        });
    };


    public async deleteContainer(idContainer: string): Promise<void> {

        this.logDebug(`(DELETE) /containers/${idContainer} ...`);
        return new Promise<void>((res, rej) => {
            let opts = this.commonOpts();

            opts.path = `/containers/${idContainer}`;
            opts.method = `DELETE`;

            const req = Https.request(opts, async (resp) => {
                this.logDebug(`(FIN) /containers/${idContainer}`);
                this.logDebugResp(resp);

                let logs: any = await StreamUtils.readToString(resp);
                if (resp.statusCode == 204) {
                    res();
                } else {
                    this.logError(`(ERR) /containers/${idContainer}`);
                    this.logErrorInfos(opts, resp, logs);
                    rej();
                }
            });

            req.on('error', (e) => {
                this.logError(`(ERR) /containers/${idContainer}`, e);
                this.logErrorInfos(opts);
                rej(e);
            });
            req.end();

        });
    };


    /* EXEC */

    public async createExec(idContainer: string, cmd: string[]): Promise<string> {

        this.logDebug(`(POST) /containers/${idContainer}/exec ...`);
        return new Promise<string>((res, rej) => {
            let opts = this.commonOpts();

            opts.path = `/containers/${idContainer}/exec`;
            opts.method = `POST`;
            opts.headers = {'Content-type': 'application/json'};

            const req = Https.request(opts, async (resp) => {
                this.logDebug(`(FIN) /containers/${idContainer}/exec`);
                this.logDebugResp(resp);

                if (resp.statusCode == 201) {
                    let result: any = await StreamUtils.readToObj<any>(resp);
                    this.logDebug(`- Resultat : `, result);
                    res(result.Id);
                } else {
                    let result: String = await StreamUtils.readToString(resp);
                    this.logError(`(ERR) /containers/${idContainer}/exec`);
                    this.logErrorInfos(opts, resp, result);
                    rej();
                }
            });

            req.on('error', (e) => {
                this.logError(`(ERR) /containers/${idContainer}/exec`, e);
                this.logErrorInfos(opts);
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

    /**
     * Lancement de l'execution
     * @param idExec
     * @param logCb
     */
    public async startExec(idExec: string, logCb?: (log: string) => void): Promise<void> {

        this.logDebug(`(POST) /exec/${idExec}/start ...`);
        return new Promise<void>((res, rej) => {
            let opts = this.commonOpts();

            opts.path = `/exec/${idExec}/start`;
            opts.method = `POST`;
            opts.headers = {'Content-type': 'application/json'};

            const req = Https.request(opts, (resp) => {
                this.logDebug(`(FIN) /exec/${idExec}/start`);
                this.logDebugResp(resp);
                if (resp.statusCode == 200) {
                    resp.on('data', d => {
                        let strData = BufferUtils.bufferOrStrToStr(d);
                        this.logDebug(strData);
                        logCb && logCb(strData);
                    });
                    resp.on('end', (d) => {
                        res();
                    });
                } else {
                    this.logErrorInfos(opts, resp);
                    rej();
                }
            });

            req.on('error', (e) => {
                this.logError(`(ERR) /exec/${idExec}/start`, e);
                this.logErrorInfos(opts);
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

        if (!e) e = '';

        if (typeof log === 'string') this.logger.debug(log, e);
        else process.stdout.write(log);
    }

    private logDebugResp(resp: IncomingMessage) {
        this.logger.debug(`- Réponse : [${resp.statusCode}]`, resp.headers);
    }

    private logError(log: string | Buffer, e?: any) {

        if (!e) e = '';

        if (typeof log === 'string') this.logger.error(log, e);
        else process.stderr.write(log);
    }

    private logErrorInfos(httpOpts: any, resp?: IncomingMessage, data?: any) {
        !!resp && this.logger.error(` ${httpOpts.path} [${resp.statusCode}]`, data);
    }

}