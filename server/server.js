require('./config/config');
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path'); // para poder usar el static. dirname necesito este path
app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(express.static(path.resolve(__dirname, '../public')));

app.use(require('./routes/index'));

mongoose.connect('mongodb://localhost:27017/cafe', (err, res) => {

    if (err) throw err;
    console.log('base de datos onlien');
});




app.listen(process.env.PORT, () => {
    console.log("escuchando puerto", process.env.PORT);
});