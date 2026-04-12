import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AlertSystem({ userId }) {
  const [assessments, setAssessments] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [nearbyFacilities, setNearbyFacilities] = useState([]);
  const [facilityLoading, setFacilityLoading] = useState(false);
  const [sharedData, setSharedData] = useState([]);
  const [autoShareEnabled, setAutoShareEnabled] = useState(true);
  const [manualLocation, setManualLocation] = useState('');
  const [searchMethod, setSearchMethod] = useState('gps');
  const [smsNumber, setSmsNumber] = useState('');
  const [shareStatus, setShareStatus] = useState({});
  const [searchRadius, setSearchRadius] = useState(10000);
  const [facilityFilter, setFacilityFilter] = useState('all');

  // Load data
  useEffect(() => {
    loadUserInfo();
    loadAssessments();
    getLocation();
    const existing = JSON.parse(localStorage.getItem('sharedAlerts') || '[]');
    setSharedData(existing);
  }, [userId]);

  // User info load
  const loadUserInfo = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/user/${userId}`);
      setUserInfo(response.data);
      if (response.data.phone) {
        setSmsNumber(response.data.phone);
      }
    } catch (err) {
      console.error('User info error:', err);
    }
  };

  // Assessments load
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
      console.error('Assessment error:', err);
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
          getLocationName(loc.lat, loc.lng);
          searchNearbyFacilities(loc.lat, loc.lng);
        },
        (err) => console.error('Location error:', err),
        { enableHighAccuracy: true, timeout: 15000 }
      );
    }
  };

  // Reverse Geocoding
  const getLocationName = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=hi,en`
      );
      const data = await response.json();
      if (data?.display_name) setLocationName(data.display_name);
    } catch (err) {}
  };

  // Manual Location Search
  const searchByManualLocation = async () => {
    if (!manualLocation.trim()) return;
    setFacilityLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualLocation)}&limit=1`
      );
      const data = await response.json();
      if (data?.length > 0) {
        const loc = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        setUserLocation(loc);
        setLocationName(data[0].display_name);
        searchNearbyFacilities(loc.lat, loc.lng);
      }
    } catch (err) {}
    setFacilityLoading(false);
  };

  // Nearby facilities search
  const searchNearbyFacilities = async (lat, lng) => {
    setFacilityLoading(true);
    try {
      const query = `
        [out:json][timeout:30];
        (
          node["amenity"="hospital"](around:${searchRadius},${lat},${lng});
          way["amenity"="hospital"](around:${searchRadius},${lat},${lng});
          node["amenity"="clinic"](around:${searchRadius},${lat},${lng});
          way["amenity"="clinic"](around:${searchRadius},${lat},${lng});
          node["amenity"="doctors"](around:${searchRadius},${lat},${lng});
          node["name"~"anganwadi|aanganwadi|आंगनवाड़ी|icds",i](around:${searchRadius},${lat},${lng});
          way["name"~"anganwadi|aanganwadi|आंगनवाड़ी|icds",i](around:${searchRadius},${lat},${lng});
          node["name"~"PHC|primary health|CHC|community health",i](around:${searchRadius},${lat},${lng});
          way["name"~"PHC|primary health|CHC|community health",i](around:${searchRadius},${lat},${lng});
          node["name"~"NRC|nutrition rehabilitation|पोषण पुनर्वास",i](around:${searchRadius},${lat},${lng});
          way["name"~"NRC|nutrition rehabilitation|पोषण पुनर्वास",i](around:${searchRadius},${lat},${lng});
          node["amenity"="social_facility"](around:${searchRadius},${lat},${lng});
          node["healthcare"="centre"](around:${searchRadius},${lat},${lng});
          way["healthcare"="centre"](around:${searchRadius},${lat},${lng});
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
            const cat = detectCategory(name, el.tags);
            return {
              id: el.id,
              name: name || cat.label,
              ...cat,
              lat: fLat, lng: fLng,
              distance: calculateDistance(lat, lng, fLat, fLng),
              phone: el.tags?.phone || el.tags?.['contact:phone'] || '',
              address: el.tags?.['addr:full'] || el.tags?.['addr:street'] || ''
            };
          })
          .filter(f => f !== null)
          .sort((a, b) => a.distance - b.distance);
        setNearbyFacilities(facilities);
      }
    } catch (err) {}
    setFacilityLoading(false);
  };

  // Category detect
  const detectCategory = (name, tags) => {
    const n = (name || '').toLowerCase();
    const a = (tags?.amenity || '').toLowerCase();
    if (n.includes('anganwadi') || n.includes('icds') || n.includes('आंगनवाड़ी'))
      return { type: 'anganwadi', label: 'Anganwadi', color: '#e91e63', icon: '👶' };
    if (n.includes('nrc') || n.includes('nutrition'))
      return { type: 'nrc', label: 'NRC', color: '#ff5722', icon: '🍼' };
    if (n.includes('phc') || n.includes('primary health'))
      return { type: 'phc', label: 'PHC', color: '#2196f3', icon: '🏨' };
    if (n.includes('chc') || n.includes('community health'))
      return { type: 'chc', label: 'CHC', color: '#009688', icon: '🏥' };
    if (a === 'hospital') return { type: 'hospital', label: 'Hospital', color: '#667eea', icon: '🏥' };
    if (a === 'clinic') return { type: 'clinic', label: 'Clinic', color: '#28a745', icon: '🩺' };
    if (a === 'doctors') return { type: 'doctor', label: 'Doctor', color: '#17a2b8', icon: '👨‍⚕️' };
    return { type: 'other', label: 'Health Centre', color: '#6c757d', icon: '🏥' };
  };

  // Distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return Math.round(2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 100) / 100;
  };

  // Generate Alerts
  const generateAlerts = (data) => {
    const alertList = [];
    const samList = data.filter(a => a.severity === 'SAM');
    const mamList = data.filter(a => a.severity === 'MAM');
    const latest = data[0];

    if (latest?.severity === 'SAM') {
      alertList.push({
        id: 'sam', type: 'CRITICAL', color: '#dc3545', icon: '🚨',
        title: 'CRITICAL: SAM Detected',
        titleHi: 'गंभीर: SAM पाया गया - तुरंत अस्पताल जाएं',
        message: 'Bachche ko turant NRC/Hospital le jaayein.',
        autoShare: true, assessment: latest
      });
    }

    if (samList.length >= 2) {
      alertList.push({
        id: 'sam_repeat', type: 'REPEAT_SAM', color: '#b71c1c', icon: '🆘',
        title: `REPEAT SAM: ${samList.length} times detected`,
        titleHi: `${samList.length} बार SAM पाया गया - हालत गंभीर`,
        message: 'Data auto-share ho raha hai.',
        autoShare: true
      });
    }

    if (latest?.severity === 'MAM') {
      alertList.push({
        id: 'mam', type: 'WARNING', color: '#ff9800', icon: '⚠️',
        title: 'WARNING: MAM Detected',
        titleHi: 'चेतावनी: MAM पाया गया - पोषण में सुधार करें',
        message: 'Anganwadi/ICDS se sampark karein.',
        autoShare: false, assessment: latest
      });
    }

    if (mamList.length >= 2) {
      alertList.push({
        id: 'mam_repeat', type: 'REPEAT_MAM', color: '#e65100', icon: '🔔',
        title: `REPEAT MAM: ${mamList.length} times detected`,
        titleHi: `${mamList.length} बार MAM - Doctor se milein`,
        message: 'Improvement nahi ho raha.',
        autoShare: false
      });
    }

    const edemaList = data.filter(a => a.edema === 'yes');
    if (edemaList.length > 0) {
      alertList.push({
        id: 'edema', type: 'EDEMA', color: '#9c27b0', icon: '💧',
        title: 'EDEMA Detected',
        titleHi: 'एडीमा (सूजन) पाया गया - SAM का लक्षण',
        message: 'Turant medical help lein.',
        autoShare: true
      });
    }

    if (latest?.severity === 'NORMAL' && alertList.length === 0) {
      alertList.push({
        id: 'normal', type: 'NORMAL', color: '#4caf50', icon: '✅',
        title: 'All Normal',
        titleHi: 'सब सामान्य - बच्चा स्वस्थ है',
        message: 'Poshan jaari rakhein.',
        autoShare: false
      });
    }

    setAlerts(alertList);

    // Auto SMS on SAM/MAM
    if (latest && (latest.severity === 'SAM' || latest.severity === 'MAM')) {
      autoSendSMS(latest);
    }
  };

  // Auto SMS to registered number
  const autoSendSMS = (assessment) => {
    const phone = userInfo?.phone || smsNumber;
    if (!phone) return;

    const alreadySent = localStorage.getItem(`sms_sent_${assessment.id}`);
    if (alreadySent) return;

    localStorage.setItem(`sms_sent_${assessment.id}`, 'true');

    const msg = `ALERT: Child Malnutrition\nSeverity: ${assessment.severity}\nHeight: ${assessment.height}cm\nWeight: ${assessment.weight}kg\nMUAC: ${assessment.muac}cm\nAction: ${assessment.severity === 'SAM' ? 'Turant hospital jaayein' : 'Poshan sudharein'}\nLocation: ${userLocation ? `maps.google.com/?q=${userLocation.lat},${userLocation.lng}` : 'N/A'}`;

    // Try to open SMS app
    try {
      window.open(`sms:${phone}?body=${encodeURIComponent(msg)}`, '_self');
    } catch (err) {}
  };

  // Manual SMS
  const sendSMS = (number, assessment) => {
    if (!number || !assessment) return;
    const msg = `ALERT: Child Malnutrition\nSeverity: ${assessment.severity}\nHeight: ${assessment.height}cm\nWeight: ${assessment.weight}kg\nMUAC: ${assessment.muac}cm\nBMI: ${assessment.bmi}\nEdema: ${assessment.edema}\nLocation: ${userLocation ? `maps.google.com/?q=${userLocation.lat},${userLocation.lng}` : 'N/A'}`;
    window.open(`sms:${number}?body=${encodeURIComponent(msg)}`, '_self');
  };

  // WhatsApp share
  const shareWhatsApp = (number, assessment) => {
    if (!assessment) return;
    const msg = `*ALERT: Child Malnutrition*\n\n*Severity:* ${assessment.severity}\n*Height:* ${assessment.height} cm\n*Weight:* ${assessment.weight} kg\n*MUAC:* ${assessment.muac} cm\n*BMI:* ${assessment.bmi}\n*Edema:* ${assessment.edema}\n\n*Location:* ${userLocation ? `https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}` : 'N/A'}\n\nPlease take action.`;
    const url = number ? `https://wa.me/91${number}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Share to facility
  const shareToFacility = (facility) => {
    const latest = assessments[0];
    if (!latest) return;
    const shareData = {
      timestamp: new Date().toISOString(),
      facility: { name: facility.name, type: facility.label, phone: facility.phone, distance: facility.distance },
      childData: { height: latest.height, weight: latest.weight, muac: latest.muac, severity: latest.severity, edema: latest.edema, bmi: latest.bmi },
      location: userLocation
    };
    const existing = JSON.parse(localStorage.getItem('sharedAlerts') || '[]');
    existing.unshift(shareData);
    localStorage.setItem('sharedAlerts', JSON.stringify(existing.slice(0, 20)));
    setSharedData(existing.slice(0, 20));
    setShareStatus(prev => ({ ...prev, [facility.id]: 'shared' }));

    if (facility.phone) {
      sendSMS(facility.phone, latest);
    }

    alert(`Data shared with ${facility.name}\nSeverity: ${latest.severity}\nAlso sending SMS...`);
  };

  // Diet Plans
  const getDietPlan = (severity) => {
    if (severity === 'SAM') {
      return {
        urban: {
          title: 'SAM - Urban Diet Plan',
          titleHi: 'SAM - शहरी डाइट प्लान',
          meals: [
            { time: 'सुबह 7:00', meal: 'दूध + केला + अंडा', mealEn: 'Milk + Banana + Egg' },
            { time: 'सुबह 10:00', meal: 'F-100 (Therapeutic milk)', mealEn: 'F-100 Therapeutic Milk' },
            { time: 'दोपहर 12:30', meal: 'खिचड़ी + दाल + घी + सब्जी', mealEn: 'Khichdi + Dal + Ghee + Vegetables' },
            { time: 'दोपहर 3:00', meal: 'RUTF (Ready-to-use therapeutic food)', mealEn: 'RUTF Packet' },
            { time: 'शाम 5:00', meal: 'फल + बिस्कुट + दूध', mealEn: 'Fruits + Biscuit + Milk' },
            { time: 'रात 7:30', meal: 'रोटी + दाल + पनीर + घी', mealEn: 'Roti + Dal + Paneer + Ghee' },
            { time: 'रात 9:00', meal: 'गर्म दूध + हल्दी', mealEn: 'Warm Milk + Turmeric' }
          ],
          tips: [
            'हर 2-3 घंटे में खिलाएं',
            'RUTF/F-100 NRC से लें',
            'ORS देते रहें',
            'डॉक्टर की दवाई समय पर दें'
          ]
        },
        rural: {
          title: 'SAM - Rural/Village Diet Plan',
          titleHi: 'SAM - ग्रामीण/गाँव डाइट प्लान',
          meals: [
            { time: 'सुबह 7:00', meal: 'दूध + गुड़ + सत्तू', mealEn: 'Milk + Jaggery + Sattu' },
            { time: 'सुबह 10:00', meal: 'मूंगफली + गुड़ के लड्डू', mealEn: 'Peanut + Jaggery Laddu' },
            { time: 'दोपहर 12:30', meal: 'दाल-चावल + घी + हरी सब्जी', mealEn: 'Dal-Rice + Ghee + Green Vegetables' },
            { time: 'दोपहर 3:00', meal: 'सत्तू + गुड़ + दूध', mealEn: 'Sattu + Jaggery + Milk' },
            { time: 'शाम 5:00', meal: 'चना + गुड़ + मौसमी फल', mealEn: 'Chana + Jaggery + Seasonal Fruit' },
            { time: 'रात 7:30', meal: 'रोटी + दाल + हरी सब्जी + घी', mealEn: 'Roti + Dal + Greens + Ghee' },
            { time: 'रात 9:00', meal: 'गर्म दूध + हल्दी + गुड़', mealEn: 'Warm Milk + Turmeric + Jaggery' }
          ],
          tips: [
            'घर का बना खाना ही दें',
            'मूंगफली, तिल, गुड़ ज़रूर दें',
            'आंगनवाड़ी से Take Home Ration लें',
            'ICDS का पोषाहार लें'
          ]
        }
      };
    }
    if (severity === 'MAM') {
      return {
        urban: {
          title: 'MAM - Urban Diet Plan',
          titleHi: 'MAM - शहरी डाइट प्लान',
          meals: [
            { time: 'सुबह 7:00', meal: 'दूध + दलिया + फल', mealEn: 'Milk + Porridge + Fruit' },
            { time: 'सुबह 10:00', meal: 'अंडा/पनीर + ब्रेड', mealEn: 'Egg/Paneer + Bread' },
            { time: 'दोपहर 12:30', meal: 'चावल + दाल + सब्जी + दही', mealEn: 'Rice + Dal + Vegetable + Curd' },
            { time: 'शाम 4:00', meal: 'फल + दूध + बिस्कुट', mealEn: 'Fruit + Milk + Biscuit' },
            { time: 'रात 7:30', meal: 'रोटी + सब्जी + दाल', mealEn: 'Roti + Vegetable + Dal' }
          ],
          tips: [
            'दिन में 5 बार खिलाएं',
            'प्रोटीन ज़्यादा दें',
            'हर खाने में घी/तेल डालें',
            'फल रोज़ दें'
          ]
        },
        rural: {
          title: 'MAM - Rural/Village Diet Plan',
          titleHi: 'MAM - ग्रामीण/गाँव डाइट प्लान',
          meals: [
            { time: 'सुबह 7:00', meal: 'दूध + रोटी + गुड़', mealEn: 'Milk + Roti + Jaggery' },
            { time: 'सुबह 10:00', meal: 'सत्तू + गुड़', mealEn: 'Sattu + Jaggery' },
            { time: 'दोपहर 12:30', meal: 'दाल-चावल + साग + घी', mealEn: 'Dal-Rice + Greens + Ghee' },
            { time: 'शाम 4:00', meal: 'मूंगफली + चना + गुड़', mealEn: 'Peanut + Chana + Jaggery' },
            { time: 'रात 7:30', meal: 'रोटी + दाल + सब्जी', mealEn: 'Roti + Dal + Vegetable' }
          ],
          tips: [
            'आंगनवाड़ी का पोषाहार लें',
            'घर के बगीचे से सब्जी उगाएं',
            'दूध ज़रूर दें',
            'गुड़, मूंगफली, तिल रोज़ दें'
          ]
        }
      };
    }
    return null;
  };

  // Filtered facilities
  const getFilteredFacilities = () => {
    if (facilityFilter === 'all') return nearbyFacilities;
    return nearbyFacilities.filter(f => f.type === facilityFilter);
  };

  const getFacilityCount = (type) => {
    if (type === 'all') return nearbyFacilities.length;
    return nearbyFacilities.filter(f => f.type === type).length;
  };

  const latest = assessments[0];
  const dietPlan = latest ? getDietPlan(latest.severity) : null;

  const popularCities = [
    'Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Lucknow',
    'Jaipur', 'Patna', 'Bhopal', 'Ranchi', 'Varanasi'
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p style={{ fontSize: '18px', color: '#667eea' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '10px' }}>
      <h2 style={{ color: '#667eea', marginBottom: '5px' }}>Alert and Action Centre</h2>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
        Alerts + Diet Plan + Hospital/Anganwadi + SMS - Sab ek jagah
      </p>

      {/* ===== SECTION 1: EMERGENCY ===== */}
      <div style={{
        background: 'linear-gradient(135deg, #dc3545, #c82333)',
        padding: '20px', borderRadius: '12px', marginBottom: '20px',
        textAlign: 'center', color: 'white'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Emergency Helpline</h3>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { l: '108 Ambulance', n: '108' },
            { l: '112 Emergency', n: '112' },
            { l: '102 Mother/Child', n: '102' },
            { l: '1098 Child', n: '1098' }
          ].map((h, i) => (
            <button key={i} onClick={() => window.open(`tel:${h.n}`, '_self')} style={{
              padding: '10px 18px', fontSize: '14px', fontWeight: 'bold',
              background: 'white', color: '#dc3545', border: 'none',
              borderRadius: '8px', cursor: 'pointer'
            }}>{h.l}</button>
          ))}
        </div>
      </div>

      {/* ===== SECTION 2: AUTO SHARE TOGGLE ===== */}
      <div style={{
        background: autoShareEnabled ? '#d4edda' : '#f8d7da',
        padding: '15px', borderRadius: '12px', marginBottom: '20px',
        border: `2px solid ${autoShareEnabled ? '#28a745' : '#dc3545'}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'
      }}>
        <div>
          <p style={{ margin: 0, fontWeight: 'bold' }}>
            Auto Alert and Share: {autoShareEnabled ? 'ON' : 'OFF'}
          </p>
          <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#666' }}>
            SAM/MAM par registered number pe SMS + nearest facility ko data share
          </p>
        </div>
        <button onClick={() => setAutoShareEnabled(!autoShareEnabled)} style={{
          padding: '8px 20px', background: autoShareEnabled ? '#dc3545' : '#28a745',
          color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
        }}>{autoShareEnabled ? 'Turn OFF' : 'Turn ON'}</button>
      </div>

      {/* ===== SECTION 3: ALERTS ===== */}
      {alerts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '30px', background: '#f8f9fa', borderRadius: '12px', marginBottom: '20px' }}>
          <p style={{ fontSize: '16px', color: '#666' }}>Koi alert nahi. Pehle Data Entry mein assessment karein.</p>
        </div>
      )}

      {alerts.map((alert) => (
        <div key={alert.id} style={{
          background: `${alert.color}08`, padding: '20px', borderRadius: '12px',
          marginBottom: '15px', border: `3px solid ${alert.color}`,
          boxShadow: alert.type === 'CRITICAL' ? `0 4px 20px ${alert.color}40` : 'none',
          animation: alert.type === 'CRITICAL' ? 'pulse 2s infinite' : 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ fontSize: '28px' }}>{alert.icon}</span>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, color: alert.color, fontSize: '16px' }}>{alert.title}</h3>
              <p style={{ margin: '3px 0 0 0', fontSize: '14px', color: '#333' }}>{alert.titleHi}</p>
            </div>
            <span style={{
              padding: '4px 12px', borderRadius: '15px', background: alert.color,
              color: 'white', fontSize: '11px', fontWeight: 'bold'
            }}>{alert.type}</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(alert.type === 'CRITICAL' || alert.type === 'REPEAT_SAM' || alert.type === 'EDEMA') && (
              <>
                <button onClick={() => window.open('tel:108', '_self')} style={{
                  padding: '8px 16px', background: '#dc3545', color: 'white',
                  border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'
                }}>Call 108</button>
                <button onClick={() => shareWhatsApp(smsNumber, latest)} style={{
                  padding: '8px 16px', background: '#25D366', color: 'white',
                  border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'
                }}>WhatsApp</button>
                <button onClick={() => sendSMS(smsNumber, latest)} style={{
                  padding: '8px 16px', background: '#667eea', color: 'white',
                  border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'
                }}>Send SMS</button>
              </>
            )}
          </div>
        </div>
      ))}

      {/* ===== SECTION 4: SMS/WHATSAPP ===== */}
      <div style={{
        background: 'white', padding: '20px', borderRadius: '12px',
        marginBottom: '20px', border: '2px solid #667eea'
      }}>
        <h3 style={{ color: '#667eea', marginTop: 0 }}>SMS / WhatsApp Alert</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
          <input type="tel" value={smsNumber} onChange={(e) => setSmsNumber(e.target.value)}
            placeholder="Phone number" style={{
              flex: 1, padding: '12px', fontSize: '16px', borderRadius: '8px',
              border: '2px solid #667eea', outline: 'none', minWidth: '180px'
            }} />
          <button onClick={() => sendSMS(smsNumber, latest)} style={{
            padding: '12px 20px', background: '#667eea', color: 'white',
            border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
          }}>SMS</button>
          <button onClick={() => shareWhatsApp(smsNumber, latest)} style={{
            padding: '12px 20px', background: '#25D366', color: 'white',
            border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
          }}>WhatsApp</button>
        </div>
        {userInfo?.phone && (
          <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
            Registered Number: {userInfo.phone}
          </p>
        )}
      </div>

      {/* ===== SECTION 5: DIET PLAN ===== */}
      {dietPlan && (
        <div style={{
          background: 'white', padding: '20px', borderRadius: '12px',
          marginBottom: '20px', border: `2px solid ${latest.severity === 'SAM' ? '#dc3545' : '#ff9800'}`
        }}>
          <h3 style={{ color: latest.severity === 'SAM' ? '#dc3545' : '#ff9800', marginTop: 0 }}>
            Diet Plan - {latest.severity}
          </h3>

          {/* Urban Diet */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#007bff', margin: '0 0 10px 0' }}>
              {dietPlan.urban.titleHi}
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#007bff', color: 'white' }}>
                    <th style={{ padding: '8px' }}>Time</th>
                    <th style={{ padding: '8px' }}>Meal (Hindi)</th>
                    <th style={{ padding: '8px' }}>Meal (English)</th>
                  </tr>
                </thead>
                <tbody>
                  {dietPlan.urban.meals.map((m, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px', fontWeight: 'bold', textAlign: 'center' }}>{m.time}</td>
                      <td style={{ padding: '8px' }}>{m.meal}</td>
                      <td style={{ padding: '8px', color: '#666' }}>{m.mealEn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ background: '#e7f3ff', padding: '10px', borderRadius: '8px', marginTop: '10px' }}>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '13px', color: '#004085' }}>Tips:</p>
              {dietPlan.urban.tips.map((tip, i) => (
                <p key={i} style={{ margin: '3px 0', fontSize: '12px', color: '#004085' }}>- {tip}</p>
              ))}
            </div>
          </div>

          {/* Rural Diet */}
          <div>
            <h4 style={{ color: '#28a745', margin: '0 0 10px 0' }}>
              {dietPlan.rural.titleHi}
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#28a745', color: 'white' }}>
                    <th style={{ padding: '8px' }}>Time</th>
                    <th style={{ padding: '8px' }}>Meal (Hindi)</th>
                    <th style={{ padding: '8px' }}>Meal (English)</th>
                  </tr>
                </thead>
                <tbody>
                  {dietPlan.rural.meals.map((m, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px', fontWeight: 'bold', textAlign: 'center' }}>{m.time}</td>
                      <td style={{ padding: '8px' }}>{m.meal}</td>
                      <td style={{ padding: '8px', color: '#666' }}>{m.mealEn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ background: '#e8f5e9', padding: '10px', borderRadius: '8px', marginTop: '10px' }}>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '13px', color: '#155724' }}>Tips:</p>
              {dietPlan.rural.tips.map((tip, i) => (
                <p key={i} style={{ margin: '3px 0', fontSize: '12px', color: '#155724' }}>- {tip}</p>
              ))}
            </div>
          </div>

          {/* Share Diet Plan */}
          <div style={{ marginTop: '15px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => {
              const msg = `*${latest.severity} Diet Plan*\n\n*Urban:*\n${dietPlan.urban.meals.map(m => `${m.time}: ${m.meal}`).join('\n')}\n\n*Rural:*\n${dietPlan.rural.meals.map(m => `${m.time}: ${m.meal}`).join('\n')}`;
              const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
              window.open(url, '_blank');
            }} style={{
              padding: '10px 20px', background: '#25D366', color: 'white',
              border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
            }}>Share Diet Plan on WhatsApp</button>
          </div>
        </div>
      )}

      {/* ===== SECTION 6: HOSPITAL/ANGANWADI FINDER ===== */}
      <div style={{
        background: 'white', padding: '20px', borderRadius: '12px',
        marginBottom: '20px', border: '2px solid #e91e63'
      }}>
        <h3 style={{ color: '#e91e63', marginTop: 0 }}>Nearest Hospital and Anganwadi</h3>

        {/* Location Method */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button onClick={() => { setSearchMethod('gps'); getLocation(); }} style={{
            flex: 1, padding: '12px', borderRadius: '8px', cursor: 'pointer',
            border: searchMethod === 'gps' ? '3px solid #667eea' : '1px solid #ccc',
            background: searchMethod === 'gps' ? '#667eea' : 'white',
            color: searchMethod === 'gps' ? 'white' : '#333',
            fontWeight: 'bold', fontSize: '14px'
          }}>GPS (Auto)</button>
          <button onClick={() => setSearchMethod('manual')} style={{
            flex: 1, padding: '12px', borderRadius: '8px', cursor: 'pointer',
            border: searchMethod === 'manual' ? '3px solid #28a745' : '1px solid #ccc',
            background: searchMethod === 'manual' ? '#28a745' : 'white',
            color: searchMethod === 'manual' ? 'white' : '#333',
            fontWeight: 'bold', fontSize: '14px'
          }}>Manual (Type)</button>
        </div>

        {/* Manual Search */}
        {searchMethod === 'manual' && (
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input type="text" value={manualLocation} onChange={(e) => setManualLocation(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') searchByManualLocation(); }}
                placeholder="City/Area/Village likhein..."
                style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '2px solid #28a745', outline: 'none' }} />
              <button onClick={searchByManualLocation} style={{
                padding: '10px 20px', background: '#28a745', color: 'white',
                border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
              }}>Search</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {popularCities.map((c, i) => (
                <button key={i} onClick={() => { setManualLocation(c); }} style={{
                  padding: '4px 10px', background: manualLocation === c ? '#28a745' : '#f8f9fa',
                  color: manualLocation === c ? 'white' : '#333',
                  border: '1px solid #28a745', borderRadius: '15px',
                  cursor: 'pointer', fontSize: '11px'
                }}>{c}</button>
              ))}
            </div>
          </div>
        )}

        {/* Location Info */}
        {locationName && (
          <div style={{ background: '#d4edda', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#155724' }}>Location: {locationName}</p>
          </div>
        )}

        {/* Radius */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap' }}>
          <label style={{ fontWeight: 'bold', fontSize: '13px' }}>Radius:</label>
          <select value={searchRadius} onChange={(e) => {
            setSearchRadius(parseInt(e.target.value));
            if (userLocation) searchNearbyFacilities(userLocation.lat, userLocation.lng);
          }} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}>
            <option value={5000}>5 KM</option>
            <option value={10000}>10 KM</option>
            <option value={20000}>20 KM</option>
            <option value={50000}>50 KM</option>
          </select>
          {userLocation && (
            <button onClick={() => searchNearbyFacilities(userLocation.lat, userLocation.lng)} style={{
              padding: '6px 15px', background: '#667eea', color: 'white',
              border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px'
            }}>Refresh</button>
          )}
        </div>

        {/* Filter */}
        {nearbyFacilities.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '15px' }}>
            {[
              { type: 'all', label: 'All', color: '#667eea' },
              { type: 'hospital', label: 'Hospital', color: '#667eea' },
              { type: 'anganwadi', label: 'Anganwadi', color: '#e91e63' },
              { type: 'nrc', label: 'NRC', color: '#ff5722' },
              { type: 'phc', label: 'PHC', color: '#2196f3' },
              { type: 'clinic', label: 'Clinic', color: '#28a745' }
            ].map((cat, i) => {
              const count = getFacilityCount(cat.type);
              if (count === 0 && cat.type !== 'all') return null;
              return (
                <button key={i} onClick={() => setFacilityFilter(cat.type)} style={{
                  padding: '5px 12px', borderRadius: '15px', cursor: 'pointer',
                  border: facilityFilter === cat.type ? `2px solid ${cat.color}` : '1px solid #ddd',
                  background: facilityFilter === cat.type ? cat.color : 'white',
                  color: facilityFilter === cat.type ? 'white' : '#333',
                  fontSize: '12px', fontWeight: 'bold'
                }}>{cat.label} ({count})</button>
              );
            })}
          </div>
        )}

        {/* Loading */}
        {facilityLoading && <p style={{ textAlign: 'center', color: '#667eea' }}>Searching...</p>}

        {/* Map */}
        {userLocation && (
          <div style={{ borderRadius: '8px', overflow: 'hidden', marginBottom: '15px', border: '2px solid #667eea' }}>
            <iframe title="Map" width="100%" height="250" frameBorder="0"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${userLocation.lng - 0.04},${userLocation.lat - 0.04},${userLocation.lng + 0.04},${userLocation.lat + 0.04}&layer=mapnik&marker=${userLocation.lat},${userLocation.lng}`}
            />
          </div>
        )}

        {/* Facility List */}
        {getFilteredFacilities().map((f, i) => (
          <div key={f.id} style={{
            padding: '12px', borderRadius: '8px', marginBottom: '8px',
            border: `2px solid ${f.color}`,
            background: shareStatus[f.id] === 'shared' ? `${f.color}08` : 'white',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '8px'
          }}>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '18px' }}>{f.icon}</span>
                <span style={{
                  padding: '2px 8px', background: `${f.color}15`, color: f.color,
                  borderRadius: '8px', fontSize: '10px', fontWeight: 'bold'
                }}>{f.label}</span>
                <span style={{ fontSize: '12px', color: '#666' }}>{f.distance} km</span>
                {shareStatus[f.id] === 'shared' && (
                  <span style={{ padding: '2px 6px', background: '#28a745', color: 'white', borderRadius: '8px', fontSize: '9px' }}>SHARED</span>
                )}
              </div>
              <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '14px' }}>{i + 1}. {f.name}</p>
              {f.phone && <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#666' }}>Ph: {f.phone}</p>}
            </div>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              <button onClick={(e) => { e.stopPropagation(); shareToFacility(f); }} style={{
                padding: '6px 12px', background: shareStatus[f.id] === 'shared' ? '#28a745' : '#e91e63',
                color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold'
              }}>{shareStatus[f.id] === 'shared' ? 'Shared' : 'Share'}</button>
              {f.phone && (
                <button onClick={(e) => { e.stopPropagation(); window.open(`tel:${f.phone}`, '_self'); }} style={{
                  padding: '6px 12px', background: '#dc3545', color: 'white',
                  border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold'
                }}>Call</button>
              )}
              <button onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${f.lat},${f.lng}`, '_blank'); }} style={{
                padding: '6px 12px', background: '#007bff', color: 'white',
                border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold'
              }}>Directions</button>
            </div>
          </div>
        ))}

        {/* Google Maps Quick */}
        {userLocation && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '15px' }}>
            {[
              { l: 'Hospitals', q: 'hospital' },
              { l: 'Anganwadi', q: 'anganwadi' },
              { l: 'NRC', q: 'NRC+nutrition' },
              { l: 'PHC', q: 'PHC+primary+health' }
            ].map((item, i) => (
              <button key={i} onClick={() => window.open(`https://www.google.com/maps/search/${item.q}/@${userLocation.lat},${userLocation.lng},13z`, '_blank')} style={{
                padding: '8px 16px', background: '#667eea', color: 'white',
                border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'
              }}>{item.l} on Maps</button>
            ))}
          </div>
        )}
      </div>

      {/* ===== SECTION 7: ASSESSMENT HISTORY ===== */}
      {assessments.length > 0 && (
        <div style={{
          background: 'white', padding: '20px', borderRadius: '12px',
          border: '1px solid #ddd'
        }}>
          <h3 style={{ color: '#333', marginTop: 0 }}>Assessment History</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#667eea', color: 'white' }}>
                  <th style={{ padding: '8px' }}>Date</th>
                  <th style={{ padding: '8px' }}>Severity</th>
                  <th style={{ padding: '8px' }}>MUAC</th>
                  <th style={{ padding: '8px' }}>Weight</th>
                  <th style={{ padding: '8px' }}>Height</th>
                  <th style={{ padding: '8px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {assessments.slice(0, 10).map((a, i) => (
                  <tr key={i} style={{
                    borderBottom: '1px solid #eee',
                    background: a.severity === 'SAM' ? '#f8d7da' : a.severity === 'MAM' ? '#fff3cd' : '#d4edda'
                  }}>
                    <td style={{ padding: '6px', textAlign: 'center' }}>{new Date(a.date).toLocaleDateString()}</td>
                    <td style={{
                      padding: '6px', textAlign: 'center', fontWeight: 'bold',
                      color: a.severity === 'SAM' ? '#dc3545' : a.severity === 'MAM' ? '#fd7e14' : '#28a745'
                    }}>{a.severity}</td>
                    <td style={{ padding: '6px', textAlign: 'center' }}>{a.muac}</td>
                    <td style={{ padding: '6px', textAlign: 'center' }}>{a.weight}</td>
                    <td style={{ padding: '6px', textAlign: 'center' }}>{a.height}</td>
                    <td style={{ padding: '6px', textAlign: 'center' }}>
                      <button onClick={() => sendSMS(smsNumber, a)} style={{
                        padding: '3px 8px', background: '#667eea', color: 'white',
                        border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '10px'
                      }}>SMS</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(220,53,69,0.4); }
          70% { box-shadow: 0 0 0 15px rgba(220,53,69,0); }
          100% { box-shadow: 0 0 0 0 rgba(220,53,69,0); }
        }
      `}</style>
    </div>
  );
}

export default AlertSystem;