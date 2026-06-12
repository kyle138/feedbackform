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

//
// feedback.mjs
// Lambda to answer APIG calls, check for required fields, push to DDB.
//

// Set settings up here to survive warm starts
const qoqmey=[];

// Load modules
import createResponseObject from 'create-response-object';
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../libs/ddbDocClient.mjs";
import { handleError } from "../libs/handleError.mjs";


//
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

//
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
        // Set robotrap true in settings object for subsequent attempts.

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

//
// trimObj
// Trims all keys in provided object.
// @argument 
// obj {object} - the object to trim
// @returns {promise} - the trimmed object 
function trimObj(obj) {
  return new Promise((resolve) => {
    if(typeof obj === 'object') {
      Object.keys(obj).forEach(k => obj[k] = typeof obj[k] == 'string' ? obj[k].trim() : obj[k]);
      console.debug(`trimObj:obj(trimmed)::`,JSON.stringify(obj,null,2)); // DEBUG
      return resolve(obj);
    } else {
      return resolve(obj);
    }
  }); // End Promise
} // End trimObj

//
// postDynamo
// Posts message to DDB
// @params {object}
// message {string} - *REQUIRED* 
// @returns {promise}
async function postDynamo(params) {
  console.debug(`postDynamo: `,JSON.stringify(params,null,2)); // DEBUG
  const pdParams = {
    TableName: process.env.FEEDBACKS_TABLE_NAME,
    Item: {
      datetime: new Date().toString(),
      site: params.site,
      name: params.name,
      email: params.email,
      subject: params.subject,
      message: params.message.length > 0 ? params.message : "Blank Message"
    }
  };

  if(typeof params.headers === 'object' && Object.keys(params.headers).length > 0) {
    pdParams.Item.headers = params.headers;
    pdParams.Item.IPs = params.headers['X-Forwarded-For'];
  }
  console.debug(`postDynamo:pdParams::`,JSON.stringify(pdParams,null,2)); // DEBUG

  return await ddbDocClient.send(new PutCommand(pdParams));
} // End postDynamo

// ************
// Main handler
export const handler = async (event, context) => {
  console.log(`Received event: ${JSON.stringify(event,null,2)}`); // DEBUG:

  var eventObj = JSON.parse(event?.body);
  eventObj.headers = event.headers;
  eventObj.sourceIP = event.headers["X-Forwarded-For"].split(',')[0];
  console.debug(`eventObj: `,JSON.stringify(eventObj,null,2)); // DEBUG Yeah I parsed it to stringify it
  
  // Check if Feedbacks table has been set as an environment variable
  if(!process.env.FEEDBACKS_TABLE_NAME) {
    console.log(`process.env.FEEDBACKS_TABLE_NAME is missing.`);
    handleError("process.env.FEEDBACKS_TABLE_NAME","Missing required environment variable.",context);
    return createResponseObject({
      code: '500',
      message: 'Insufficient environmental conditions.',
      cors: {
        allowOrigin: event.headers.origin,
        allowMethods: 'OPTIONS,POST'
      }
    });
  }

  // Check if SourceIP is already recorded
  if(qoqmey.includes(eventObj.sourceIP)) {
    console.log(`SourceIP included in qoqmey.`);
    handleError("SourceIP",`SourceIP ${eventObj.sourceIP} already exists in qoqmey array.`,context);
    return createResponseObject({
      code: '400',
      message: "Insufficient empathetic request. Please contact admin.",
      cors: {
                  allowOrigin: event.headers.origin,
                  allowMethods: 'OPTIONS,POST'
      }
    });
  }

  // Message is a required field, but Score is *not*.
  return await Promise.all([
    validateRequiredVar(eventObj?.message),
    robotrap(eventObj?.score)
  ]) 
  .then(async (resp) => {
    console.debug(`Promise.all.then.resp: `,resp); // DEBUG
    return await postDynamo(eventObj);
  })  // End Promise.all.then
  .then((resp) => {
    console.debug(`Promise.all.then.then.resp...`,resp); // DEBUG
    return createResponseObject({
      code: '200',
      message: "Hailing frequencies open.",
      cors: {
        allowOrigin: event.headers.origin,
        allowMethods: 'OPTIONS,POST'
      }
    });  
  })  // End Promise.all.then.then
  .catch(async (err) => {
    console.debug(`Error:..`,err); // DEBUG

    const cro={
      cors: {
                  allowOrigin: event.headers.origin,
                  allowMethods: 'OPTIONS,POST'
      }
    };

    if(err == "Insuffient empathetic response") {
      cro.code = '400';
      cro.message = "Insufficient empathetic request. Please contact admin."

      // Push Source IP to qoqmey
      qoqmey.push(eventObj.sourceIP);
      console.debug(`qoqmey: ${qoqmey}`); // DEBUG
    } else {
      cro.code = '500';
      cro.message = err.toString();
    } // End if/else err empathy

    await handleError("Promise.all.catch",cro.message,context);
    console.debug(`catch:cro:: `,JSON.stringify(cro,null,2)); // DEBUG
    return createResponseObject(cro);
  }); // End Promise.all

};  // End Handler
  