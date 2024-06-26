const mongoose = require('mongoose');
// const dotenv = require('dotenv');
const path = require('path');

const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http');
// dotenv.config({ path: './config.env' });
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET);

console.log("dirname:", __dirname);
// require('./connection')
const server = http.createServer(app);

//reason for socket io
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', "DELETE"]
});

// const User = require('./models/User');
const userRoutes = require('./routes/userRoutes')
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const imageRoutes = require('./routes/imageRoutes')

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/Users', userRoutes);
app.use('/products', productRoutes);

app.use('/orders', orderRoutes);

app.use('/images', imageRoutes);

//Serving static files
app.use(express.static(path.join(__dirname, '/e-comerce-frontend/build')));

//render e-comerce-frontend for any path
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '/e-comerce-frontend/build/index.html')))

const DB = process.env.MONGODB_URI;
mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('DB connection successful!'));

//Payment routes
app.post('/create-payment', async (req, res) => {
    const { amount } = req.body;
    console.log(amount);
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            payment_method_types: ['card']
        });
        res.status(200).json(paymentIntent)
    } catch (e) {
        //   console.log(e.message);
        res.status(400).json(e.message);
    }
})

if (process.env.NODE_ENV === 'production') {
    const path = require('path')

    app.get('/', (req, res) => {
        app.use(express.static(path.resolve(__dirname, 'e-comerce-frontend', 'build')))
        res.sendFile(path.resolve(__dirname, 'e-comerce-frontend', 'build', 'index.html'))
    })
}

server.listen(8000, () => {
    console.log('server running at port', 8000)
});

//that we can had this available in our io route 
app.set('socketio', io);