/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */

// validateRequiredVar
// Checks if the supplied variable is of type string and has length
// @param {var} reqvar - the variable to check
// @return {promise} - Error or response object
function validateRequiredVar(reqvar) {
  return new Promise((resolve,reject) => {
    // Is the envar a string and have some length?
    console.log(`validateRequiredVar:reqvar:: ${reqvar}`);  // DEBUG
    if(typeof reqvar === 'string' && reqvar.length > 0) {
      return resolve(true);
    } else {
      return reject(new Error('Missing Required Variable'));
    }
  }); // End Promise
} // End validateRequiredvar

// robotrap
// Checks for sufficient empathetic response (hint: we want it to be empty)
// @param {var} vrbl - the variable to check
// @return {promise} - Error or response object
function robotrap(vrbl) {
  return new Promise(async (resolve,reject) => {
    // Does the vrbl have a value?
    console.debug(`robotrap:vrbl:: ${vrbl}`); // DEBUG

    if (vrbl === undefined ) {
      console.debug(`robotrap: vrbl is undefined.`); // DEBUG
      return resolve();
    } else {
      // vrbl isn't undefined but it might still be something...
      await validateRequiredVar(vrbl)
      .then(() => {
        console.log(`Game: Checkers, Number of Players: 0`); // Bad robot!
        return reject('Insuffient empathetic response');
      })
      .catch((err) => {
        // In this case, error is good.
        console.debug(`No trap.`); // DEBUG
        return resolve();
      })
    }
  }); // End Promise
} // End robotrap

// ************
// Main handler
export const handler = async (event, context) => {
  console.log(`Received event: ${JSON.stringify(event,null,2)}`); // DEBUG:

  var DateTime = new Date().toString();

  var eventObj = JSON.parse(event?.body);
  console.debug(`eventObj: `,JSON.stringify(eventObj,null,2)); // DEBUG Yeah I parsed it to stringify it
  console.debug(`eventObj.message: ${eventObj.message}`); // DEBUG

  // ******************
  // Fields should be::
  // name, email, site, subject, message, score (trap)


  // Message is a required field, but Score is *not*.
  return await Promise.all([
    validateRequiredVar(eventObj?.message),
    robotrap(eventObj?.score)
  ]) 
  .then((resp) => {
    console.debug(`Promise.all.then.resp...`,resp); // DEBUG
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Honky Donky',
      })
    };

    return response;
    
  })
  .catch((err) => {
    console.debug(`Error:..`,err); // DEBUG
  }); // End ValidateRequiredVar

};  // End Handler
  