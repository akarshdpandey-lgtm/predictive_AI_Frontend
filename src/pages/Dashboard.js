import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

function Dashboard({ userId }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssessments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/assessment/all/${userId}`);
      if (res.data.assessments && res.data.assessments.length > 0) {
        setAssessments(res.data.assessments);
        setError(null);
      } else {
        setAssessments([]);
        setError('कोई Assessment नहीं मिला');
      }
    } catch (err) {
      setAssessments([]);
      setError('Data fetch नहीं हो पाया');
    } finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { fetchAssessments(); }, [fetchAssessments]);

  const getSeverityColor = (s) => {
    if (s === 'SAM') return '#dc3545';
    if (s === 'MAM') return '#fd7e14';
    return '#28a745';
  };

  const getSeverityLabel = (s) => {
    if (s === 'SAM') return '🔴 SAM - गंभीर कुपोषण';
    if (s === 'MAM') return '🟠 MAM - मध्यम कुपोषण';
    return '🟢 Normal - सामान्य';
  };

  if (loading) return <div className="dashboard"><h2>📈 Dashboard</h2><p>⏳ Loading...</p></div>;

  const latest = assessments.length > 0 ? assessments[0] : null;

  return (
    <div className="dashboard">
      <h2>📈 Dashboard</h2>

      {error && (
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          ❌ {error}
        </div>
      )}

      {latest && (
        <>
          {/* ========== TRAFFIC LIGHT ========== */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '15px',
            margin: '20px 0', padding: '25px',
            background: '#333', borderRadius: '20px'
          }}>
            {/* Red Light */}
            <div style={{
              width: '70px', height: '70px', borderRadius: '50%',
              background: latest.severity === 'SAM' ? '#dc3545' : '#555',
              boxShadow: latest.severity === 'SAM' ? '0 0 20px #dc3545' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '30px', transition: 'all 0.5s'
            }}>
              {latest.severity === 'SAM' ? '🔴' : '⚫'}
            </div>
            {/* Yellow/Orange Light */}
            <div style={{
              width: '70px', height: '70px', borderRadius: '50%',
              background: latest.severity === 'MAM' ? '#fd7e14' : '#555',
              boxShadow: latest.severity === 'MAM' ? '0 0 20px #fd7e14' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '30px', transition: 'all 0.5s'
            }}>
              {latest.severity === 'MAM' ? '🟠' : '⚫'}
            </div>
            {/* Green Light */}
            <div style={{
              width: '70px', height: '70px', borderRadius: '50%',
              background: latest.severity === 'NORMAL' ? '#28a745' : '#555',
              boxShadow: latest.severity === 'NORMAL' ? '0 0 20px #28a745' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '30px', transition: 'all 0.5s'
            }}>
              {latest.severity === 'NORMAL' ? '🟢' : '⚫'}
            </div>
          </div>

          {/* Status Label */}
          <div style={{
            textAlign: 'center', padding: '15px',
            background: getSeverityColor(latest.severity) + '20',
            borderRadius: '12px', marginBottom: '20px',
            border: `2px solid ${getSeverityColor(latest.severity)}`
          }}>
            <p style={{
              fontSize: '22px', fontWeight: 'bold',
              color: getSeverityColor(latest.severity)
            }}>
              {getSeverityLabel(latest.severity)}
            </p>
          </div>

          {/* Z-Score Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            <div style={{
              background: (latest.z_wfa || 0) < -2 ? '#f8d7da' : '#d4edda',
              padding: '15px', borderRadius: '12px', textAlign: 'center'
            }}>
              <p style={{ fontSize: '12px', color: '#666' }}>⚖️ Weight-for-Age</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: (latest.z_wfa || 0) < -2 ? '#dc3545' : '#28a745' }}>
                {(latest.z_wfa || 0).toFixed(2)}
              </p>
              <p style={{ fontSize: '11px' }}>{(latest.z_wfa || 0) < -2 ? 'Underweight' : 'Normal'}</p>
            </div>
            <div style={{
              background: (latest.z_hfa || 0) < -2 ? '#f8d7da' : '#d4edda',
              padding: '15px', borderRadius: '12px', textAlign: 'center'
            }}>
              <p style={{ fontSize: '12px', color: '#666' }}>📏 Height-for-Age</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: (latest.z_hfa || 0) < -2 ? '#dc3545' : '#28a745' }}>
                {(latest.z_hfa || 0).toFixed(2)}
              </p>
              <p style={{ fontSize: '11px' }}>{(latest.z_hfa || 0) < -2 ? 'Stunting' : 'Normal'}</p>
            </div>
            <div style={{
              background: (latest.z_wfh || 0) < -2 ? '#f8d7da' : '#d4edda',
              padding: '15px', borderRadius: '12px', textAlign: 'center'
            }}>
              <p style={{ fontSize: '12px', color: '#666' }}>📉 Weight-for-Height</p>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: (latest.z_wfh || 0) < -2 ? '#dc3545' : '#28a745' }}>
                {(latest.z_wfh || 0).toFixed(2)}
              </p>
              <p style={{ fontSize: '11px' }}>{(latest.z_wfh || 0) < -2 ? 'Wasting' : 'Normal'}</p>
            </div>
          </div>

          {/* Metrics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            {[
              { label: '📏 Height', value: `${latest.height} cm` },
              { label: '⚖️ Weight', value: `${latest.weight} kg` },
              { label: '🔵 MUAC', value: `${latest.muac} cm` },
              { label: '📊 BMI', value: latest.bmi }
            ].map((m, i) => (
              <div key={i} style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                padding: '15px', borderRadius: '12px', textAlign: 'center', color: 'white'
              }}>
                <p style={{ fontSize: '12px', opacity: 0.9 }}>{m.label}</p>
                <p style={{ fontSize: '22px', fontWeight: 'bold' }}>{m.value}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* History Table */}
      {assessments.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <h3>📋 History</h3>
          <table style={{
            width: '100%', borderCollapse: 'collapse',
            background: 'white', borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginTop: '10px'
          }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white' }}>
                <th style={{ padding: '12px' }}>Date</th>
                <th style={{ padding: '12px' }}>Height</th>
                <th style={{ padding: '12px' }}>Weight</th>
                <th style={{ padding: '12px' }}>MUAC</th>
                <th style={{ padding: '12px' }}>Z-WFH</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((a, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #ddd' }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#f5f5f5'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{new Date(a.date).toLocaleDateString('hi-IN')}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{a.height} cm</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{a.weight} kg</td>
                  <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>{a.muac} cm</td>
                  <td style={{ padding: '10px', textAlign: 'center', color: (a.z_wfh || 0) < -2 ? '#dc3545' : '#28a745', fontWeight: 'bold' }}>
                    {(a.z_wfh || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center', color: getSeverityColor(a.severity), fontWeight: 'bold' }}>
                    {getSeverityLabel(a.severity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button onClick={fetchAssessments} style={{
        marginTop: '20px', padding: '12px 24px', width: '100%',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: 'white', border: 'none', borderRadius: '8px',
        cursor: 'pointer', fontSize: '16px', fontWeight: '600'
      }}>🔄 Refresh</button>
    </div>
  );
}

export default Dashboard;