import React, { useState } from 'react';

function DietPlan({ userId }) {
  const [severity, setSeverity] = useState('');
  const [areaType, setAreaType] = useState('');
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [showPlan, setShowPlan] = useState(false);

  // Rural area foods
  const ruralFoods = [
    { id: 1, name: '🌾 गेहूँ', cal: 340 },
    { id: 2, name: '🍚 चावल', cal: 350 },
    { id: 3, name: '🫘 दाल (मसूर/अरहर)', cal: 340 },
    { id: 4, name: '🥛 दूध', cal: 60 },
    { id: 5, name: '🥚 अंडा', cal: 155 },
    { id: 6, name: '🍌 केला', cal: 89 },
    { id: 7, name: '🥕 गाजर', cal: 41 },
    { id: 8, name: '🥬 पालक', cal: 23 },
    { id: 9, name: '🍠 शकरकंद', cal: 86 },
    { id: 10, name: '🥜 मूंगफली', cal: 567 },
    { id: 11, name: '🥔 आलू', cal: 77 },
    { id: 12, name: '🧈 घी', cal: 900 },
    { id: 13, name: '🍯 गुड़', cal: 383 },
    { id: 14, name: '🫙 दही', cal: 61 },
    { id: 15, name: '🌽 मक्का', cal: 365 },
    { id: 16, name: '🧅 प्याज', cal: 40 },
    { id: 17, name: '🍅 टमाटर', cal: 18 },
    { id: 18, name: '🌶️ हरी मिर्च', cal: 40 },
    { id: 19, name: '🥒 लौकी', cal: 15 },
    { id: 20, name: '🫛 चना', cal: 364 },
  ];

  // Urban area foods (rural + extra)
  const urbanFoods = [
    ...ruralFoods,
    { id: 21, name: '🥜 बादाम (Almonds)', cal: 579 },
    { id: 22, name: '🌰 काजू (Cashew)', cal: 553 },
    { id: 23, name: '🫐 किशमिश (Raisins)', cal: 299 },
    { id: 24, name: '🥜 अखरोट (Walnuts)', cal: 654 },
    { id: 25, name: '🌰 पिस्ता (Pistachio)', cal: 560 },
    { id: 26, name: '🥜 चिया सीड्स', cal: 486 },
    { id: 27, name: '🍎 सेब (Apple)', cal: 52 },
    { id: 28, name: '🍊 संतरा (Orange)', cal: 47 },
    { id: 29, name: '🥛 पनीर (Paneer)', cal: 265 },
    { id: 30, name: '🍗 चिकन (Chicken)', cal: 239 },
    { id: 31, name: '🐟 मछली (Fish)', cal: 206 },
    { id: 32, name: '🥣 ओट्स (Oats)', cal: 389 },
    { id: 33, name: '🍞 ब्रेड (Bread)', cal: 265 },
    { id: 34, name: '🧀 चीज़ (Cheese)', cal: 402 },
    { id: 35, name: '🥤 प्रोटीन पाउडर', cal: 400 },
    { id: 36, name: '🫘 सोयाबीन', cal: 446 },
    { id: 37, name: '🥜 खजूर (Dates)', cal: 277 },
    { id: 38, name: '🥥 नारियल (Coconut)', cal: 354 },
    { id: 39, name: '🍌 एवोकाडो', cal: 160 },
    { id: 40, name: '🥛 बादाम दूध', cal: 15 },
  ];

  const toggleFood = (id) => {
    if (selectedFoods.includes(id)) {
      setSelectedFoods(selectedFoods.filter(f => f !== id));
    } else {
      setSelectedFoods([...selectedFoods, id]);
    }
  };

  const currentFoods = areaType === 'rural' ? ruralFoods : urbanFoods;
  const selected = currentFoods.filter(f => selectedFoods.includes(f.id));

  // Diet Plan generate karo
  const getDietPlan = () => {
    const grains = selected.filter(f => [1,2,15,32,33].includes(f.id));
    const proteins = selected.filter(f => [3,4,5,10,14,20,29,30,31,35,36].includes(f.id));
    const vegs = selected.filter(f => [7,8,9,11,16,17,18,19].includes(f.id));
    const fruits = selected.filter(f => [6,23,27,28,37,39].includes(f.id));
    const dryFruits = selected.filter(f => [21,22,24,25,26,37].includes(f.id));
    const fats = selected.filter(f => [12,13,38].includes(f.id));

    const g = (arr, i) => arr.length > i ? arr[i].name : '';

    if (severity === 'SAM') {
      return {
        title: '🔴 SAM - गंभीर कुपोषण आहार योजना',
        subtitle: areaType === 'rural' ? '(ग्रामीण क्षेत्र)' : '(शहरी क्षेत्र)',
        calories: '1500-1800 कैलोरी/दिन',
        meals: [
          { time: 'सुबह 6:00', meal: `${g(proteins,0) || '🥛 दूध'} + ${g(fats,0) || '🧈 घी'} + ${g(dryFruits,0) || '🥜 मूंगफली'}`, note: 'High calorie start' },
          { time: 'सुबह 8:00', meal: `${g(grains,0) || '🌾 गेहूँ'} दलिया + ${g(fruits,0) || '🍌 केला'} + ${g(fats,1) || '🍯 गुड़'}`, note: 'Energy boost' },
          { time: 'सुबह 10:00', meal: `${g(dryFruits,0) || '🥜 मूंगफली'} + ${g(dryFruits,1) || '🍯 गुड़'} की चिक्की`, note: 'Dry fruit snack' },
          { time: 'दोपहर 12:00', meal: `${g(grains,0) || '🍚 चावल'} + ${g(proteins,0) || '🫘 दाल'} + ${g(vegs,0) || '🥬 पालक'} + ${g(fats,0) || '🧈 घी'}`, note: 'Main meal' },
          { time: 'दोपहर 2:00', meal: `${g(proteins,1) || '🫙 दही'} + ${g(fruits,0) || '🍌 केला'} + ${g(dryFruits,0) || '🥜 बादाम'}`, note: 'Protein + Fruit' },
          { time: 'शाम 4:00', meal: `खिचड़ी (${g(grains,1) || '🍚 चावल'} + ${g(proteins,0) || '🫘 दाल'}) + ${g(fats,0) || '🧈 घी'}`, note: 'Easy to digest' },
          { time: 'शाम 6:00', meal: `${g(grains,0) || '🌾 गेहूँ'} रोटी + ${g(vegs,1) || '🥕 गाजर'} + ${g(proteins,1) || '🫙 दही'}`, note: 'Balanced dinner' },
          { time: 'रात 8:00', meal: `${g(proteins,0) || '🥛 दूध'} + हल्दी + ${g(fats,1) || '🍯 गुड़'} + ${g(dryFruits,0) || '🥜 बादाम'}`, note: 'Night recovery' },
        ],
        tips: [
          '🚨 दिन में 8 बार खिलाएं (हर 2 घंटे)',
          '🏥 तुरंत NRC (Nutrition Rehabilitation Centre) जाएं',
          '💊 Vitamin A + Iron + Zinc सप्लीमेंट दें',
          '🍯 हर खाने में घी/तेल/गुड़ मिलाएं (calorie बढ़ाने के लिए)',
          '💧 ORS दें अगर दस्त हो',
          dryFruits.length > 0 ? `🥜 ${dryFruits.map(d => d.name).join(', ')} रोज दें` : '🥜 मूंगफली/गुड़ की चिक्की दें',
          '🥚 अंडा रोज दें (अगर उपलब्ध हो)',
          '⚠️ हर हफ्ते वजन चेक करें'
        ]
      };
    } else if (severity === 'MAM') {
      return {
        title: '🟠 MAM - मध्यम कुपोषण आहार योजना',
        subtitle: areaType === 'rural' ? '(ग्रामीण क्षेत्र)' : '(शहरी क्षेत्र)',
        calories: '1200-1500 कैलोरी/दिन',
        meals: [
          { time: 'सुबह 7:00', meal: `${g(proteins,0) || '🥛 दूध'} + ${g(grains,0) || '🌾 गेहूँ'} दलिया + ${g(dryFruits,0) || '🥜 मूंगफली'}`, note: 'Healthy start' },
          { time: 'सुबह 10:00', meal: `${g(fruits,0) || '🍌 केला'} + ${g(dryFruits,0) || '🥜 बादाम'} 5-6 दाने`, note: 'Fruit snack' },
          { time: 'दोपहर 12:30', meal: `${g(grains,0) || '🍚 चावल'} + ${g(proteins,0) || '🫘 दाल'} + ${g(vegs,0) || '🥬 पालक'} + ${g(fats,0) || '🧈 घी'}`, note: 'Full meal' },
          { time: 'दोपहर 3:00', meal: `${g(proteins,1) || '🫙 दही'} + ${g(fats,1) || '🍯 गुड़'} + ${g(dryFruits,1) || '🥜 काजू'} 3-4 दाने`, note: 'Energy boost' },
          { time: 'शाम 6:30', meal: `रोटी + ${g(vegs,1) || '🥕 गाजर'} सब्जी + ${g(proteins,0) || '🫘 दाल'}`, note: 'Light dinner' },
          { time: 'रात 8:30', meal: `${g(proteins,0) || '🥛 दूध'} + ${g(dryFruits,0) || '🥜 बादाम'}`, note: 'Night nutrition' },
        ],
        tips: [
          '⚠️ दिन में 6 बार खिलाएं',
          '🥜 Dry fruits (मूंगफली/बादाम/काजू) रोज दें',
          '🥚 अंडा या पनीर दें protein के लिए',
          '🥛 दूध में हल्दी + शहद मिलाकर दें',
          '👨‍⚕️ हर 2 हफ्ते में doctor से मिलें',
          '📊 हर हफ्ते MUAC check करें',
          dryFruits.length > 0 ? `🥜 ${dryFruits.map(d => d.name).join(', ')} daily दें` : '🥜 मूंगफली + गुड़ दें'
        ]
      };
    } else {
      return {
        title: '🟢 Normal - सामान्य पोषण योजना',
        subtitle: areaType === 'rural' ? '(ग्रामीण क्षेत्र)' : '(शहरी क्षेत्र)',
        calories: '1000-1200 कैलोरी/दिन',
        meals: [
          { time: 'सुबह 7:30', meal: `${g(proteins,0) || '🥛 दूध'} + परांठा/दलिया + ${g(dryFruits,0) || '🥜 बादाम'} 3-4`, note: 'Balanced start' },
          { time: 'सुबह 10:00', meal: `${g(fruits,0) || '🍌 केला'} + ${g(dryFruits,0) || '🥜 मूंगफली'}`, note: 'Fruit break' },
          { time: 'दोपहर 12:30', meal: `${g(grains,0) || '🍚 चावल'} + ${g(proteins,0) || '🫘 दाल'} + सब्जी + ${g(proteins,1) || '🫙 दही'}`, note: 'Full meal' },
          { time: 'शाम 4:00', meal: `${g(proteins,0) || '🥛 दूध'} + बिस्कुट`, note: 'Evening snack' },
          { time: 'रात 7:30', meal: `रोटी + सब्जी + ${g(proteins,0) || '🫘 दाल'}`, note: 'Light dinner' },
        ],
        tips: [
          '✅ संतुलित भोजन दें',
          '🥗 विविध प्रकार का भोजन दें',
          '💪 शारीरिक गतिविधि बढ़ाएं',
          '📅 6 महीने में health checkup करवाएं',
          dryFruits.length > 0 ? `🥜 ${dryFruits.map(d => d.name).join(', ')} weekly दें` : '🥜 Dry fruits weekly दें'
        ]
      };
    }
  };

  return (
    <div className="diet-plan">
      <h2>🍽️ डाइट प्लान (Diet Plan)</h2>

      {/* Step 1: Area Type */}
      <div style={{
        background: 'white', padding: '20px',
        borderRadius: '12px', marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3>Step 1: क्षेत्र चुनो (Area)</h3>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button onClick={() => { setAreaType('rural'); setSelectedFoods([]); setShowPlan(false); }} style={{
            flex: 1, padding: '15px', borderRadius: '8px', cursor: 'pointer',
            border: areaType === 'rural' ? '3px solid #28a745' : '2px solid #ddd',
            background: areaType === 'rural' ? '#d4edda' : 'white',
            fontSize: '16px', fontWeight: areaType === 'rural' ? 'bold' : 'normal'
          }}>
            🏡 ग्रामीण (Rural)
          </button>
          <button onClick={() => { setAreaType('urban'); setSelectedFoods([]); setShowPlan(false); }} style={{
            flex: 1, padding: '15px', borderRadius: '8px', cursor: 'pointer',
            border: areaType === 'urban' ? '3px solid #007bff' : '2px solid #ddd',
            background: areaType === 'urban' ? '#e7f3ff' : 'white',
            fontSize: '16px', fontWeight: areaType === 'urban' ? 'bold' : 'normal'
          }}>
            🏙️ शहरी (Urban)
          </button>
        </div>
      </div>

      {/* Step 2: Severity */}
      {areaType && (
        <div style={{
          background: 'white', padding: '20px',
          borderRadius: '12px', marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3>Step 2: बच्चे की स्थिति चुनो</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
            <button onClick={() => setSeverity('SAM')} style={{
              padding: '12px 24px', borderRadius: '8px', cursor: 'pointer',
              border: severity === 'SAM' ? '3px solid #dc3545' : '2px solid #ddd',
              background: severity === 'SAM' ? '#f8d7da' : 'white',
              fontWeight: severity === 'SAM' ? 'bold' : 'normal'
            }}>🔴 SAM (गंभीर)</button>
            <button onClick={() => setSeverity('MAM')} style={{
              padding: '12px 24px', borderRadius: '8px', cursor: 'pointer',
              border: severity === 'MAM' ? '3px solid #fd7e14' : '2px solid #ddd',
              background: severity === 'MAM' ? '#fff3cd' : 'white',
              fontWeight: severity === 'MAM' ? 'bold' : 'normal'
            }}>🟠 MAM (मध्यम)</button>
            <button onClick={() => setSeverity('NORMAL')} style={{
              padding: '12px 24px', borderRadius: '8px', cursor: 'pointer',
              border: severity === 'NORMAL' ? '3px solid #28a745' : '2px solid #ddd',
              background: severity === 'NORMAL' ? '#d4edda' : 'white',
              fontWeight: severity === 'NORMAL' ? 'bold' : 'normal'
            }}>🟢 Normal (सामान्य)</button>
          </div>
        </div>
      )}

      {/* Step 3: Available Foods */}
      {severity && (
        <div style={{
          background: 'white', padding: '20px',
          borderRadius: '12px', marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3>Step 3: आपके पास क्या-क्या उपलब्ध है? (चुनो)</h3>
          <p style={{ color: '#666', marginBottom: '15px' }}>जो चीजें हैं उन पर click करो ✅</p>
          
          {areaType === 'urban' && (
            <p style={{ background: '#e7f3ff', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px' }}>
              🥜 <strong>Dry Fruits भी शामिल हैं:</strong> बादाम, काजू, अखरोट, पिस्ता, किशमिश, खजूर
            </p>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {currentFoods.map(food => (
              <button key={food.id} onClick={() => toggleFood(food.id)} style={{
                padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
                border: selectedFoods.includes(food.id) ? '2px solid #28a745' : '2px solid #ddd',
                background: selectedFoods.includes(food.id) ? '#d4edda' : 'white',
                fontSize: '13px'
              }}>
                {selectedFoods.includes(food.id) ? '✅' : '⬜'} {food.name} ({food.cal} cal)
              </button>
            ))}
          </div>

          <p style={{ marginTop: '15px', color: '#666' }}>
            ✅ चुने हुए: <strong>{selectedFoods.length}</strong> items
          </p>

          <button onClick={() => setShowPlan(true)} style={{
            marginTop: '15px', padding: '12px 24px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white', border: 'none', borderRadius: '8px',
            cursor: 'pointer', fontSize: '16px', fontWeight: '600', width: '100%'
          }}>
            🍽️ डाइट प्लान बनाओ
          </button>
        </div>
      )}

      {/* Step 4: Show Diet Plan */}
      {showPlan && severity && (
        <div style={{
          background: 'white', padding: '20px',
          borderRadius: '12px', marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3>{getDietPlan().title}</h3>
          <p style={{ color: '#666' }}>{getDietPlan().subtitle}</p>
          <p style={{ marginTop: '5px' }}><strong>🔥 Target Calories:</strong> {getDietPlan().calories}</p>

          {/* Meals Table */}
          <div style={{ marginTop: '20px' }}>
            <h4>🕐 खाने का समय:</h4>
            {getDietPlan().meals.map((m, i) => (
              <div key={i} style={{
                display: 'flex', padding: '12px', borderBottom: '1px solid #eee',
                alignItems: 'center', flexWrap: 'wrap'
              }}>
                <span style={{
                  background: '#667eea', color: 'white',
                  padding: '5px 12px', borderRadius: '15px',
                  fontSize: '13px', minWidth: '120px', textAlign: 'center'
                }}>{m.time}</span>
                <span style={{ marginLeft: '15px', fontSize: '15px', flex: 1 }}>{m.meal}</span>
                <span style={{ fontSize: '12px', color: '#999', marginLeft: '10px' }}>({m.note})</span>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div style={{
            marginTop: '20px', background: '#f8f9fa',
            padding: '15px', borderRadius: '8px',
            borderLeft: '4px solid #667eea'
          }}>
            <h4>💡 जरूरी सुझाव:</h4>
            {getDietPlan().tips.map((tip, i) => (
              <p key={i} style={{ margin: '8px 0', fontSize: '14px' }}>{tip}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DietPlan;