const redis = require("redis");

var cacheHostName = process.env.REDISCACHEHOSTNAME;
var cachePassword = process.env.REDISCACHEKEY;

const cacheConnection = redis.createClient({
  // rediss for TLS
  url: "rediss://" + cacheHostName + ":6380",
  password: cachePassword,
});

// async function testCache() {
//   // Connect to the Azure Cache for Redis over the TLS port using the key.
//   await cacheConnection.connect();

//   // Perform cache operations using the cache connection object...

//   // Simple PING command
//   console.log("\nCache command: PING");
//   console.log("Cache response : " + (await cacheConnection.ping()));
// }
// testCache();
module.exports = cacheConnection;
