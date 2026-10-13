import serverlessExpress from '@vendia/serverless-express';
import { connectDB } from './config/db';
import app from './app';

let serverlessExpressInstance: any;

/**
 * Serverless AWS Lambda Entry Point Handler.
 * Ensures cached database connection and wraps Express app instance.
 */
export const handler = async (event: any, context: any) => {
  if (context) {
    context.callbackWaitsForEmptyEventLoop = false;
  }

  // Ensure PostgreSQL connection is established & cached
  await connectDB();

  if (!serverlessExpressInstance) {
    serverlessExpressInstance = serverlessExpress({ app });
  }

  return serverlessExpressInstance(event, context);
};

export default handler;
