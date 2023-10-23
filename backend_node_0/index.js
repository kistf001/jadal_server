const express = require('express') //express를 설치했기 때문에 가져올 수 있다.
const { sequelize } = require('./db/models/index')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser');

const app = express()

app.use(cookieParser())
app.use(bodyParser.json());

sequelize
  .sync()
  .then(() => console.log('connected database'))

// redisClient = redis.createClient(6379,'127.0.0.1');
// redisClient
//   .connect()
//   .then(async (res) => {
//     console.log('redis connected');
//     // Write your own code here

//     // Example
//     const value = await client.lRange('data', 0, -1);
//     console.log(value.length);
//     console.log(value);
//     client.quit();
//   })
//   .catch((err) => {
//     console.log('err happened' + err);
//   });

const common = require('./routes/common')(app);
app.use('/api2/common', common);

const post = require('./routes/post')(app);
app.use('/api2/post', post);

const auth = require('./routes/auth')(app);
app.use('/api2/auth', auth);

const topic = require('./routes/topic');
app.use('/api2/topic', topic);

app.listen(5001)