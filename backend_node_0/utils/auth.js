const redis = require('redis');

let redisClient;

(async () => {
  redisClient = redis.createClient();

  redisClient.on("error", (error) => console.error(`Error : ${error}`));

  await redisClient.connect();
  const cacheResults = await redisClient.keys("*");
  console.log(cacheResults)
})();