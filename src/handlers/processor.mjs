//
// processor.mjs
// Lambda to process DDB stream and send SSE emails.
//

// Load modules
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { sesClient } from "../libs/sesClient.mjs";
import { SendRawEmailCommand } from "@aws-sdk/client-ses";
import { createMimeMessage } from "mimetext";

//
// processRecum
// processes individual recum to generate mime message for email
// @params rec {object} - The recum to process
// @returns {promise} - Mime message
async function processRecum(rec) {
  return new Promise((resolve,reject) => {
    const site = rec?.site ? rec.site : "Site Missing";
    const msg = createMimeMessage();
    msg.setSender(process.env.SENDER);
    msg.setTo(process.env.RECEIVER);
    msg.setSubject(`[FEEDBACK] Site: ${recum.site}`)
  }); // End Promise
} // End processRecum

// ************
// Main Handler
export const handler = async (event,context) => {
  console.log(`Received event: ${JSON.stringify(event,null,2)}`); // DEBUG:

  // const record = event.Records[0];
  // console.debug(`record: `,JSON.stringify(record.dynamodb.NewImage,null,2)); // DEBUG
  // const eventObj = unmarshall(JSON.parse(event.Records[0].dynamodb.NewImage));
  // const eventObj = unmarshall(event.Records[0].dynamodb.NewImage);
  // console.debug(`eventObj: `,JSON.stringify(eventObj,null,2)); // DEBUG

  // Process all the records
  await Promise.all(
    event.Records.map(async record => {
      const recum = unmarshall(record.dynamodb.NewImage);
      console.debug(`recum: `,JSON.stringify(recum,null,2)); // DEBUG

    })
  )
  .then((resp) => {
    console.debug(`Promise.all.then: ${resp}`); // DEBUG
    return "Honkey Donkey";
  })  // End Promise.all.then
  .catch((err) => {
    console.error('Promise.all.catch: ',err);
  }); // End Promise.all

} // End Main Handler