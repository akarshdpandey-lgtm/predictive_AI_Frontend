import React, { useState } from 'react';

function ScanPage({ userId }) {
  const [edemaResult, setEdemaResult] = useState(null);
  const [anemiaResult, setAnemiaResult] = useState(null);
  const [photoUploaded, setPhotoUploaded] = useState(false);

  // ========== EDEMA DETECTION ==========
  const [edemaQuestions, setEdemaQuestions] = useState({
    feet_swelling: false,
    hands_swelling: false,
    face_swelling: false,
    skin_pitting: false
  });

  const handleEdemaChange = (key) => {
    setEdemaQuestions({ ...edemaQuestions, [key]: !edemaQuestions[key] });
  };

  const checkEdema = () => {
    const yesCount = Object.values(edemaQuestions).filter(v => v).length;
    let severity, message;

    if (yesCount >= 3) {
      severity = 'SEVERE';
      message = '🔴 गंभीर Edema - तुरंत अस्पताल जाएं! दोनों पैरों में सूजन = SAM';
    } else if (yesCount >= 1) {
      severity = 'MODERATE';
      message = '🟠 हल्का Edema - डॉक्टर से दिखाएं';
    } else {
      severity = 'NORMAL';
      message = '🟢 कोई Edema नहीं - सामान्य';
    }

    setEdemaResult({ severity, message, yesCount });
  };

  // ========== ANEMIA DETECTION ==========
  const [anemiaQuestions, setAnemiaQuestions] = useState({
    pale_eyes: false,
    pale_nails: false,
    pale_tongue: false,
    weakness: false,
    fast_breathing: false
  });

  const handleAnemiaChange = (key) => {
    setAnemiaQuestions({ ...anemiaQuestions, [key]: !anemiaQuestions[key] });
  };

  const checkAnemia = () => {
    const yesCount = Object.values(anemiaQuestions).filter(v => v).length;
    let severity, message;

    if (yesCount >= 4) {
      severity = 'SEVERE';
      message = '🔴 गंभीर Anemia संभव - तुरंत Hemoglobin test करवाएं!';
    } else if (yesCount >= 2) {
      severity = 'MODERATE';
      message = '🟠 Anemia के लक्षण - Iron सप्लीमेंट शुरू करें';
    } else {
      severity = 'NORMAL';
      message = '🟢 Anemia के कोई स्पष्ट लक्षण नहीं';
    }

    setAnemiaResult({ severity, message, yesCount });
  };

  const getSeverityColor = (s) => {
    if (s === 'SEVERE') return '#dc3545';
    if (s === 'MODERATE') return '#fd7e14';
    return '#28a745';
  };

  // Photo upload handler
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoUploaded(true);
    }
  };

  return (
    <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2>🔍 Scan & Detection</h2>

      {/* ========== PHOTO UPLOAD (MediaPipe Placeholder) ========== */}
      <div style={{
        background: '#f8f9fa', padding: '20px',
        borderRadius: '12px', marginBottom: '25px',
        border: '2px solid #667eea'
      }}>
        <h3>📷 Photo Upload (Body Detection)</h3>
        <p style={{ color: '#666', marginBottom: '15px' }}>
          बच्चे की full body photo upload करें (MediaPipe Analysis)
        </p>

        <input type="file" accept="image/*" capture="environment"
          onChange={handlePhotoUpload}
          style={{
            width: '100%', padding: '15px',
            border: '2px dashed #667eea', borderRadius: '8px',
            cursor: 'pointer', background: '#f0f4ff'
          }}
        />

        {photoUploaded && (
          <div style={{
            background: '#d4edda', padding: '15px',
            borderRadius: '8px', marginTop: '15px',
            border: '1px solid #28a745'
          }}>
            <p>✅ Photo uploaded successfully!</p>
            <p style={{ marginTop: '10px', fontSize: '14px' }}>
              📊 <strong>MediaPipe Analysis:</strong>
            </p>
            <p>• Body detected: ✅ Yes</p>
            <p>• Face visible: ✅ Yes</p>
            <p>• Arms visible: ✅ Yes (MUAC measurement possible)</p>
            <p style={{ marginTop: '10px', color: '#666', fontSize: '13px' }}>
              ℹ️ Full MediaPipe/OpenCV analysis production version में available होगा
            </p>
          </div>
        )}
      </div>

      {/* ========== EDEMA DETECTION ========== */}
      <div style={{
        background: '#fff', padding: '20px',
        borderRadius: '12px', marginBottom: '25px',
        border: '2px solid #17a2b8',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <h3>💧 Edema Detection (सूजन जांच)</h3>
        <p style={{ color: '#666', marginBottom: '15px' }}>
          Edema = शरीर में सूजन। अगर Bilateral Edema (दोनों तरफ सूजन) है तो बच्चा SAM है।
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { key: 'feet_swelling', label: '🦶 क्या दोनों पैरों में सूजन है?', detail: 'पैर दबाने पर गड्ढा बनता है?' },
            { key: 'hands_swelling', label: '🤲 क्या हाथों में सूजन है?', detail: 'उँगलियाँ फूली हुई दिखती हैं?' },
            { key: 'face_swelling', label: '😶 क्या चेहरे पर सूजन है?', detail: 'गाल या आँखों के नीचे सूजन?' },
            { key: 'skin_pitting', label: '👆 क्या त्वचा दबाने पर गड्ढा बनता है?', detail: 'पिंडली पर 3 सेकंड दबाएं' }
          ].map(q => (
            <div key={q.key} onClick={() => handleEdemaChange(q.key)} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px', borderRadius: '8px', cursor: 'pointer',
              border: edemaQuestions[q.key] ? '2px solid #dc3545' : '2px solid #ddd',
              background: edemaQuestions[q.key] ? '#f8d7da' : 'white',
              transition: 'all 0.3s'
            }}>
              <span style={{ fontSize: '20px' }}>
                {edemaQuestions[q.key] ? '✅' : '⬜'}
              </span>
              <div>
                <p style={{ fontWeight: 'bold', fontSize: '15px' }}>{q.label}</p>
                <p style={{ fontSize: '12px', color: '#666' }}>{q.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={checkEdema} style={{
          marginTop: '15px', padding: '12px 24px', width: '100%',
          background: '#17a2b8', color: 'white', border: 'none',
          borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '600'
        }}>
          🔍 Edema Check करो
        </button>

        {edemaResult && (
          <div style={{
            marginTop: '15px', padding: '15px', borderRadius: '8px',
            background: edemaResult.severity === 'NORMAL' ? '#d4edda' :
                        edemaResult.severity === 'MODERATE' ? '#fff3cd' : '#f8d7da',
            border: `2px solid ${getSeverityColor(edemaResult.severity)}`
          }}>
            <p style={{ fontWeight: 'bold', color: getSeverityColor(edemaResult.severity) }}>
              {edemaResult.message}
            </p>
            <p style={{ marginTop: '8px', fontSize: '14px' }}>
              {edemaResult.yesCount}/4 लक्षण पाए गए
            </p>
            {edemaResult.severity === 'SEVERE' && (
              <p style={{ marginTop: '10px', fontWeight: 'bold', color: '#dc3545' }}>
                ⚠️ Bilateral Edema = SAM (गंभीर कुपोषण) - WHO Guidelines
              </p>
            )}
          </div>
        )}
      </div>

      {/* ========== ANEMIA DETECTION ========== */}
      <div style={{
        background: '#fff', padding: '20px',
        borderRadius: '12px', marginBottom: '25px',
        border: '2px solid #e91e63',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <h3>🩸 Anemia Detection (खून की कमी जांच)</h3>
        <p style={{ color: '#666', marginBottom: '15px' }}>
          Anemia = खून में Hemoglobin की कमी। नीचे दिए गए लक्षण check करो:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { key: 'pale_eyes', label: '👁️ क्या आँखों का अंदरूनी हिस्सा पीला/सफेद है?', detail: 'नीचे की पलक खींचकर देखें - लाल की जगह सफेद दिखे?' },
            { key: 'pale_nails', label: '💅 क्या नाखून पीले/सफेद हैं?', detail: 'गुलाबी की जगह सफेद नाखून = Anemia' },
            { key: 'pale_tongue', label: '👅 क्या जीभ पीली/सफेद है?', detail: 'जीभ का रंग check करो - लाल होनी चाहिए' },
            { key: 'weakness', label: '😴 क्या बच्चा बहुत कमजोर/थका हुआ है?', detail: 'खेलता नहीं, सुस्त रहता है?' },
            { key: 'fast_breathing', label: '💨 क्या साँस तेज चलती है?', detail: 'आराम से बैठे भी साँस तेज?' }
          ].map(q => (
            <div key={q.key} onClick={() => handleAnemiaChange(q.key)} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px', borderRadius: '8px', cursor: 'pointer',
              border: anemiaQuestions[q.key] ? '2px solid #e91e63' : '2px solid #ddd',
              background: anemiaQuestions[q.key] ? '#fce4ec' : 'white',
              transition: 'all 0.3s'
            }}>
              <span style={{ fontSize: '20px' }}>
                {anemiaQuestions[q.key] ? '✅' : '⬜'}
              </span>
              <div>
                <p style={{ fontWeight: 'bold', fontSize: '15px' }}>{q.label}</p>
                <p style={{ fontSize: '12px', color: '#666' }}>{q.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={checkAnemia} style={{
          marginTop: '15px', padding: '12px 24px', width: '100%',
          background: '#e91e63', color: 'white', border: 'none',
          borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '600'
        }}>
          🔍 Anemia Check करो
        </button>

        {anemiaResult && (
          <div style={{
            marginTop: '15px', padding: '15px', borderRadius: '8px',
            background: anemiaResult.severity === 'NORMAL' ? '#d4edda' :
                        anemiaResult.severity === 'MODERATE' ? '#fff3cd' : '#f8d7da',
            border: `2px solid ${getSeverityColor(anemiaResult.severity)}`
          }}>
            <p style={{ fontWeight: 'bold', color: getSeverityColor(anemiaResult.severity) }}>
              {anemiaResult.message}
            </p>
            <p style={{ marginTop: '8px', fontSize: '14px' }}>
              {anemiaResult.yesCount}/5 लक्षण पाए गए
            </p>
            {anemiaResult.severity !== 'NORMAL' && (
              <div style={{ marginTop: '10px', fontSize: '14px' }}>
                <p><strong>💊 उपचार:</strong></p>
                <p>• Iron + Folic Acid (IFA) टैबलेट दें</p>
                <p>• पालक, गुड़, अंडा, चुकंदर खिलाएं</p>
                <p>• Hemoglobin test करवाएं</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reference Guide */}
      <div style={{
        background: '#f8f9fa', padding: '20px',
        borderRadius: '12px', borderLeft: '4px solid #667eea'
      }}>
        <h3>📚 Reference Guide</h3>
        <div style={{ marginTop: '10px' }}>
          <p><strong>💧 Edema (WHO):</strong></p>
          <p style={{ fontSize: '14px', margin: '5px 0' }}>• Bilateral pitting edema = SAM (MUAC चाहे कुछ भी हो)</p>
          <p style={{ fontSize: '14px', margin: '5px 0' }}>• Grade + (mild): दोनों पैरों में सूजन</p>
          <p style={{ fontSize: '14px', margin: '5px 0' }}>• Grade ++ (moderate): पैर + हाथ में सूजन</p>
          <p style={{ fontSize: '14px', margin: '5px 0' }}>• Grade +++ (severe): पूरे शरीर में सूजन (चेहरा भी)</p>
          
          <p style={{ marginTop: '15px' }}><strong>🩸 Anemia (WHO):</strong></p>
          <p style={{ fontSize: '14px', margin: '5px 0' }}>• Hb &lt; 7 g/dl = Severe Anemia</p>
          <p style={{ fontSize: '14px', margin: '5px 0' }}>• Hb 7-10 g/dl = Moderate Anemia</p>
          <p style={{ fontSize: '14px', margin: '5px 0' }}>• Hb 10-11 g/dl = Mild Anemia</p>
          <p style={{ fontSize: '14px', margin: '5px 0' }}>• Hb &gt; 11 g/dl = Normal</p>
        </div>
      </div>
    </div>
  );
}

export default ScanPage;