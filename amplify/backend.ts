import { defineBackend } from '@aws-amplify/backend';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { sendSamelleHi } from './functions/send-samelle-hi/resource';

const backend = defineBackend({
  auth,
  data,
  sendSamelleHi,
});

// Replace the expired V1 key without replacing the AppSync API or its tables.
backend.data.resources.cfnResources.cfnApiKey?.overrideLogicalId(
  'amplifyDataGraphQLAPIDefaultApiKeyV2'
);

backend.sendSamelleHi.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['ses:SendEmail', 'ses:SendRawEmail'],
    resources: ['*'],
  })
);
