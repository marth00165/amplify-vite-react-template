import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/**
 * ✅ 1️⃣ Transactions
 * ✅ 2️⃣ Todos / Goals
 * ✅ 3️⃣ (Optional) User Wallet (we can store the balance OR compute it live)
 */

const schema = a.schema({
  Transaction: a
    .model({
      userId: a.string(),       // required: to link to the user
      type: a.string(),         // e.g. 'income' | 'expense'
      amount: a.float(),
      description: a.string(),
      createdAt: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  Todo: a
    .model({
      userId: a.string(),
      content: a.string(),
      isDone: a.boolean(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
