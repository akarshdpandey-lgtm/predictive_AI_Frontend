import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function AlertSystem({ userId }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/assessment/all/${userId}`);
      if (res.data.assessments) {
        setAssessments(res.data.assessments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setAssessments([]);
      setLoading(false);
      return;
    }
    fetchData();
  }, [userId, fetchData]);

  // Active alerts (SAM/MAM wale)
  const activeAlerts = assessments.filter(a => a.severity === 'SAM' || a.severity === 'MAM');
  const latestSeverity = assessments.length > 0 ? assessments[0].severity : 'UNKNOWN';

  const getSeverityColor = (s) => {
    if (s === 'SAM') return '#dc3545';
    if (s === 'MAM') return '#fd7e14';
    return '#28a745';
  };

  // Emergency contacts
  const emergencyContacts = [
    { name: '🚑 Ambulance', number: '102' },
    { name: '📞 Child Helpline', number: '1098' },
    { name: '🏥 Health Helpline', number: '104' },
    { name: '📱 ICDS Helpline', number: '1800-345-6789' },
    { name: '🆘 Emergency', number: '112' },
  ];

  if (loading) return <div className="alert-system"><h2>🚨 Alert System</h2><p>⏳ Loading...</p></div>;

  return (
    <div className="alert-system" style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2>🚨 Alert System</h2>

      {/* Current Status */}
      <div style={{
        background: latestSeverity === 'SAM' ? '#f8d7da' : latestSeverity === 'MAM' ? '#fff3cd' : '#d4edda',
        padding: '25px', borderRadius: '12px', marginBottom: '20px',
        border: `3px solid ${getSeverityColor(latestSeverity)}`,
        textAlign: 'center'
      }}>
        <h3>📊 वर्तमान स्थिति</h3>
        <div style={{
          display: 'inline-block', padding: '12px 30px',
          borderRadius: '25px', backgroundColor: getSeverityColor(latestSeverity),
          color: 'white', fontSize: '22px', fontWeight: 'bold', margin: '10px 0'
        }}>
          {latestSeverity === 'SAM' && '🔴 SAM - गंभीर कुपोषण'}
          {latestSeverity === 'MAM' && '🟠 MAM - मध्यम कुपोषण'}
          {latestSeverity === 'NORMAL' && '🟢 NORMAL - सामान्य'}
          {latestSeverity === 'UNKNOWN' && '❓ कोई डेटा नहीं'}
        </div>

        {latestSeverity === 'NORMAL' ? (
          <p style={{ fontSize: '16px', color: '#28a745', marginTop: '10px' }}>
            ✅ सभी अलर्ट बंद हैं - बच्चा स्वस्थ है!
          </p>
        ) : latestSeverity !== 'UNKNOWN' ? (
          <p style={{ fontSize: '16px', color: getSeverityColor(latestSeverity), marginTop: '10px', fontWeight: 'bold' }}>
            ⚠️ अलर्ट सक्रिय है - {latestSeverity === 'SAM' ? 'तुरंत अस्पताल जाएं!' : 'पोषण में सुधार करें!'}
          </p>
        ) : null}
      </div>

      {/* Active Alerts Timeline */}
      {activeAlerts.length > 0 && (
        <div style={{
          background: '#fff', padding: '20px',
          borderRadius: '12px', marginBottom: '20px',
          border: '1px solid #ddd'
        }}>
          <h3>📋 सक्रिय अलर्ट ({activeAlerts.length})</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            ⚠️ जब तक Normal नहीं आता, अलर्ट दिखता रहेगा
          </p>
          {activeAlerts.map((alert, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '15px',
              padding: '12px', borderBottom: '1px solid #eee',
              borderLeft: `4px solid ${getSeverityColor(alert.severity)}`
            }}>
              <span style={{
                background: getSeverityColor(alert.severity),
                color: 'white', padding: '4px 12px',
                borderRadius: '15px', fontSize: '13px'
              }}>
                {alert.severity}
              </span>
              <span>MUAC: {alert.muac} cm</span>
              <span style={{ color: '#666', fontSize: '13px' }}>
                {new Date(alert.date).toLocaleDateString('hi-IN')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Emergency Contacts */}
      <div style={{
        background: '#f8d7da', padding: '20px',
        borderRadius: '12px', marginBottom: '20px',
        border: '2px solid #dc3545'
      }}>
        <h3 style={{ color: '#dc3545' }}>🚨 Emergency Numbers - तुरंत Call करें</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
          {emergencyContacts.map((c, i) => (
            <a key={i} href={`tel:${c.number}`} style={{
              display: 'block', background: 'white', padding: '15px',
              borderRadius: '8px', textAlign: 'center', textDecoration: 'none',
              color: '#333', border: '1px solid #ddd', transition: 'all 0.3s'
            }}>
              <p style={{ fontWeight: 'bold', fontSize: '15px' }}>{c.name}</p>
              <p style={{
                display: 'inline-block', marginTop: '8px',
                padding: '6px 20px', background: '#dc3545',
                color: 'white', borderRadius: '20px', fontSize: '18px', fontWeight: 'bold'
              }}>📞 {c.number}</p>
            </a>
          ))}
        </div>
      </div>

      {/* SMS/WhatsApp Alert Info */}
      <div style={{
        background: '#e7f3ff', padding: '20px',
        borderRadius: '12px', marginBottom: '20px',
        border: '2px solid #007bff'
      }}>
        <h3>📱 SMS/WhatsApp Alert</h3>
        <p style={{ marginTop: '10px' }}>
          {latestSeverity === 'SAM' && '🔴 गंभीर कुपोषण का संदेश भेजा जाएगा:'}
          {latestSeverity === 'MAM' && '🟠 मध्यम कुपोषण का संदेश भेजा जाएगा:'}
          {latestSeverity === 'NORMAL' && '🟢 कोई अलर्ट नहीं भेजा जाएगा'}
        </p>
        
        {latestSeverity !== 'NORMAL' && latestSeverity !== 'UNKNOWN' && (
          <div style={{
            background: 'white', padding: '15px',
            borderRadius: '8px', marginTop: '15px',
            border: '1px solid #ddd', fontFamily: 'monospace'
          }}>
            <p>📩 <strong>Message Preview:</strong></p>
            <p style={{ marginTop: '10px', lineHeight: '1.8' }}>
              🚨 कुपोषण अलर्ट - {latestSeverity}<br />
              बच्चे को {latestSeverity === 'SAM' ? 'गंभीर' : 'मध्यम'} कुपोषण का खतरा है।<br />
              MUAC: {assessments[0]?.muac} cm<br />
              {latestSeverity === 'SAM' ? 'तुरंत नजदीकी अस्पताल जाएं!' : 'पोषण में सुधार करें।'}<br />
              Helpline: 1098 / 104
            </p>
          </div>
        )}
      </div>

      {/* Alert Rules */}
      <div style={{
        background: '#f8f9fa', padding: '20px',
        borderRadius: '12px', borderLeft: '4px solid #667eea'
      }}>
        <h3>📋 Alert नियम</h3>
        <p style={{ margin: '8px 0' }}>🔴 <strong>SAM:</strong> तुरंत SMS + Dashboard पर red alert</p>
        <p style={{ margin: '8px 0' }}>🟠 <strong>MAM:</strong> Warning SMS + Dashboard पर orange alert</p>
        <p style={{ margin: '8px 0' }}>🟢 <strong>Normal:</strong> सब alerts बंद हो जाएंगे ✅</p>
        <p style={{ margin: '8px 0', fontWeight: 'bold' }}>
          ⚠️ जब तक MUAC normal (&gt;12.5 cm) नहीं आता, alert दिखता रहेगा!
        </p>
      </div>

      <button onClick={fetchData} style={{
        marginTop: '20px', padding: '12px 24px', width: '100%',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: 'white', border: 'none', borderRadius: '8px',
        cursor: 'pointer', fontSize: '16px', fontWeight: '600'
      }}>
        🔄 Refresh Alerts
      </button>
    </div>
  );
}

export default AlertSystem;