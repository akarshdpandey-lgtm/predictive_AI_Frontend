import React, { useState, useRef, useEffect } from 'react';

function Chatbot({ userId }) {
  const [messages, setMessages] = useState([
    { from: 'bot', text: '🏥 नमस्ते! मैं कुपोषण AI Assistant हूँ। आप मुझसे कुपोषण, Z-Score, MUAC, Edema, Anemia, Diet या किसी भी health related सवाल पूछ सकते हैं!' }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // WHO Knowledge Base
  const knowledgeBase = [
    {
      keywords: ['muac', 'muac kya', 'muac meaning', 'muac full form', 'mid upper arm'],
      answer: '📏 MUAC = Mid-Upper Arm Circumference (बाजू की परिधि)\n\n📐 कैसे मापें:\n1. बायाँ बाजू 90° पर मोड़ें\n2. कंधे-कोहनी का मध्य बिंदु खोजें\n3. Tape बिना कसे लपेटें\n\n📊 WHO Standards:\n🟢 > 12.5 cm = Normal\n🟠 11.5-12.5 cm = MAM\n🔴 < 11.5 cm = SAM\n\n⚠️ 6-59 महीने के बच्चों के लिए applicable है।'
    },
    {
      keywords: ['sam', 'severe', 'गंभीर', 'severe acute malnutrition', 'sam kya'],
      answer: '🔴 SAM = Severe Acute Malnutrition (गंभीर तीव्र कुपोषण)\n\n📊 SAM कब होता है?\n• MUAC < 11.5 cm\n• Weight-for-Height Z-score < -3\n• Bilateral Edema (दोनों पैरों में सूजन)\n\n⚠️ SAM के लक्षण:\n• बहुत दुबला-पतला\n• त्वचा सिकुड़ी हुई\n• भूख न लगना\n• बार-बार बीमार पड़ना\n\n🏥 उपचार:\n• तुरंत NRC में भर्ती करें\n• F-75 और F-100 therapeutic milk\n• RUTF (Ready-to-Use Therapeutic Food)\n• Vitamin A, Folic Acid, Zinc दें'
    },
    {
      keywords: ['mam', 'moderate', 'मध्यम', 'moderate acute malnutrition', 'mam kya'],
      answer: '🟠 MAM = Moderate Acute Malnutrition (मध्यम तीव्र कुपोषण)\n\n📊 MAM कब होता है?\n• MUAC 11.5-12.5 cm\n• Weight-for-Height Z-score -2 to -3\n\n⚠️ MAM के लक्षण:\n• सामान्य से कम वजन\n• थोड़ा दुबला\n• कमजोरी\n\n🏥 उपचार:\n• Supplementary Feeding Program (SFP)\n• Iron + Folic Acid\n• Protein-rich local foods\n• हर 2 हफ्ते में जांच\n• आंगनवाड़ी से संपर्क करें'
    },
    {
      keywords: ['z score', 'z-score', 'zscore', 'z score kya', 'जेड स्कोर'],
      answer: '📊 Z-Score = WHO Growth Standard से तुलना\n\nZ-Score बताता है कि बच्चा WHO reference से कितना ऊपर या नीचे है।\n\n📐 3 तरह के Z-Scores:\n\n1. Weight-for-Age (WFA):\n• कम = Underweight (कम वजन)\n\n2. Height-for-Age (HFA):\n• कम = Stunting (बौनापन)\n\n3. Weight-for-Height (WFH):\n• कम = Wasting (दुबलापन)\n• सबसे important acute malnutrition के लिए\n\n📊 Interpretation:\n🟢 > -1 = Normal\n🟡 -1 to -2 = Mild\n🟠 -2 to -3 = Moderate (MAM)\n🔴 < -3 = Severe (SAM)\n\n📐 Formula: Z = (Measured - Median) / SD'
    },
    {
      keywords: ['edema', 'सूजन', 'शोथ', 'swelling', 'edema kya'],
      answer: '💧 Edema = शरीर में पानी जमा होने से सूजन\n\n📊 Nutritional Edema:\n• Bilateral pitting edema = SAM\n• यानी दोनों पैरों में सूजन = गंभीर कुपोषण\n\n📋 Grading (WHO):\n+ (Mild): दोनों पैरों में\n++ (Moderate): पैर + हाथ\n+++ (Severe): पूरे शरीर + चेहरा\n\n🔍 कैसे check करें:\n1. पिंडली पर 3 सेकंड अंगूठे से दबाएं\n2. छोड़ने पर गड्ढा बने = Edema\n\n⚠️ Important:\nEdema वाले बच्चे को MUAC चाहे कुछ भी हो, SAM माना जाता है!'
    },
    {
      keywords: ['anemia', 'anaemia', 'खून की कमी', 'रक्ताल्पता', 'hemoglobin', 'hb'],
      answer: '🩸 Anemia = खून में Hemoglobin की कमी\n\n📊 WHO Classification:\n• Hb > 11 g/dl = Normal\n• Hb 10-11 g/dl = Mild Anemia\n• Hb 7-10 g/dl = Moderate Anemia\n• Hb < 7 g/dl = Severe Anemia\n\n⚠️ लक्षण:\n• पीली आँखें/जीभ/नाखून\n• थकान/कमजोरी\n• तेज साँस\n• चक्कर आना\n\n💊 उपचार:\n• Iron + Folic Acid (IFA) tablet\n• Iron-rich foods: पालक, गुड़, चुकंदर, अंडा\n• Vitamin C foods (Iron absorption बढ़ाता है)\n• Deworming tablet (कीड़े मारने की दवा)\n\n🍎 Iron-rich foods:\n• पालक, मेथी, चौलाई\n• गुड़, खजूर, किशमिश\n• अंडा, मछली, चिकन\n• दाल, चना, सोयाबीन'
    },
    {
      keywords: ['stunting', 'बौनापन', 'height kam', 'छोटा कद'],
      answer: '📏 Stunting = Height-for-Age Z-score < -2\n\nइसका मतलब बच्चे की ऊंचाई उम्र के हिसाब से कम है।\n\n📊 Classification:\n🟢 > -1 = Normal\n🟡 -1 to -2 = Mild Stunting\n🟠 -2 to -3 = Moderate Stunting\n🔴 < -3 = Severe Stunting\n\n⚠️ कारण:\n• लंबे समय तक कुपोषण\n• बार-बार बीमारी\n• गर्भावस्था में माँ का कुपोषण\n\n💡 रोकथाम:\n• पहले 1000 दिन सबसे important\n• Exclusive breastfeeding (6 महीने तक)\n• विविध पौष्टिक आहार\n• टीकाकरण'
    },
    {
      keywords: ['wasting', 'दुबलापन', 'patla', 'weight kam'],
      answer: '📉 Wasting = Weight-for-Height Z-score < -2\n\nइसका मतलब बच्चे का वजन ऊंचाई के हिसाब से कम है।\n\n📊 Classification:\n🟢 > -1 = Normal\n🟡 -1 to -2 = Mild Wasting\n🟠 -2 to -3 = Moderate Wasting (MAM)\n🔴 < -3 = Severe Wasting (SAM)\n\n⚠️ कारण:\n• अचानक भोजन की कमी\n• बीमारी (Diarrhea, TB, etc.)\n• स्तनपान बंद करना\n\n💡 उपचार:\n• High calorie foods\n• Frequent feeding (दिन में 6-8 बार)\n• RUTF / RUSF\n• ORS अगर दस्त हो'
    },
    {
      keywords: ['underweight', 'कम वजन', 'vajan kam'],
      answer: '⚖️ Underweight = Weight-for-Age Z-score < -2\n\nइसका मतलब बच्चे का वजन उम्र के हिसाब से कम है।\n\n📊 India Statistics:\n• भारत में ~35% बच्चे underweight हैं\n• MP, Bihar, UP, Jharkhand में सबसे ज्यादा\n\n💡 उपचार:\n• Calorie-dense foods (घी, मूंगफली, गुड़)\n• दिन में 5-6 बार खिलाएं\n• दूध, अंडा, दाल daily\n• Iron + Vitamin supplements'
    },
    {
      keywords: ['diet', 'khana', 'food', 'भोजन', 'आहार', 'nutrition', 'पोषण'],
      answer: '🍽️ कुपोषित बच्चों के लिए आहार:\n\n🔴 SAM के लिए (8 बार/दिन):\n• F-75 therapeutic milk\n• खिचड़ी + घी\n• दलिया + दूध + गुड़\n• मूंगफली-गुड़ चिक्की\n• केला + दही\n\n🟠 MAM के लिए (6 बार/दिन):\n• दूध + दलिया\n• दाल-चावल + घी\n• अंडा/पनीर\n• फल + dry fruits\n\n🥜 Dry Fruits (शहरी क्षेत्र):\n• बादाम (5-6 daily)\n• काजू (3-4 daily)\n• अखरोट (2-3 daily)\n• खजूर (2-3 daily)\n• किशमिश (8-10 daily)\n\n🏡 ग्रामीण क्षेत्र:\n• मूंगफली + गुड़\n• सत्तू + दूध\n• दाल का पानी\n• पालक + गाजर\n• शकरकंद'
    },
    {
      keywords: ['rutf', 'therapeutic food', 'ready to use'],
      answer: '🍫 RUTF = Ready-to-Use Therapeutic Food\n\nयह SAM बच्चों के लिए special food है।\n\n📊 Composition:\n• मूंगफली paste\n• दूध powder\n• चीनी\n• Vegetable oil\n• Vitamins & Minerals\n\n📋 Properties:\n• 500 kcal per packet\n• No cooking needed\n• 2 साल तक shelf life\n• Bacteria-free\n\n🏥 कहाँ मिलेगा:\n• NRC (Nutrition Rehabilitation Centre)\n• ICDS/आंगनवाड़ी\n• District Hospital'
    },
    {
      keywords: ['nrc', 'nutrition rehabilitation', 'पोषण पुनर्वास'],
      answer: '🏥 NRC = Nutrition Rehabilitation Centre\n\nयहाँ SAM बच्चों का इलाज होता है।\n\n📋 NRC में क्या होता है:\n• 14 दिन तक भर्ती\n• Special therapeutic diet\n• Medical treatment\n• माँ को nutrition education\n• Follow-up plan\n\n📊 भर्ती के criteria:\n• MUAC < 11.5 cm\n• W/H Z-score < -3\n• Bilateral Edema\n• Medical complications\n\n📍 NRC कहाँ:\n• जिला अस्पताल में\n• CHC (Community Health Centre) में'
    },
    {
      keywords: ['icds', 'आंगनवाड़ी', 'anganwadi', 'integrated child'],
      answer: '🏫 ICDS = Integrated Child Development Services\n\n📋 ICDS सेवाएं:\n1. Supplementary Nutrition\n2. Pre-school Education\n3. Nutrition & Health Education\n4. Immunization\n5. Health Check-up\n6. Referral Services\n\n👩 आंगनवाड़ी कार्यकर्ता:\n• वजन मापती हैं\n• Growth monitoring करती हैं\n• पोषण आहार बांटती हैं\n• MAM/SAM बच्चों को refer करती हैं\n\n📊 Target:\n• 0-6 साल के बच्चे\n• गर्भवती महिलाएं\n• स्तनपान कराने वाली माताएं'
    },
    {
      keywords: ['breastfeeding', 'स्तनपान', 'dudh', 'breast milk'],
      answer: '🤱 स्तनपान (Breastfeeding):\n\n📋 WHO Guidelines:\n• जन्म के 1 घंटे के अंदर शुरू करें\n• 6 महीने तक Exclusive Breastfeeding\n• 6 महीने बाद complementary food + breastfeeding\n• 2 साल तक breastfeeding जारी रखें\n\n✅ फायदे:\n• Immunity बढ़ती है\n• Diarrhea से बचाव\n• Brain development\n• Bonding\n• FREE!\n\n⚠️ Common गलतियाँ:\n• ऊपर का दूध/पानी देना (6 month से पहले)\n• Bottle feeding\n• बहुत जल्दी solid food शुरू करना'
    },
    {
      keywords: ['help', 'helpline', 'emergency', 'ambulance', 'hospital'],
      answer: '🚨 Emergency Numbers:\n\n🚑 Ambulance: 102\n📞 Child Helpline: 1098\n🏥 Health Helpline: 104\n📱 ICDS Helpline: 1800-345-6789\n🆘 Emergency: 112\n\n🏥 कहाँ जाएं:\n• आंगनवाड़ी केंद्र (1 km)\n• PHC - Primary Health Centre (2-5 km)\n• CHC - Community Health Centre (5-10 km)\n• District Hospital (10-30 km)\n• NRC - SAM के लिए'
    },
    {
      keywords: ['health score', 'स्वास्थ्य स्कोर', 'score'],
      answer: '📊 Health Score कैसे calculate होता है:\n\n🔵 MUAC Score (30%)\n• > 13.5 cm = 30 points\n• 12.5-13.5 = 20 points\n• 11.5-12.5 = 10 points\n• < 11.5 = 0 points\n\n📊 Z-Score (30%)\n• > -1 = 30 points\n• -1 to -2 = 20 points\n• -2 to -3 = 10 points\n• < -3 = 0 points\n\n⚖️ BMI Score (20%)\n• Normal BMI = 20 points\n\n💧 Edema (10%)\n• No edema = 10 points\n\n🩸 Anemia (10%)\n• No anemia = 10 points\n\n📊 Total: /100\n🟢 80-100 = Excellent\n🟡 60-79 = Good\n🟠 40-59 = At Risk\n🔴 0-39 = Critical'
    }
  ];

  const getBotResponse = (userInput) => {
    const input = userInput.toLowerCase().trim();

    // Search knowledge base
    for (const item of knowledgeBase) {
      for (const keyword of item.keywords) {
        if (input.includes(keyword.toLowerCase())) {
          return item.answer;
        }
      }
    }

    // Default responses
    if (input.includes('hello') || input.includes('hi') || input.includes('नमस्ते') || input.includes('hlo'))
      return '🙏 नमस्ते! मैं कुपोषण AI Assistant हूँ। आप मुझसे पूछ सकते हैं:\n\n• MUAC क्या है?\n• SAM/MAM क्या है?\n• Z-Score कैसे calculate होता है?\n• Edema/Anemia क्या है?\n• Diet plan बताओ\n• Emergency numbers\n• Health Score\n• Stunting/Wasting/Underweight';

    if (input.includes('thank') || input.includes('धन्यवाद') || input.includes('shukriya'))
      return '🙏 धन्यवाद! अगर कोई और सवाल हो तो जरूर पूछें। बच्चे का स्वास्थ्य सबसे जरूरी है! 💪';

    return '🤔 मुझे यह समझ नहीं आया। आप इनमें से कुछ पूछ सकते हैं:\n\n• MUAC क्या है?\n• SAM/MAM बताओ\n• Z-Score समझाओ\n• Edema/Anemia क्या है?\n• Diet plan\n• Emergency numbers\n• Stunting/Wasting\n• RUTF/NRC/ICDS\n• Breastfeeding\n• Health Score';
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    const botResponse = getBotResponse(input);
    const botMsg = { from: 'bot', text: botResponse };
    setMessages([...messages, userMsg, botMsg]);
    setInput('');

    // Voice output
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(botResponse.replace(/[📊🔴🟠🟢🟡⚠️💧🩸📏📐📋💡🏥💊🍽️🥜🏡📍✅❌🤱🚨🚑📞📱🆘🤔🙏💪🔵⚖️🍫]/g, ''));
      utterance.lang = 'hi-IN';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  // Quick questions
  const quickQuestions = [
    'MUAC क्या है?', 'SAM बताओ', 'MAM बताओ', 'Z-Score समझाओ',
    'Edema क्या है?', 'Anemia बताओ', 'Diet plan', 'Emergency numbers',
    'Health Score', 'Stunting', 'Wasting', 'RUTF क्या है?', 'NRC बताओ'
  ];

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2>🤖 AI Health Assistant</h2>
      <p style={{ color: '#666', marginBottom: '15px' }}>कुपोषण से जुड़ा कोई भी सवाल पूछें!</p>

      {/* Quick Questions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '15px' }}>
        {quickQuestions.map((q, i) => (
          <button key={i} onClick={() => { setInput(q); }} style={{
            padding: '5px 10px', borderRadius: '15px', cursor: 'pointer',
            border: '1px solid #667eea', background: '#f0f4ff',
            color: '#667eea', fontSize: '12px'
          }}>{q}</button>
        ))}
      </div>

      {/* Chat Messages */}
      <div style={{
        height: '400px', overflowY: 'auto', padding: '15px',
        background: '#f8f9fa', borderRadius: '12px', marginBottom: '15px'
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: '12px'
          }}>
            <div style={{
              maxWidth: '80%', padding: '12px 16px', borderRadius: '16px',
              background: msg.from === 'user' ? '#667eea' : 'white',
              color: msg.from === 'user' ? 'white' : '#333',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              whiteSpace: 'pre-line', fontSize: '14px', lineHeight: '1.6'
            }}>
              <span style={{ fontSize: '12px', opacity: 0.7 }}>
                {msg.from === 'user' ? '👤 You' : '🤖 AI'}
              </span>
              <p style={{ marginTop: '4px' }}>{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="अपना सवाल लिखें... (जैसे: MUAC क्या है?)"
          style={{
            flex: 1, padding: '14px', border: '2px solid #667eea',
            borderRadius: '12px', fontSize: '16px'
          }} />
        <button onClick={sendMessage} style={{
          padding: '14px 24px', background: '#667eea', color: 'white',
          border: 'none', borderRadius: '12px', cursor: 'pointer',
          fontSize: '16px', fontWeight: 'bold'
        }}>📩 Send</button>
      </div>
    </div>
  );
}

export default Chatbot;