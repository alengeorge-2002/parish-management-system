const serverlessExpress = require('@vendia/serverless-express');

let distLambda;
try {
  distLambda = require('./dist/lambda');
} catch (_) {
  // Fallback if imported directly before build
}

let serverlessExpressInstance;

const handler = async (event, context) => {
  if (distLambda && distLambda.handler) {
    return distLambda.handler(event, context);
  }

  if (context) {
    context.callbackWaitsForEmptyEventLoop = false;
  }

  const { connectDB } = require('./dist/config/db');
  const app = require('./dist/app').default || require('./dist/app');

  await connectDB();

  if (!serverlessExpressInstance) {
    serverlessExpressInstance = serverlessExpress({ app });
  }

  return serverlessExpressInstance(event, context);
};

module.exports = { handler };
