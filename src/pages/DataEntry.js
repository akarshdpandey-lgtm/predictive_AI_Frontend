import React, { useState } from 'react';
import axios from 'axios';

function DataEntry({ userId }) {
  const [step, setStep] = useState(1);
  const [basicData, setBasicData] = useState({
    height: '', weight: '', age_months: '', gender: 'male'
  });
  const [manualMuac, setManualMuac] = useState('');
  const [hardwareMuac, setHardwareMuac] = useState('');
  const [muacMethod, setMuacMethod] = useState('both');
  const [edema, setEdema] = useState('no');
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleBasicChange = (e) => {
    setBasicData({ ...basicData, [e.target.name]: e.target.value });
  };

  const goToStep2 = (e) => { e.preventDefault(); setStep(2); };

  const getMuacAccuracy = () => {
    if (!manualMuac || !hardwareMuac) return null;
    const m = parseFloat(manualMuac), h = parseFloat(hardwareMuac);
    const diff = Math.abs(m - h), avg = (m + h) / 2;
    const pErr = ((diff / avg) * 100).toFixed(1);
    return {
      manual: m, hardware: h, difference: diff.toFixed(1),
      average: avg.toFixed(1), percentError: pErr,
      reliability: diff < 0.5 ? 'HIGH' : diff < 1.0 ? 'MEDIUM' : 'LOW',
      recommendedValue: avg.toFixed(1)
    };
  };

  const getFinalMuac = () => {
    if (muacMethod === 'both' && manualMuac && hardwareMuac)
      return ((parseFloat(manualMuac) + parseFloat(hardwareMuac)) / 2).toFixed(1);
    if (manualMuac) return manualMuac;
    if (hardwareMuac) return hardwareMuac;
    return '0';
  };

  const submitAssessment = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const finalMuac = parseFloat(getFinalMuac());
    const accuracy = getMuacAccuracy();
    try {
      const response = await axios.post('http://localhost:5000/api/assessment/create', {
        user_id: userId, height: parseFloat(basicData.height),
        weight: parseFloat(basicData.weight), muac: finalMuac,
        age_months: parseInt(basicData.age_months), gender: basicData.gender,
        entry_type: muacMethod, edema: edema,
        notes: notes + (accuracy ? ` | Manual:${accuracy.manual} Hardware:${accuracy.hardware} Diff:${accuracy.difference}` : '')
      });
      setResult({ ...response.data, accuracy }); setStep(3);
    } catch (err) { setError(err.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  };

  const getSevColor = (s) => s === 'SAM' ? '#dc3545' : s === 'MAM' ? '#fd7e14' : '#28a745';
  const getSevBg = (s) => s === 'SAM' ? '#f8d7da' : s === 'MAM' ? '#fff3cd' : '#d4edda';

  const resetForm = () => {
    setStep(1); setBasicData({ height: '', weight: '', age_months: '', gender: 'male' });
    setManualMuac(''); setHardwareMuac(''); setNotes(''); setResult(null); setError(null); setEdema('no');
  };

  return (
    <div className="data-entry">
      <h2>📊 Data Entry</h2>

      {/* STEP 1 */}
      {step === 1 && (
        <form onSubmit={goToStep2}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea20, #764ba220)',
            padding: '20px', borderRadius: '12px', marginBottom: '20px',
            border: '2px solid #667eea'
          }}>
            <h3 style={{ color: '#667eea', marginBottom: '15px' }}>
              📋 Step 1: बच्चे की बेसिक जानकारी
            </h3>

            <div className="form-group">
              <label style={{ fontSize: '16px' }}>📏 ऊंचाई (Height in cm):</label>
              <input type="number" name="height" step="0.1"
                value={basicData.height} onChange={handleBasicChange}
                required placeholder="जैसे: 75.5"
                style={{ fontSize: '18px', padding: '14px' }} />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '16px' }}>⚖️ वजन (Weight in kg):</label>
              <input type="number" name="weight" step="0.1"
                value={basicData.weight} onChange={handleBasicChange}
                required placeholder="जैसे: 9.5"
                style={{ fontSize: '18px', padding: '14px' }} />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '16px' }}>🎂 उम्र (Age in months):</label>
              <input type="number" name="age_months"
                value={basicData.age_months} onChange={handleBasicChange}
                required placeholder="जैसे: 18 (महीनों में)"
                style={{ fontSize: '18px', padding: '14px' }} />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '16px' }}>👶 लिंग (Gender):</label>
              <select name="gender" value={basicData.gender} onChange={handleBasicChange}
                style={{ fontSize: '18px', padding: '14px' }}>
                <option value="male">👦 लड़का (Boy)</option>
                <option value="female">👧 लड़की (Girl)</option>
              </select>
            </div>

            {/* Edema */}
            <div className="form-group">
              <label style={{ fontSize: '16px' }}>💧 सूजन (Edema):</label>
              <select value={edema} onChange={(e) => setEdema(e.target.value)}
                style={{ fontSize: '18px', padding: '14px' }}>
                <option value="no">❌ नहीं (No Edema)</option>
                <option value="yes">✅ हाँ (Edema Present)</option>
              </select>
            </div>
          </div>

          <button type="submit" style={{ fontSize: '18px', padding: '15px' }}>
            अगले Step पर जाओ → MUAC दर्ज करो
          </button>
        </form>
      )}

      {/* STEP 2: MUAC */}
      {step === 2 && (
        <form onSubmit={submitAssessment}>

          {/* Summary */}
          <div style={{
            background: '#e7f3ff', padding: '15px', borderRadius: '12px',
            marginBottom: '20px', border: '2px solid #007bff'
          }}>
            <p style={{ fontSize: '16px' }}>
              <strong>📏</strong> {basicData.height} cm |
              <strong> ⚖️</strong> {basicData.weight} kg |
              <strong> 🎂</strong> {basicData.age_months} months |
              <strong> 💧 Edema:</strong> {edema === 'yes' ? '✅ हाँ' : '❌ नहीं'}
            </p>
            <button type="button" onClick={() => setStep(1)} style={{
              marginTop: '8px', padding: '6px 15px', cursor: 'pointer',
              borderRadius: '6px', border: '1px solid #007bff',
              background: 'white', color: '#007bff', fontSize: '14px'
            }}>← वापस जाओ</button>
          </div>

          {/* MUAC METHOD SELECTION - VERY CLEAR UI */}
          <div style={{
            background: '#f0f0ff', padding: '20px', borderRadius: '16px',
            marginBottom: '25px', border: '3px solid #667eea'
          }}>
            <h3 style={{ color: '#667eea', fontSize: '20px', textAlign: 'center', marginBottom: '20px' }}>
              📏 MUAC कैसे माप रहे हो? (Method चुनो)
            </h3>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {/* BOTH */}
              <div onClick={() => setMuacMethod('both')} style={{
                flex: '1', minWidth: '140px', padding: '20px', borderRadius: '16px',
                cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s',
                border: muacMethod === 'both' ? '4px solid #667eea' : '3px solid #ccc',
                background: muacMethod === 'both' ? '#667eea' : 'white',
                color: muacMethod === 'both' ? 'white' : '#333',
                transform: muacMethod === 'both' ? 'scale(1.05)' : 'scale(1)',
                boxShadow: muacMethod === 'both' ? '0 8px 25px rgba(102,126,234,0.4)' : '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <p style={{ fontSize: '36px', marginBottom: '8px' }}>📏🔧</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold' }}>दोनों</p>
                <p style={{ fontSize: '13px', opacity: 0.8 }}>Manual + Hardware</p>
                <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '5px' }}>
                  ✅ सबसे accurate
                </p>
              </div>

              {/* MANUAL */}
              <div onClick={() => setMuacMethod('manual')} style={{
                flex: '1', minWidth: '140px', padding: '20px', borderRadius: '16px',
                cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s',
                border: muacMethod === 'manual' ? '4px solid #ffc107' : '3px solid #ccc',
                background: muacMethod === 'manual' ? '#ffc107' : 'white',
                color: muacMethod === 'manual' ? '#333' : '#333',
                transform: muacMethod === 'manual' ? 'scale(1.05)' : 'scale(1)',
                boxShadow: muacMethod === 'manual' ? '0 8px 25px rgba(255,193,7,0.4)' : '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <p style={{ fontSize: '36px', marginBottom: '8px' }}>📏</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Manual Tape</p>
                <p style={{ fontSize: '13px', opacity: 0.8 }}>हाथ से Tape से</p>
              </div>

              {/* HARDWARE */}
              <div onClick={() => setMuacMethod('hardware')} style={{
                flex: '1', minWidth: '140px', padding: '20px', borderRadius: '16px',
                cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s',
                border: muacMethod === 'hardware' ? '4px solid #28a745' : '3px solid #ccc',
                background: muacMethod === 'hardware' ? '#28a745' : 'white',
                color: muacMethod === 'hardware' ? 'white' : '#333',
                transform: muacMethod === 'hardware' ? 'scale(1.05)' : 'scale(1)',
                boxShadow: muacMethod === 'hardware' ? '0 8px 25px rgba(40,167,69,0.4)' : '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <p style={{ fontSize: '36px', marginBottom: '8px' }}>🔧</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Hardware</p>
                <p style={{ fontSize: '13px', opacity: 0.8 }}>Digital Device से</p>
              </div>
            </div>
          </div>

          {/* MANUAL MUAC INPUT - YELLOW THEME */}
          {(muacMethod === 'both' || muacMethod === 'manual') && (
            <div style={{
              background: 'linear-gradient(135deg, #fff8e1, #fff3cd)',
              padding: '25px', borderRadius: '16px', marginBottom: '20px',
              border: '3px solid #ffc107',
              boxShadow: '0 4px 15px rgba(255,193,7,0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <span style={{
                  background: '#ffc107', color: '#333', padding: '8px 16px',
                  borderRadius: '20px', fontSize: '18px', fontWeight: 'bold'
                }}>📏 MANUAL TAPE</span>
                <span style={{ fontSize: '14px', color: '#856404' }}>- हाथ से Tape से मापें</span>
              </div>

              <input type="number" step="0.1" value={manualMuac}
                onChange={(e) => setManualMuac(e.target.value)}
                required={muacMethod !== 'hardware'}
                placeholder="Manual MUAC दर्ज करो (cm में)"
                style={{
                  width: '100%', padding: '18px', fontSize: '22px',
                  border: '3px solid #ffc107', borderRadius: '12px',
                  background: 'white', fontWeight: 'bold', textAlign: 'center',
                  color: '#333'
                }} />

              <div style={{
                background: '#fff', padding: '15px', borderRadius: '10px',
                marginTop: '15px', border: '1px solid #ffc107'
              }}>
                <p style={{ fontWeight: 'bold', color: '#856404', marginBottom: '8px' }}>📋 सही तरीका:</p>
                <p style={{ fontSize: '14px', color: '#666' }}>1️⃣ बायाँ बाजू 90° पर मोड़ो</p>
                <p style={{ fontSize: '14px', color: '#666' }}>2️⃣ कंधे-कोहनी के बीच मध्य बिंदु खोजो</p>
                <p style={{ fontSize: '14px', color: '#666' }}>3️⃣ Tape को बिना कसे आराम से लपेटो</p>
                <p style={{ fontSize: '14px', color: '#666' }}>4️⃣ निकटतम 0.1 cm तक मापो</p>
              </div>
            </div>
          )}

          {/* HARDWARE MUAC INPUT - GREEN THEME */}
          {(muacMethod === 'both' || muacMethod === 'hardware') && (
            <div style={{
              background: 'linear-gradient(135deg, #e8f5e9, #d4edda)',
              padding: '25px', borderRadius: '16px', marginBottom: '20px',
              border: '3px solid #28a745',
              boxShadow: '0 4px 15px rgba(40,167,69,0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <span style={{
                  background: '#28a745', color: 'white', padding: '8px 16px',
                  borderRadius: '20px', fontSize: '18px', fontWeight: 'bold'
                }}>🔧 HARDWARE DEVICE</span>
                <span style={{ fontSize: '14px', color: '#155724' }}>- Digital Device से मापें</span>
              </div>

              <input type="number" step="0.1" value={hardwareMuac}
                onChange={(e) => setHardwareMuac(e.target.value)}
                required={muacMethod !== 'manual'}
                placeholder="Hardware MUAC दर्ज करो (cm में)"
                style={{
                  width: '100%', padding: '18px', fontSize: '22px',
                  border: '3px solid #28a745', borderRadius: '12px',
                  background: 'white', fontWeight: 'bold', textAlign: 'center',
                  color: '#333'
                }} />

              <p style={{ marginTop: '10px', fontSize: '14px', color: '#155724' }}>
                🔧 Digital MUAC Tape / Smart Scale / Caliper से reading डालो
              </p>
            </div>
          )}

          {/* ACCURACY COMPARISON - PURPLE THEME */}
          {muacMethod === 'both' && manualMuac && hardwareMuac && (() => {
            const acc = getMuacAccuracy();
            if (!acc) return null;
            return (
              <div style={{
                background: 'linear-gradient(135deg, #f3e5f5, #e8eaf6)',
                padding: '25px', borderRadius: '16px', marginBottom: '20px',
                border: '3px solid #667eea',
                boxShadow: '0 4px 15px rgba(102,126,234,0.2)'
              }}>
                <h4 style={{ color: '#667eea', fontSize: '18px', textAlign: 'center', marginBottom: '15px' }}>
                  🔍 ACCURACY COMPARISON - दोनों की तुलना
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '15px' }}>
                  <div style={{
                    background: '#ffc107', padding: '15px', borderRadius: '12px',
                    textAlign: 'center', color: '#333'
                  }}>
                    <p style={{ fontSize: '13px', fontWeight: 'bold' }}>📏 MANUAL</p>
                    <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{acc.manual} cm</p>
                  </div>
                  <div style={{
                    background: '#28a745', padding: '15px', borderRadius: '12px',
                    textAlign: 'center', color: 'white'
                  }}>
                    <p style={{ fontSize: '13px', fontWeight: 'bold' }}>🔧 HARDWARE</p>
                    <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{acc.hardware} cm</p>
                  </div>
                  <div style={{
                    background: '#667eea', padding: '15px', borderRadius: '12px',
                    textAlign: 'center', color: 'white'
                  }}>
                    <p style={{ fontSize: '13px', fontWeight: 'bold' }}>📊 AVERAGE</p>
                    <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{acc.average} cm</p>
                  </div>
                </div>

                <div style={{
                  background: 'white', padding: '15px', borderRadius: '10px',
                  display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center'
                }}>
                  <div>
                    <p style={{ fontSize: '12px', color: '#666' }}>📐 अंतर</p>
                    <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{acc.difference} cm</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#666' }}>📊 Error</p>
                    <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{acc.percentError}%</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#666' }}>✅ विश्वसनीयता</p>
                    <p style={{
                      fontSize: '18px', fontWeight: 'bold',
                      color: acc.reliability === 'HIGH' ? '#28a745' :
                             acc.reliability === 'MEDIUM' ? '#fd7e14' : '#dc3545'
                    }}>
                      {acc.reliability === 'HIGH' ? '🟢 HIGH' :
                       acc.reliability === 'MEDIUM' ? '🟡 MEDIUM' : '🔴 LOW'}
                    </p>
                  </div>
                </div>

                {acc.reliability === 'LOW' && (
                  <p style={{
                    color: '#dc3545', fontWeight: 'bold', marginTop: '12px',
                    textAlign: 'center', fontSize: '16px',
                    background: '#f8d7da', padding: '10px', borderRadius: '8px'
                  }}>
                    ⚠️ दोनों में बहुत अंतर है! कृपया दोबारा मापें!
                  </p>
                )}
              </div>
            );
          })()}

          <div className="form-group">
            <label style={{ fontSize: '16px' }}>📝 Notes (optional):</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="कोई नोट्स..." rows="2"
              style={{ fontSize: '16px', padding: '12px' }} />
          </div>

          {error && <p className="error">❌ {error}</p>}

          <button type="submit" disabled={loading} style={{ fontSize: '18px', padding: '15px' }}>
            {loading ? '⏳ Processing...' : '✅ Assessment Submit करो'}
          </button>
        </form>
      )}

      {/* STEP 3: RESULT */}
      {step === 3 && result && (
        <div style={{
          background: getSevBg(result.severity), padding: '25px',
          borderRadius: '16px', textAlign: 'center',
          border: `4px solid ${getSevColor(result.severity)}`
        }}>
          <h3>✅ Assessment Complete!</h3>

          <div style={{
            display: 'inline-block', padding: '15px 40px', borderRadius: '30px',
            backgroundColor: getSevColor(result.severity), color: 'white',
            fontSize: '24px', fontWeight: 'bold', margin: '15px 0',
            boxShadow: `0 6px 20px ${getSevColor(result.severity)}60`
          }}>
            {result.severity === 'SAM' && '🔴 SAM - गंभीर कुपोषण'}
            {result.severity === 'MAM' && '🟠 MAM - मध्यम कुपोषण'}
            {result.severity === 'NORMAL' && '🟢 NORMAL - सामान्य'}
          </div>

          {/* Metrics */}
          <div style={{
            background: 'white', padding: '20px', borderRadius: '12px',
            margin: '15px 0', textAlign: 'left'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <p><strong>📏 Height:</strong> {basicData.height} cm</p>
              <p><strong>⚖️ Weight:</strong> {basicData.weight} kg</p>
              <p><strong>🔵 MUAC:</strong> {getFinalMuac()} cm</p>
              <p><strong>📊 BMI:</strong> {result.bmi}</p>
              <p><strong>📐 W/H Ratio:</strong> {result.wh_ratio}%</p>
              <p><strong>💧 Edema:</strong> {edema === 'yes' ? '✅ हाँ' : '❌ नहीं'}</p>
            </div>
          </div>

          {/* Z-Scores */}
          {result.z_scores && (
            <div style={{
              background: 'white', padding: '15px', borderRadius: '12px',
              margin: '15px 0'
            }}>
              <h4>📊 WHO Z-Scores</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '10px' }}>
                {[
                  { label: 'Weight-for-Age', val: result.z_scores.wfa },
                  { label: 'Height-for-Age', val: result.z_scores.hfa },
                  { label: 'Weight-for-Height', val: result.z_scores.wfh }
                ].map((z, i) => (
                  <div key={i} style={{
                    background: z.val < -2 ? '#f8d7da' : '#d4edda',
                    padding: '12px', borderRadius: '10px', textAlign: 'center'
                  }}>
                    <p style={{ fontSize: '11px', color: '#666' }}>{z.label}</p>
                    <p style={{ fontSize: '22px', fontWeight: 'bold', color: z.val < -2 ? '#dc3545' : '#28a745' }}>
                      {z.val?.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conditions */}
          {result.conditions && result.conditions.length > 0 && (
            <div style={{
              background: '#f8d7da', padding: '15px', borderRadius: '12px',
              margin: '15px 0', textAlign: 'left', border: '2px solid #dc3545'
            }}>
              <h4 style={{ color: '#dc3545' }}>⚠️ पाए गए लक्षण:</h4>
              {result.conditions.map((c, i) => (
                <p key={i} style={{ margin: '5px 0', fontSize: '15px' }}>{c}</p>
              ))}
            </div>
          )}

          {/* Advice */}
          <div style={{
            background: 'white', padding: '15px', borderRadius: '12px',
            margin: '15px 0', textAlign: 'left',
            borderLeft: `5px solid ${getSevColor(result.severity)}`
          }}>
            <p><strong>📋 स्थिति:</strong> {result.severity_hindi}</p>
            <p><strong>💡 सलाह:</strong> {result.advice}</p>
          </div>

          {/* Accuracy */}
          {result.accuracy && (
            <div style={{
              background: 'white', padding: '15px', borderRadius: '12px',
              margin: '15px 0', textAlign: 'left', borderLeft: '5px solid #667eea'
            }}>
              <h4>🔍 MUAC Accuracy</h4>
              <p>📏 Manual: {result.accuracy.manual} cm | 🔧 Hardware: {result.accuracy.hardware} cm</p>
              <p>📐 अंतर: {result.accuracy.difference} cm | विश्वसनीयता: <strong>{result.accuracy.reliability}</strong></p>
            </div>
          )}

          <button onClick={resetForm} style={{ fontSize: '18px', padding: '15px' }}>
            🔄 नया Assessment करो
          </button>
        </div>
      )}
    </div>
  );
}

export default DataEntry;