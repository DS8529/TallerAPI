import express from 'express';
import { read, write } from './src/utils/files.js';
import Joi from 'joi';
import fs from 'fs';

const app = express();
app.use(express.json());

const impresoraSchema = Joi.object({
    nombre: Joi.string().min(3).max(50).required(),
    modelo: Joi.string().min(3).max(50).required(),
    tipo: Joi.string().valid('laser', 'inkjet', 'matricial').required(),
    disponible: Joi.boolean().required(),
});

const validateImpresora = (data) => {
    const { error } = impresoraSchema.validate(data);
    if (error) {
        throw new Error(error.details[0].message);
    }
};

// GET
app.get('/impresoras', (req, res) => {
    const impresoras = read();
    console.log('impresoras', impresoras);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(impresoras));
});

// GET
app.get('/impresoras/:id', (req, res) => {
    const impresoras = read();
    const impresora = impresoras.find(impresora => impresora.id === parseInt(req.params.id));
    if (impresora) {
        res.json(impresora);
    } else {
        res.status(404).end();
    }
});

// POST
app.post('/impresoras', (req, res) => {
    try {
        validateImpresora(req.body); // Validación
        const impresoras = read();
        const impresora = {
            ...req.body,
            id: impresoras.length + 1,
        };
        impresoras.push(impresora);
        write(impresoras);
        res.status(201).json(impresora);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT
app.put('/impresoras/:id', (req, res) => {
    try {
        validateImpresora(req.body); // Validación
        const impresoras = read();
        let impresora = impresoras.find(impresora => impresora.id === parseInt(req.params.id));
        if (impresora) {
            impresora = {
                ...impresora,
                ...req.body,
            };

            impresoras[impresoras.findIndex(impresora => impresora.id === parseInt(req.params.id))] = impresora;
            write(impresoras);
            res.json(impresora);
        } else {
            res.status(404).end();
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE
app.delete('/impresoras/:id', (req, res) => {
    const impresoras = read();
    const impresora = impresoras.find(impresora => impresora.id === parseInt(req.params.id));
    if (impresora) {
        impresoras.splice(
            impresoras.findIndex(impresora => impresora.id === parseInt(req.params.id)),
            1
        );
        write(impresoras);
        res.json(impresora);
    } else {
        res.status(404).end();
    }
});

app.get("/", (req, res) => {
    res.send("¡Bienvenido al centro de impresoras!");
});

app.listen(4000, () => {
    console.log('Server is running on port 4000');
});
