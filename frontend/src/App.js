import { useState } from 'react';

const WEEKDAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

function maskCep(value) {
  return value.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
}

function Badge({ color, children }) {
  const colors = {
    green: { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
    red: { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' },
    purple: { bg: '#ede9fe', text: '#6d28d9', border: '#c4b5fd' },
  };
  const c = colors[color];
  return (
    <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  );
}

function SlotRow({ slot, available }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderRadius: 12, background: available ? '#f0fdf4' : '#fef2f2', border: `1px solid ${available ? '#bbf7d0' : '#fecaca'}`, marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: available ? '#dcfce7' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
          {available ? '📦' : '🚫'}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{WEEKDAYS[slot.weekday]}</div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{slot.start_time} – {slot.end_time}</div>
        </div>
      </div>
      {available
        ? <Badge color="green">{slot.capacity_max - slot.current_bookings} vagas disponíveis</Badge>
        : <Badge color="red">{slot.reason}</Badge>
      }
    </div>
  );
}

export default function App() {
  const [cep, setCep] = useState('');
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  async function validar() {
    const raw = cep.replace(/\D/g, '');
    if (raw.length !== 8) { setErro('CEP inválido. Digite 8 dígitos.'); return; }
    setLoading(true); setErro(null); setResultado(null);
    try {
      const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API}/api/validate?cep=${raw}`);
      setResultado(await res.json());
    } catch { setErro('Erro ao conectar com a API.'); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)', padding: '0 32px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, backdropFilter: 'blur(10px)' }}>🚚</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#fff', letterSpacing: '-0.3px' }}>LogisticsEngine</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Delivery Validation API</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: '6px 14px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
            <span style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>API Online</span>
          </div>
        </div>

        {/* Hero */}
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 0 56px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: '6px 14px', marginBottom: 20, border: '1px solid rgba(255,255,255,0.15)' }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>⚡ Validação em tempo real</span>
          </div>
          <h1 style={{ margin: '0 0 12px', fontSize: 40, fontWeight: 900, color: '#fff', letterSpacing: '-1px', lineHeight: 1.1 }}>
            Verifique a disponibilidade<br />
            <span style={{ background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              de entrega pelo CEP
            </span>
          </h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: 16, maxWidth: 480 }}>
            Consulte regiões atendidas, janelas de entrega disponíveis e valor do frete em tempo real.
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: '-28px auto 0', padding: '0 24px 48px' }}>

        {/* Search card */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: 28, marginBottom: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>CEP de entrega</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              placeholder="00000-000"
              value={cep}
              onChange={e => setCep(maskCep(e.target.value))}
              onKeyDown={e => e.key === 'Enter' && validar()}
              style={{ flex: 1, padding: '14px 18px', fontSize: 17, borderRadius: 12, border: '2px solid #e2e8f0', outline: 'none', color: '#0f172a', fontWeight: 500, transition: 'border 0.2s' }}
            />
            <button
              onClick={validar}
              disabled={loading}
              style={{ padding: '14px 28px', fontSize: 15, fontWeight: 800, borderRadius: 12, background: loading ? '#e2e8f0' : 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: loading ? '#94a3b8' : '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.3px', boxShadow: loading ? 'none' : '0 4px 14px rgba(79,70,229,0.4)' }}
            >
              {loading ? 'Verificando...' : 'Verificar'}
            </button>
          </div>
          {erro && <p style={{ margin: '10px 0 0', color: '#dc2626', fontSize: 13, fontWeight: 500 }}>⚠ {erro}</p>}
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Testar:</span>
            {['02001-000', '01005-000', '03001-000', '99999-999'].map(c => (
              <span key={c} onClick={() => setCep(c)} style={{ fontSize: 12, color: '#6366f1', fontWeight: 700, cursor: 'pointer', background: '#ede9fe', borderRadius: 6, padding: '3px 8px' }}>{c}</span>
            ))}
          </div>
        </div>

        {/* Result */}
        {resultado && (
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

            {/* Status */}
            <div style={{ padding: '20px 28px', background: resultado.success ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)' : 'linear-gradient(135deg, #fef2f2, #fee2e2)', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: resultado.success ? '#dcfce7' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  {resultado.success ? '✅' : '❌'}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17, color: resultado.success ? '#15803d' : '#b91c1c' }}>
                    {resultado.success ? 'Entrega disponível' : 'Entrega indisponível'}
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{resultado.message}</div>
                </div>
              </div>
              <Badge color={resultado.success ? 'green' : 'red'}>{resultado.success ? '✓ Atendido' : '✗ Bloqueado'}</Badge>
            </div>

            {resultado.region && (
              <div style={{ padding: 28 }}>
                {/* Info */}
                <div style={{ display: 'flex', gap: 14, marginBottom: 28 }}>
                  {[
                    { label: 'Região', value: resultado.region, icon: '📍' },
                    ...(resultado.freight ? [{ label: 'Frete', value: resultado.freight, icon: '💰' }] : []),
                    ...(resultado.available_slots ? [{ label: 'Janelas', value: `${resultado.available_slots.length} disponíveis`, icon: '📅' }] : []),
                  ].map(item => (
                    <div key={item.label} style={{ flex: 1, background: '#f8fafc', borderRadius: 14, padding: '16px 20px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>{item.icon} {item.label}</div>
                      <div style={{ fontWeight: 800, fontSize: 18, color: '#0f172a' }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                {resultado.available_slots?.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>Janelas disponíveis</div>
                      <Badge color="green">{resultado.available_slots.length} disponíveis</Badge>
                    </div>
                    {resultado.available_slots.map(slot => <SlotRow key={slot.id} slot={slot} available={true} />)}
                  </div>
                )}

                {resultado.unavailable_slots?.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>Janelas indisponíveis</div>
                      <Badge color="red">{resultado.unavailable_slots.length} bloqueadas</Badge>
                    </div>
                    {resultado.unavailable_slots.map(slot => <SlotRow key={slot.id} slot={slot} available={false} />)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#cbd5e1' }}>
            Luis Santini · <a href="https://github.com/Luisin07/logistics-validation-engine-v2" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 600 }}>GitHub</a> · Node.js · React · PostgreSQL
          </p>
        </div>
      </div>
    </div>
  );
}