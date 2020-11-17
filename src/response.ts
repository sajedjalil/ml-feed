import { DEBUG_MODE } from './common';

export class Response {
    private status: number| undefined;
    private statusText: string | undefined;
    private headers: any | undefined;
    private config: any | undefined;
    private request: any | undefined;
    private data: any | undefined;

    constructor(response: any) {
        if (DEBUG_MODE) { console.log(response); }

        try {
            this.status = response.status;
            this.statusText = response.statusText;

            this.headers = {
                date: response.headers.date,
                expires: response.headers.expires,
                "cache-control": response.headers["cache-control"],
                "content-type": response.headers["content-type"],
                p3p: response.headers.p3p,
                server: response.headers.server,
                "x-xss-protection": response.headers["x-xss-protection"],
                "x-frame-options": response.headers["x-frame-option"],
                "set-cookie": response.headers["set-cookie"],
                connection: response.headers.connection,
                "transfer-encoding": response.headers["transfer-encoding"]
            };

            this.config = {
                timeout: response.config.timeout,
                xsrfCookieName: response.config.xsrfCookieName,
                xsrfHeaderName: response.config.xsrfHeaderName
            };

            this.request = {
                method: response.request.method,
                res: {
                    httpVersion:  response.request.res.httpVersion,
                    responseUrl: response.request.res.responseUrl
                }
            };

            this.data = response.data;
        } catch {

        }
    }

    parse() {
        return {
            "application/json": {
                status: this.status,
                statusText: this.statusText,
                headers: this.headers,
                config: this.config,
                request: this.request,
                data: this.data
            },
            "text/html": this.data
        };
    };
}