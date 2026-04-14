const express = require('express');
const router = express.Router();
const { validateCep, normalizeCep } = require('../services/logisticsService');

router.get('/', async (req, res) => {
    const { cep } = req.query;

    if (!cep || normalizeCep(cep).length !== 8) {
        return res.status(400).json({ success: false, message: 'CEP inválido.' });
    }

    try {
        const result = await validateCep(cep);
        return res.status(200).json(result);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
});

module.exports = router;