import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>({
  authMode: 'apiKey',
});

export async function sendSamelleCommand(code: string, action: string) {
  const response = await client.mutations.sendSamelleHi({
    action,
    code,
  });

  if (response.errors?.length) {
    throw new Error(response.errors[0].message);
  }

  return response.data;
}

export async function sendSamelleFoodRequest(
  code: string,
  request: { food: string; date: string; time: string }
) {
  const response = await client.mutations.sendSamelleHi({
    action: 'food-request',
    code,
    food: request.food,
    requestedDate: request.date,
    requestedTime: request.time,
  });

  if (response.errors?.length) {
    throw new Error(response.errors[0].message);
  }

  return response.data;
}
