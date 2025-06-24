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

  Goal: a
    .model({
      userId: a.string().required(),
      title: a.string().required(),
      description: a.string(),
      completionDate: a.string(),
      isCompleted: a.boolean().required(),
      subtasks: a.hasMany('Subtask', 'goalSubtasksId'),
      createdAt: a.string(),
    })
    .authorization((allow) => [
      allow.owner().identityClaim("sub").to(["create", "read", "update", "delete"]),
    ]),

  Subtask: a
    .model({
      name: a.string().required(),
      isCompleted: a.boolean().required(),
      goalSubtasksId: a.string(),
      goal: a.belongsTo('Goal', 'goalSubtasksId'), // Add this line to establish the bidirectional relationship
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
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
