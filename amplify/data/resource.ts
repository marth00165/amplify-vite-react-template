import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/**
 * ✅ 1️⃣ Transactions
 * ✅ 2️⃣ Todos / Goals
 * ✅ 3️⃣ (Optional) User Wallet (we can store the balance OR compute it live)
 */

const schema = a.schema({
Transaction: a
  .model({
    userId: a.string().required(),
    type: a.string().required(),
    amount: a.float().required(),
    vendor: a.string().required(),
    notes: a.string(),
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

  Wallet: a
    .model({
      userId: a.string(),
      balance: a.float(),
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
