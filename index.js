const AWS = require("aws-sdk");

exports.handler = async (event) => {
  const { user_id } = event;

  // Temporary dummy response
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello from Lambda!",
      user_id,
    }),
  };
};
