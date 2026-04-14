import { useState } from 'react';

function App() {
  const [cep, setCep] = useState('');
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  async function validar() {
    setLoading(true);
    setErro(null);
    setResultado(null);

    try {
      const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API}/api/validate?cep=${cep}`);
      const data = await res.json();
      setResultado(data);
    } catch (e) {
      setErro('Erro ao conectar com a API.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '60px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <h1>Validador de Entrega</h1>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Digite o CEP"
          value={cep}
          onChange={e => setCep(e.target.value)}
          style={{ flex: 1, padding: '10px', fontSize: 16, borderRadius: 6, border: '1px solid #ccc' }}
        />
        <button
          onClick={validar}
          style={{ padding: '10px 20px', fontSize: 16, borderRadius: 6, background: '#0070f3', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          Validar
        </button>
      </div>

      {loading && <p>Consultando...</p>}
      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      {resultado && (
        <div style={{ background: resultado.success ? '#e6f4ea' : '#fdecea', padding: 20, borderRadius: 8 }}>
          <h2>{resultado.success ? '✅ Entrega disponível' : '❌ Entrega indisponível'}</h2>
          <p><strong>Região:</strong> {resultado.region}</p>
          {resultado.freight && <p><strong>Frete:</strong> {resultado.freight}</p>}
          {resultado.message && <p><strong>Motivo:</strong> {resultado.message}</p>}

          {resultado.available_slots?.length > 0 && (
            <div>
              <h3>Janelas disponíveis</h3>
              {resultado.available_slots.map(slot => (
                <div key={slot.id} style={{ background: '#fff', padding: 10, borderRadius: 6, marginBottom: 8 }}>
                  <strong>Dia {slot.weekday}</strong> — {slot.start_time} às {slot.end_time}
                  <span style={{ marginLeft: 10, color: '#666' }}>
                    ({slot.capacity_max - slot.current_bookings} vagas)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;