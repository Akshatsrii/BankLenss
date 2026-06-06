const { onCall } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { parseStatement, ERRORS } = require("./parsers/index");

initializeApp();

exports.helloWorld = onCall(async (request) => {
  return {
    message: "Hello from Firebase Functions!",
    timestamp: new Date().toISOString(),
  };
});

/**
 * testParser — callable for local testing only
 * In production this will be replaced by processStatement
 * which reads from Firebase Storage
 */
exports.testParser = onCall(async (request) => {
  // This will be wired to real PDF bytes in Day 3
  // For now just confirms the module loads correctly
  return {
    status: "Parser module loaded successfully",
    supportedBanks: ["SBI", "HDFC", "ICICI"],
  };
});