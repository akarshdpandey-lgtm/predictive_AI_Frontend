import React, { useState, useCallback } from 'react';

function HospitalFinder({ userId }) {
  const [userLocation, setUserLocation] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('pending');
  const [searchRadius, setSearchRadius] = useState(5000);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchMethod, setSearchMethod] = useState('gps');
  const [manualLocation, setManualLocation] = useState('');
  const [manualSearching, setManualSearching] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [searchType, setSearchType] = useState('all');

  // GPS Location
  const getLocation = useCallback(() => {
    setLoading(true);
    setError(null);
    setSearchMethod('gps');

    if (!navigator.geolocation) {
      setError('GPS support nahi hai. Manual location use karein.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setUserLocation(loc);
        setPermissionStatus('granted');
        setLoading(false);
        getLocationName(loc.lat, loc.lng);
        searchNearby(loc.lat, loc.lng);
      },
      (err) => {
        setLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setPermissionStatus('denied');
            setError('Location permission denied. Manual location use karein.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location unavailable. GPS on karein ya Manual use karein.');
            break;
          case err.TIMEOUT:
            setError('Location timeout. Retry karein ya Manual use karein.');
            break;
          default:
            setError('Location error. Manual location use karein.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  // Reverse Geocoding
  const getLocationName = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=hi,en`
      );
      const data = await response.json();
      if (data && data.display_name) {
        setLocationName(data.display_name);
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err);
    }
  };

  // Manual Location Search
  const searchByManualLocation = async () => {
    if (!manualLocation.trim()) {
      setError('Location ka naam likhein');
      return;
    }

    setManualSearching(true);
    setLoading(true);
    setError(null);
    setSearchMethod('manual');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualLocation)}&limit=1&accept-language=hi,en`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const loc = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          accuracy: 0
        };
        setUserLocation(loc);
        setLocationName(result.display_name);
        setPermissionStatus('granted');
        searchNearby(loc.lat, loc.lng);
      } else {
        setError(`"${manualLocation}" nahi mila. Sahi naam likhein.`);
        setLoading(false);
      }
    } catch (err) {
      setError('Search error. Internet check karein.');
      setLoading(false);
    }

    setManualSearching(false);
  };

  // Search Nearby - Hospital + Anganwadi + Clinic + PHC + NRC
  const searchNearby = async (lat, lng) => {
    setLoading(true);
    setError(null);
    try {
      const radiusInMeters = searchRadius;

      // Overpass API query - Hospital + Anganwadi + Clinic + PHC + NRC + Doctor
      const query = `
        [out:json][timeout:30];
        (
          node["amenity"="hospital"](around:${radiusInMeters},${lat},${lng});
          way["amenity"="hospital"](around:${radiusInMeters},${lat},${lng});
          node["amenity"="clinic"](around:${radiusInMeters},${lat},${lng});
          way["amenity"="clinic"](around:${radiusInMeters},${lat},${lng});
          node["amenity"="doctors"](around:${radiusInMeters},${lat},${lng});
          node["healthcare"="hospital"](around:${radiusInMeters},${lat},${lng});
          way["healthcare"="hospital"](around:${radiusInMeters},${lat},${lng});
          node["healthcare"="clinic"](around:${radiusInMeters},${lat},${lng});
          node["healthcare"="centre"](around:${radiusInMeters},${lat},${lng});
          way["healthcare"="centre"](around:${radiusInMeters},${lat},${lng});
          node["amenity"="social_facility"](around:${radiusInMeters},${lat},${lng});
          way["amenity"="social_facility"](around:${radiusInMeters},${lat},${lng});
          node["social_facility"="outreach"](around:${radiusInMeters},${lat},${lng});
          node["office"="government"]["name"~"anganwadi|aanganwadi|आंगनवाड़ी|anganbadi|icds",i](around:${radiusInMeters},${lat},${lng});
          way["office"="government"]["name"~"anganwadi|aanganwadi|आंगनवाड़ी|anganbadi|icds",i](around:${radiusInMeters},${lat},${lng});
          node["name"~"anganwadi|aanganwadi|आंगनवाड़ी|anganbadi|icds",i](around:${radiusInMeters},${lat},${lng});
          way["name"~"anganwadi|aanganwadi|आंगनवाड़ी|anganbadi|icds",i](around:${radiusInMeters},${lat},${lng});
          node["name"~"PHC|primary health|प्राथमिक स्वास्थ्य|CHC|community health",i](around:${radiusInMeters},${lat},${lng});
          way["name"~"PHC|primary health|प्राथमिक स्वास्थ्य|CHC|community health",i](around:${radiusInMeters},${lat},${lng});
          node["name"~"NRC|nutrition rehabilitation|पोषण पुनर्वास",i](around:${radiusInMeters},${lat},${lng});
          way["name"~"NRC|nutrition rehabilitation|पोषण पुनर्वास",i](around:${radiusInMeters},${lat},${lng});
          node["amenity"="childcare"](around:${radiusInMeters},${lat},${lng});
          way["amenity"="childcare"](around:${radiusInMeters},${lat},${lng});
        );
        out body center;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const data = await response.json();

      if (data.elements && data.elements.length > 0) {
        const resultList = data.elements
          .map((element, index) => {
            const itemLat = element.lat || element.center?.lat;
            const itemLng = element.lon || element.center?.lon;
            if (!itemLat || !itemLng) return null;

            const distance = calculateDistance(lat, lng, itemLat, itemLng);
            const name = element.tags?.name || element.tags?.['name:hi'] || element.tags?.['name:en'] || '';
            const category = detectCategory(name, element.tags);

            return {
              id: element.id || index,
              name: name || category.label,
              category: category.type,
              categoryLabel: category.label,
              categoryColor: category.color,
              categoryIcon: category.icon,
              lat: itemLat,
              lng: itemLng,
              distance: distance,
              address: element.tags?.['addr:full'] || element.tags?.['addr:street'] || element.tags?.['addr:city'] || '',
              phone: element.tags?.phone || element.tags?.['contact:phone'] || '',
              website: element.tags?.website || '',
              operator: element.tags?.operator || '',
              beds: element.tags?.beds || '',
              openingHours: element.tags?.opening_hours || '',
              description: element.tags?.description || ''
            };
          })
          .filter(h => h !== null)
          .sort((a, b) => a.distance - b.distance);

        setResults(resultList);

        if (resultList.length === 0) {
          setError('Is area mein kuch nahi mila. Radius badhakar try karein.');
        }
      } else {
        setResults([]);
        setError('Is area mein kuch nahi mila. Radius badhakar try karein.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Search error. Internet check karein.');
    }
    setLoading(false);
  };

  // Category Detect karo
  const detectCategory = (name, tags) => {
    const nameLower = (name || '').toLowerCase();
    const amenity = (tags?.amenity || '').toLowerCase();
    const healthcare = (tags?.healthcare || '').toLowerCase();

    // Anganwadi check
    if (nameLower.includes('anganwadi') || nameLower.includes('aanganwadi') || 
        nameLower.includes('आंगनवाड़ी') || nameLower.includes('anganbadi') ||
        nameLower.includes('icds')) {
      return { type: 'anganwadi', label: 'Anganwadi Centre', color: '#e91e63', icon: '👶' };
    }

    // NRC check
    if (nameLower.includes('nrc') || nameLower.includes('nutrition rehabilitation') ||
        nameLower.includes('पोषण पुनर्वास') || nameLower.includes('malnutrition')) {
      return { type: 'nrc', label: 'NRC Centre', color: '#ff5722', icon: '🍼' };
    }

    // PHC check
    if (nameLower.includes('phc') || nameLower.includes('primary health') ||
        nameLower.includes('प्राथमिक स्वास्थ्य')) {
      return { type: 'phc', label: 'Primary Health Centre', color: '#2196f3', icon: '🏨' };
    }

    // CHC check
    if (nameLower.includes('chc') || nameLower.includes('community health') ||
        nameLower.includes('सामुदायिक स्वास्थ्य')) {
      return { type: 'chc', label: 'Community Health Centre', color: '#009688', icon: '🏥' };
    }

    // Childcare check
    if (amenity === 'childcare' || nameLower.includes('child care') ||
        nameLower.includes('बाल देखभाल')) {
      return { type: 'childcare', label: 'Child Care Centre', color: '#8bc34a', icon: '🧒' };
    }

    // Hospital check
    if (amenity === 'hospital' || healthcare === 'hospital') {
      return { type: 'hospital', label: 'Hospital', color: '#667eea', icon: '🏥' };
    }

    // Clinic check
    if (amenity === 'clinic' || healthcare === 'clinic') {
      return { type: 'clinic', label: 'Clinic', color: '#28a745', icon: '🩺' };
    }

    // Doctor check
    if (amenity === 'doctors') {
      return { type: 'doctor', label: 'Doctor', color: '#17a2b8', icon: '👨‍⚕️' };
    }

    // Social facility
    if (amenity === 'social_facility') {
      return { type: 'social', label: 'Social Facility', color: '#6f42c1', icon: '🏢' };
    }

    // Default
    return { type: 'other', label: 'Healthcare Centre', color: '#6c757d', icon: '🏥' };
  };

  // Distance calculate
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  };

  // Google Maps Directions
  const openDirections = (item) => {
    const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${item.lat},${item.lng}`;
    window.open(url, '_blank');
  };

  // Google Maps View
  const openInMaps = (item) => {
    const url = `https://www.google.com/maps/search/${encodeURIComponent(item.name)}/@${item.lat},${item.lng},15z`;
    window.open(url, '_blank');
  };

  // Filter results by type
  const getFilteredResults = () => {
    if (searchType === 'all') return results;
    return results.filter(r => r.category === searchType);
  };

  // Count by category
  const getCategoryCount = (type) => {
    if (type === 'all') return results.length;
    return results.filter(r => r.category === type).length;
  };

  // Popular cities
  const popularCities = [
    'Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Bangalore',
    'Hyderabad', 'Lucknow', 'Jaipur', 'Patna', 'Bhopal',
    'Chandigarh', 'Ahmedabad', 'Pune', 'Ranchi', 'Raipur',
    'Varanasi', 'Kanpur', 'Indore', 'Nagpur', 'Dehradun'
  ];

  const filteredResults = getFilteredResults();

  return (
    <div style={{ padding: '10px' }}>
      <h2 style={{ color: '#667eea', marginBottom: '20px' }}>Hospital and Anganwadi Finder</h2>

      {/* Emergency */}
      <div style={{
        background: 'linear-gradient(135deg, #dc3545, #c82333)',
        padding: '20px', borderRadius: '12px', marginBottom: '20px',
        textAlign: 'center', color: 'white',
        boxShadow: '0 4px 15px rgba(220, 53, 69, 0.4)'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Emergency Helpline</h3>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { label: '108 - Ambulance', number: '108' },
            { label: '112 - Emergency', number: '112' },
            { label: '102 - Mother/Child', number: '102' },
            { label: '1098 - Child Helpline', number: '1098' }
          ].map((item, i) => (
            <button key={i} onClick={() => window.open(`tel:${item.number}`, '_self')} style={{
              padding: '10px 20px', fontSize: '15px', fontWeight: 'bold',
              background: 'white', color: '#dc3545', border: 'none',
              borderRadius: '8px', cursor: 'pointer'
            }}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== SEARCH METHOD ===== */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea10, #764ba210)',
        padding: '25px', borderRadius: '12px', marginBottom: '20px',
        border: '2px solid #667eea'
      }}>
        <h3 style={{ color: '#667eea', marginTop: 0, marginBottom: '15px' }}>
          Location Choose Karein
        </h3>

        {/* Toggle */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => setSearchMethod('gps')} style={{
            flex: 1, padding: '15px', borderRadius: '10px', cursor: 'pointer',
            border: searchMethod === 'gps' ? '3px solid #667eea' : '2px solid #ccc',
            background: searchMethod === 'gps' ? '#667eea' : 'white',
            color: searchMethod === 'gps' ? 'white' : '#333',
            fontWeight: 'bold', fontSize: '15px', transition: 'all 0.3s'
          }}>
            GPS Location (Auto)
          </button>
          <button onClick={() => setSearchMethod('manual')} style={{
            flex: 1, padding: '15px', borderRadius: '10px', cursor: 'pointer',
            border: searchMethod === 'manual' ? '3px solid #28a745' : '2px solid #ccc',
            background: searchMethod === 'manual' ? '#28a745' : 'white',
            color: searchMethod === 'manual' ? 'white' : '#333',
            fontWeight: 'bold', fontSize: '15px', transition: 'all 0.3s'
          }}>
            Manual Location (Type)
          </button>
        </div>

        {/* GPS */}
        {searchMethod === 'gps' && (
          <div style={{
            background: '#e7f3ff', padding: '20px', borderRadius: '10px',
            border: '2px solid #007bff'
          }}>
            <p style={{ margin: '0 0 15px 0', color: '#004085', fontWeight: 'bold' }}>
              GPS se current location detect karein
            </p>
            <button onClick={getLocation} style={{
              padding: '12px 30px', background: '#007bff', color: 'white',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontWeight: 'bold', fontSize: '16px', width: '100%'
            }}>
              {loading && searchMethod === 'gps' ? 'Detecting...' : 'Detect My Location'}
            </button>

            {permissionStatus === 'granted' && userLocation && searchMethod === 'gps' && (
              <div style={{ marginTop: '15px', background: '#d4edda', padding: '12px', borderRadius: '8px' }}>
                <p style={{ margin: 0, color: '#155724', fontWeight: 'bold' }}>Location Found</p>
                <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#155724' }}>
                  {locationName || `Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(4)}`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Manual */}
        {searchMethod === 'manual' && (
          <div style={{
            background: '#e8f5e9', padding: '20px', borderRadius: '10px',
            border: '2px solid #28a745'
          }}>
            <p style={{ margin: '0 0 15px 0', color: '#155724', fontWeight: 'bold' }}>
              Location ka naam likhein (City, Area, Village, Pin Code)
            </p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <input
                type="text"
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') searchByManualLocation(); }}
                placeholder="City/Area/Village likhein... (e.g. Lucknow, Varanasi, 226001)"
                style={{
                  flex: 1, padding: '14px', fontSize: '16px', borderRadius: '8px',
                  border: '2px solid #28a745', outline: 'none', boxSizing: 'border-box'
                }}
              />
              <button onClick={searchByManualLocation}
                disabled={manualSearching || !manualLocation.trim()}
                style={{
                  padding: '14px 25px', background: manualSearching ? '#ccc' : '#28a745',
                  color: 'white', border: 'none', borderRadius: '8px',
                  cursor: manualSearching ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold', fontSize: '16px', whiteSpace: 'nowrap'
                }}>
                {manualSearching ? 'Searching...' : 'Search'}
              </button>
            </div>

            <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#155724', fontWeight: 'bold' }}>
              Ya koi city select karein:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {popularCities.map((city, i) => (
                <button key={i} onClick={() => {
                  setManualLocation(city);
                  setTimeout(() => {
                    const fakeEvent = { target: { value: city } };
                    setManualLocation(city);
                  }, 50);
                }} style={{
                  padding: '6px 14px',
                  background: manualLocation === city ? '#28a745' : 'white',
                  color: manualLocation === city ? 'white' : '#333',
                  border: '1px solid #28a745', borderRadius: '20px',
                  cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s'
                }}>
                  {city}
                </button>
              ))}
            </div>

            {userLocation && searchMethod === 'manual' && locationName && (
              <div style={{ marginTop: '15px', background: '#d4edda', padding: '12px', borderRadius: '8px' }}>
                <p style={{ margin: 0, color: '#155724', fontWeight: 'bold' }}>Location Found</p>
                <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#155724' }}>{locationName}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search Controls */}
      {userLocation && (
        <div style={{
          background: '#f8f9fa', padding: '15px', borderRadius: '12px',
          marginBottom: '20px', border: '1px solid #ddd'
        }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <label style={{ fontWeight: 'bold' }}>Radius:</label>
            <select value={searchRadius} onChange={(e) => {
              const newRadius = parseInt(e.target.value);
              setSearchRadius(newRadius);
              searchNearby(userLocation.lat, userLocation.lng);
            }} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}>
              <option value={2000}>2 KM</option>
              <option value={5000}>5 KM</option>
              <option value={10000}>10 KM</option>
              <option value={20000}>20 KM</option>
              <option value={50000}>50 KM</option>
            </select>

            <button onClick={() => searchNearby(userLocation.lat, userLocation.lng)} style={{
              padding: '8px 20px', background: '#667eea', color: 'white',
              border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
            }}>Search Again</button>

            <button onClick={() => {
              window.open(`https://www.google.com/maps/search/hospitals+anganwadi+near+me/@${userLocation.lat},${userLocation.lng},13z`, '_blank');
            }} style={{
              padding: '8px 20px', background: '#28a745', color: 'white',
              border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
            }}>Open Google Maps</button>
          </div>
        </div>
      )}

      {/* Category Filter */}
      {results.length > 0 && (
        <div style={{
          background: 'white', padding: '15px', borderRadius: '12px',
          marginBottom: '20px', border: '1px solid #ddd',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#333' }}>Filter by Type:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {[
              { type: 'all', label: 'All', color: '#667eea', icon: '' },
              { type: 'hospital', label: 'Hospital', color: '#667eea', icon: '🏥' },
              { type: 'anganwadi', label: 'Anganwadi', color: '#e91e63', icon: '👶' },
              { type: 'nrc', label: 'NRC', color: '#ff5722', icon: '🍼' },
              { type: 'phc', label: 'PHC', color: '#2196f3', icon: '🏨' },
              { type: 'chc', label: 'CHC', color: '#009688', icon: '🏥' },
              { type: 'clinic', label: 'Clinic', color: '#28a745', icon: '🩺' },
              { type: 'doctor', label: 'Doctor', color: '#17a2b8', icon: '👨‍⚕️' },
              { type: 'childcare', label: 'Child Care', color: '#8bc34a', icon: '🧒' }
            ].map((cat, i) => {
              const count = getCategoryCount(cat.type);
              if (count === 0 && cat.type !== 'all') return null;
              return (
                <button key={i} onClick={() => setSearchType(cat.type)} style={{
                  padding: '8px 16px', borderRadius: '20px', cursor: 'pointer',
                  border: searchType === cat.type ? `3px solid ${cat.color}` : '1px solid #ddd',
                  background: searchType === cat.type ? cat.color : 'white',
                  color: searchType === cat.type ? 'white' : '#333',
                  fontWeight: 'bold', fontSize: '13px', transition: 'all 0.2s'
                }}>
                  {cat.icon} {cat.label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Map */}
      {userLocation && (
        <div style={{
          background: 'white', borderRadius: '12px', marginBottom: '20px',
          overflow: 'hidden', border: '2px solid #667eea',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            background: '#667eea', padding: '10px 15px', color: 'white',
            fontWeight: 'bold'
          }}>
            Map View ({filteredResults.length} results)
          </div>
          <iframe
            title="Map"
            width="100%"
            height="350"
            frameBorder="0"
            style={{ border: 0 }}
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${userLocation.lng - 0.05},${userLocation.lat - 0.05},${userLocation.lng + 0.05},${userLocation.lat + 0.05}&layer=mapnik&marker=${userLocation.lat},${userLocation.lng}`}
          />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{
          textAlign: 'center', padding: '40px', background: '#f8f9fa',
          borderRadius: '12px', marginBottom: '20px'
        }}>
          <p style={{ fontSize: '18px', color: '#667eea' }}>Searching...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background: '#f8d7da', padding: '15px', borderRadius: '12px',
          marginBottom: '20px', border: '2px solid #dc3545', color: '#721c24'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{error}</p>
        </div>
      )}

      {/* Results */}
      {filteredResults.length > 0 && (
        <div>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>
            {filteredResults.length} Results (within {searchRadius / 1000} km)
          </h3>

          {filteredResults.map((item, index) => (
            <div key={item.id} style={{
              background: selectedItem === item.id ? '#e7f3ff' : 'white',
              padding: '20px', borderRadius: '12px', marginBottom: '15px',
              border: selectedItem === item.id ? `3px solid ${item.categoryColor}` : '2px solid #e0e0e0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              cursor: 'pointer', transition: 'all 0.3s'
            }}
            onClick={() => setSelectedItem(item.id === selectedItem ? null : item.id)}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                    <span style={{ fontSize: '24px' }}>{item.categoryIcon}</span>
                    <h4 style={{ margin: 0, color: '#333', fontSize: '16px' }}>
                      {index + 1}. {item.name}
                    </h4>
                  </div>
                  <span style={{
                    display: 'inline-block', padding: '3px 12px',
                    background: `${item.categoryColor}15`,
                    color: item.categoryColor, borderRadius: '12px',
                    fontSize: '12px', fontWeight: 'bold',
                    border: `1px solid ${item.categoryColor}`
                  }}>
                    {item.categoryLabel}
                  </span>
                </div>

                <div style={{
                  background: item.distance < 2 ? '#d4edda' : item.distance < 5 ? '#fff3cd' : '#f8d7da',
                  padding: '8px 15px', borderRadius: '8px', textAlign: 'center', minWidth: '80px'
                }}>
                  <p style={{
                    margin: 0, fontSize: '18px', fontWeight: 'bold',
                    color: item.distance < 2 ? '#155724' : item.distance < 5 ? '#856404' : '#721c24'
                  }}>
                    {item.distance} km
                  </p>
                </div>
              </div>

              {item.address && <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>Address: {item.address}</p>}
              {item.operator && <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>Operator: {item.operator}</p>}
              {item.beds && <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>Beds: {item.beds}</p>}
              {item.openingHours && <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>Hours: {item.openingHours}</p>}
              {item.description && <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>Info: {item.description}</p>}

              <div style={{ display: 'flex', gap: '8px', marginTop: '15px', flexWrap: 'wrap' }}>
                <button onClick={(e) => { e.stopPropagation(); openDirections(item); }} style={{
                  padding: '10px 20px', background: '#007bff', color: 'white',
                  border: 'none', borderRadius: '6px', cursor: 'pointer',
                  fontWeight: 'bold', fontSize: '13px'
                }}>Get Directions</button>

                <button onClick={(e) => { e.stopPropagation(); openInMaps(item); }} style={{
                  padding: '10px 20px', background: '#28a745', color: 'white',
                  border: 'none', borderRadius: '6px', cursor: 'pointer',
                  fontWeight: 'bold', fontSize: '13px'
                }}>View on Map</button>

                {item.phone && (
                  <button onClick={(e) => { e.stopPropagation(); window.open(`tel:${item.phone}`, '_self'); }} style={{
                    padding: '10px 20px', background: '#dc3545', color: 'white',
                    border: 'none', borderRadius: '6px', cursor: 'pointer',
                    fontWeight: 'bold', fontSize: '13px'
                  }}>Call: {item.phone}</button>
                )}

                {item.website && (
                  <button onClick={(e) => { e.stopPropagation(); window.open(item.website, '_blank'); }} style={{
                    padding: '10px 20px', background: '#6f42c1', color: 'white',
                    border: 'none', borderRadius: '6px', cursor: 'pointer',
                    fontWeight: 'bold', fontSize: '13px'
                  }}>Website</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Google Maps Quick Search */}
      {userLocation && (
        <div style={{
          background: 'linear-gradient(135deg, #667eea20, #764ba220)',
          padding: '20px', borderRadius: '12px', marginTop: '20px',
          border: '2px solid #667eea'
        }}>
          <h3 style={{ color: '#667eea', marginTop: 0 }}>Google Maps Quick Search</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[
              { label: 'Hospitals', query: 'hospital', color: '#667eea' },
              { label: 'Anganwadi', query: 'anganwadi+centre', color: '#e91e63' },
              { label: 'NRC Centre', query: 'NRC+nutrition+rehabilitation', color: '#ff5722' },
              { label: 'PHC', query: 'PHC+primary+health+centre', color: '#2196f3' },
              { label: 'Child Clinic', query: 'child+clinic+pediatric', color: '#8bc34a' },
              { label: 'ICDS Centre', query: 'ICDS+centre', color: '#ff9800' }
            ].map((item, i) => (
              <button key={i} onClick={() => {
                window.open(`https://www.google.com/maps/search/${item.query}/@${userLocation.lat},${userLocation.lng},13z`, '_blank');
              }} style={{
                padding: '12px 20px', background: item.color, color: 'white',
                border: 'none', borderRadius: '8px', cursor: 'pointer',
                fontWeight: 'bold', fontSize: '14px'
              }}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Helplines */}
      <div style={{
        background: 'white', padding: '20px', borderRadius: '12px',
        marginTop: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0'
      }}>
        <h3 style={{ color: '#333', marginTop: 0 }}>Government Helplines</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
          {[
            { name: 'Ambulance', number: '108', color: '#dc3545' },
            { name: 'Emergency', number: '112', color: '#dc3545' },
            { name: 'Mother/Child', number: '102', color: '#e91e63' },
            { name: 'Health', number: '104', color: '#007bff' },
            { name: 'Child', number: '1098', color: '#28a745' },
            { name: 'Women', number: '181', color: '#6f42c1' }
          ].map((h, i) => (
            <button key={i} onClick={() => window.open(`tel:${h.number}`, '_self')} style={{
              padding: '12px', background: `${h.color}10`,
              border: `2px solid ${h.color}`, borderRadius: '8px',
              cursor: 'pointer', textAlign: 'center'
            }}>
              <p style={{ margin: '0 0 3px 0', fontWeight: 'bold', color: h.color, fontSize: '18px' }}>{h.number}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#333' }}>{h.name}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HospitalFinder;