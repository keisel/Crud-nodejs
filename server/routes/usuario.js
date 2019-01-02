const express = require('express');
const app = express();
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const token = require('../middlewares/token');


app.get('/usuario', token.verificaToken, function(req, res) {

    //let id = req.usuario._id; // este id lo estoy agarrando del usuario que me devuelve token.js


    // con esto de abajo retorno todos los usuarios de la bd

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 10;
    limite = Number(limite);

    Usuario.find({ estado: true }) // aca adentro se puede poner una considicon estado:true me trae solo registros activos
        .skip(desde)
        .limit(limite) // limitar la cantidad de registros que va a traer
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            if (usuarios == '') {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'No se encontraron usuarios registrados'
                    }
                });
            }
            Usuario.count({ estado: true }, (err, conteo) => { // devuelve el numero de registros en la BD estado:true omite los borrados
                res.json({
                    ok: true,
                    usuarios,
                    conteo
                });
            });
        })
});

app.get('/usuario/:id', token.verificaToken, (req, res) => {

    let id = req.params.id;
    Usuario.find({ _id: id, estado: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'id No valido'
                }
            });
        };
        if (usuarioDB == '') { // por si el id no existe
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'id No encontrado'
                }
            });
        };
        res.json({
            ok: true,
            usuarioDB
        });
    });
});
app.post('/usuario', [token.verificaToken, token.verificaRole], function(req, res) {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});
app.put('/usuario/:id', [token.verificaToken, token.verificaRole], function(req, res) {

    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    // new true es para que me devuelva el usuario una vez cambiado y runvalidators es para que siga las reglas que tenemos en el modelo
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!usuarioDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'id No encontrado'
                }
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
})

app.delete('/usuario/:id', [token.verificaToken, token.verificaRole], function(req, res) {

    let id = req.params.id;

    let estado = { estado: false };

    Usuario.findByIdAndUpdate(id, estado, { new: true }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!usuarioDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'id No encontrado'
                }
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

    /* Esto hace que se borre de la base de datos
    let id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });

    });*/

});
module.exports = app;