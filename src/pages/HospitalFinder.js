import React, { useState } from 'react';

function HospitalFinder({ userId }) {
  const [location, setLocation] = useState('');
  const [showHospitals, setShowHospitals] = useState(false);

  // Sample hospitals data
  const hospitals = [
    {
      name: '🏥 जिला अस्पताल (District Hospital)',
      distance: '5 km',
      phone: '📞 0120-1234567',
      services: 'NRC (Nutrition Rehabilitation Centre) उपलब्ध',
      timing: '24 घंटे खुला'
    },
    {
      name: '🏥 प्राथमिक स्वास्थ्य केंद्र (PHC)',
      distance: '2 km',
      phone: '📞 0120-2345678',
      services: 'OPD + टीकाकरण + पोषण परामर्श',
      timing: 'सुबह 8 AM - शाम 5 PM'
    },
    {
      name: '🏥 आंगनवाड़ी केंद्र (AWC)',
      distance: '1 km',
      phone: '📞 0120-3456789',
      services: 'पोषण आहार + वजन जांच + स्वास्थ्य शिक्षा',
      timing: 'सुबह 9 AM - दोपहर 2 PM'
    },
    {
      name: '🏥 सामुदायिक स्वास्थ्य केंद्र (CHC)',
      distance: '8 km',
      phone: '📞 0120-4567890',
      services: 'भर्ती सुविधा + NRC + Lab Test',
      timing: '24 घंटे खुला'
    }
  ];

  // Emergency contacts
  const emergencyContacts = [
    { name: '🚑 Ambulance', number: '102' },
    { name: '📞 Child Helpline', number: '1098' },
    { name: '🏥 Health Helpline', number: '104' },
    { name: '📱 ICDS Helpline', number: '1800-345-6789' }
  ];

  return (
    <div className="hospital-finder">
      <h2>🏥 नजदीकी अस्पताल खोजो</h2>

      {/* Location Input */}
      <div style={{
        background: 'white', padding: '20px',
        borderRadius: '12px', marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3>📍 अपना स्थान बताओ</h3>
        <div className="form-group">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="गाँव / शहर का नाम लिखो"
            style={{
              width: '100%', padding: '12px',
              border: '2px solid #ddd', borderRadius: '8px',
              fontSize: '16px'
            }}
          />
        </div>
        <button onClick={() => setShowHospitals(true)} style={{
          marginTop: '10px', padding: '12px 24px',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white', border: 'none', borderRadius: '8px',
          cursor: 'pointer', fontSize: '16px', fontWeight: '600',
          width: '100%'
        }}>
          🔍 अस्पताल खोजो
        </button>
      </div>

      {/* Emergency Contacts */}
      <div style={{
        background: '#f8d7da', padding: '20px',
        borderRadius: '12px', marginBottom: '20px',
        border: '2px solid #dc3545'
      }}>
        <h3 style={{ color: '#dc3545' }}>🚨 Emergency Numbers</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
          {emergencyContacts.map((contact, i) => (
            <div key={i} style={{
              background: 'white', padding: '15px',
              borderRadius: '8px', textAlign: 'center'
            }}>
              <p style={{ fontWeight: 'bold', fontSize: '16px' }}>{contact.name}</p>
              <a href={`tel:${contact.number}`} style={{
                display: 'inline-block', marginTop: '5px',
                padding: '8px 20px', background: '#dc3545',
                color: 'white', borderRadius: '20px',
                textDecoration: 'none', fontSize: '18px', fontWeight: 'bold'
              }}>
                📞 {contact.number}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Hospital List */}
      {showHospitals && (
        <div>
          <h3>📋 {location || 'आपके'} क्षेत्र में उपलब्ध अस्पताल:</h3>
          {hospitals.map((hospital, i) => (
            <div key={i} style={{
              background: 'white', padding: '20px',
              borderRadius: '12px', marginBottom: '15px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              borderLeft: '4px solid #667eea'
            }}>
              <h4 style={{ color: '#333', marginBottom: '10px' }}>{hospital.name}</h4>
              <p>📍 <strong>दूरी:</strong> {hospital.distance}</p>
              <p>{hospital.phone}</p>
              <p>🏥 <strong>सुविधाएं:</strong> {hospital.services}</p>
              <p>🕐 <strong>समय:</strong> {hospital.timing}</p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button style={{
                  padding: '8px 20px', background: '#28a745',
                  color: 'white', border: 'none', borderRadius: '8px',
                  cursor: 'pointer', fontSize: '14px'
                }}>
                  📞 Call करो
                </button>
                <button style={{
                  padding: '8px 20px', background: '#17a2b8',
                  color: 'white', border: 'none', borderRadius: '8px',
                  cursor: 'pointer', fontSize: '14px'
                }}>
                  🗺️ Map देखो
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HospitalFinder;