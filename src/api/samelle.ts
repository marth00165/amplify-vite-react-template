import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>({
  authMode: 'apiKey',
});

export async function sendSamelleHi(code: string) {
  const response = await client.mutations.sendSamelleHi({
    code,
  });

  if (response.errors?.length) {
    throw new Error(response.errors[0].message);
  }

  return response.data;
}
