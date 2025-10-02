## AWS Amplify React+Vite Starter Template

This repository provides a starter template for creating applications using React+Vite and AWS Amplify, emphasizing easy setup for authentication, API, and database capabilities.

## Overview

This template equips you with a foundational React application integrated with AWS Amplify, streamlined for scalability and performance. It is ideal for developers looking to jumpstart their project with pre-configured AWS services like Cognito, AppSync, and DynamoDB.

## Features

- **Authentication**: Setup with Amazon Cognito for secure user authentication.
- **API**: Ready-to-use GraphQL endpoint with AWS AppSync.
- **Database**: Real-time database powered by Amazon DynamoDB.

## Local Development

To run the application locally:

1. Install dependencies:

```bash
npm install
```

2. Start the local backend sandbox:

```bash
npx ampx sandbox
```

This will start a local instance of your Amplify backend services. The sandbox provides local development capabilities without deploying to the cloud.

3. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

For testing:

```bash
npm run test      # Run tests once
npm run test:dev  # Run tests in watch mode
```

Note: The `npx ampx sandbox` command requires:

- AWS Amplify CLI installed (`npm install -g @aws-amplify/cli`)
- Valid AWS credentials configured
- Amplify project initialized (`amplify init`)

## Deploying to AWS

For detailed instructions on deploying your application, refer to the [deployment section](https://docs.amplify.aws/react/start/quickstart/#deploy-a-fullstack-app-to-aws) of our documentation.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.
