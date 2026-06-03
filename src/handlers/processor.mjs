//
// processor.mjs
// Lambda to process DDB stream and send SSE emails.
//

// Load modules
import { smClient } from "../libs/secretsClient.mjs";
import { GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { sesClient } from "../libs/sesClient.mjs";
import { SendRawEmailCommand } from "@aws-sdk/client-ses";
import { createMimeMessage } from "mimetext";
import { handleError } from "../libs/handleError.mjs"

// 
// Declaring the Settings up here prevents them from needing to be set with every execution.
// Only the handler module gets re-initiated with every run, everything declared above the
// handler survives and retains its settings as long as the Lambda container is still warm.
const settings={};

// 
// loadSettings
// Checks if global 'settings' object is already populated
// Otherwise retrieves settings from ASM 
// Parameters:
// secretName - The ASM secret name retrief from process.env
function loadSettings(params) {
  return new Promise(async (resolve, reject) => {
    console.debug(`loadSettings:params:: `,JSON.stringify(params,null,2)); // DEBUG
    // Check if keyPair is already stored on global 'settings' object.
    if(settings.hasOwnProperty('SENDER') && settings.hasOwnProperty('RECEIVER')) {
      console.log('loadSettings: SENDER and RECEIVER are already set.');
      return resolve();
    } else {
      if(!params.secretName) {
        console.log('loadSettings:params:: ',JSON.stringify(params,null,2));
        return reject('loadSettings: secretName is a required parameter.');
      } else {
        // Retrieve SENDER/RECEIVER from ASM
        // Note: If this Lambda is in a VPC you will be "awaiting" a long time(out) if 
        // you don't first configure a VPC Endpoint for ASM.
        return await smClient.send(
          new GetSecretValueCommand({SecretId: params.secretName})
        )
        .then((resp) => {
          console.debug('loadSettings:smClient::resp::: ',resp); // DEBUG:
          console.log('loadSettings: settings set.');
          const secret = JSON.parse(resp.SecretString);
          settings.SENDER = secret.SENDER;
          settings.RECEIVER = secret.RECEIVER;
          console.debug(`settings: `,JSON.stringify(settings,null,2)); // DEBUG
          return resolve();
        })
        .catch((err) => {
          console.log('loadSettings:smClient::err::: ', err);
          return reject(err);
        }); // End getPATFromASM
      } // End if/else params
    } // End if/else 'pelcroAT'
  }); // End Promise
} // End loadSettings


//
// processRecum
// processes individual recum to generate mime message for email
// @params rec {object} - The recum to process
// @returns {promise} - Mime message
function processRecum(rec) {
  return new Promise(async (resolve,reject) => {
    // Check that SENDER and RECEIVER are set, these are REQUIRED
    if(!settings.hasOwnProperty('SENDER') || !settings.hasOwnProperty('RECEIVER')) {
      console.error('processRecum: SENDER and RECEIVER are missing.');
      return reject(new Error("SENDER y RECEIVER are required."));
    } else {
      const site = rec?.site ? rec.site : "Site Missing";
      const msg = createMimeMessage();
      msg.setSender(settings.SENDER);
      msg.setTo(settings.RECEIVER);
      msg.setSubject(`[FEEDBACK] Site: ${rec.site}`);
      msg.addMessage({
        contentType: 'text/plain',
        data: `You have received feedback regarding site: ${rec.site}\n\n` +
              `Date Submitted: ${rec?.datetime}\n` +
              `Name Submitted: ${rec?.name}\n` +
              `Email Address: ${rec?.email}\n` +
              `Subject: ${rec?.subject}\n` +
              `Message: ${rec?.message}\n\n`
      });
      console.debug(`processRecum:msg:: `,JSON.stringify(msg,null,2)); // DEBUG
  
      const params = {
        Destinations: msg.getRecipients({type: 'to'}).map(box => box.addr),
        RawMessage: {
          Data: Buffer.from(msg.asRaw(), 'utf8')
        },
        Source: msg.getSender().addr
      };
  
      await sesClient.send(new SendRawEmailCommand(params))
      .then((resp) => {
        console.debug(`sesClient.send: `,resp); // DEBUG
        return resolve(resp.MessageId); 
      })  // end sesClient.then
      .catch((err) => {
        console.error(`processRecum:sesClient.err:: `,err);
        return reject (err)
      }); // End sesClient.send
    } // End if/else SENDER/RECEIVER set

  }); // End Promise
} // End processRecum

// ************
// Main Handler
export const handler = async (event,context) => {
  console.log(`Received event: ${JSON.stringify(event,null,2)}`); // DEBUG:

  // Check if SECRET_NAME is set as an environment variable (REQUIRED)
  if(!process.env.SECRET_NAME) {
    console.log("process.env.SECRET_NAME missing", process.env.SECRET_NAME);  // DEBUG
    await handleError("process.env.SECRET_NAME", "Missing Environment Variable", context);
    return new Error("Missing process.env.SECRET_NAME.");
  }

  return await loadSettings({secretName: process.env.SECRET_NAME})
  .then(async() => {
    // Process all the records
    return await Promise.all(
      event.Records.map(async record => {
        const recum = unmarshall(record.dynamodb.NewImage);
        console.debug(`recum: `,JSON.stringify(recum,null,2)); // DEBUG
        return await processRecum(recum);
      })
    ) // End Promise.all
    .then((resp) => {
      console.debug(`Promise.all.then: ${resp}`); // DEBUG
      return "Honkey Donkey";
    })  // End Promise.all.then
  })
  .catch((err) => {
    console.error('loadSettings.catch: ',err);
    return "DISAPPOINTED!!!"
  }); // End loadSettings

} // End Main Handler