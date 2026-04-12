import React, { createContext, useState, useContext, useCallback, useRef } from 'react';
import TRANSLATIONS from './translations';

export const LanguageContext = createContext();

// Emoji हटाने का function
const removeEmojis = (text) => {
  return text
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
    .replace(/[\u{2600}-\u{26FF}]/gu, '')
    .replace(/[\u{2700}-\u{27BF}]/gu, '')
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
    .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '')
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '')
    .replace(/[\u{200D}]/gu, '')
    .replace(/[\u{20E3}]/gu, '')
    .replace(/[\u{E0020}-\u{E007F}]/gu, '')
    .replace(/[☰✕✅❌⚖️📏🎂👶💧🩸📊🔍📈❤️🍽️🏥🚨📄🏠📋🔊⏹️🌐👩👨🚪👋📐🔵🟢🟡🟠🔴⚠️💡🔄]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('hi');
  const [voiceGender, setVoiceGender] = useState('female');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef(null);

  // Language code to speech language mapping
  const langToSpeechCode = {
    hi: 'hi-IN',
    en: 'en-US',
    bn: 'bn-IN',
    te: 'te-IN',
    ta: 'ta-IN',
    mr: 'mr-IN',
    gu: 'gu-IN',
    kn: 'kn-IN',
    ml: 'ml-IN',
    pa: 'pa-IN',
    ur: 'ur-IN',
    od: 'or-IN',
    as: 'as-IN',
  };

  // Get best matching voice for language and gender
  const getBestVoice = useCallback((langCode, gender) => {
    const voices = window.speechSynthesis.getVoices();
    const speechCode = langToSpeechCode[langCode] || 'hi-IN';
    const langPrefix = speechCode.split('-')[0];

    let matchingVoices = voices.filter(v => v.lang.startsWith(langPrefix));

    if (matchingVoices.length === 0) {
      matchingVoices = voices.filter(v => v.lang.includes(langPrefix));
    }

    if (matchingVoices.length === 0) {
      return null;
    }

    if (gender === 'female') {
      const femaleVoice = matchingVoices.find(v => 
        v.name.toLowerCase().includes('female') || 
        v.name.toLowerCase().includes('woman') ||
        v.name.toLowerCase().includes('mahila') ||
        v.name.toLowerCase().includes('lekha') ||
        v.name.toLowerCase().includes('aditi')
      );
      return femaleVoice || matchingVoices[0];
    } else {
      const maleVoice = matchingVoices.find(v => 
        v.name.toLowerCase().includes('male') || 
        v.name.toLowerCase().includes('man') ||
        v.name.toLowerCase().includes('purush') ||
        v.name.toLowerCase().includes('ravi')
      );
      return maleVoice || matchingVoices[1] || matchingVoices[0];
    }
  }, []);

  const changeLang = (langCode) => {
    setLanguage(langCode);
  };

  const speak = useCallback((text) => {
    if (!text || text.trim() === '') return;

    // Stop any current speech
    window.speechSynthesis.cancel();

    // Remove emojis from text before speaking
    const cleanText = removeEmojis(text);
    if (!cleanText || cleanText.trim() === '') return;

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utteranceRef.current = utterance;

      // Set language
      const speechCode = langToSpeechCode[language] || 'hi-IN';
      utterance.lang = speechCode;

      // FIXED speed at 0.5 (50%) - धीमी और समझ में आने वाली
      utterance.rate = 0.5;

      // Set pitch based on gender
      if (voiceGender === 'female') {
        utterance.pitch = 1.1;
      } else {
        utterance.pitch = 0.8;
      }

      utterance.volume = 1.0;

      // Try to get best voice
      const bestVoice = getBestVoice(language, voiceGender);
      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    }, 100);
  }, [language, voiceGender, getBestVoice]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const t = useCallback((key) => {
    // First check TRANSLATIONS file
    if (TRANSLATIONS[language] && TRANSLATIONS[language][key]) {
      return TRANSLATIONS[language][key];
    }

    // Fallback translations
    const fallback = {
      hi: {
        app_title: 'बाल कुपोषण पहचान प्रणाली',
        app_subtitle: 'बच्चों के कुपोषण का पता लगाएं',
        language: 'भाषा',
        voice: 'आवाज़',
        voice_female: 'महिला',
        voice_male: 'पुरुष',
        voice_speak: 'बोलो',
        voice_stop: 'रोको',
        logout: 'लॉग आउट',
        nav_home: 'होम',
        nav_data: 'डेटा एंट्री',
        nav_scan: 'स्कैन',
        nav_dashboard: 'डैशबोर्ड',
        nav_score: 'हेल्थ स्कोर',
        nav_diet: 'डाइट प्लान',
        nav_hospital: 'हॉस्पिटल',
        nav_alerts: 'अलर्ट',
        nav_report: 'रिपोर्ट',
        home_title: 'स्वागत है!',
        home_subtitle: 'इस ऐप से कुपोषण की जांच करें',
        growth_title: 'विकास संदर्भ तालिका (WHO)',
        growth_age: 'उम्र',
        growth_normal_weight: 'सामान्य वजन',
        growth_normal_height: 'सामान्य ऊंचाई',
        sev_sam: 'गंभीर तीव्र कुपोषण',
        sev_mam: 'मध्यम तीव्र कुपोषण',
        sev_normal: 'सामान्य',
        footer_line1: 'कुपोषण पहचान प्रणाली - राष्ट्रीय स्तर हैकाथॉन',
        footer_line2: ''
      },
      en: {
        app_title: 'Child Malnutrition Detection',
        app_subtitle: 'Detect Child Malnutrition',
        language: 'Language',
        voice: 'Voice',
        voice_female: 'Female',
        voice_male: 'Male',
        voice_speak: 'Speak',
        voice_stop: 'Stop',
        logout: 'Logout',
        nav_home: 'Home',
        nav_data: 'Data Entry',
        nav_scan: 'Scan',
        nav_dashboard: 'Dashboard',
        nav_score: 'Health Score',
        nav_diet: 'Diet Plan',
        nav_hospital: 'Hospital',
        nav_alerts: 'Alerts',
        nav_report: 'Report',
        home_title: 'Welcome!',
        home_subtitle: 'Check malnutrition with this app',
        growth_title: 'Growth Reference Table (WHO)',
        growth_age: 'Age',
        growth_normal_weight: 'Normal Weight',
        growth_normal_height: 'Normal Height',
        sev_sam: 'Severe Acute Malnutrition',
        sev_mam: 'Moderate Acute Malnutrition',
        sev_normal: 'Normal',
        footer_line1: 'Malnutrition Detection System - National Level Hackathon',
        footer_line2: ''
      }
    };

    return fallback[language]?.[key] || fallback['en']?.[key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ 
      lang: language, 
      changeLang, 
      t, 
      speak, 
      stopSpeaking, 
      isSpeaking, 
      voiceGender, 
      setVoiceGender
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLang must be used within LanguageProvider');
  return context;
};