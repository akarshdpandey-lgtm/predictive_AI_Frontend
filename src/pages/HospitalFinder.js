import React, { useState, useEffect, useCallback } from 'react';

function HospitalFinder({ userId }) {
  const [userLocation, setUserLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('pending');
  const [searchRadius, setSearchRadius] = useState(5000);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchMethod, setSearchMethod] = useState('gps');
  const [manualLocation, setManualLocation] = useState('');
  const [manualSearching, setManualSearching] = useState(false);
  const [locationName, setLocationName] = useState('');

  // GPS Permission लो और Location लो
  const getLocation = useCallback(() => {
    setLoading(true);
    setError(null);
    setSearchMethod('gps');

    if (!navigator.geolocation) {
      setError('आपका browser GPS support नहीं करता। Manual location use करें।');
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
        // Reverse geocode - location ka naam lo
        getLocationName(loc.lat, loc.lng);
        // Hospitals search karo
        searchNearbyHospitals(loc.lat, loc.lng);
      },
      (err) => {
        setLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setPermissionStatus('denied');
            setError('Location permission denied. Manual location use करें।');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location unavailable. GPS on करें या Manual location use करें।');
            break;
          case err.TIMEOUT:
            setError('Location timeout. फिर से try करें या Manual location use करें।');
            break;
          default:
            setError('Location error. Manual location use करें।');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  }, []);

  // Location का नाम लो (Reverse Geocoding)
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

  // Manual Location से search करो (Geocoding)
  const searchByManualLocation = async () => {
    if (!manualLocation.trim()) {
      setError('कृपया location का नाम लिखें');
      return;
    }

    setManualSearching(true);
    setLoading(true);
    setError(null);
    setSearchMethod('manual');

    try {
      // Nominatim API से location के coordinates लो (FREE)
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
        
        // Ab hospitals search karo
        searchNearbyHospitals(loc.lat, loc.lng);
      } else {
        setError(`"${manualLocation}" location nahi mila. Sahi naam likhein. Example: Lucknow, Delhi, Mumbai`);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setError('Location search mein error. Internet check karein.');
    }

    setManualSearching(false);
    setLoading(false);
  };

  // Nearby Hospitals खोजो (OpenStreetMap Overpass API - FREE)
  const searchNearbyHospitals = async (lat, lng) => {
    setLoading(true);
    try {
      const radiusInMeters = searchRadius;
      
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:${radiusInMeters},${lat},${lng});
          way["amenity"="hospital"](around:${radiusInMeters},${lat},${lng});
          node["amenity"="clinic"](around:${radiusInMeters},${lat},${lng});
          way["amenity"="clinic"](around:${radiusInMeters},${lat},${lng});
          node["amenity"="doctors"](around:${radiusInMeters},${lat},${lng});
          node["healthcare"="hospital"](around:${radiusInMeters},${lat},${lng});
          way["healthcare"="hospital"](around:${radiusInMeters},${lat},${lng});
          node["healthcare"="clinic"](around:${radiusInMeters},${lat},${lng});
        );
        out body center;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const data = await response.json();

      if (data.elements && data.elements.length > 0) {
        const hospitalList = data.elements
          .map((element, index) => {
            const hospLat = element.lat || element.center?.lat;
            const hospLng = element.lon || element.center?.lon;
            
            if (!hospLat || !hospLng) return null;

            const distance = calculateDistance(lat, lng, hospLat, hospLng);
            
            return {
              id: element.id || index,
              name: element.tags?.name || element.tags?.['name:hi'] || element.tags?.['name:en'] || 'Hospital/Clinic',
              type: element.tags?.amenity || element.tags?.healthcare || 'hospital',
              lat: hospLat,
              lng: hospLng,
              distance: distance,
              address: element.tags?.['addr:full'] || element.tags?.['addr:street'] || '',
              phone: element.tags?.phone || element.tags?.['contact:phone'] || '',
              website: element.tags?.website || '',
              emergency: element.tags?.emergency || '',
              operator: element.tags?.operator || '',
              beds: element.tags?.beds || '',
              openingHours: element.tags?.opening_hours || '',
              wheelchair: element.tags?.wheelchair || ''
            };
          })
          .filter(h => h !== null)
          .sort((a, b) => a.distance - b.distance);

        setHospitals(hospitalList);
      } else {
        setHospitals([]);
        setError('Is area mein koi hospital nahi mila. Radius badhakar try karein.');
      }
    } catch (err) {
      console.error('Hospital search error:', err);
      setError('Hospital search mein error. Internet connection check karein.');
    }
    setLoading(false);
  };

  // 2 points ke beech distance (km)
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

  // Google Maps mein directions kholo
  const openDirections = (hospital) => {
    const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${hospital.lat},${hospital.lng}`;
    window.open(url, '_blank');
  };

  // Google Maps mein hospital location kholo
  const openInMaps = (hospital) => {
    const url = `https://www.google.com/maps/search/${encodeURIComponent(hospital.name)}/@${hospital.lat},${hospital.lng},15z`;
    window.open(url, '_blank');
  };

  // Phone call karo
  const callHospital = (phone) => {
    window.open(`tel:${phone}`, '_self');
  };

  // Emergency number
  const callEmergency = () => {
    window.open('tel:108', '_self');
  };

  // Hospital type ka icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'hospital': return '🏥';
      case 'clinic': return '🏨';
      case 'doctors': return '👨‍⚕️';
      default: return '🏥';
    }
  };

  // Hospital type ka label
  const getTypeLabel = (type) => {
    switch (type) {
      case 'hospital': return 'Hospital';
      case 'clinic': return 'Clinic';
      case 'doctors': return 'Doctor';
      default: return 'Healthcare';
    }
  };

  // Popular cities for quick search
  const popularCities = [
    'Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Bangalore',
    'Hyderabad', 'Lucknow', 'Jaipur', 'Patna', 'Bhopal',
    'Chandigarh', 'Ahmedabad', 'Pune', 'Ranchi', 'Raipur'
  ];

  return (
    <div style={{ padding: '10px' }}>
      <h2 style={{ color: '#667eea', marginBottom: '20px' }}>Hospital Finder</h2>

      {/* Emergency Button */}
      <div style={{
        background: 'linear-gradient(135deg, #dc3545, #c82333)',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        textAlign: 'center',
        color: 'white',
        boxShadow: '0 4px 15px rgba(220, 53, 69, 0.4)'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Emergency Helpline</h3>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={callEmergency} style={{
            padding: '12px 30px', fontSize: '18px', fontWeight: 'bold',
            background: 'white', color: '#dc3545', border: 'none',
            borderRadius: '8px', cursor: 'pointer'
          }}>
            108 - Ambulance
          </button>
          <button onClick={() => window.open('tel:112', '_self')} style={{
            padding: '12px 30px', fontSize: '18px', fontWeight: 'bold',
            background: 'white', color: '#dc3545', border: 'none',
            borderRadius: '8px', cursor: 'pointer'
          }}>
            112 - Emergency
          </button>
          <button onClick={() => window.open('tel:102', '_self')} style={{
            padding: '12px 30px', fontSize: '18px', fontWeight: 'bold',
            background: 'white', color: '#dc3545', border: 'none',
            borderRadius: '8px', cursor: 'pointer'
          }}>
            102 - Mother/Child
          </button>
        </div>
      </div>

      {/* ===== SEARCH METHOD SELECTION ===== */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea10, #764ba210)',
        padding: '25px',
        borderRadius: '12px',
        marginBottom: '20px',
        border: '2px solid #667eea'
      }}>
        <h3 style={{ color: '#667eea', marginTop: 0, marginBottom: '15px' }}>
          Location Choose Karein
        </h3>

        {/* Method Toggle */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={() => setSearchMethod('gps')}
            style={{
              flex: 1,
              padding: '15px',
              borderRadius: '10px',
              cursor: 'pointer',
              border: searchMethod === 'gps' ? '3px solid #667eea' : '2px solid #ccc',
              background: searchMethod === 'gps' ? '#667eea' : 'white',
              color: searchMethod === 'gps' ? 'white' : '#333',
              fontWeight: 'bold',
              fontSize: '15px',
              transition: 'all 0.3s'
            }}
          >
            GPS Location (Auto)
          </button>
          <button 
            onClick={() => setSearchMethod('manual')}
            style={{
              flex: 1,
              padding: '15px',
              borderRadius: '10px',
              cursor: 'pointer',
              border: searchMethod === 'manual' ? '3px solid #28a745' : '2px solid #ccc',
              background: searchMethod === 'manual' ? '#28a745' : 'white',
              color: searchMethod === 'manual' ? 'white' : '#333',
              fontWeight: 'bold',
              fontSize: '15px',
              transition: 'all 0.3s'
            }}
          >
            Manual Location (Type)
          </button>
        </div>

        {/* GPS Option */}
        {searchMethod === 'gps' && (
          <div style={{
            background: '#e7f3ff',
            padding: '20px',
            borderRadius: '10px',
            border: '2px solid #007bff'
          }}>
            <p style={{ margin: '0 0 15px 0', color: '#004085', fontWeight: 'bold' }}>
              GPS se apni current location detect karein
            </p>
            <button onClick={getLocation} style={{
              padding: '12px 30px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              width: '100%'
            }}>
              {loading ? 'Detecting Location...' : 'Detect My Location (GPS)'}
            </button>

            {permissionStatus === 'granted' && userLocation && (
              <div style={{ marginTop: '15px', background: '#d4edda', padding: '12px', borderRadius: '8px' }}>
                <p style={{ margin: 0, color: '#155724', fontWeight: 'bold' }}>Location Found</p>
                <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#155724' }}>
                  {locationName || `Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(4)}`}
                </p>
              </div>
            )}

            {permissionStatus === 'denied' && (
              <div style={{ marginTop: '15px', background: '#f8d7da', padding: '12px', borderRadius: '8px' }}>
                <p style={{ margin: 0, color: '#721c24', fontWeight: 'bold' }}>
                  Location Permission Denied
                </p>
                <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#721c24' }}>
                  Browser settings se allow karein ya Manual Location use karein
                </p>
              </div>
            )}
          </div>
        )}

        {/* Manual Location Option */}
        {searchMethod === 'manual' && (
          <div style={{
            background: '#e8f5e9',
            padding: '20px',
            borderRadius: '10px',
            border: '2px solid #28a745'
          }}>
            <p style={{ margin: '0 0 15px 0', color: '#155724', fontWeight: 'bold' }}>
              Location ka naam likhein (City, Area, Village, Pin Code)
            </p>

            {/* Search Input */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <input
                type="text"
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') searchByManualLocation();
                }}
                placeholder="City/Area/Village ka naam likhein... (e.g. Lucknow, Varanasi)"
                style={{
                  flex: 1,
                  padding: '14px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: '2px solid #28a745',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button 
                onClick={searchByManualLocation}
                disabled={manualSearching || !manualLocation.trim()}
                style={{
                  padding: '14px 25px',
                  background: manualSearching ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: manualSearching ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  whiteSpace: 'nowrap'
                }}
              >
                {manualSearching ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Quick City Buttons */}
            <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#155724', fontWeight: 'bold' }}>
              Ya fir koi city select karein:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {popularCities.map((city, i) => (
                <button 
                  key={i}
                  onClick={() => {
                    setManualLocation(city);
                    setTimeout(() => {
                      searchByManualLocation();
                    }, 100);
                  }}
                  style={{
                    padding: '8px 16px',
                    background: manualLocation === city ? '#28a745' : 'white',
                    color: manualLocation === city ? 'white' : '#333',
                    border: '1px solid #28a745',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'all 0.2s'
                  }}
                >
                  {city}
                </button>
              ))}
            </div>

            {/* Manual location result */}
            {userLocation && searchMethod === 'manual' && locationName && (
              <div style={{ marginTop: '15px', background: '#d4edda', padding: '12px', borderRadius: '8px' }}>
                <p style={{ margin: 0, color: '#155724', fontWeight: 'bold' }}>Location Found</p>
                <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#155724' }}>
                  {locationName}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search Controls - Radius */}
      {userLocation && (
        <div style={{
          background: '#f8f9fa',
          padding: '15px',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid #ddd'
        }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <label style={{ fontWeight: 'bold' }}>Search Radius:</label>
            <select 
              value={searchRadius} 
              onChange={(e) => {
                const newRadius = parseInt(e.target.value);
                setSearchRadius(newRadius);
                searchNearbyHospitals(userLocation.lat, userLocation.lng);
              }}
              style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
            >
              <option value={2000}>2 KM</option>
              <option value={5000}>5 KM</option>
              <option value={10000}>10 KM</option>
              <option value={20000}>20 KM</option>
              <option value={50000}>50 KM</option>
            </select>

            <button onClick={() => searchNearbyHospitals(userLocation.lat, userLocation.lng)} style={{
              padding: '8px 20px', background: '#667eea', color: 'white',
              border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
            }}>
              Search Again
            </button>

            <button onClick={() => {
              const url = `https://www.google.com/maps/search/hospitals+near+me/@${userLocation.lat},${userLocation.lng},13z`;
              window.open(url, '_blank');
            }} style={{
              padding: '8px 20px', background: '#28a745', color: 'white',
              border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
            }}>
              Open Google Maps
            </button>
          </div>
        </div>
      )}

      {/* Map View */}
      {userLocation && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          marginBottom: '20px',
          overflow: 'hidden',
          border: '2px solid #667eea',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            background: '#667eea', 
            padding: '10px 15px', 
            color: 'white', 
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Map View ({hospitals.length} hospitals found)</span>
          </div>
          <iframe
            title="Hospital Map"
            width="100%"
            height="400"
            frameBorder="0"
            style={{ border: 0 }}
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${userLocation.lng - 0.05},${userLocation.lat - 0.05},${userLocation.lng + 0.05},${userLocation.lat + 0.05}&layer=mapnik&marker=${userLocation.lat},${userLocation.lng}`}
            onLoad={() => setMapLoaded(true)}
          />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{
          textAlign: 'center', padding: '40px',
          background: '#f8f9fa', borderRadius: '12px', marginBottom: '20px'
        }}>
          <p style={{ fontSize: '18px', color: '#667eea' }}>Searching hospitals...</p>
          <p style={{ fontSize: '14px', color: '#666' }}>Please wait...</p>
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

      {/* Hospital Results */}
      {hospitals.length > 0 && (
        <div>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>
            {hospitals.length} Hospitals/Clinics Found (within {searchRadius / 1000} km)
          </h3>

          {hospitals.map((hospital, index) => (
            <div key={hospital.id} style={{
              background: selectedHospital === hospital.id ? '#e7f3ff' : 'white',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '15px',
              border: selectedHospital === hospital.id ? '3px solid #007bff' : '2px solid #e0e0e0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onClick={() => setSelectedHospital(hospital.id === selectedHospital ? null : hospital.id)}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                    <span style={{ fontSize: '24px' }}>{getTypeIcon(hospital.type)}</span>
                    <h4 style={{ margin: 0, color: '#333', fontSize: '16px' }}>
                      {index + 1}. {hospital.name}
                    </h4>
                  </div>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 10px',
                    background: hospital.type === 'hospital' ? '#667eea20' : '#28a74520',
                    color: hospital.type === 'hospital' ? '#667eea' : '#28a745',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {getTypeLabel(hospital.type)}
                  </span>
                </div>

                {/* Distance */}
                <div style={{
                  background: hospital.distance < 2 ? '#d4edda' : hospital.distance < 5 ? '#fff3cd' : '#f8d7da',
                  padding: '8px 15px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  minWidth: '80px'
                }}>
                  <p style={{ 
                    margin: 0, fontSize: '18px', fontWeight: 'bold',
                    color: hospital.distance < 2 ? '#155724' : hospital.distance < 5 ? '#856404' : '#721c24'
                  }}>
                    {hospital.distance} km
                  </p>
                  <p style={{ margin: 0, fontSize: '10px', color: '#666' }}>distance</p>
                </div>
              </div>

              {/* Details */}
              {hospital.address && (
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                  Address: {hospital.address}
                </p>
              )}
              {hospital.operator && (
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                  Operator: {hospital.operator}
                </p>
              )}
              {hospital.beds && (
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                  Beds: {hospital.beds}
                </p>
              )}
              {hospital.openingHours && (
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                  Hours: {hospital.openingHours}
                </p>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '15px', flexWrap: 'wrap' }}>
                <button onClick={(e) => {
                  e.stopPropagation();
                  openDirections(hospital);
                }} style={{
                  padding: '10px 20px', background: '#007bff', color: 'white',
                  border: 'none', borderRadius: '6px', cursor: 'pointer',
                  fontWeight: 'bold', fontSize: '13px'
                }}>
                  Get Directions
                </button>

                <button onClick={(e) => {
                  e.stopPropagation();
                  openInMaps(hospital);
                }} style={{
                  padding: '10px 20px', background: '#28a745', color: 'white',
                  border: 'none', borderRadius: '6px', cursor: 'pointer',
                  fontWeight: 'bold', fontSize: '13px'
                }}>
                  View on Map
                </button>

                {hospital.phone && (
                  <button onClick={(e) => {
                    e.stopPropagation();
                    callHospital(hospital.phone);
                  }} style={{
                    padding: '10px 20px', background: '#dc3545', color: 'white',
                    border: 'none', borderRadius: '6px', cursor: 'pointer',
                    fontWeight: 'bold', fontSize: '13px'
                  }}>
                    Call: {hospital.phone}
                  </button>
                )}

                {hospital.website && (
                  <button onClick={(e) => {
                    e.stopPropagation();
                    window.open(hospital.website, '_blank');
                  }} style={{
                    padding: '10px 20px', background: '#6f42c1', color: 'white',
                    border: 'none', borderRadius: '6px', cursor: 'pointer',
                    fontWeight: 'bold', fontSize: '13px'
                  }}>
                    Website
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && hospitals.length === 0 && userLocation && !error && (
        <div style={{
          textAlign: 'center', padding: '40px',
          background: '#fff3cd', borderRadius: '12px',
          border: '2px solid #ffc107'
        }}>
          <p style={{ fontSize: '18px', color: '#856404', fontWeight: 'bold' }}>
            Koi hospital nahi mila
          </p>
          <p style={{ fontSize: '14px', color: '#856404' }}>
            Radius badhakar try karein
          </p>
        </div>
      )}

      {/* NRC Centers */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea20, #764ba220)',
        padding: '20px',
        borderRadius: '12px',
        marginTop: '20px',
        border: '2px solid #667eea'
      }}>
        <h3 style={{ color: '#667eea', marginTop: 0 }}>NRC / Anganwadi / PHC Search</h3>
        <p style={{ fontSize: '14px', color: '#333', marginBottom: '15px' }}>
          SAM ke liye NRC, Anganwadi ya PHC search karein:
        </p>
        
        {userLocation && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => {
              const url = `https://www.google.com/maps/search/NRC+nutrition+rehabilitation+centre/@${userLocation.lat},${userLocation.lng},12z`;
              window.open(url, '_blank');
            }} style={{
              padding: '12px 25px', background: '#667eea', color: 'white',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
            }}>
              Search NRC
            </button>

            <button onClick={() => {
              const url = `https://www.google.com/maps/search/anganwadi+centre/@${userLocation.lat},${userLocation.lng},12z`;
              window.open(url, '_blank');
            }} style={{
              padding: '12px 25px', background: '#28a745', color: 'white',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
            }}>
              Search Anganwadi
            </button>

            <button onClick={() => {
              const url = `https://www.google.com/maps/search/PHC+primary+health+centre/@${userLocation.lat},${userLocation.lng},12z`;
              window.open(url, '_blank');
            }} style={{
              padding: '12px 25px', background: '#fd7e14', color: 'white',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
            }}>
              Search PHC
            </button>
          </div>
        )}
      </div>

      {/* Government Helplines */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginTop: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0'
      }}>
        <h3 style={{ color: '#333', marginTop: 0 }}>Government Helplines</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {[
            { name: 'Ambulance', number: '108', color: '#dc3545' },
            { name: 'Emergency', number: '112', color: '#dc3545' },
            { name: 'Mother/Child', number: '102', color: '#e91e63' },
            { name: 'Health Helpline', number: '104', color: '#007bff' },
            { name: 'Child Helpline', number: '1098', color: '#28a745' },
            { name: 'Women Helpline', number: '181', color: '#6f42c1' }
          ].map((helpline, i) => (
            <button key={i} onClick={() => window.open(`tel:${helpline.number}`, '_self')} style={{
              padding: '15px',
              background: `${helpline.color}10`,
              border: `2px solid ${helpline.color}`,
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'center'
            }}>
              <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: helpline.color, fontSize: '20px' }}>
                {helpline.number}
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#333' }}>{helpline.name}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HospitalFinder;