const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs'); // este y el de bajo es para boorar los archivos de las carpetass
const path = require('path');
// default options
app.use(fileUpload());

app.post('/upload/:tipo/:id', (req, res) => {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files) {
        return res.status(400)
            .json({
                ok: false,
                err
            });
    }

    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Error. Los tipos validos son: ' + tiposValidos.join(', ')
            }
        });
    }

    let archivo = req.files.archivo;
    // se corta el nombre para poder buscar la extension del archico y compararla para ver si es valida o no
    let nombreCortado = archivo.name.split('.'); // corta la cadena despues del .
    let extension = nombreCortado[nombreCortado.length - 1];
    let extensionesValidas = ['jpg', 'png', 'gif', 'jpeg'];


    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Error. Las extensiones permitidas son: ' + extensionesValidas.join(', ')

            }
        });
    }

    let nombreArchivo = `${id}-${new Date().getMilliseconds() }.${extension}`;

    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };

        if (tipo == 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }


    });

});


function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioDB) => {

        if (err) {
            borrarArchivo('usuarios', nombreArchivo); // como hay un error y la imagen se subio, la borramos
            return res.status(500).json({
                ok: false,
                err: { message: 'Usuario no existe' }
            });
        }

        if (!usuarioDB) {
            borrarArchivo('usuarios', nombreArchivo); // como el usuario no existe y la imagen se subio, la borramos
            return res.status(400).json({
                ok: false,
                err: { message: 'Usuario no existe' }
            });
        }

        borrarArchivo('usuarios', usuarioDB.img); // borramos la imagen que tenia el usuario anteriormente

        usuarioDB.img = nombreArchivo;
        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })
        })

    });
};

function imagenProducto(id, res, nombreArchivo) {
    Producto.findById(id, (err, productoDB) => {

        if (err) {
            borrarArchivo('productos', nombreArchivo); // como hay un error y la imagen se subio, la borramos
            return res.status(500).json({
                ok: false,
                err: { message: 'Producto no existe' }
            });
        }

        if (!productoDB) {
            borrarArchivo('productos', nombreArchivo); // como el usuario no existe y la imagen se subio, la borramos
            return res.status(400).json({
                ok: false,
                err: { message: 'Producto no existe' }
            });
        }

        borrarArchivo('productos', productoDB.img); // borramos la imagen que tenia el usuario anteriormente

        productoDB.img = nombreArchivo;
        productoDB.save((err, productoGuardado) => {
            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            })
        })

    });
}

function borrarArchivo(tipo, nombreImagen) {

    // nos istuamos en la carpeta donde esta el archivo si existe lo borramos si no existe no hacemos nada.
    let pathArchivo = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    if (fs.existsSync(pathArchivo)) {
        fs.unlinkSync(pathArchivo);
    }
}
module.exports = app;