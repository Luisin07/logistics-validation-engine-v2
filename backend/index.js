const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const cepRanges = [
    { region_id: 'bairro_a', region_name: 'Bairro A', cep_start: '01000000', cep_end: '01009999', freight_value: 12.50, status: 'active', delivery_profile: 'Entrega agendada' },
    { region_id: 'bairro_b', region_name: 'Bairro B', cep_start: '02000000', cep_end: '02009999', freight_value: 8.00, status: 'active', delivery_profile: 'Entrega padrão' },
    { region_id: 'bairro_c', region_name: 'Bairro C', cep_start: '03000000', cep_end: '03009999', freight_value: 15.00, status: 'paused', delivery_profile: 'Região restrita' },
];

const blockedLocations = [
    { type: 'CEP', value: '01005000', reason: 'CEP temporariamente indisponível.' },
    { type: 'REGION', value: 'bairro_c', reason: 'Região temporariamente suspensa.' },
];

const regionRules = [
    { region_id: 'bairro_a', allowed_weekdays: [0, 2] },
    { region_id: 'bairro_b', allowed_weekdays: [0, 1, 2, 3, 4] },
    { region_id: 'bairro_c', allowed_weekdays: [1, 3, 5] },
];

const slots = [
    { id: 'slot_1', weekday: 0, start_time: '08:00', end_time: '12:00', capacity_max: 10, current_bookings: 4, active: true },
    { id: 'slot_2', weekday: 2, start_time: '14:00', end_time: '18:00', capacity_max: 5, current_bookings: 5, active: true },
    { id: 'slot_3', weekday: 4, start_time: '09:00', end_time: '13:00', capacity_max: 8, current_bookings: 2, active: true },
    { id: 'slot_4', weekday: 1, start_time: '10:00', end_time: '14:00', capacity_max: 6, current_bookings: 1, active: true },
    { id: 'slot_5', weekday: 5, start_time: '08:00', end_time: '11:00', capacity_max: 4, current_bookings: 0, active: true },
    { id: 'slot_6', weekday: 3, start_time: '13:00', end_time: '18:00', capacity_max: 7, current_bookings: 7, active: true },
];

const LEAD_TIME_HOURS = 18;

function normalizeCep(cep) {
    return cep.replace(/\D/g, '').padStart(8, '0');
}

function findRegion(cep) {
    const num = parseInt(normalizeCep(cep));
    return cepRanges.find(r => num >= parseInt(r.cep_start) && num <= parseInt(r.cep_end)) || null;
}

function getBlockedReason(cep, regionId) {
    const normalized = normalizeCep(cep);
    const blocked = blockedLocations.find(b =>
        (b.type === 'CEP' && b.value === normalized) ||
        (b.type === 'REGION' && b.value === regionId)
    );
    return blocked ? blocked.reason : null;
}

function evaluateSlots(regionId) {
    const rule = regionRules.find(r => r.region_id === regionId);
    if (!rule) return { valid: [], invalid: [] };

    const valid = [];
    const invalid = [];

    slots.forEach(slot => {
        if (!slot.active) return invalid.push({ ...slot, reason: 'Slot inativo' });
        if (!rule.allowed_weekdays.includes(slot.weekday)) return invalid.push({ ...slot, reason: 'Dia não permitido para a região' });
        if (slot.current_bookings >= slot.capacity_max) return invalid.push({ ...slot, reason: 'Sem capacidade disponível' });
        valid.push(slot);
    });

    return { valid, invalid };
}

app.get('/api/validate', (req, res) => {
    const { cep } = req.query;

    if (!cep || normalizeCep(cep).length !== 8) {
        return res.status(400).json({ success: false, message: 'CEP inválido.' });
    }

    const region = findRegion(cep);
    if (!region) {
        return res.status(404).json({ success: false, message: 'CEP não atendido.' });
    }

    const blockedReason = getBlockedReason(cep, region.region_id);
    if (blockedReason) {
        return res.status(200).json({ success: false, message: blockedReason, region: region.region_name });
    }

    const { valid, invalid } = evaluateSlots(region.region_id);

    if (valid.length === 0) {
        return res.status(200).json({ success: false, message: 'Sem janelas elegíveis.', region: region.region_name });
    }

    return res.status(200).json({
        success: true,
        message: 'Entrega disponível.',
        region: region.region_name,
        freight: `R$ ${region.freight_value.toFixed(2).replace('.', ',')}`,
        available_slots: valid,
        unavailable_slots: invalid,
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});