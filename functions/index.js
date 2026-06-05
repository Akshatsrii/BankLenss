const {onCall} = require("firebase-functions/v2/https");

exports.helloWorld = onCall(async (request) => {
  return {
    message: "Hello from Firebase Functions!",
    timestamp: new Date().toISOString(),
  };
});
