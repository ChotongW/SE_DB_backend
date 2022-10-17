const SmsClient = require("@azure/communication-sms");

const connectionString =
  process.env["COMMUNICATION_SERVICES_CONNECTION_STRING"];

// Instantiate the SMS client.
const smsClient = new SmsClient(connectionString);

async function main() {
  const sendResults = await smsClient.send({
    from: "0805169599",
    to: ["<to-phone-number-1>", "<to-phone-number-2>"],
    message: "Hello World 👋🏻 via SMS",
  });

  // Individual messages can encounter errors during sending.
  // Use the "successful" property to verify the status.
  for (const sendResult of sendResults) {
    if (sendResult.successful) {
      console.log("Success: ", sendResult);
    } else {
      console.error(
        "Something went wrong when trying to send this message: ",
        sendResult
      );
    }
  }
}

main();
