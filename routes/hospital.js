var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

// ===============================
// Obtener todos los hospitales
// ===============================
app.get('/', (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospitales',
                    errors: err
                })
            }

            Hospital.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: conteo
                })
            })
        });
})

// ===============================
// Actualizar hospital
// ===============================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return req.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return req.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con este ID' }
            });
        }

        hospital.nombre = body.nombre;
        // hospital.img = body.img;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalModificado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al modificar hospital',
                    errors: err
                })
            }

            res.status(201).json({
                ok: true,
                hospital: hospitalModificado
                    // usuariotoken: req.usuario
            })
        })

    });
})

// ===============================
// Crear un nuevo hospital
// ===============================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        // img: "",
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            })
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
                // usuariotoken: req.usuario
        })
    });


});

// ===============================
// Borrar un hospital por el id
// ===============================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            })
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con este id no existe',
                errors: { message: 'El hospital con este id no existe' }
            })
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
                // usuariotoken: req.usuario
        })
    })
})


module.exports = app;