import React, { createContext, useState, useContext } from 'react';
import TRANSLATIONS, { getT } from './translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('appLang') || 'hi');
  const [voiceGender, setVoiceGender] = useState('female');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const changeLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('appLang', newLang);
  };

  const t = (key) => getT(lang, key);

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleaned = text.replace(/[📊🔴🟠🟢🟡⚠️💧🩸📏📐📋💡🏥💊🍽️🥜🏡📍✅❌🤱🚨🚑📞📱🆘🤔🙏💪🔵⚖️🍫📅🎂👶👦👧🔧📝📷🔍❤️📈📄🤖🏠☰🔊⏹️]/g, '');
    const u = new SpeechSynthesisUtterance(cleaned);
    const voiceCode = TRANSLATIONS[lang]?.voiceCode || 'hi-IN';
    u.lang = voiceCode;
    u.rate = 0.85;
    u.pitch = voiceGender === 'female' ? 1.2 : 0.8;

    const voices = window.speechSynthesis.getVoices();
    const langVoices = voices.filter(v => v.lang.includes(voiceCode.split('-')[0]));
    if (langVoices.length > 0) u.voice = langVoices[0];

    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <LanguageContext.Provider value={{
      lang, changeLang, t, speak, stopSpeaking,
      isSpeaking, voiceGender, setVoiceGender
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
export default LanguageContext;