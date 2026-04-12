import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function AlertSystem({ userId }) {
  const [alerts, setAlerts] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyFacilities, setNearbyFacilities] = useState([]);
  const [sharedData, setSharedData] = useState([]);
  const [autoShareEnabled, setAutoShareEnabled] = useState(true);
  const [smsNumber, setSmsNumber] = useState('');
  const [showShareConfirm, setShowShareConfirm] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [shareStatus, setShareStatus] = useState({});

  // Assessments load karo
  useEffect(() => {
    loadAssessments();
    getLocation();
  }, [userId]);

  const loadAssessments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/assessment/all/${userId}`);
      if (response.data.success) {
        const data = response.data.assessments;
        setAssessments(data);
        generateAlerts(data);
      }
    } catch (err) {
      console.error('Error loading assessments:', err);
    }
    setLoading(false);
  };

  // GPS Location
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(loc);
          searchNearbyFacilities(loc.lat, loc.lng);
        },
        (err) => console.error('Location error:', err),
        { enableHighAccuracy: true, timeout: 15000 }
      );
    }
  };

  // Nearby Hospital + Anganwadi search
  const searchNearbyFacilities = async (lat, lng) => {
    try {
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:10000,${lat},${lng});
          way["amenity"="hospital"](around:10000,${lat},${lng});
          node["amenity"="clinic"](around:10000,${lat},${lng});
          node["name"~"anganwadi|aanganwadi|आंगनवाड़ी|anganbadi|icds",i](around:10000,${lat},${lng});
          way["name"~"anganwadi|aanganwadi|आंगनवाड़ी|anganbadi|icds",i](around:10000,${lat},${lng});
          node["name"~"PHC|primary health|CHC|community health",i](around:10000,${lat},${lng});
          way["name"~"PHC|primary health|CHC|community health",i](around:10000,${lat},${lng});
          node["name"~"NRC|nutrition rehabilitation",i](around:10000,${lat},${lng});
          way["name"~"NRC|nutrition rehabilitation",i](around:10000,${lat},${lng});
        );
        out body center;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const data = await response.json();

      if (data.elements) {
        const facilities = data.elements
          .map((el) => {
            const fLat = el.lat || el.center?.lat;
            const fLng = el.lon || el.center?.lon;
            if (!fLat || !fLng) return null;

            const name = el.tags?.name || el.tags?.['name:hi'] || '';
            const nameLower = name.toLowerCase();
            let type = 'hospital';
            let typeLabel = 'Hospital';
            let color = '#667eea';

            if (nameLower.includes('anganwadi') || nameLower.includes('icds') || nameLower.includes('आंगनवाड़ी')) {
              type = 'anganwadi'; typeLabel = 'Anganwadi'; color = '#e91e63';
            } else if (nameLower.includes('phc') || nameLower.includes('primary health')) {
              type = 'phc'; typeLabel = 'PHC'; color = '#2196f3';
            } else if (nameLower.includes('nrc') || nameLower.includes('nutrition')) {
              type = 'nrc'; typeLabel = 'NRC'; color = '#ff5722';
            } else if (nameLower.includes('chc') || nameLower.includes('community')) {
              type = 'chc'; typeLabel = 'CHC'; color = '#009688';
            } else if (el.tags?.amenity === 'clinic') {
              type = 'clinic'; typeLabel = 'Clinic'; color = '#28a745';
            }

            const distance = calculateDistance(lat, lng, fLat, fLng);

            return {
              id: el.id,
              name: name || typeLabel,
              type, typeLabel, color,
              lat: fLat, lng: fLng,
              distance,
              phone: el.tags?.phone || el.tags?.['contact:phone'] || '',
              address: el.tags?.['addr:full'] || el.tags?.['addr:street'] || ''
            };
          })
          .filter(f => f !== null)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 10);

        setNearbyFacilities(facilities);
      }
    } catch (err) {
      console.error('Facility search error:', err);
    }
  };

  // Distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return Math.round(2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 100) / 100;
  };

  // Alerts generate karo
  const generateAlerts = (data) => {
    const alertList = [];
    const samAssessments = data.filter(a => a.severity === 'SAM');
    const mamAssessments = data.filter(a => a.severity === 'MAM');
    const latestAssessment = data[0];

    // CRITICAL: Agar latest SAM hai
    if (latestAssessment && latestAssessment.severity === 'SAM') {
      alertList.push({
        id: 'sam_critical',
        type: 'CRITICAL',
        title: 'CRITICAL: SAM Detected - Severe Acute Malnutrition',
        titleHi: 'गंभीर: SAM - गंभीर तीव्र कुपोषण पाया गया',
        message: 'Bachche ko turant hospital le jaayein. NRC mein admission zaroori hai.',
        messageHi: 'बच्चे को तुरंत अस्पताल ले जाएं। NRC में एडमिशन ज़रूरी है।',
        color: '#dc3545',
        icon: '🚨',
        action: 'EMERGENCY',
        autoShare: true,
        timestamp: latestAssessment.date,
        assessment: latestAssessment
      });
    }

    // WARNING: Agar SAM 2 baar aaya hai
    if (samAssessments.length >= 2) {
      alertList.push({
        id: 'sam_repeat',
        type: 'REPEAT_SAM',
        title: `REPEAT SAM: ${samAssessments.length} times SAM detected`,
        titleHi: `बार-बार SAM: ${samAssessments.length} बार गंभीर कुपोषण पाया गया`,
        message: 'Bachche ki haalat serious hai. Data auto-share ho raha hai nearest hospital/anganwadi ko.',
        messageHi: 'बच्चे की हालत गंभीर है। डेटा ऑटो-शेयर हो रहा है निकटतम अस्पताल/आंगनवाड़ी को।',
        color: '#b71c1c',
        icon: '🆘',
        action: 'AUTO_SHARE',
        autoShare: true,
        timestamp: new Date().toISOString(),
        samCount: samAssessments.length
      });
    }

    // WARNING: MAM detected
    if (latestAssessment && latestAssessment.severity === 'MAM') {
      alertList.push({
        id: 'mam_warning',
        type: 'WARNING',
        title: 'WARNING: MAM Detected - Moderate Acute Malnutrition',
        titleHi: 'चेतावनी: MAM - मध्यम तीव्र कुपोषण पाया गया',
        message: 'Poshan mein sudhar karein. Anganwadi/ICDS se sampark karein.',
        messageHi: 'पोषण में सुधार करें। आंगनवाड़ी/ICDS से संपर्क करें।',
        color: '#ff9800',
        icon: '⚠️',
        action: 'FOLLOW_UP',
        autoShare: false,
        timestamp: latestAssessment.date,
        assessment: latestAssessment
      });
    }

    // INFO: MAM 2+ times
    if (mamAssessments.length >= 2) {
      alertList.push({
        id: 'mam_repeat',
        type: 'REPEAT_MAM',
        title: `REPEAT MAM: ${mamAssessments.length} times MAM detected`,
        titleHi: `बार-बार MAM: ${mamAssessments.length} बार मध्यम कुपोषण पाया गया`,
        message: 'Bachche mein improvement nahi ho raha. Doctor se milein.',
        messageHi: 'बच्चे में सुधार नहीं हो रहा। डॉक्टर से मिलें।',
        color: '#e65100',
        icon: '🔔',
        action: 'CONSULT',
        autoShare: false,
        timestamp: new Date().toISOString(),
        mamCount: mamAssessments.length
      });
    }

    // Edema check
    const edemaAssessments = data.filter(a => a.edema === 'yes');
    if (edemaAssessments.length > 0) {
      alertList.push({
        id: 'edema_alert',
        type: 'EDEMA',
        title: 'EDEMA Detected - Swelling Found',
        titleHi: 'एडीमा (सूजन) पाया गया',
        message: 'Edema SAM ka lakshan hai. Turant medical help lein.',
        messageHi: 'एडीमा SAM का लक्षण है। तुरंत मेडिकल सहायता लें।',
        color: '#9c27b0',
        icon: '💧',
        action: 'EMERGENCY',
        autoShare: true,
        timestamp: edemaAssessments[0].date
      });
    }

    // Low MUAC
    const lowMuac = data.filter(a => a.muac && a.muac < 11.5);
    if (lowMuac.length > 0) {
      alertList.push({
        id: 'low_muac',
        type: 'LOW_MUAC',
        title: `CRITICAL MUAC: ${lowMuac[0].muac} cm (< 11.5 cm)`,
        titleHi: `गंभीर MUAC: ${lowMuac[0].muac} cm (< 11.5 cm)`,
        message: 'MUAC bahut kam hai. SAM ki category mein hai.',
        messageHi: 'MUAC बहुत कम है। SAM की श्रेणी में है।',
        color: '#d32f2f',
        icon: '📏',
        action: 'EMERGENCY',
        autoShare: true,
        timestamp: lowMuac[0].date
      });
    }

    // Normal
    if (latestAssessment && latestAssessment.severity === 'NORMAL' && alertList.length === 0) {
      alertList.push({
        id: 'normal',
        type: 'NORMAL',
        title: 'All Normal - Child is Healthy',
        titleHi: 'सब सामान्य - बच्चा स्वस्थ है',
        message: 'Bachcha swasth hai. Poshan jaari rakhein.',
        messageHi: 'बच्चा स्वस्थ है। पोषण जारी रखें।',
        color: '#4caf50',
        icon: '✅',
        action: 'NONE',
        autoShare: false,
        timestamp: latestAssessment.date
      });
    }

    setAlerts(alertList);

    // Auto share if SAM detected
    if (autoShareEnabled) {
      const criticalAlerts = alertList.filter(a => a.autoShare);
      if (criticalAlerts.length > 0) {
        autoShareToFacilities(criticalAlerts, data[0]);
      }
    }
  };

  // Auto Share Data to facilities
  const autoShareToFacilities = (criticalAlerts, latestAssessment) => {
    if (!latestAssessment || nearbyFacilities.length === 0) return;

    const shareData = {
      timestamp: new Date().toISOString(),
      alertType: criticalAlerts[0].type,
      severity: latestAssessment.severity,
      childData: {
        height: latestAssessment.height,
        weight: latestAssessment.weight,
        muac: latestAssessment.muac,
        bmi: latestAssessment.bmi,
        edema: latestAssessment.edema,
        zScores: {
          wfa: latestAssessment.z_wfa,
          hfa: latestAssessment.z_hfa,
          wfh: latestAssessment.z_wfh
        }
      },
      location: userLocation,
      sharedWith: nearbyFacilities.slice(0, 3).map(f => ({
        name: f.name,
        type: f.typeLabel,
        distance: f.distance,
        phone: f.phone
      }))
    };

    // Save to shared data
    const existingShared = JSON.parse(localStorage.getItem('sharedAlerts') || '[]');
    existingShared.unshift(shareData);
    localStorage.setItem('sharedAlerts', JSON.stringify(existingShared.slice(0, 20)));
    setSharedData(existingShared.slice(0, 20));

    // Update share status
    const newStatus = {};
    nearbyFacilities.slice(0, 3).forEach(f => {
      newStatus[f.id] = 'shared';
    });
    setShareStatus(newStatus);
  };

  // Manual share to specific facility
  const shareToFacility = (facility, assessment) => {
    if (!assessment) {
      alert('Koi assessment data nahi hai share karne ke liye');
      return;
    }

    const shareData = {
      timestamp: new Date().toISOString(),
      facility: {
        name: facility.name,
        type: facility.typeLabel,
        phone: facility.phone,
        distance: facility.distance
      },
      childData: {
        height: assessment.height,
        weight: assessment.weight,
        muac: assessment.muac,
        severity: assessment.severity,
        edema: assessment.edema,
        bmi: assessment.bmi
      },
      location: userLocation
    };

    // Save
    const existing = JSON.parse(localStorage.getItem('sharedAlerts') || '[]');
    existing.unshift(shareData);
    localStorage.setItem('sharedAlerts', JSON.stringify(existing.slice(0, 20)));
    setSharedData(existing.slice(0, 20));

    // Update status
    setShareStatus(prev => ({ ...prev, [facility.id]: 'shared' }));

    // Show confirmation
    alert(`Data shared with ${facility.name}\n\nSeverity: ${assessment.severity}\nHeight: ${assessment.height} cm\nWeight: ${assessment.weight} kg\nMUAC: ${assessment.muac} cm\n\nPlease also call: ${facility.phone || 'N/A'}`);
  };

  // Send SMS Alert
  const sendSmsAlert = (number, assessment) => {
    if (!number) {
      alert('Phone number daalein');
      return;
    }
    const msg = `ALERT: Child Malnutrition Detected\nSeverity: ${assessment?.severity || 'SAM'}\nHeight: ${assessment?.height || 'N/A'} cm\nWeight: ${assessment?.weight || 'N/A'} kg\nMUAC: ${assessment?.muac || 'N/A'} cm\nLocation: ${userLocation ? `${userLocation.lat.toFixed(4)},${userLocation.lng.toFixed(4)}` : 'N/A'}\nPlease take immediate action.`;
    window.open(`sms:${number}?body=${encodeURIComponent(msg)}`, '_self');
  };

  // WhatsApp share
  const shareOnWhatsApp = (number, assessment) => {
    const msg = `🚨 *ALERT: Child Malnutrition Detected*\n\n📊 *Severity:* ${assessment?.severity || 'SAM'}\n📏 *Height:* ${assessment?.height || 'N/A'} cm\n⚖️ *Weight:* ${assessment?.weight || 'N/A'} kg\n📐 *MUAC:* ${assessment?.muac || 'N/A'} cm\n📊 *BMI:* ${assessment?.bmi || 'N/A'}\n💧 *Edema:* ${assessment?.edema || 'N/A'}\n\n📍 *Location:* ${userLocation ? `https://www.google.com/maps?q=${userLocation.lat},${userLocation.lng}` : 'N/A'}\n\n⚠️ Please take immediate action.\nContact nearest NRC/Hospital.`;
    const url = number 
      ? `https://wa.me/${number}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Load shared data
  useEffect(() => {
    const existing = JSON.parse(localStorage.getItem('sharedAlerts') || '[]');
    setSharedData(existing);
  }, []);

  const latestAssessment = assessments[0];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p style={{ fontSize: '18px', color: '#667eea' }}>Loading alerts...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '10px' }}>
      <h2 style={{ color: '#667eea', marginBottom: '20px' }}>Alert System</h2>

      {/* Auto Share Toggle */}
      <div style={{
        background: autoShareEnabled ? '#d4edda' : '#f8d7da',
        padding: '15px', borderRadius: '12px', marginBottom: '20px',
        border: `2px solid ${autoShareEnabled ? '#28a745' : '#dc3545'}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          <p style={{ margin: 0, fontWeight: 'bold', color: autoShareEnabled ? '#155724' : '#721c24' }}>
            Auto Data Share: {autoShareEnabled ? 'ON' : 'OFF'}
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#666' }}>
            SAM aane par automatically nearest hospital/anganwadi ko data bheja jayega
          </p>
        </div>
        <button onClick={() => setAutoShareEnabled(!autoShareEnabled)} style={{
          padding: '10px 25px',
          background: autoShareEnabled ? '#dc3545' : '#28a745',
          color: 'white', border: 'none', borderRadius: '8px',
          cursor: 'pointer', fontWeight: 'bold'
        }}>
          {autoShareEnabled ? 'Turn OFF' : 'Turn ON'}
        </button>
      </div>

      {/* Alerts */}
      {alerts.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '40px', background: '#f8f9fa',
          borderRadius: '12px', marginBottom: '20px'
        }}>
          <p style={{ fontSize: '18px', color: '#666' }}>Koi alert nahi hai</p>
          <p style={{ fontSize: '14px', color: '#999' }}>Pehle Data Entry mein assessment karein</p>
        </div>
      )}

      {alerts.map((alert, index) => (
        <div key={alert.id} style={{
          background: `${alert.color}08`,
          padding: '20px', borderRadius: '12px', marginBottom: '15px',
          border: `3px solid ${alert.color}`,
          boxShadow: alert.type === 'CRITICAL' || alert.type === 'REPEAT_SAM' 
            ? `0 4px 20px ${alert.color}40` : '0 2px 8px rgba(0,0,0,0.08)',
          animation: alert.type === 'CRITICAL' ? 'pulse 2s infinite' : 'none'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ fontSize: '30px' }}>{alert.icon}</span>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, color: alert.color, fontSize: '16px' }}>{alert.title}</h3>
              <p style={{ margin: '3px 0 0 0', color: '#333', fontSize: '14px' }}>{alert.titleHi}</p>
            </div>
            <span style={{
              padding: '5px 15px', borderRadius: '20px',
              background: alert.color, color: 'white',
              fontSize: '12px', fontWeight: 'bold'
            }}>
              {alert.type}
            </span>
          </div>

          {/* Message */}
          <div style={{
            background: 'white', padding: '15px', borderRadius: '8px',
            marginBottom: '15px', borderLeft: `5px solid ${alert.color}`
          }}>
            <p style={{ margin: 0, fontSize: '15px', color: '#333' }}>{alert.message}</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>{alert.messageHi}</p>
          </div>

          {/* Auto Share Status */}
          {alert.autoShare && (
            <div style={{
              background: '#fff3cd', padding: '12px', borderRadius: '8px',
              marginBottom: '15px', border: '1px solid #ffc107'
            }}>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#856404', fontSize: '14px' }}>
                {autoShareEnabled 
                  ? 'Data auto-shared to nearest facilities' 
                  : 'Auto share OFF hai. Manually share karein.'}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(alert.action === 'EMERGENCY' || alert.action === 'AUTO_SHARE') && (
              <>
                <button onClick={() => window.open('tel:108', '_self')} style={{
                  padding: '10px 20px', background: '#dc3545', color: 'white',
                  border: 'none', borderRadius: '6px', cursor: 'pointer',
                  fontWeight: 'bold', fontSize: '14px'
                }}>
                  Call 108 Ambulance
                </button>
                <button onClick={() => shareOnWhatsApp('', latestAssessment)} style={{
                  padding: '10px 20px', background: '#25D366', color: 'white',
                  border: 'none', borderRadius: '6px', cursor: 'pointer',
                  fontWeight: 'bold', fontSize: '14px'
                }}>
                  Share on WhatsApp
                </button>
              </>
            )}
            <button onClick={() => {
              if (userLocation) {
                window.open(`https://www.google.com/maps/search/hospital/@${userLocation.lat},${userLocation.lng},13z`, '_blank');
              }
            }} style={{
              padding: '10px 20px', background: '#007bff', color: 'white',
              border: 'none', borderRadius: '6px', cursor: 'pointer',
              fontWeight: 'bold', fontSize: '14px'
            }}>
              Find Hospital
            </button>
          </div>
        </div>
      ))}

      {/* SMS Alert */}
      <div style={{
        background: 'white', padding: '20px', borderRadius: '12px',
        marginBottom: '20px', border: '2px solid #667eea',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ color: '#667eea', marginTop: 0 }}>SMS / WhatsApp Alert Bhejein</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
          <input
            type="tel"
            value={smsNumber}
            onChange={(e) => setSmsNumber(e.target.value)}
            placeholder="Phone number (e.g. 9876543210)"
            style={{
              flex: 1, padding: '12px', fontSize: '16px',
              borderRadius: '8px', border: '2px solid #667eea',
              outline: 'none', minWidth: '200px'
            }}
          />
          <button onClick={() => sendSmsAlert(smsNumber, latestAssessment)} style={{
            padding: '12px 25px', background: '#667eea', color: 'white',
            border: 'none', borderRadius: '8px', cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            Send SMS
          </button>
          <button onClick={() => shareOnWhatsApp(smsNumber ? `91${smsNumber}` : '', latestAssessment)} style={{
            padding: '12px 25px', background: '#25D366', color: 'white',
            border: 'none', borderRadius: '8px', cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            WhatsApp
          </button>
        </div>

        {/* Quick Numbers */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { label: 'Ambulance 108', number: '108' },
            { label: 'Emergency 112', number: '112' },
            { label: 'Mother/Child 102', number: '102' },
            { label: 'Child Helpline 1098', number: '1098' }
          ].map((item, i) => (
            <button key={i} onClick={() => window.open(`tel:${item.number}`, '_self')} style={{
              padding: '8px 15px', background: '#dc354510',
              border: '1px solid #dc3545', borderRadius: '20px',
              cursor: 'pointer', fontSize: '13px', color: '#dc3545',
              fontWeight: 'bold'
            }}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Nearby Facilities - Data Share */}
      {nearbyFacilities.length > 0 && (
        <div style={{
          background: 'white', padding: '20px', borderRadius: '12px',
          marginBottom: '20px', border: '2px solid #e91e63',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#e91e63', marginTop: 0 }}>
            Nearby Facilities - Data Share
          </h3>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
            SAM/Emergency hone par in facilities ko bachche ka data auto-share hoga
          </p>

          {nearbyFacilities.map((facility, index) => (
            <div key={facility.id} style={{
              padding: '15px', borderRadius: '10px', marginBottom: '10px',
              border: `2px solid ${facility.color}`,
              background: shareStatus[facility.id] === 'shared' ? `${facility.color}10` : 'white',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexWrap: 'wrap', gap: '10px'
            }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    padding: '3px 10px', background: `${facility.color}15`,
                    color: facility.color, borderRadius: '10px',
                    fontSize: '11px', fontWeight: 'bold'
                  }}>
                    {facility.typeLabel}
                  </span>
                  <span style={{ fontSize: '13px', color: '#666' }}>
                    {facility.distance} km
                  </span>
                  {shareStatus[facility.id] === 'shared' && (
                    <span style={{
                      padding: '2px 8px', background: '#28a745',
                      color: 'white', borderRadius: '10px',
                      fontSize: '10px', fontWeight: 'bold'
                    }}>
                      SHARED
                    </span>
                  )}
                </div>
                <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', fontSize: '15px' }}>
                  {index + 1}. {facility.name}
                </p>
                {facility.phone && (
                  <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#666' }}>
                    Phone: {facility.phone}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button onClick={() => shareToFacility(facility, latestAssessment)} style={{
                  padding: '8px 15px',
                  background: shareStatus[facility.id] === 'shared' ? '#28a745' : '#e91e63',
                  color: 'white', border: 'none', borderRadius: '6px',
                  cursor: 'pointer', fontWeight: 'bold', fontSize: '12px'
                }}>
                  {shareStatus[facility.id] === 'shared' ? 'Shared' : 'Share Data'}
                </button>
                {facility.phone && (
                  <button onClick={() => window.open(`tel:${facility.phone}`, '_self')} style={{
                    padding: '8px 15px', background: '#dc3545',
                    color: 'white', border: 'none', borderRadius: '6px',
                    cursor: 'pointer', fontWeight: 'bold', fontSize: '12px'
                  }}>
                    Call
                  </button>
                )}
                <button onClick={() => {
                  window.open(`https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${facility.lat},${facility.lng}`, '_blank');
                }} style={{
                  padding: '8px 15px', background: '#007bff',
                  color: 'white', border: 'none', borderRadius: '6px',
                  cursor: 'pointer', fontWeight: 'bold', fontSize: '12px'
                }}>
                  Directions
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share History */}
      {sharedData.length > 0 && (
        <div style={{
          background: 'white', padding: '20px', borderRadius: '12px',
          marginBottom: '20px', border: '1px solid #ddd',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ color: '#333', marginTop: 0 }}>Share History</h3>
          {sharedData.slice(0, 5).map((share, i) => (
            <div key={i} style={{
              padding: '10px', borderRadius: '8px', marginBottom: '8px',
              background: '#f8f9fa', border: '1px solid #e0e0e0'
            }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#333' }}>
                <strong>{new Date(share.timestamp).toLocaleString()}</strong>
              </p>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#666' }}>
                Severity: {share.childData?.severity || share.severity || 'N/A'} | 
                Shared with: {share.facility?.name || share.sharedWith?.map(f => f.name).join(', ') || 'N/A'}
              </p>
            </div>
          ))}

          <button onClick={() => {
            localStorage.removeItem('sharedAlerts');
            setSharedData([]);
          }} style={{
            marginTop: '10px', padding: '8px 20px',
            background: '#dc3545', color: 'white',
            border: 'none', borderRadius: '6px',
            cursor: 'pointer', fontSize: '13px'
          }}>
            Clear History
          </button>
        </div>
      )}

      {/* Assessment History */}
      {assessments.length > 0 && (
        <div style={{
          background: 'white', padding: '20px', borderRadius: '12px',
          border: '1px solid #ddd', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ color: '#333', marginTop: 0 }}>Assessment History</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#667eea', color: 'white' }}>
                  <th style={{ padding: '10px' }}>Date</th>
                  <th style={{ padding: '10px' }}>Severity</th>
                  <th style={{ padding: '10px' }}>MUAC</th>
                  <th style={{ padding: '10px' }}>Weight</th>
                  <th style={{ padding: '10px' }}>Height</th>
                </tr>
              </thead>
              <tbody>
                {assessments.slice(0, 10).map((a, i) => (
                  <tr key={i} style={{
                    borderBottom: '1px solid #eee',
                    background: a.severity === 'SAM' ? '#f8d7da' : a.severity === 'MAM' ? '#fff3cd' : '#d4edda'
                  }}>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      {new Date(a.date).toLocaleDateString()}
                    </td>
                    <td style={{
                      padding: '8px', textAlign: 'center', fontWeight: 'bold',
                      color: a.severity === 'SAM' ? '#dc3545' : a.severity === 'MAM' ? '#fd7e14' : '#28a745'
                    }}>
                      {a.severity}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>{a.muac} cm</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>{a.weight} kg</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>{a.height} cm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(220, 53, 69, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
        }
      `}</style>
    </div>
  );
}

export default AlertSystem;