var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

// Rutas
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de colección
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no válido',
            errors: { message: 'Tipo de colección no válido' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó nada',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Sólo aceptamos estas extensiones
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover el archivo del temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);
    })
});


function subirPorTipo(tipo, id, nombreArchivo, res) {

    switch (tipo) {
        case 'usuarios':
            {
                Usuario.findById(id, (err, usuario) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al buscar usuario',
                            errors: err
                        });
                    }

                    if (!usuario) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'El usuario no existe',
                            errors: { message: 'Usuario no existe' }
                        })
                    }

                    var pathViejo = './uploads/usuarios/' + usuario.img;
                    if (fs.existsSync(pathViejo)) {
                        fs.unlink(pathViejo, (err) => {
                            if (err) {
                                return res.status(500).json({
                                    ok: false,
                                    mensaje: 'Error al borrar archivo',
                                    errors: err
                                });
                            }
                        })
                    }

                    usuario.img = nombreArchivo;
                    usuario.save((err, usuarioActualizado) => {
                        usuarioActualizado.password = ':)';
                        return res.status(200).json({
                            ok: true,
                            mensaje: 'Imagen de usuario actualizada correctamente',
                            usuario: usuarioActualizado
                        });
                    })
                });
                break;
            }

        case 'medicos':
            {
                Medico.findById(id, (err, medico) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al buscar médico',
                            errors: err
                        });
                    }

                    if (!medico) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'El médico no existe',
                            errors: { message: 'Médico no existe' }
                        })
                    }

                    var pathViejo = './uploads/medicos/' + medico.img;
                    if (fs.existsSync(pathViejo)) {
                        fs.unlink(pathViejo, (err) => {
                            if (err) {
                                return res.status(500).json({
                                    ok: false,
                                    mensaje: 'Error al borrar archivo',
                                    errors: err
                                });
                            }
                        })
                    }

                    medico.img = nombreArchivo;
                    medico.save((err, medicoActualizado) => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error al modificar médico',
                                error: err
                            })
                        }

                        medicoActualizado.password = ':)';
                        return res.status(200).json({
                            ok: true,
                            mensaje: 'Imagen de médico actualizada correctamente',
                            medico: medicoActualizado
                        })
                    });

                })
                break;
            }

        case 'hospitales':
            {
                Hospital.findById(id, (err, hospital) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al buscar hosptal',
                            error: err
                        })
                    }

                    if (!hospital) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'El hospital no existe',
                            errors: { message: 'Hospital no existe' }
                        })
                    }

                    var pathViejo = './uploads/hospitales/' + hospital.img;
                    if (fs.existsSync(pathViejo)) {
                        fs.unlink(pathViejo, (err) => {
                            if (err) {
                                return res.status(500).json({
                                    ok: false,
                                    mensaje: 'Error al borrar archivo',
                                    error: err
                                })
                            }
                        })
                    }

                    hospital.img = nombreArchivo;
                    hospital.save((err, hospitalActualizado) => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error al actualizar hospital',
                                error: err
                            })
                        }

                        return res.status(200).json({
                            ok: true,
                            mensaje: 'Imagen de hospital actualizada correctamente',
                            hospital: hospitalActualizado
                        })
                    })
                })
                break;
            }
    }
}


module.exports = app;