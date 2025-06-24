import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

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
    .authorization((allow) => [
      // Only authenticated users can perform operations on their own data
      allow.owner().identityClaim("sub").to(["create", "read", "update", "delete"]),
    ]),

  Todo: a
    .model({
      userId: a.string(),
      content: a.string(),
      isDone: a.boolean(),
    })
    .authorization((allow) => [
      allow.owner().identityClaim("sub").to(["create", "read", "update", "delete"]),
    ]),

  Wallet: a
    .model({
      userId: a.string(),
      balance: a.float(),
    })
    .authorization((allow) => [
      allow.owner().identityClaim("sub").to(["create", "read", "update", "delete"]),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    // Keep API key for development or public read-only operations
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
