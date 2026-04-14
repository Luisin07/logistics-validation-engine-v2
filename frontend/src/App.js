import { useState } from 'react';

const WEEKDAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

function maskCep(value) {
  return value.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
}

function SlotCard({ slot, available }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 16px',
      background: available ? '#f0fdf4' : '#fef2f2',
      border: `1px solid ${available ? '#bbf7d0' : '#fecaca'}`,
      borderRadius: 10, marginBottom: 8
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: available ? '#22c55e' : '#ef4444'
        }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>{WEEKDAYS[slot.weekday]}</div>
          <div style={{ fontSize: 13, color: '#666' }}>{slot.start_time} – {slot.end_time}</div>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        {available
          ? <span style={{ fontSize: 13, fontWeight: 600, color: '#16a34a' }}>{slot.capacity_max - slot.current_bookings} vagas</span>
          : <span style={{ fontSize: 12, color: '#dc2626', maxWidth: 140, display: 'block', textAlign: 'right' }}>{slot.reason}</span>
        }
      </div>
    </div>
  );
}

function App() {
  const [cep, setCep] = useState('');
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  async function validar() {
    const raw = cep.replace(/\D/g, '');
    if (raw.length !== 8) { setErro('Digite um CEP válido com 8 dígitos.'); return; }
    setLoading(true); setErro(null); setResultado(null);
    try {
      const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API}/api/validate?cep=${raw}`);
      setResultado(await res.json());
    } catch { setErro('Erro ao conectar com a API.'); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 580 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🚚</div>
          <h1 style={{ margin: 0, color: '#fff', fontSize: 26, fontWeight: 700 }}>Validador de Entrega</h1>
          <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Consulte a disponibilidade pelo CEP</p>
        </div>

        {/* Input card */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              placeholder="00000-000"
              value={cep}
              onChange={e => setCep(maskCep(e.target.value))}
              onKeyDown={e => e.key === 'Enter' && validar()}
              style={{ flex: 1, padding: '14px 16px', fontSize: 16, borderRadius: 10, border: '2px solid #e5e7eb', outline: 'none', transition: 'border 0.2s' }}
            />
            <button
              onClick={validar}
              disabled={loading}
              style={{ padding: '14px 28px', fontSize: 15, fontWeight: 700, borderRadius: 10, background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
            >
              {loading ? '...' : 'Verificar'}
            </button>
          </div>
          {erro && <p style={{ margin: '10px 0 0', color: '#dc2626', fontSize: 13 }}>{erro}</p>}
        </div>

        {/* Resultado */}
        {resultado && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>

            {/* Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: resultado.success ? '#f0fdf4' : '#fef2f2', border: `1.5px solid ${resultado.success ? '#bbf7d0' : '#fecaca'}`, borderRadius: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 22 }}>{resultado.success ? '✅' : '❌'}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: resultado.success ? '#15803d' : '#dc2626' }}>
                  {resultado.success ? 'Entrega disponível' : 'Entrega indisponível'}
                </div>
                <div style={{ fontSize: 13, color: '#666' }}>{resultado.message}</div>
              </div>
            </div>

            {/* Região e Frete */}
            {resultado.region && (
              <div style={{ display: 'grid', gridTemplateColumns: resultado.freight ? '1fr 1fr' : '1fr', gap: 12, marginBottom: 20 }}>
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Região</div>
                  <div style={{ fontWeight: 700, color: '#111' }}>{resultado.region}</div>
                </div>
                {resultado.freight && (
                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Frete</div>
                    <div style={{ fontWeight: 700, color: '#111' }}>{resultado.freight}</div>
                  </div>
                )}
              </div>
            )}

            {/* Slots disponíveis */}
            {resultado.available_slots?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                  Janelas disponíveis ({resultado.available_slots.length})
                </div>
                {resultado.available_slots.map(slot => <SlotCard key={slot.id} slot={slot} available={true} />)}
              </div>
            )}

            {/* Slots indisponíveis */}
            {resultado.unavailable_slots?.length > 0 && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                  Janelas indisponíveis ({resultado.unavailable_slots.length})
                </div>
                {resultado.unavailable_slots.map(slot => <SlotCard key={slot.id} slot={slot} available={false} />)}
              </div>
            )}
          </div>
        )}

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 16 }}>
          Luis Santini · logistics-validation-engine-v2
        </p>
      </div>
    </div>
  );
}

export default App;