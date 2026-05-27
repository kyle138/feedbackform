import { SESClient } from "@aws-sdk/client-ses";
const sesClient = new SESClient({ region: 'us-east-1' });

export { sesClient };