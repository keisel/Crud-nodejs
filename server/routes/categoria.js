const express = require('express');
const { verificaToken } = require('../middlewares/token');
const app = express();
const Categoria = require('../models/categoria');
const _ = require('underscore');

// mostrar todas las categorias
app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({})
        .populate('usuario')
        .sort('descripcion') // ordenar el resultado por orden alfabetico de la descripcion
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            if (categorias == '') {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'No hay categorias registradas'
                    }
                });
            }
            Categoria.count({}, (err, conteo) => {
                res.json({
                    ok: true,
                    categorias,
                    conteo

                });
            });
        })
});
app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Categoria.findById(id, (err, categoria) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        if (!categoria) { // por si el id no existe
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'id No encontrado'
                }
            });
        };

        res.json({
            ok: true,
            categoria
        });

    });

});

// verfica token me devulve el req:usuario._id ese id es el que guardare aqui
app.post('/categoria', verificaToken, (req, res) => {

    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });
    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

app.delete('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    Categoria.findByIdAndRemove(id, verificaToken, (err, categoriaBorrada) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        if (!categoriaBorrada) { // por si el id no existe
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'id No encontrado'
                }
            });
        };

        res.json({
            ok: true,
            Categoria: categoriaBorrada
        });

    });


});

app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['descripcion']);

    // new true es para que me devuelva la categoria una vez cambiado 
    Categoria.findByIdAndUpdate(id, body, { new: true }, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) { // por si el id no existe
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'id No encontrado'
                }
            });
        };

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

module.exports = app;