/**
 * Creates a response object for AWS API Gateway with Lambda proxy integration.
 * 
 * Parameters {object}:
 * code {string} - [REQUIRED] Response status code: '200', '400', etc.
 * uri {string} - [REQUIRED for 301 and 302 codes] Redirect URI for '301' and '302' responses.
 * message {string} - Response body's message.
 * cors {object}: 
 *   allowHeaders {string} - List of allowed headers separated by comma.
 *   allowOrigin {string} - Origin to include in CORS response.
 *   allowMethods {string} - List of allowed methods separated by comma.
 * 
 * Returns:
 * {Promise} Error or response object.
 */
function createResponseObject(params) {
  return new Promise((resolve, reject) => {
    // console.debug(`createResponseObject() parameter(s): `,JSON.stringify(params,null,2));

    // Set default code
    params.code = (params.code && params.code.length > 0) ? params.code : '200';

    // Create response object.
    let response = {
      statusCode: params.code,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    // Check if this is a redirect
    if(params.code == '301' || params.code == '302') {
      // Check if uri parameter is supplied.
      if(params.uri && params.uri.length > 0) {
        response.headers.Location = params.uri;
        //    console.debug('createResponseObject(): response =', JSON.stringify(response, null, 2),'\n');
        return resolve(response);
      } else {
      // Missing URI
        return reject('The uri parameter is required for 301 and 302 redirects.');
      }
    } else {  // Non-redirect responses
      // If a message was supplied add it to the response.
      if(params.message && params.message.length > 0) {
        response.body = JSON.stringify({ 'response': params.message });
      }

      // If an object for CORS was supplied, add it to the headers.
      if(params?.cors) {
        let corsHeaders = {
          // Set specified allowed headers or defaults.
          'Access-Control-Allow-Headers': (params.cors?.allowHeaders && params.cors.allowHeaders.length > 0) 
                                        ? params.cors.allowHeaders 
                                        : 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',

          // Set specified allowed methods or defaults.
          'Access-Control-Allow-Methods': (params.cors?.allowMethods && params.cors.allowMethods.length > 0)
                                        ? params.cors.allowMethods 
                                        : '*',

          // Set specified allowed origin or default.
          'Access-Control-Allow-Origin': (params.cors?.allowOrigin && params.cors.allowOrigin.length > 0)
                                       ? params.cors.allowOrigin
                                       : '*'
        };

        response.headers = {...corsHeaders, ...response.headers};
      }

      // console.debug('createResponseObject(): response =', JSON.stringify(response, null, 2),'\n');
      return resolve(response);
    } // End if(301||302)
  }); // End promise
} // End createResponseObject

exports = module.exports = createResponseObject;
