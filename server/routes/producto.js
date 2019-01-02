const express = require('express');
const app = express();
const Producto = require('../models/producto');
const { verificaToken } = require('../middlewares/token');
const _ = require('underscore');

app.get('/producto', verificaToken, (req, res) => {

    Producto.find({})
        .populate('usuario')
        .populate('categoria')
        .sort('nombre') // ordenar el resultado por orden alfabetico de la descripcion
        .exec((err, productos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            if (productos == '') {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'No hay productos registrados'
                    }
                });
            }
            Producto.count({}, (err, conteo) => {
                res.json({
                    ok: true,
                    productos,
                    conteo

                });
            });
        })

});

app.get('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    Producto.findById(id)
        .populate('usuario')
        .populate('categoria')
        .sort('nombre') // ordenar el resultado por orden alfabetico de la descripcion
        .exec((err, producto) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'id No encontrado'
                    }
                });
            };
            if (!producto) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'Id no encontrado'
                    }
                });
            }
            res.json({
                ok: true,
                producto,

            });
        });
});

app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;
    // esto es para poder hacer la busqueda de palabras que mas o menos concuerden sino te traeria todo de manera literal la i para que no le importa mayusculas o minusculas
    let regex = new RegExp(termino, 'i');
    Producto.find({ $or: [{ nombre: regex }, { descripcion: regex }] }) // condicion or busca en el nombre o la descripcion
        .populate('usuario')
        .populate('categoria')
        .sort('nombre') // ordenar el resultado por orden alfabetico del nombre
        .exec((err, producto) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            };
            if (producto == '') {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'No hay coincidencias'
                    }
                });
            };
            res.json({
                ok: true,
                producto,
            });
        });
});

app.post('/producto', verificaToken, (req, res) => {

    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        descripcion: body.descripcion,
        precioUni: body.precio,
        categoria: body.categoria,
        usuario: req.usuario._id,
        img: req.body.img
    });
    producto.save((err, productoDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            producto: productoDB
        });
    });
});



app.put('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'descripcion', 'precioUni', 'categoria', 'disponible']);

    // new true es para que me devuelva el usuario una vez cambiado y runvalidators es para que siga las reglas que tenemos en el modelo
    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, productoBD) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!productoBD) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'id no encontrado'
                }
            });
        };
        res.json({
            ok: true,
            producto: productoBD
        });
    });
});

app.delete('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    let disponible = { disponible: false };

    Producto.findByIdAndUpdate(id, disponible, { new: true }, (err, productoBD) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!productoBD) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'id no encontrado'
                }
            });
        };
        res.json({
            ok: true,
            producto: productoBD,
            message: 'producto borrado'
        });
    });

});

module.exports = app;