const pool = require('./db');

async function setup() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS cep_ranges (
            id SERIAL PRIMARY KEY,
            region_id VARCHAR(50) UNIQUE NOT NULL,
            region_name VARCHAR(100) NOT NULL,
            cep_start VARCHAR(8) NOT NULL,
            cep_end VARCHAR(8) NOT NULL,
            freight_value DECIMAL(10,2) NOT NULL,
            status VARCHAR(20) DEFAULT 'active',
            delivery_profile VARCHAR(100)
        );

        CREATE TABLE IF NOT EXISTS blocked_locations (
            id SERIAL PRIMARY KEY,
            type VARCHAR(10) NOT NULL,
            value VARCHAR(50) NOT NULL,
            reason TEXT
        );

        CREATE TABLE IF NOT EXISTS region_rules (
            id SERIAL PRIMARY KEY,
            region_id VARCHAR(50) NOT NULL,
            allowed_weekdays INTEGER[] NOT NULL
        );

        CREATE TABLE IF NOT EXISTS slots (
            id VARCHAR(20) PRIMARY KEY,
            weekday INTEGER NOT NULL,
            start_time VARCHAR(5) NOT NULL,
            end_time VARCHAR(5) NOT NULL,
            capacity_max INTEGER NOT NULL,
            current_bookings INTEGER DEFAULT 0,
            active BOOLEAN DEFAULT true
        );
    `);

    await pool.query(`
        INSERT INTO cep_ranges (region_id, region_name, cep_start, cep_end, freight_value, status, delivery_profile)
        VALUES
            ('bairro_a', 'Bairro A', '01000000', '01009999', 12.50, 'active', 'Entrega agendada'),
            ('bairro_b', 'Bairro B', '02000000', '02009999', 8.00, 'active', 'Entrega padrão'),
            ('bairro_c', 'Bairro C', '03000000', '03009999', 15.00, 'paused', 'Região restrita')
        ON CONFLICT (region_id) DO NOTHING;

        INSERT INTO blocked_locations (type, value, reason)
        VALUES
            ('CEP', '01005000', 'CEP temporariamente indisponível.'),
            ('REGION', 'bairro_c', 'Região temporariamente suspensa.')
        ON CONFLICT DO NOTHING;

        INSERT INTO region_rules (region_id, allowed_weekdays)
        VALUES
            ('bairro_a', '{0,2}'),
            ('bairro_b', '{0,1,2,3,4}'),
            ('bairro_c', '{1,3,5}')
        ON CONFLICT DO NOTHING;

        INSERT INTO slots (id, weekday, start_time, end_time, capacity_max, current_bookings, active)
        VALUES
            ('slot_1', 0, '08:00', '12:00', 10, 4, true),
            ('slot_2', 2, '14:00', '18:00', 5, 5, true),
            ('slot_3', 4, '09:00', '13:00', 8, 2, true),
            ('slot_4', 1, '10:00', '14:00', 6, 1, true),
            ('slot_5', 5, '08:00', '11:00', 4, 0, true),
            ('slot_6', 3, '13:00', '18:00', 7, 7, true)
        ON CONFLICT DO NOTHING;
    `);

    console.log('Banco configurado com sucesso.');
    process.exit(0);
}

setup().catch(err => {
    console.error('Erro:', err);
    process.exit(1);
});