import { defineFunction } from '@aws-amplify/backend';

export const sendSamelleHi = defineFunction({
  name: 'send-samelle-hi',
  entry: './handler.ts',
  runtime: 20,
  timeoutSeconds: 10,
  environment: {
    EMAIL_TO: 'rohit.pratti@gmail.com',
    EMAIL_FROM: 'rohit.pratti@gmail.com',
  },
});
