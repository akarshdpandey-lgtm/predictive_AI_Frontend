import React, { useState } from 'react';

// Top 10 Indian Languages + English
const TRANSLATIONS = {
  en: { name: 'English', flag: '🇬🇧',
    welcome: 'Welcome!', data_entry: 'Data Entry', dashboard: 'Dashboard',
    diet_plan: 'Diet Plan', hospital: 'Hospital', alerts: 'Alerts',
    scan: 'Scan', report: 'Report', height: 'Height (cm)', weight: 'Weight (kg)',
    age: 'Age (months)', gender: 'Gender', boy: 'Boy', girl: 'Girl',
    submit: 'Submit', muac: 'MUAC (cm)', severity: 'Severity',
    sam: 'Severe Acute Malnutrition', mam: 'Moderate Acute Malnutrition',
    normal: 'Normal', advice_sam: 'Go to hospital immediately!',
    advice_mam: 'Improve nutrition. Visit doctor.',
    advice_normal: 'Child is healthy. Keep good nutrition.',
    manual_tape: 'Manual Tape', hardware_device: 'Hardware Device',
    both_methods: 'Both Methods', edema: 'Edema (Swelling)',
    anemia: 'Anemia (Blood Deficiency)', health_score: 'Health Score'
  },
  hi: { name: 'हिंदी', flag: '🇮🇳',
    welcome: 'स्वागत है!', data_entry: 'डेटा एंट्री', dashboard: 'डैशबोर्ड',
    diet_plan: 'डाइट प्लान', hospital: 'अस्पताल', alerts: 'अलर्ट',
    scan: 'स्कैन', report: 'रिपोर्ट', height: 'ऊंचाई (cm)', weight: 'वजन (kg)',
    age: 'उम्र (महीने)', gender: 'लिंग', boy: 'लड़का', girl: 'लड़की',
    submit: 'जमा करो', muac: 'MUAC (cm)', severity: 'गंभीरता',
    sam: 'गंभीर तीव्र कुपोषण', mam: 'मध्यम तीव्र कुपोषण',
    normal: 'सामान्य', advice_sam: 'तुरंत अस्पताल जाएं!',
    advice_mam: 'पोषण सुधारें। डॉक्टर से मिलें।',
    advice_normal: 'बच्चा स्वस्थ है। अच्छा पोषण जारी रखें।',
    manual_tape: 'मैनुअल टेप', hardware_device: 'हार्डवेयर डिवाइस',
    both_methods: 'दोनों तरीके', edema: 'सूजन (Edema)',
    anemia: 'खून की कमी (Anemia)', health_score: 'स्वास्थ्य स्कोर'
  },
  bn: { name: 'বাংলা', flag: '🇮🇳',
    welcome: 'স্বাগতম!', data_entry: 'ডেটা এন্ট্রি', dashboard: 'ড্যাশবোর্ড',
    diet_plan: 'ডায়েট প্ল্যান', hospital: 'হাসপাতাল', alerts: 'সতর্কতা',
    scan: 'স্ক্যান', report: 'রিপোর্ট', height: 'উচ্চতা (cm)', weight: 'ওজন (kg)',
    age: 'বয়স (মাস)', gender: 'লিঙ্গ', boy: 'ছেলে', girl: 'মেয়ে',
    submit: 'জমা দিন', muac: 'MUAC (cm)', severity: 'তীব্রতা',
    sam: 'গুরুতর তীব্র অপুষ্টি', mam: 'মাঝারি তীব্র অপুষ্টি', normal: 'স্বাভাবিক',
    advice_sam: 'এখনই হাসপাতালে যান!', advice_mam: 'পুষ্টি উন্নত করুন।',
    advice_normal: 'শিশু সুস্থ আছে।', manual_tape: 'ম্যানুয়াল টেপ',
    hardware_device: 'হার্ডওয়্যার', both_methods: 'উভয়', edema: 'শোথ',
    anemia: 'রক্তাল্পতা', health_score: 'স্বাস্থ্য স্কোর'
  },
  te: { name: 'తెలుగు', flag: '🇮🇳',
    welcome: 'స్వాగతం!', data_entry: 'డేటా ఎంట్రీ', dashboard: 'డాష్‌బోర్డ్',
    sam: 'తీవ్రమైన పోషకాహార లోపం', mam: 'మధ్యస్థ పోషకాహార లోపం', normal: 'సాధారణ',
    advice_sam: 'వెంటనే ఆసుపత్రికి వెళ్ళండి!', submit: 'సమర్పించండి',
    height: 'ఎత్తు', weight: 'బరువు', health_score: 'ఆరోగ్య స్కోరు',
    manual_tape: 'మాన్యువల్ టేప్', hardware_device: 'హార్డ్‌వేర్', both_methods: 'రెండూ'
  },
  mr: { name: 'मराठी', flag: '🇮🇳',
    welcome: 'स्वागत!', data_entry: 'डेटा एंट्री', dashboard: 'डॅशबोर्ड',
    sam: 'गंभीर तीव्र कुपोषण', mam: 'मध्यम तीव्र कुपोषण', normal: 'सामान्य',
    advice_sam: 'लगेच हॉस्पिटलला जा!', submit: 'सबमिट करा',
    height: 'उंची', weight: 'वजन', health_score: 'आरोग्य गुण',
    manual_tape: 'मॅन्युअल टेप', hardware_device: 'हार्डवेअर', both_methods: 'दोन्ही'
  },
  ta: { name: 'தமிழ்', flag: '🇮🇳',
    welcome: 'வரவேற்கிறோம்!', data_entry: 'தரவு பதிவு', dashboard: 'டாஷ்போர்டு',
    sam: 'கடுமையான ஊட்டச்சத்து குறைபாடு', mam: 'மிதமான ஊட்டச்சத்து குறைபாடு', normal: 'சாதாரண',
    advice_sam: 'உடனடியாக மருத்துவமனைக்கு செல்லுங்கள்!', submit: 'சமர்ப்பிக்கவும்',
    height: 'உயரம்', weight: 'எடை', health_score: 'ஆரோக்கிய மதிப்பெண்'
  },
  ur: { name: 'اردو', flag: '🇮🇳',
    welcome: '!خوش آمدید', data_entry: 'ڈیٹا انٹری', dashboard: 'ڈیش بورڈ',
    sam: 'شدید غذائی قلت', mam: 'درمیانی غذائی قلت', normal: 'نارمل',
    advice_sam: '!فوری طور پر ہسپتال جائیں', submit: 'جمع کریں',
    height: 'قد', weight: 'وزن', health_score: 'صحت سکور'
  },
  gu: { name: 'ગુજરાતી', flag: '🇮🇳',
    welcome: 'સ્વાગત!', data_entry: 'ડેટા એન્ટ્રી', dashboard: 'ડેશબોર્ડ',
    sam: 'ગંભીર કુપોષણ', mam: 'મધ્યમ કુપોષણ', normal: 'સામાન્ય',
    advice_sam: 'તાત્કાલિક હોસ્પિટલ જાઓ!', submit: 'સબમિટ કરો',
    height: 'ઊંચાઈ', weight: 'વજન', health_score: 'આરોગ્ય સ્કોર'
  },
  kn: { name: 'ಕನ್ನಡ', flag: '🇮🇳',
    welcome: 'ಸ್ವಾಗತ!', data_entry: 'ಡೇಟಾ ಎಂಟ್ರಿ', dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    sam: 'ತೀವ್ರ ಪೋಷಕಾಂಶ ಕೊರತೆ', mam: 'ಮಧ್ಯಮ ಪೋಷಕಾಂಶ ಕೊರತೆ', normal: 'ಸಾಮಾನ್ಯ',
    advice_sam: 'ತಕ್ಷಣ ಆಸ್ಪತ್ರೆಗೆ ಹೋಗಿ!', submit: 'ಸಲ್ಲಿಸಿ',
    height: 'ಎತ್ತರ', weight: 'ತೂಕ', health_score: 'ಆರೋಗ್ಯ ಅಂಕ'
  },
  ml: { name: 'മലയാളം', flag: '🇮🇳',
    welcome: 'സ്വാഗതം!', data_entry: 'ഡാറ്റ എൻട്രി', dashboard: 'ഡാഷ്‌ബോർഡ്',
    sam: 'കടുത്ത പോഷകാഹാരക്കുറവ്', mam: 'മിതമായ പോഷകാഹാരക്കുറവ്', normal: 'സാധാരണ',
    advice_sam: 'ഉടൻ ആശുപത്രിയിൽ പോകുക!', submit: 'സമർപ്പിക്കുക',
    height: 'ഉയരം', weight: 'ഭാരം', health_score: 'ആരോഗ്യ സ്കോർ'
  },
  od: { name: 'ଓଡ଼ିଆ', flag: '🇮🇳',
    welcome: 'ସ୍ୱାଗତ!', data_entry: 'ଡାଟା ଏଣ୍ଟ୍ରି', dashboard: 'ଡ୍ୟାସବୋର୍ଡ',
    sam: 'ଗମ୍ଭୀର ପୋଷଣ ଅଭାବ', mam: 'ମଧ୍ୟମ ପୋଷଣ ଅଭାବ', normal: 'ସାଧାରଣ',
    advice_sam: 'ତୁରନ୍ତ ହସ୍ପିଟାଲ ଯାଆନ୍ତୁ!', submit: 'ଦାଖଲ କରନ୍ତୁ',
    height: 'ଉଚ୍ଚତା', weight: 'ଓଜନ', health_score: 'ସ୍ୱାସ୍ଥ୍ୟ ସ୍କୋର'
  },
  pa: { name: 'ਪੰਜਾਬੀ', flag: '🇮🇳',
    welcome: 'ਸੁਆਗਤ ਹੈ!', data_entry: 'ਡੇਟਾ ਐਂਟਰੀ', dashboard: 'ਡੈਸ਼ਬੋਰਡ',
    sam: 'ਗੰਭੀਰ ਕੁਪੋਸ਼ਣ', mam: 'ਮੱਧਮ ਕੁਪੋਸ਼ਣ', normal: 'ਸਾਧਾਰਨ',
    advice_sam: 'ਤੁਰੰਤ ਹਸਪਤਾਲ ਜਾਓ!', submit: 'ਜਮ੍ਹਾਂ ਕਰੋ',
    height: 'ਕੱਦ', weight: 'ਭਾਰ', health_score: 'ਸਿਹਤ ਸਕੋਰ'
  }
};

// Voice lang codes for Web Speech API
const VOICE_CODES = {
  en: 'en-IN', hi: 'hi-IN', bn: 'bn-IN', te: 'te-IN',
  mr: 'mr-IN', ta: 'ta-IN', ur: 'ur-IN', gu: 'gu-IN',
  kn: 'kn-IN', ml: 'ml-IN', od: 'or-IN', pa: 'pa-IN'
};

function LanguageVoice({ currentLang, setCurrentLang }) {
  const [voiceGender, setVoiceGender] = useState('female');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Text-to-Speech function
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = VOICE_CODES[currentLang] || 'hi-IN';
      utterance.rate = 0.9;
      utterance.pitch = voiceGender === 'female' ? 1.2 : 0.8;

      const voices = window.speechSynthesis.getVoices();
      const langVoices = voices.filter(v => v.lang.startsWith(VOICE_CODES[currentLang]?.split('-')[0] || 'hi'));
      if (langVoices.length > 0) {
        const genderVoice = langVoices.find(v =>
          voiceGender === 'female' ? v.name.toLowerCase().includes('female') : v.name.toLowerCase().includes('male')
        );
        utterance.voice = genderVoice || langVoices[0];
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Voice not supported in this browser');
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.hi;

  return (
    <div style={{
      background: 'white', padding: '15px', borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px'
    }}>
      {/* Language Selector */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
        {Object.entries(TRANSLATIONS).map(([code, lang]) => (
          <button key={code} onClick={() => setCurrentLang(code)} style={{
            padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
            border: currentLang === code ? '2px solid #667eea' : '1px solid #ddd',
            background: currentLang === code ? '#667eea' : 'white',
            color: currentLang === code ? 'white' : '#333',
            fontSize: '12px', fontWeight: currentLang === code ? 'bold' : 'normal'
          }}>
            {lang.flag} {lang.name}
          </button>
        ))}
      </div>

      {/* Voice Controls */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <select value={voiceGender} onChange={(e) => setVoiceGender(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' }}>
          <option value="female">👩 Female Voice</option>
          <option value="male">👨 Male Voice</option>
        </select>

        <button onClick={() => speak(t.welcome + ' ' + t.sam + ' ' + t.advice_sam)} style={{
          padding: '6px 14px', background: isSpeaking ? '#dc3545' : '#28a745',
          color: 'white', border: 'none', borderRadius: '6px',
          cursor: 'pointer', fontSize: '13px'
        }}>
          {isSpeaking ? '⏹️ Stop' : '🔊 Test Voice'}
        </button>

        {isSpeaking && (
          <button onClick={stopSpeaking} style={{
            padding: '6px 14px', background: '#dc3545', color: 'white',
            border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
          }}>⏹️ Stop</button>
        )}
      </div>
    </div>
  );
}

export { TRANSLATIONS, VOICE_CODES };
export default LanguageVoice;