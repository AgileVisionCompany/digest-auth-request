declare class DigitalAuthRequest {
    private scheme;
    private nonce;
    private realm;
    private qop;
    private opaque;
    private nc;
    private cnonce;
    private formRequest;
    private xmlRequest;
    private requestOptions;
    private loggingOn;
    private post;
    private url;
    private username;
    private password;
    private data;
    private successFn;
    private errorFn;
    private method;
    constructor(method: any, url: any, username: any, password: any, loggingOn?: any);
    request(successFn: any, errorFn: any, data?: any, requestType?: any, options?: any): void;
    private makeAuthenticatedRequest;
    private makeUnauthenticatedRequest;
    private formulateResponse;
    private isJson;
    private log;
}
export default DigitalAuthRequest;
