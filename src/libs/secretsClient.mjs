import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";

const smClient = new SecretsManagerClient({apiVersion: '2017-10-17'});

export { smClient };