import React, { useState, useRef, useEffect } from 'react';

// Chatbot knowledge base
const knowledgeBase = [
  { kw: ['muac','muac kya','mid upper arm'], ans: '📏 MUAC = Mid-Upper Arm Circumference\n\n🟢 > 12.5 cm = Normal\n🟠 11.5-12.5 cm = MAM\n🔴 < 11.5 cm = SAM\n\nकैसे मापें:\n1. बायाँ बाजू 90° पर मोड़ें\n2. कंधे-कोहनी का मध्य बिंदु\n3. Tape बिना कसे लपेटें' },
  { kw: ['sam','severe','गंभीर'], ans: '🔴 SAM = Severe Acute Malnutrition\n\nMUAC < 11.5 cm\nZ-score < -3\nBilateral Edema\n\n🏥 तुरंत NRC में भर्ती करें!\n💊 RUTF + Vitamin A + Zinc दें' },
  { kw: ['mam','moderate','मध्यम'], ans: '🟠 MAM = Moderate Acute Malnutrition\n\nMUAC 11.5-12.5 cm\nZ-score -2 to -3\n\n⚠️ आंगनवाड़ी/ICDS से संपर्क करें\n🥗 Protein-rich foods दें' },
  { kw: ['z score','zscore','z-score','जेड स्कोर'], ans: '📊 Z-Score = WHO Standard से तुलना\n\n3 types:\n⚖️ WFA: Underweight\n📏 HFA: Stunting\n📉 WFH: Wasting\n\n🟢 > -1 Normal\n🟡 -1 to -2 Mild\n🟠 -2 to -3 MAM\n🔴 < -3 SAM' },
  { kw: ['edema','सूजन','swelling'], ans: '💧 Edema = शरीर में सूजन\n\nBilateral pitting edema = SAM\n\nGrading:\n+ दोनों पैर\n++ पैर + हाथ\n+++ पूरा शरीर\n\nCheck: पिंडली 3 sec दबाएं, गड्ढा = Edema' },
  { kw: ['anemia','anaemia','खून की कमी','रक्ताल्पता'], ans: '🩸 Anemia = Hemoglobin कम\n\nHb > 11 = Normal\nHb 10-11 = Mild\nHb 7-10 = Moderate\nHb < 7 = Severe\n\n💊 Iron + Folic Acid दें\n🥬 पालक, गुड़, चुकंदर, अंडा खिलाएं' },
  { kw: ['stunting','बौनापन','height kam'], ans: '📏 Stunting = HFA Z-score < -2\nलंबे समय का कुपोषण\n\nरोकथाम:\n• पहले 1000 दिन important\n• 6 month Exclusive breastfeeding\n• विविध पौष्टिक आहार' },
  { kw: ['wasting','दुबलापन','patla'], ans: '📉 Wasting = WFH Z-score < -2\nAcute malnutrition\n\nउपचार:\n• High calorie foods\n• दिन में 6-8 बार खिलाएं\n• RUTF/RUSF' },
  { kw: ['diet','food','khana','भोजन','आहार'], ans: '🍽️ कुपोषित बच्चों का आहार:\n\nSAM: दिन में 8 बार\n• खिचड़ी + घी\n• दूध + दलिया + गुड़\n• मूंगफली चिक्की\n\nMAM: दिन में 6 बार\n• दाल-चावल + घी\n• अंडा/पनीर\n• फल + dry fruits' },
  { kw: ['rutf','therapeutic'], ans: '🍫 RUTF = Ready-to-Use Therapeutic Food\n\nSAM बच्चों के लिए\n• मूंगफली paste + दूध powder\n• 500 kcal/packet\n• Cooking नहीं चाहिए\n\nNRC/आंगनवाड़ी से मिलेगा' },
  { kw: ['nrc','nutrition rehabilitation'], ans: '🏥 NRC = Nutrition Rehabilitation Centre\n\nSAM बच्चों का इलाज\n• 14 दिन भर्ती\n• Therapeutic diet\n• Medical treatment\n\nजिला अस्पताल/CHC में मिलेगा' },
  { kw: ['emergency','ambulance','helpline'], ans: '🚨 Emergency Numbers:\n🚑 Ambulance: 102\n📞 Child Helpline: 1098\n🏥 Health: 104\n📱 ICDS: 1800-345-6789\n🆘 Emergency: 112' },
  { kw: ['health score','स्वास्थ्य स्कोर'], ans: '📊 Health Score /100:\n\n🔵 MUAC: 30 points\n📊 Z-Score: 30 points\n⚖️ BMI: 20 points\n💧 Edema: 10 points\n🩸 Anemia: 10 points\n\n🟢 80-100 Excellent\n🟡 60-79 Good\n🟠 40-59 At Risk\n🔴 0-39 Critical' },
  { kw: ['breastfeeding','स्तनपान','dudh'], ans: '🤱 Breastfeeding:\n• जन्म के 1 घंटे में शुरू\n• 6 month exclusive\n• 2 साल तक जारी रखें\n• ऊपर का दूध 6 month से पहले ❌' },
  { kw: ['icds','आंगनवाड़ी','anganwadi'], ans: '🏫 ICDS सेवाएं:\n• Supplementary Nutrition\n• Growth Monitoring\n• Health Check-up\n• Immunization\n• Nutrition Education\n\nTarget: 0-6 साल बच्चे' },
];

function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: '🏥 नमस्ते! मैं AI Health Assistant हूँ। कुपोषण से जुड़ा कोई भी सवाल पूछें!' }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getResponse = (text) => {
    const lower = text.toLowerCase().trim();
    for (const item of knowledgeBase) {
      for (const kw of item.kw) {
        if (lower.includes(kw.toLowerCase())) return item.ans;
      }
    }
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('नमस्ते'))
      return '🙏 नमस्ते! पूछें:\n• MUAC क्या है?\n• SAM/MAM बताओ\n• Z-Score\n• Edema/Anemia\n• Diet plan\n• Emergency numbers';
    if (lower.includes('thank') || lower.includes('धन्यवाद'))
      return '🙏 धन्यवाद! कोई और सवाल हो तो पूछें!';
    return '🤔 यह समझ नहीं आया। पूछें:\n• MUAC\n• SAM/MAM\n• Z-Score\n• Edema/Anemia\n• Diet\n• Emergency';
  };

  const send = () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    const botMsg = { from: 'bot', text: getResponse(input) };
    setMessages([...messages, userMsg, botMsg]);
    setInput('');

    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(
        botMsg.text.replace(/[📊🔴🟠🟢🟡⚠️💧🩸📏📐📋💡🏥💊🍽️🥜📍✅❌🤱🚨🚑📞📱🆘🤔🙏💪🔵⚖️🍫📉]/g, '')
      );
      u.lang = 'hi-IN'; u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  };

  const quickQs = ['MUAC', 'SAM', 'MAM', 'Z-Score', 'Edema', 'Anemia', 'Diet', 'Emergency', 'NRC'];

  return (
    <>
      {/* Floating Button */}
      <div onClick={() => { setIsOpen(!isOpen); setUnread(0); }} style={{
        position: 'fixed', bottom: '25px', right: '25px', width: '65px', height: '65px',
        borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', boxShadow: '0 6px 20px rgba(102,126,234,0.5)',
        zIndex: 9999, transition: 'all 0.3s',
        transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)'
      }}>
        <span style={{ fontSize: '28px', color: 'white' }}>{isOpen ? '✕' : '🤖'}</span>
        {unread > 0 && !isOpen && (
          <span style={{
            position: 'absolute', top: '-5px', right: '-5px',
            background: '#dc3545', color: 'white', borderRadius: '50%',
            width: '22px', height: '22px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '12px'
          }}>{unread}</span>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '100px', right: '25px',
          width: '380px', maxWidth: '90vw', height: '500px', maxHeight: '70vh',
          background: 'white', borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)', zIndex: 9998,
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white', padding: '15px', display: 'flex',
            alignItems: 'center', gap: '10px'
          }}>
            <span style={{ fontSize: '24px' }}>🤖</span>
            <div>
              <p style={{ fontWeight: 'bold', fontSize: '16px' }}>AI Health Assistant</p>
              <p style={{ fontSize: '12px', opacity: 0.9 }}>कुपोषण से जुड़ा कोई भी सवाल पूछें</p>
            </div>
          </div>

          {/* Quick Questions */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '5px',
            padding: '8px 10px', background: '#f8f9fa', borderBottom: '1px solid #eee'
          }}>
            {quickQs.map((q, i) => (
              <button key={i} onClick={() => setInput(q)} style={{
                padding: '3px 8px', borderRadius: '12px', cursor: 'pointer',
                border: '1px solid #667eea', background: 'white',
                color: '#667eea', fontSize: '11px'
              }}>{q}</button>
            ))}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '10px'
              }}>
                <div style={{
                  maxWidth: '85%', padding: '10px 14px', borderRadius: '14px',
                  background: msg.from === 'user' ? '#667eea' : '#f0f0f0',
                  color: msg.from === 'user' ? 'white' : '#333',
                  fontSize: '13px', lineHeight: '1.5', whiteSpace: 'pre-line'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div style={{
            display: 'flex', gap: '8px', padding: '10px',
            borderTop: '1px solid #eee', background: '#f8f9fa'
          }}>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && send()}
              placeholder="सवाल लिखें..."
              style={{
                flex: 1, padding: '10px', border: '2px solid #667eea',
                borderRadius: '10px', fontSize: '14px', outline: 'none'
              }} />
            <button onClick={send} style={{
              padding: '10px 16px', background: '#667eea', color: 'white',
              border: 'none', borderRadius: '10px', cursor: 'pointer',
              fontSize: '14px', fontWeight: 'bold'
            }}>📩</button>
          </div>
        </div>
      )}
    </>
  );
}

export default FloatingChatbot;