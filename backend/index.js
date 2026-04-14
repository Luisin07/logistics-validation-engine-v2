const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const LEAD_TIME_HOURS = 18;

function normalizeCep(cep) {
    return cep.replace(/\D/g, '').padStart(8, '0');
}

app.get('/api/validate', async (req, res) => {
    const { cep } = req.query;

    if (!cep || normalizeCep(cep).length !== 8) {
        return res.status(400).json({ success: false, message: 'CEP inválido.' });
    }

    const normalized = normalizeCep(cep);

    try {
        // Busca região
        const regionResult = await pool.query(
            `SELECT * FROM cep_ranges WHERE $1::integer BETWEEN cep_start::integer AND cep_end::integer LIMIT 1`,
            [parseInt(normalized)]
        );

        if (regionResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'CEP não atendido.' });
        }

        const region = regionResult.rows[0];

        // Verifica bloqueios
        const blockedResult = await pool.query(
            `SELECT * FROM blocked_locations WHERE (type = 'CEP' AND value = $1) OR (type = 'REGION' AND value = $2) LIMIT 1`,
            [normalized, region.region_id]
        );

        if (blockedResult.rows.length > 0) {
            return res.status(200).json({
                success: false,
                message: blockedResult.rows[0].reason,
                region: region.region_name
            });
        }

        // Busca regras da região
        const ruleResult = await pool.query(
            `SELECT * FROM region_rules WHERE region_id = $1 LIMIT 1`,
            [region.region_id]
        );

        if (ruleResult.rows.length === 0) {
            return res.status(200).json({ success: false, message: 'Região sem regras configuradas.' });
        }

        const allowedWeekdays = ruleResult.rows[0].allowed_weekdays;

        // Busca slots
        const slotsResult = await pool.query(`SELECT * FROM slots`);
        const slots = slotsResult.rows;

        const valid = [];
        const invalid = [];

        slots.forEach(slot => {
            if (!slot.active) return invalid.push({ ...slot, reason: 'Slot inativo' });
            if (!allowedWeekdays.includes(slot.weekday)) return invalid.push({ ...slot, reason: 'Dia não permitido para a região' });
            if (slot.current_bookings >= slot.capacity_max) return invalid.push({ ...slot, reason: 'Sem capacidade disponível' });
            valid.push(slot);
        });

        if (valid.length === 0) {
            return res.status(200).json({ success: false, message: 'Sem janelas elegíveis.', region: region.region_name });
        }

        return res.status(200).json({
            success: true,
            message: 'Entrega disponível.',
            region: region.region_name,
            freight: `R$ ${parseFloat(region.freight_value).toFixed(2).replace('.', ',')}`,
            available_slots: valid,
            unavailable_slots: invalid,
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});