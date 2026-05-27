# create-response-object
NPM Module. A very, very tiny object creator for lambda-proxy responses. Primarily for 200 and 400 responses with an optional message. Also supports 301 and 302 responses with redirect URI.

## Install
npm install --save create-response-object

## Usage
```javascript
let params = {
  code: '200',
  message: 'Hello world!'
};

createResponseObject(params);
 ```

#### Parameter Options  
* **code:** (optional but recommended) The HTTP status code to return. Defaults to '200'.  
   {string} '200', '301', '302', '400', etc  
* **uri:** (required only for 301|302 codes) The redirect uri.  
* **message:** (optional) The response body's message.  
   {string} 'Hello World!'  
* **cors:** (optional) Adds CORS headers to the response.  
  * **allowHeaders** (optional) List of allowed headers separated by comma.  
    {string} Defaults to 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'  
  * **allowOrigin** (optional) Origin to include in the CORS response.  
    {string} Defaults to '*'  
  * **allowMethods** (optional) List of allowed headers seperated by comma.  
    {string} Defaults to '*'  



## Examples  
### Import or require the module:  
```javascript
import createResponseObject from 'create-response-object';           // ES Modulees import  
const createResponseObject = require('create-response-object');      // CommonJS import  
```

### Return a plain 400 response:  
```javascript
exports.handler = async (event, context) => {
  return await createResponseObject({
    code: '400',
    message: 'Something went wrong!'
  });
};
```
Will output:
```javascript
{
    "statusCode": "400",
    "body": "Something went wrong!",
    "headers": {
        "Content-Type": "application/json"
    }
}
```

### Return a 200 response with CORS headers:
```javascript
exports.handler = async (event, context) => {
  return await createResponseObject({
    code: '200',
    message: 'Hello World!'
    cors: {
      allowHeaders: 'Content-Type',
      allowOrigin: 'http://localhost:3000',
      allowMethods: 'OPTIONS,GET'
    }
  });
};
```
Will output:
```javascript
{
    "statusCode": "200",
    "body": "Hello world!",
    "headers": {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,GET",
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Content-Type": "application/json"
    }
}
```

### Return a 301 response with redirect:
```javascript
exports.handler = async (event, context) => {
  return await createResponseObject({
    code: '301',
    uri: 'https://www.npmjs.com/package/create-response-object'
  });
};
```
Will output:
```javascript
{
    "statusCode": "301",
    "body": "Hello World!",
    "headers": {
        "Location": "https://www.npmjs.com/package/create-response-object"
    }
}
```

## Credit
This function, as small as it is, draws inspiration from [jroberson](https://github.com/jroberson).
