import { createClient } from 'redis';

const redisClient = createClient({
    password: process.env.REDIS,
    socket: {
        host: '127.0.0.1',
        port: 6379
    }
});



redisClient.connect();

redisClient.on('error', function (err) {
    console.log('Could not establish a connection with redis. ' + err);
});
redisClient.on('connect', function (err) {
    console.log('Connected to redis successfully');
});

export { redisClient };