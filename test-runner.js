const { handler } = require("./index");

(async () => {
  const response = await handler({ user_id: 1 });
  console.log("Lambda response:", response);
})();
