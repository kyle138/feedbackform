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
async function loadSettings(params) {
  console.debug(`loadSettings:params:: `,JSON.stringify(params,null,2)); // DEBUG
  // Check if keyPair is already stored on global 'settings' object.
  if(settings.hasOwnProperty('SENDER') && settings.hasOwnProperty('RECEIVER')) {
    console.log('loadSettings: SENDER and RECEIVER are already set.');
    return;
  }

  if(!params.secretName) {
    console.error('loadSettings:secretName MISSING:: ',JSON.stringify(params,null,2));
    throw new Error('loadSettings: secretName is a required parameter.');
  }

  // Retrieve SENDER/RECEIVER from ASM
  // Note: If this Lambda is in a VPC you will be "awaiting" a long time(out) if 
  // you don't first configure a VPC Endpoint for ASM.
  const lSresp = await smClient.send(new GetSecretValueCommand({SecretId: params.secretName}));
  console.debug('loadSettings:smClient::lSresp::: ',lSresp); // DEBUG:
  console.log('loadSettings: settings set.');
  const secret = JSON.parse(lSresp.SecretString);
  settings.SENDER = secret.SENDER;
  settings.RECEIVER = secret.RECEIVER;
  console.debug(`settings cached:: `,JSON.stringify(settings,null,2)); // DEBUG
} // End loadSettings


//
// processRecum
// processes individual recum to generate mime message for email
// @params rec {object} - The recum to process
// @returns {promise} - Mime message
async function processRecum(rec) {
  // Check that SENDER and RECEIVER are set, these are REQUIRED
  if(!settings.hasOwnProperty('SENDER') || !settings.hasOwnProperty('RECEIVER')) {
    console.error('processRecum: SENDER and RECEIVER are missing.');
    throw new Error("SENDER y RECEIVER are required.");
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

    const pRresp = await sesClient.send(new SendRawEmailCommand(params));

    console.debug(`sesClient.send: `,pRresp); // DEBUG
    return pRresp.MessageId; 
    } // End if/else SENDER/RECEIVER set
} // End processRecum

// ************
// Main Handler
// ************
export const handler = async (event,context) => {
  console.log(`Received event: ${JSON.stringify(event,null,2)}`); // DEBUG:

  // Check if SECRET_NAME is set as an environment variable (REQUIRED)
  if(!process.env.SECRET_NAME) {
    console.error("process.env.SECRET_NAME missing", process.env.SECRET_NAME);  // DEBUG
    await handleError("process.env.SECRET_NAME", "Missing Environment Variable", context);
    throw new Error("Missing process.env.SECRET_NAME.");
  }

  try {
    await loadSettings({secretName: process.env.SECRET_NAME})
  } catch (lSerr) {
    console.error("Failed to load Settings object.", lSerr);
    await handleError("loadSettings",lSerr.message, context);
  }

  const batchItemFailures = [];

  // Loop through all DDB records
  for (const record of event.Records) {
    const sequenceNumber = record.dynamodb.SequenceNumber;

    try {
      // Discard deletes, only process new inserts/updates
      // This shouldn't happen as we're only passing inserts/updates to the stream.
      if (record.eventName === 'REMOVE') continue;

      const recum = unmarshall(record.dynamodb.NewImage);
      console.debug(`recum: `,JSON.stringify(recum,null,2)); // DEBUG

      await processRecum(recum);
    } catch (recsErr) {
      console.error(`Failed to process record ID ${sequenceNumber}:`, recsErr);
      await handleError(`RecordProcessor: ${sequenceNumber}`,recsErr.message, context);

      // Track failures to report to DDB
      batchItemFailures.push({ itemIdentifier: sequenceNumber });

    } // End try/catch
  } // End for records loop

  // Tell DDB which stream records failed so it only retries those. 
  return { batchItemFailures };

} // End Main Handler