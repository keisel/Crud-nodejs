const express = require('express');
const app = express();
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);
app.post('/login', (req, res) => {


    let body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => { // busca eln la bd si hay un email igual y devuelve el objeto de la bd se alamcena en usuario DB
        if (err) { // por si hay un error en la bd
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) { // si devuelve nulo es porque no hay un email igual en la bd 
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos'
                }
            });
        }

        // mandamos la contraseña del usuario mas la que nos retorno la BD en usuarioDB devuelve un true si la encuetra o un false si no la encuetra
        // ponemos primero la negacion, si no la encutra
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos'
                }
            });
        }
        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        res.json({
            ok: true,
            usuario: usuarioDB,
            token

        });

    });


});

// CONFIGURACIONES PARA INICIAR SECION CON GOOGLE 
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }

    console.log(payload.name);
}


app.post('/google', async(req, res) => {

    let token = req.body.idtoken;

    let googleUser = await verify(token)
        .catch(e => {
            res.status(403).json({
                ok: false,
                err: e
            });
        });


    // con findone buscamos en la base de datos si ya existe ese correo
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        // si hay un error 
        if (err) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña  error 1'
                }
            });
        };
        // si el usuario existe
        if (usuarioDB) {
            // si el suaurio existe pero no esta autenticado con google
            if (usuarioDB.google == false) {

                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe usar su autenticacion normal'
                    }
                });
                // si el usuario existe y esta auttenticado con google renuevo el token y lo mando
            } else {
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
            // si el usuario no existe en la bd lo guardamos
        } else {
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err: {
                            message: 'Usuario o contraseña incorrectos ultimo'
                        }
                    });
                }

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            });

        }

    });

});

module.exports = app;