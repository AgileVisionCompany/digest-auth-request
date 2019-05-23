Digest Auth Request (TypeScript)
===================

Make digest-auth with request library and TypeScript.

More info on Digest Auth: http://en.wikipedia.org/wiki/Digest_access_authentication
Currently only supports "auth" quality-of-protection type. 
Original repostitory: https://github.com/inorganik/digest-auth-request.

Changes: 
 * Moved to TypeScript
 * Use request library to make http requests
 * Make possible to do requests with XML and form data

### Usage:

GET request:

```ts
import authRequest from "digest-auth-request-ts"

const url = 'http://example.com/protected-resource';
		
// create digest request object
const getRequest = new authRequest('GET', url, 'username', 'password');
		
// make the request
getRequest.request(function(data) { 
  // success callback
  // do something with the data
},function(errorCode) { 
  // error callback
  // tell user request failed
});

// make additional GET requests here...
```
POST request with JSON body:

```ts

import authRequest from "digest-auth-request-ts"

const postData = {
   address: '123 main st.',
   city: 'Denver',
   state: 'Colorado'
}

// create new digest request object
// because method (POST vs GET) is different
// otherwise we could re-use the first one
const postReq = new authRequest('POST', url, 'username', 'password');

postReq.request(function(data) { 
  // success callback
  // data probably a success message
},function(errorCode) { 
  // error callback
  // tell user request failed
}, postData);
```
POST request with XML body:

```ts

import authRequest from "digest-auth-request-ts"

const xmlRequest = "<xml></xml>"

// create new digest request object
// because method (POST vs GET) is different
// otherwise we could re-use the first one
const postReq = new authRequest('POST', url, 'username', 'password');

postReq.request(function(data) { 
  // success callback
  // data probably a success message
},function(errorCode) { 
  // error callback
  // tell user request failed
}, postData, "xmlRequest", { action: "action"});
```

POST request with multipart/form content:

```ts

import authRequest from "digest-auth-request-ts"

const xmlRequest = {
    object: {
        value: JSON.stringify({
            version: "1.0"
        }),
        options: {
            contentType: "application/json"
        }
    },
    file: {
        value: fs.createReadStream("example.bin"),
        options: {
            filename: "example.bin",
            contentType: "application/octet-stream"
        }
    }
}

// create new digest request object
// because method (POST vs GET) is different
// otherwise we could re-use the first one
const postReq = new authRequest('POST', url, 'username', 'password');

postReq.request(function(data) { 
  // success callback
  // data probably a success message
},function(errorCode) { 
  // error callback
  // tell user request failed
}, postData, "formRequest");
```

### Toggle console logging

Out of the box logging is turned off. Set `loggingOn` to true to activate it.

### Contributing

1. Make edits to `index.ts` in the src folder 
2. In terminal, run `npm run build`.