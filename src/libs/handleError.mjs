import { ddbDocClient } from "./ddbDocClient.mjs";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

// 
// handleError
// Publishes errors to dynamodb to email to devsupport
// Arguments: 
// method {string} - The name of the method that threw the error.
// message {string} - The message to include, usually the error itself.
// context {object} - This is provided by the Lambda handler, used to identify the reporting lambda function.
const handleError = (method, message, context) => {
  return new Promise(async (resolve) => {
    var errorMessage = {
      lambdaFunctionName: context?.functionName,
      eventTimeUTC: new Date().toUTCString(),
      methodName: method,
      error: message
    }; // End errorMessage
    console.log("handleError: " + JSON.stringify(errorMessage)); // DEBUG:

    const params = {
      TableName: 'errorLogs',
      Item: {
        // DDB ttl to expire item after 1 month
        ttl: Math.floor(Date.now() / 1000) + 2592000,
        data: errorMessage
      }
    }; // End params

    // Load the DDB client and write the errorLogs
    // Now everybody gonna know what you did.
    try {
      console.log("DDB params:: ",JSON.stringify(params,null,2)); // DEBUG:
      const data = await ddbDocClient.send(new PutCommand(params));
      console.log("handleError:put data:",JSON.stringify(data,null,2)); // DEBUG:
      return resolve();

    } catch (err) {
      console.log("Unable to add DDB item to errorLogs: " ,err);
      // Yes this is an error, but we don't want it to kill the lambda.
      return resolve();

    }
  }); // End Promise  
}; // End handleError

export { handleError };