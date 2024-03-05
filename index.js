import express from 'express';
import http from 'http';
import { Server } from "socket.io";
import { redisClient } from './db/index.js';
const app = express();

const server = http.createServer(app);

const io = new Server(server);



app.get('/', (req, res) => {
  return res.status(200).json(
    {
        message: 'gm frens! API is up and running!'
    });
});

io.on('connection', (socket) => {
    // increment points for user if user exists else create user and increment points
    socket.on('increment', async (data) => {

        const { userId } = data;
        const userExists = await redisClient.get(`user:${userId}`);
        if (userExists) {
           await redisClient.incr(`user:${userId}`)
        } else {
            await redisClient.set(`user:${userId}`, 1);
        }
        const userPoints = await redisClient.get(`user:${userId}`);
        io.emit('increment', { userId, points: parseInt(userPoints) + 1 });
    });

    // get points for user
    socket.on('getPoints', async (data) => {
       io.emit('getPoints', { userId: data.userId, points: await redisClient.get(`user:${data.userId}`)});
    });

    socket.on('leaderboard', async () => {
        const keys = await redisClient.keys('user:*');
        const users = await redisClient.mGet(keys)
        const leaderboard = keys.map((key, index) => {
            return { userId: key.split(':')[1], points: users[index] }
        });
        io.emit('leaderboard', leaderboard);
    })
  
            
});

server.listen(5000, () => {
    console.log('listening on http://localhost:5000')
});