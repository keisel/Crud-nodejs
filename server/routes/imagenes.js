const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const { verificaTokenImg } = require('../middlewares/token');

// devuelve la imagen de la carpeta uploads
app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {

    let tipo = req.params.tipo;
    let img = req.params.img;

    let pathImage = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);

    if (fs.existsSync(pathImage)) {
        res.sendFile(pathImage);
    } else {
        let pathNoImage = path.resolve(__dirname, `../assets/image.png`); // en la carpeta assets se guarda los archivos globales que quiero usar, en este caso una imagen por defecto
        res.sendFile(pathNoImage);
    }
});

module.exports = app;