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

class VoiceService {
  constructor() {
    this.currentLanguage = 'hi-IN';
    this.speechRate = 0.5;
    this.voiceGender = 'female';
    this.isSpeaking = false;
    this.selectedVoice = null;
  }

  getAvailableVoices() {
    return new Promise((resolve) => {
      let voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          voices = window.speechSynthesis.getVoices();
          resolve(voices);
        };
      } else {
        resolve(voices);
      }
    });
  }

  async selectBestVoice(language, gender) {
    const voices = await this.getAvailableVoices();
    const langPrefix = language.split('-')[0];
    let filteredVoices = voices.filter(voice => 
      voice.lang.startsWith(langPrefix)
    );

    if (filteredVoices.length === 0) {
      this.selectedVoice = null;
      return;
    }

    if (gender === 'female') {
      const femaleVoice = filteredVoices.find(v => 
        v.name.toLowerCase().includes('female') || 
        v.name.toLowerCase().includes('woman')
      );
      this.selectedVoice = femaleVoice || filteredVoices[0];
    } else {
      const maleVoice = filteredVoices.find(v => 
        v.name.toLowerCase().includes('male') || 
        v.name.toLowerCase().includes('man')
      );
      this.selectedVoice = maleVoice || filteredVoices[1] || filteredVoices[0];
    }
  }

  async speak(text) {
    if (!text || text.trim() === '') return;

    // Remove emojis before speaking
    const cleanText = removeEmojis(text);
    if (!cleanText || cleanText.trim() === '') return;
    
    await this.selectBestVoice(this.currentLanguage, this.voiceGender);
    
    if (this.isSpeaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = this.currentLanguage;
    
    // FIXED at 0.5 - slow and clear
    utterance.rate = 0.5;
    
    // Gender-based pitch
    utterance.pitch = this.voiceGender === 'female' ? 1.1 : 0.8;
    utterance.volume = 1.0;
    
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    utterance.onstart = () => { this.isSpeaking = true; };
    utterance.onend = () => { this.isSpeaking = false; };
    utterance.onerror = () => { this.isSpeaking = false; };

    window.speechSynthesis.speak(utterance);
  }

  setLanguage(langCode) {
    this.currentLanguage = langCode;
  }

  setVoiceGender(gender) {
    this.voiceGender = gender;
  }

  stop() {
    window.speechSynthesis.cancel();
    this.isSpeaking = false;
  }

  pause() {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
  }

  resume() {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }
}

export default new VoiceService();