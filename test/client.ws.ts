import * as WebSocket from 'ws';

export class ClientWs {

    public onMessage: (data: any) => void = () => {
    };
    public onClose: (evt: Event) => void = () => {
    };
    public onError: (evt: ErrorEvent) => void = () => {
    };

    private wsClient;
    private _debug = false;

    /**
     * _ctor
     * @param url
     */
    constructor(private url) {
    }

    public debug(): this {
        this._debug = true;
        return this;
    }

    /**
     * Connection au websocket
     * @returns {Promise<void>}
     */
    public connect(opts: any): Promise<void> {
        this._debug && console.log(`(CLIENT WS) ${this.url} Connect`);
        this.wsClient = new WebSocket(this.url, opts);

        this.wsClient.onclose = this.internalOnClose.bind(this);
        this.wsClient.onmessage = this.internalOnMessage.bind(this);

        return new Promise((res, rej) => {
            this.wsClient.onerror = (e) => {
                this.internalOnError(e);
                rej(e);
            };
            this.wsClient.onopen = () => {
                this.wsClient.onerror = this.internalOnError.bind(this);
                this._debug && console.log(`(CLIENT WS) Open`);
                res();
            };
        });
    }

    /**
     * Gestion interne lors du close
     * @param evt
     * @param cb
     */
    private internalOnClose(evt: Event) {
        this._debug && console.log(`(CLIENT WS) Close`);
        this.onClose(evt);
    }

    private internalOnError(evt: ErrorEvent) {
        this._debug && console.log(`(CLIENT WS) Error : ${evt.message}`);
        this.onError(evt);
    }

    private internalOnMessage(evt: MessageEvent) {

        let data: any = evt.data;
        this._debug && console.log(`(CLIENT WS) ${this.url} => (${data})`);
        try {
            data = JSON.parse(evt.data);
        } catch (e) { // do nothing
        }

        this.onMessage(data);
    }

    /**
     * Envoi d'une données
     * @param data
     * @returns {Ws}
     */
    public send(data): this {

        let message: string;
        if (typeof data == 'string') {
            message = data;
        } else {
            message = JSON.stringify(data);
        }

        this._debug && console.log(`(CLIENT WS) (${message}) => ${this.url}`);

        try {
            this.wsClient.send(message);
        } catch (e) {
            this.wsClient.onerror(e);
        }

        return this;
    }

    /**
     * Fermeture du websocket
     */
    public close(): void {
        this.wsClient.close();
    }


}