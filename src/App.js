import React, { useState } from 'react';
import './App.css';
import { useLang } from './LanguageContext';
import TRANSLATIONS from './translations';
import UserRegistration from './pages/UserRegistration';
import DataEntry from './pages/DataEntry';
import Dashboard from './pages/Dashboard';
import DietPlan from './pages/DietPlan';
import HospitalFinder from './pages/HospitalFinder';
import AlertSystem from './pages/AlertSystem';
import ScanPage from './pages/ScanPage';
import ReportExport from './pages/ReportExport';
import HealthScore from './pages/HealthScore';
import FloatingChatbot from './pages/FloatingChatbot';

function App() {
  const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
  const [currentPage, setCurrentPage] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);

  const { lang, changeLang, t, speak, stopSpeaking, isSpeaking, voiceGender, setVoiceGender } = useLang();

  const handleUserRegistered = (id) => {
    setUserId(id); localStorage.setItem('userId', id); setCurrentPage('home');
  };

  const handleLogout = () => {
    setUserId(null); localStorage.removeItem('userId'); setCurrentPage('home');
  };

  // Page speak function
  const speakPage = () => {
    const pageText = document.querySelector('.app-main')?.innerText || '';
    speak(pageText.substring(0, 500));
  };

  return (
    <div className="App">
      {/* HEADER */}
      <header className="app-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '22px' }}>🏥 {t('app_title')}</h1>
            <p style={{ fontSize: '12px', opacity: 0.9 }}>{t('app_subtitle')}</p>
          </div>

          {/* HAMBURGER MENU (☰) */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{
              background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.5)',
              color: 'white', padding: '8px 12px', borderRadius: '8px',
              cursor: 'pointer', fontSize: '20px'
            }}>
              ☰
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div style={{
                position: 'absolute', top: '45px', right: '0',
                background: 'white', borderRadius: '12px', padding: '20px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.2)', zIndex: 1000,
                minWidth: '320px', maxHeight: '80vh', overflowY: 'auto'
              }}>
                {/* Language Section */}
                <h4 style={{ color: '#333', marginBottom: '10px', borderBottom: '2px solid #667eea', paddingBottom: '8px' }}>
                  🌐 {t('language')}
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                  {Object.entries(TRANSLATIONS).map(([code, langData]) => (
                    <button key={code} onClick={() => { changeLang(code); }}
                      style={{
                        padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                        border: lang === code ? '2px solid #667eea' : '1px solid #ddd',
                        background: lang === code ? '#667eea' : 'white',
                        color: lang === code ? 'white' : '#333',
                        fontSize: '12px', fontWeight: lang === code ? 'bold' : 'normal'
                      }}>
                      {langData.flag} {langData.name}
                    </button>
                  ))}
                </div>

                {/* Voice Section */}
                <h4 style={{ color: '#333', marginBottom: '10px', borderBottom: '2px solid #667eea', paddingBottom: '8px' }}>
                  🔊 {t('voice')}
                </h4>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
                  <select value={voiceGender} onChange={(e) => setVoiceGender(e.target.value)}
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' }}>
                    <option value="female">👩 {t('voice_female')}</option>
                    <option value="male">👨 {t('voice_male')}</option>
                  </select>

                  <button onClick={speakPage} style={{
                    padding: '8px 14px', background: isSpeaking ? '#dc3545' : '#28a745',
                    color: 'white', border: 'none', borderRadius: '6px',
                    cursor: 'pointer', fontSize: '13px'
                  }}>
                    {isSpeaking ? `⏹️ ${t('voice_stop')}` : `🔊 ${t('voice_speak')}`}
                  </button>

                  {isSpeaking && (
                    <button onClick={stopSpeaking} style={{
                      padding: '8px 14px', background: '#dc3545', color: 'white',
                      border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
                    }}>⏹️ {t('voice_stop')}</button>
                  )}
                </div>

                {/* User Info */}
                {userId && (
                  <div style={{ borderTop: '1px solid #eee', paddingTop: '10px' }}>
                    <p style={{ color: '#666', fontSize: '13px' }}>User ID: {userId}</p>
                    <button onClick={handleLogout} style={{
                      marginTop: '8px', padding: '8px 16px', background: '#dc3545',
                      color: 'white', border: 'none', borderRadius: '6px',
                      cursor: 'pointer', fontSize: '13px', width: '100%'
                    }}>🚪 {t('logout')}</button>
                  </div>
                )}

                {/* Close */}
                <button onClick={() => setMenuOpen(false)} style={{
                  marginTop: '15px', padding: '8px', width: '100%',
                  background: '#f8f9fa', border: '1px solid #ddd',
                  borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
                }}>✕ Close</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Click outside to close menu */}
      {menuOpen && (
        <div onClick={() => setMenuOpen(false)} style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          zIndex: 999, background: 'rgba(0,0,0,0.3)'
        }} />
      )}

      <main className="app-main">
        {!userId ? (
          <UserRegistration onSuccess={handleUserRegistered} />
        ) : (
          <>
            {/* Navigation */}
            <nav className="nav-buttons">
              {[
                { key: 'home', label: `🏠 ${t('nav_home')}` },
                { key: 'data-entry', label: `📊 ${t('nav_data')}` },
                { key: 'scan', label: `🔍 ${t('nav_scan')}` },
                { key: 'dashboard', label: `📈 ${t('nav_dashboard')}` },
                { key: 'health-score', label: `❤️ ${t('nav_score')}` },
                { key: 'diet-plan', label: `🍽️ ${t('nav_diet')}` },
                { key: 'hospital', label: `🏥 ${t('nav_hospital')}` },
                { key: 'alerts', label: `🚨 ${t('nav_alerts')}` },
                { key: 'report', label: `📄 ${t('nav_report')}` }
              ].map(btn => (
                <button key={btn.key}
                  onClick={() => setCurrentPage(btn.key)}
                  className={currentPage === btn.key ? 'active' : ''}>
                  {btn.label}
                </button>
              ))}
            </nav>

            {/* HOME */}
            {currentPage === 'home' && (
              <div className="home-page">
                <h2>👋 {t('home_title')}</h2>
                <p>{t('home_subtitle')}</p>

                {/* Growth Reference Table */}
                <div style={{
                  background: '#f8f9fa', padding: '20px', borderRadius: '12px',
                  marginTop: '20px', border: '2px solid #667eea', textAlign: 'left'
                }}>
                  <h3>📊 {t('growth_title')}</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                    <thead>
                      <tr style={{ background: '#667eea', color: 'white' }}>
                        <th style={{ padding: '10px' }}>{t('growth_age')}</th>
                        <th style={{ padding: '10px' }}>{t('growth_normal_weight')}</th>
                        <th style={{ padding: '10px' }}>{t('growth_normal_height')}</th>
                        <th style={{ padding: '10px' }}>MUAC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { age: '1 year', w: '8-10 kg', h: '70-80 cm', m: '> 12.5 cm' },
                        { age: '2 years', w: '10-12 kg', h: '80-90 cm', m: '> 12.5 cm' },
                        { age: '3 years', w: '12-14 kg', h: '90-100 cm', m: '> 13 cm' },
                        { age: '4 years', w: '14-16 kg', h: '100-110 cm', m: '> 13.5 cm' },
                        { age: '5 years', w: '16-18 kg', h: '105-115 cm', m: '> 13.5 cm' }
                      ].map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #ddd' }}>
                          <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>{row.age}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>{row.w}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>{row.h}</td>
                          <td style={{ padding: '10px', textAlign: 'center', color: '#28a745' }}>{row.m}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Feature Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '20px' }}>
                  {[
                    { key: 'data-entry', icon: '📊', title: t('nav_data'), desc: t('home_data_desc'), color: '#007bff' },
                    { key: 'scan', icon: '🔍', title: t('nav_scan'), desc: t('home_scan_desc'), color: '#17a2b8' },
                    { key: 'dashboard', icon: '📈', title: t('nav_dashboard'), desc: t('home_dashboard_desc'), color: '#28a745' },
                    { key: 'health-score', icon: '❤️', title: t('nav_score'), desc: t('home_score_desc'), color: '#e91e63' },
                    { key: 'diet-plan', icon: '🍽️', title: t('nav_diet'), desc: t('home_diet_desc'), color: '#fd7e14' },
                    { key: 'hospital', icon: '🏥', title: t('nav_hospital'), desc: t('home_hospital_desc'), color: '#dc3545' },
                    { key: 'alerts', icon: '🚨', title: t('nav_alerts'), desc: t('home_alerts_desc'), color: '#6f42c1' },
                    { key: 'report', icon: '📄', title: t('nav_report'), desc: t('home_report_desc'), color: '#6610f2' }
                  ].map(card => (
                    <div key={card.key} onClick={() => setCurrentPage(card.key)} style={{
                      background: `${card.color}10`, padding: '16px', borderRadius: '12px',
                      cursor: 'pointer', textAlign: 'center', border: `2px solid ${card.color}`,
                      transition: 'all 0.3s'
                    }}>
                      <p style={{ fontSize: '26px' }}>{card.icon}</p>
                      <p style={{ fontWeight: 'bold', fontSize: '13px' }}>{card.title}</p>
                      <p style={{ fontSize: '11px', color: '#666' }}>{card.desc}</p>
                    </div>
                  ))}
                </div>

                {/* MUAC Reference */}
                <div style={{
                  background: '#fff', padding: '20px', borderRadius: '12px',
                  marginTop: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <h3>📏 MUAC Reference</h3>
                  <p style={{ color: '#dc3545', margin: '5px 0' }}>🔴 &lt; 11.5 cm = SAM ({t('sev_sam')})</p>
                  <p style={{ color: '#fd7e14', margin: '5px 0' }}>🟠 11.5-12.5 cm = MAM ({t('sev_mam')})</p>
                  <p style={{ color: '#28a745', margin: '5px 0' }}>🟢 &gt; 12.5 cm = Normal ({t('sev_normal')})</p>
                </div>

                {/* Z-Score Reference */}
                <div style={{
                  background: '#fff', padding: '20px', borderRadius: '12px',
                  marginTop: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <h3>📊 Z-Score Reference</h3>
                  <p style={{ margin: '5px 0' }}>🟢 &gt; -1: Normal</p>
                  <p style={{ margin: '5px 0' }}>🟡 -1 to -2: Mild</p>
                  <p style={{ margin: '5px 0' }}>🟠 -2 to -3: MAM (Moderate)</p>
                  <p style={{ margin: '5px 0' }}>🔴 &lt; -3: SAM (Severe)</p>
                </div>
              </div>
            )}

            {currentPage === 'data-entry' && <DataEntry userId={userId} />}
            {currentPage === 'scan' && <ScanPage userId={userId} />}
            {currentPage === 'dashboard' && <Dashboard userId={userId} />}
            {currentPage === 'health-score' && <HealthScore userId={userId} />}
            {currentPage === 'diet-plan' && <DietPlan userId={userId} />}
            {currentPage === 'hospital' && <HospitalFinder userId={userId} />}
            {currentPage === 'alerts' && <AlertSystem userId={userId} />}
            {currentPage === 'report' && <ReportExport userId={userId} />}
          </>
        )}
      </main>

      <footer style={{
        textAlign: 'center', padding: '20px', background: '#333',
        color: 'white', marginTop: '40px', fontSize: '13px'
      }}>
        <p>{t('footer_line1')}</p>
        <p>{t('footer_line2')}</p>
      </footer>

      {/* Floating Chatbot - Right Side */}
      {userId && <FloatingChatbot />}
    </div>
  );
}

export default App;