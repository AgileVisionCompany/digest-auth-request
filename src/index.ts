import * as request from "request";
import * as crypto from "crypto";

import { generateCnonce } from "./utils";

class DigitalAuthRequest {
  private scheme: string;
  private nonce: string;
  private realm: string;
  private qop: "" | "auth" | "auth-int";
  private opaque: string;
  private nc: number;
  private cnonce: string;
  private formRequest: boolean;
  private xmlRequest: boolean;
  private requestOptions: any;
  private loggingOn: boolean;
  private post: boolean;
  private url: string;
  private username: string;
  private password: string;
  private data: any;
  private successFn: any;
  private errorFn: any;
  private method: string;

  constructor(method, url, username, password, loggingOn?) {
    this.url = url;
    this.username = username;
    this.password = password;
    this.nc = 1; // nonce count - increments with each request used with the same nonce
    this.formRequest = false;
    this.xmlRequest = false;
    this.requestOptions = {};
    this.method = method;

    // settings
    this.loggingOn = !!loggingOn; // toggle console logging

    // determine if a post, so that request will send data
    this.post = false;
    if (method.toLowerCase() === "post" || method.toLowerCase() === "put") {
      this.post = true;
    }
  }
  // start here
  // successFn - will be passed JSON data
  // errorFn - will be passed error status code
  // data - optional, for POSTS
  request(successFn, errorFn, data?, requestType?, options?) {
    if (requestType === "formRequest") {
      this.formRequest = true;
      this.data = data;
    } else if (requestType === "xmlRequest") {
      this.xmlRequest = true;
      this.data = data;
    } else if (data) {
      this.data = JSON.stringify(data);
    }
    this.successFn = successFn;
    this.errorFn = errorFn;
    this.requestOptions = options;

    if (!this.nonce) {
      this.makeUnauthenticatedRequest();
    } else {
      this.makeAuthenticatedRequest(0);
    }
  }

  private makeAuthenticatedRequest = attemptNumber => {
    const digestAuthHeader = `${this.scheme} username="${
      this.username
    }", realm="${this.realm}", nonce="${this.nonce}", uri="${
      this.url
    }", response="${this.formulateResponse()}", ${
      !!this.opaque ? `opaque="${this.opaque}", ` : ""
    } qop=${this.qop}, nc=${("00000000" + this.nc).slice(
      -8
    )}, algorithm="MD5", cnonce="${this.cnonce}"`;
    this.log("digest auth header response to be sent:");
    this.log(digestAuthHeader);
    this.log("Authenticated request to " + this.url);
    try {
      request(
        this.url,
        {
          method: this.post ? "POST" : "GET",
          timeout: 360 * 1000,
          headers: {
            "Content-type": !!this.formRequest
              ? "multipart/form-data"
              : !!this.xmlRequest
              ? `application/soap+xml;charset=UTF-8;action="${
                  this.requestOptions.action
                }"`
              : "application/json",
            Authorization: digestAuthHeader
          },
          formData: !!this.formRequest ? this.data : undefined,
          body: !!!this.formRequest ? this.data : undefined
        },
        (err, response, body) => {
          if (!!err) {
            this.log(`"Error (${err}) on authenticated request to ${this.url}`);
            this.nonce = null;
            this.errorFn(err);
          } else {
            if (
              !!response &&
              response.statusCode >= 200 &&
              response.statusCode < 400
            ) {
              // increment nonce count
              this.nc++;
              // return data
              if (!!body && !!body.length) {
                // If JSON, parse and return object
                if (this.isJson(body)) {
                  this.successFn(JSON.parse(body));
                } else {
                  this.successFn(body);
                }
              } else {
                this.successFn();
              }
            } else if (
              !!response &&
              response.statusCode === 503 &&
              attemptNumber < 5
            ) {
              setTimeout(() => {
                this.makeAuthenticatedRequest(attemptNumber++);
              }, 2500);
            } else {
              this.nonce = null;
              this.errorFn(response.statusCode);
            }
          }
        }
      );
    } catch (e) {
      this.errorFn(e);
    }
  };
  private makeUnauthenticatedRequest = () => {
    this.log("Unauthenticated request to " + this.url);
    try {
      request(
        this.url,
        {
          method: this.post ? "POST" : "GET",
          headers: {
            "Content-type": !!this.formRequest
              ? "multipart/form-data"
              : !!this.xmlRequest
              ? 'application/soap+xml;charset=UTF-8;action="' +
                this.requestOptions.action +
                '"'
              : "application/json"
          },
          body: !!!this.formRequest ? this.data : undefined
        },
        (err, response, body) => {
          if (!!err && (!!!response || response.statusCode !== 401)) {
            this.log(
              `"Error (${err}) on unauthenticated request to ${this.url}`
            );
            this.errorFn(err);
          } else {
            if (
              !!response &&
              response.statusCode >= 200 &&
              response.statusCode < 400
            ) {
              this.log("Authentication not required for " + this.url);
              // increment nonce count
              this.nc++;
              // return data
              if (body !== "undefined" && !!body.length) {
                // If JSON, parse and return object
                if (this.isJson(body)) {
                  this.successFn(JSON.parse(body));
                } else {
                  this.successFn(body);
                }
              } else {
                this.successFn();
              }
            } else {
              const responseHeaders = response.headers;
              // get authenticate header
              let digestHeaders: any = responseHeaders["www-authenticate"];
              if (digestHeaders != null) {
                // parse auth header and get digest auth keys
                digestHeaders = digestHeaders.slice(
                  digestHeaders.indexOf(":") + 1,
                  -1
                );
                digestHeaders = digestHeaders.split(",");
                this.scheme = digestHeaders[0].split(/\s/)[0];
                for (let i = 0; i < digestHeaders.length; i++) {
                  const equalIndex = digestHeaders[i].indexOf("=");
                  const key = digestHeaders[i].substring(0, equalIndex);
                  const val = digestHeaders[i]
                    .substring(equalIndex + 1)
                    .replace(/['"]+/g, "");
                  // find realm
                  if (key.match(/realm/i) != null) {
                    this.realm = val;
                  }
                  // find nonce
                  if (key.match(/nonce/i) != null) {
                    this.nonce = val;
                  }
                  // find opaque
                  if (key.match(/opaque/i) != null) {
                    this.opaque = val;
                  }
                  // find QOP
                  if (key.match(/qop/i) != null) {
                    this.qop = val;
                  }
                }
                // client generated keys
                this.cnonce = generateCnonce();
                this.nc++;
                // if logging, show headers received:
                this.log("received headers:");
                this.log("	realm: " + this.realm);
                this.log("	nonce: " + this.nonce);
                if (!!this.opaque) this.log("	opaque: " + this.opaque);
                this.log("	qop: " + this.qop);
                // now we can make an authenticated request
                this.makeAuthenticatedRequest(0);
              }
            }
          }
        }
      );
    } catch (e) {
      this.errorFn(e);
    }
  };
  // hash response based on server challenge
  private formulateResponse = () => {
    const HA1 = crypto
      .createHash("md5")
      .update(`${this.username}:${this.realm}:${this.password}`)
      .digest("hex");
    const HA2 = crypto
      .createHash("md5")
      .update(`${this.method}:${this.url}`)
      .digest("hex");
    const response = crypto
      .createHash("md5")
      .update(
        `${HA1}:${this.nonce}:${("00000000" + this.nc).slice(-8)}:${
          this.cnonce
        }:${this.qop}:${HA2}`
      )
      .digest("hex");
    return response;
  };
  private isJson = str => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  };
  private log = str => {
    if (this.loggingOn) {
      console.log("[digestAuthRequest] " + str);
    }
  };
}
export default DigitalAuthRequest;
