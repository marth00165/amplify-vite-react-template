import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  User: a
    .model({
      cognitoId: a.string().required(),
      email: a.string().required(),
      username: a.string(),
      displayName: a.string(),
      profilePicture: a.string(),
      createdAt: a.string().required(),
      lastLogin: a.string().required(),
      wallet: a.hasOne('Wallet', 'userId'),
      transactions: a.hasMany('Transaction', 'userId'),
      goals: a.hasMany('Goal', 'userId'),
      jobs: a.hasMany('Job', 'userId'),
    })
    .authorization((allow) => [
      allow
        .owner()
        .identityClaim('sub')
        .to(['create', 'read', 'update', 'delete']),
      allow.publicApiKey().to(['read']),
    ]),

  Transaction: a
    .model({
      userId: a.string().required(),
      type: a.string().required(),
      amount: a.float().required(),
      vendor: a.string().required(),
      notes: a.string(),
      createdAt: a.string(),
      user: a.belongsTo('User', 'userId'),
    })
    .authorization((allow) => [
      allow
        .owner()
        .identityClaim('sub')
        .to(['create', 'read', 'update', 'delete']),
    ]),

  Todo: a
    .model({
      userId: a.string(),
      content: a.string(),
      isDone: a.boolean(),
    })
    .authorization((allow) => [
      allow
        .owner()
        .identityClaim('sub')
        .to(['create', 'read', 'update', 'delete']),
    ]),

  Wallet: a
    .model({
      userId: a.string().required(),
      balance: a.float().required(),
      user: a.belongsTo('User', 'userId'),
    })
    .authorization((allow) => [
      allow
        .owner()
        .identityClaim('sub')
        .to(['create', 'read', 'update', 'delete']),
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
      user: a.belongsTo('User', 'userId'),
    })
    .authorization((allow) => [
      allow
        .owner()
        .identityClaim('sub')
        .to(['create', 'read', 'update', 'delete']),
    ]),

  Subtask: a
    .model({
      name: a.string().required(),
      isCompleted: a.boolean().required(),
      goalSubtasksId: a.string(),
      goal: a.belongsTo('Goal', 'goalSubtasksId'),
    })
    .authorization((allow) => [
      allow
        .owner()
        .identityClaim('sub')
        .to(['create', 'read', 'update', 'delete']),
    ]),

  Job: a
    .model({
      userId: a.string().required(),
      title: a.string().required(),
      company: a.string().required(),
      description: a.string(),
      jobUrl: a.string(),
      salary: a.string(),
      location: a.string(),
      status: a.enum([
        'applied',
        'response',
        'interviewing',
        'rejected',
        'offer',
        'accepted',
      ]),
      appliedDate: a.string().required(),
      createdAt: a.string(),
      updatedAt: a.string(),
      comments: a.hasMany('JobComment', 'jobId'),
      user: a.belongsTo('User', 'userId'),
    })
    .authorization((allow) => [
      allow
        .owner()
        .identityClaim('sub')
        .to(['create', 'read', 'update', 'delete']),
    ]),

  JobComment: a
    .model({
      jobId: a.string().required(),
      userId: a.string().required(),
      content: a.string().required(),
      type: a.enum(['comment', 'status_change', 'interview_scheduled']),
      createdAt: a.string(),
      job: a.belongsTo('Job', 'jobId'),
    })
    .authorization((allow) => [
      allow
        .owner()
        .identityClaim('sub')
        .to(['create', 'read', 'update', 'delete']),
    ]),

  // Food Challenge Models
  FoodTracker: a
    .model({
      name: a.string().required(),
      goal: a.float().required(),
      startDate: a.string().required(),
      endDate: a.string().required(),
      datasetId: a.string().required(),
      isActive: a.boolean().default(true),
      createdAt: a.string(),
      updatedAt: a.string(),
      dataset: a.belongsTo('FoodDataset', 'datasetId'),
      consumptionLogs: a.hasMany('ConsumptionLog', 'trackerId'),
    })
    .authorization((allow) => [
      allow
        .owner()
        .identityClaim('sub')
        .to(['create', 'read', 'update', 'delete']),
    ]),

  FoodDataset: a
    .model({
      name: a.string().required(),
      baseUnit: a.string().required(),
      isDefault: a.boolean().default(false),
      createdAt: a.string(),
      foodItems: a.hasMany('FoodItem', 'datasetId'),
      trackers: a.hasMany('FoodTracker', 'datasetId'),
    })
    .authorization((allow) => [
      allow
        .owner()
        .identityClaim('sub')
        .to(['create', 'read', 'update', 'delete']),
      allow.publicApiKey().to(['read']),
    ]),

  FoodItem: a
    .model({
      name: a.string().required(),
      conversions: a.json().required(),
      datasetId: a.string().required(),
      createdAt: a.string(),
      dataset: a.belongsTo('FoodDataset', 'datasetId'),
      consumptionLogs: a.hasMany('ConsumptionLog', 'foodItemId'),
    })
    .authorization((allow) => [
      allow
        .owner()
        .identityClaim('sub')
        .to(['create', 'read', 'update', 'delete']),
      allow.publicApiKey().to(['read']),
    ]),

  ConsumptionLog: a
    .model({
      trackerId: a.string().required(),
      foodItemId: a.string().required(),
      quantity: a.float().required(),
      unit: a.string().required(),
      consumedAt: a.string().required(),
      notes: a.string(),
      createdAt: a.string(),
      tracker: a.belongsTo('FoodTracker', 'trackerId'),
      foodItem: a.belongsTo('FoodItem', 'foodItemId'),
    })
    .authorization((allow) => [
      allow
        .owner()
        .identityClaim('sub')
        .to(['create', 'read', 'update', 'delete']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
