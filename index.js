
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const app = express();
const cors = require("cors");

const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
}

app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(express.json());
app.use(fileUpload());


const secretKey = 'mySecretKey';
let user;

const carSchema = new mongoose.Schema({
    user: {
        type: String
    },
    carModel: {
        type: String
    },
    price: {
        type: String
    },
    phoneNo: {
        type: String
    },
    picture: { type: Array, "default": [] }
});

const cars = mongoose.model('cars', carSchema);

mongoose.connect(
    `mongodb+srv://usama:usama@cluster0.iqyds.mongodb.net/cars?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
    console.log("Connected successfully");
});


async function getUser() {
    const data = await cars.find()
    return { uname: data[0].user, pass: data[0].price };
}
app.get('/', async (req, res) => {

    res.send(200)

});

app.post('/login', async (req, res) => {
    const { uname, pass } = await getUser();
    const { username, password } = req.body;

    user = username;
    // Authenticate user
    if (username === uname && password === pass) {
        // Generate token
        const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
        res.status(200).json({ token: token });
        // Send
    } else {
        res.status(401).json({ message: 'Invalid username or password' });
    }
});

app.post('/submit-form', (req, res) => {
    const { carModel, price, phoneNo } = req.body;
    if (req.files && req.files.images) {
        const images = req.files.images;
        const newCar = new cars({
            user: user,
            carModel: carModel,
            price: price,
            phoneNo: phoneNo,
            picture: images
        });
        newCar.save((err) => {
            if (err) {
                console.log(err);

            } else {
                console.log("cars saved to database!");
                res.sendStatus(200);
            }
        });

    }
});

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});