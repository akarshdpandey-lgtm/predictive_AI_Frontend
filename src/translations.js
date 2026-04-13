// translations.js - सभी 12 भाषाओं के translations

const TRANSLATIONS = {

  // ============ ENGLISH ============
  en: {
    name: 'English', flag: '🇬🇧', voiceCode: 'en-IN',

    // Common
    welcome: 'Welcome!',
    app_title: 'Malnutrition Detection System',
    app_subtitle: 'Predictive AI System for Malnutrition - WHO Standards',
    logout: 'Logout',
    submit: 'Submit',
    back: 'Go Back',
    next: 'Next Step',
    loading: 'Loading...',
    refresh: 'Refresh',
    no_data: 'No data found. Please enter data first.',

    // Navigation
    nav_home: 'Home',
    nav_data: 'Data Entry',
    nav_scan: 'Scan',
    nav_dashboard: 'Dashboard',
    nav_score: 'Health Score',
    nav_diet: 'Diet Plan',
    nav_hospital: 'Hospital',
    nav_alerts: 'Alerts',
    nav_chat: 'AI Chat',
    nav_report: 'Report',

    // Home Page
    home_title: 'Welcome!',
    home_subtitle: 'Check malnutrition with this app',
    home_data_desc: 'Enter Height, Weight, MUAC',
    home_scan_desc: 'Edema + Anemia Check',
    home_dashboard_desc: 'View all entries',
    home_score_desc: 'Health Score /100',
    home_diet_desc: 'Rural + Urban Diet',
    home_hospital_desc: 'Find nearest hospital',
    home_alerts_desc: 'SMS + Emergency',
    home_chat_desc: 'Ask health questions',
    home_report_desc: 'Download PDF Report',

    // Data Entry - Step 1
    de_title: 'Data Entry',
    de_step1_title: 'Step 1: Enter Basic Information',
    de_height: 'Height (cm)',
    de_height_placeholder: 'e.g. 75.5',
    de_weight: 'Weight (kg)',
    de_weight_placeholder: 'e.g. 9.5',
    de_age: 'Age (months)',
    de_age_placeholder: 'e.g. 18 (in months)',
    de_gender: 'Gender',
    de_boy: 'Boy',
    de_girl: 'Girl',
    de_edema: 'Edema (Swelling)',
    de_edema_no: 'No Edema',
    de_edema_yes: 'Yes, Edema Present',
    de_next_muac: 'Go to Next Step → Enter MUAC',

    // Data Entry - Step 2
    de_step2_title: 'Step 2: Enter MUAC',
    de_muac_method: 'How are you measuring MUAC? (Select Method)',
    de_both: 'Both (Manual + Hardware)',
    de_both_desc: 'Most Accurate',
    de_manual: 'Manual Tape',
    de_manual_desc: 'Measure with hand tape',
    de_hardware: 'Hardware Device',
    de_hardware_desc: 'Measure with digital device',
    de_manual_muac: 'Manual Tape MUAC (cm)',
    de_manual_placeholder: 'Enter Manual MUAC (in cm)',
    de_hardware_muac: 'Hardware Device MUAC (cm)',
    de_hardware_placeholder: 'Enter Hardware MUAC (in cm)',
    de_manual_instructions: 'Correct Method:',
    de_manual_step1: '1. Bend left arm at 90°',
    de_manual_step2: '2. Find midpoint between shoulder and elbow',
    de_manual_step3: '3. Wrap tape without tightening',
    de_manual_step4: '4. Measure to nearest 0.1 cm',
    de_hardware_info: 'Enter reading from Digital MUAC Tape / Smart Device',
    de_notes: 'Notes (optional)',
    de_notes_placeholder: 'Any notes...',
    de_submit: 'Submit Assessment',
    de_processing: 'Processing...',

    // Accuracy
    de_accuracy_title: 'ACCURACY COMPARISON - Comparing Both',
    de_manual_label: 'MANUAL',
    de_hardware_label: 'HARDWARE',
    de_average_label: 'AVERAGE',
    de_difference: 'Difference',
    de_error_percent: 'Error %',
    de_reliability: 'Reliability',
    de_reliability_high: 'HIGH (Very Good)',
    de_reliability_medium: 'MEDIUM (OK)',
    de_reliability_low: 'LOW (Measure Again)',
    de_remeasure_warning: 'Too much difference! Please measure again!',

    // Results
    res_title: 'Assessment Complete!',
    res_sam: 'SAM - Severe Acute Malnutrition',
    res_mam: 'MAM - Moderate Acute Malnutrition',
    res_normal: 'NORMAL - Healthy',
    res_new: 'New Assessment',
    res_conditions: 'Conditions Found:',
    res_status: 'Status',
    res_advice: 'Advice',

    // Z-Score
    z_wfa: 'Weight-for-Age',
    z_hfa: 'Height-for-Age',
    z_wfh: 'Weight-for-Height',
    z_underweight: 'Underweight',
    z_stunting: 'Stunting',
    z_wasting: 'Wasting',
    z_normal: 'Normal',

    // Severity
    sev_sam: 'Severe Acute Malnutrition',
    sev_mam: 'Moderate Acute Malnutrition',
    sev_normal: 'Normal',
    adv_sam: 'Go to hospital immediately! Child has severe malnutrition.',
    adv_mam: 'Improve nutrition. Visit doctor.',
    adv_normal: 'Child is healthy. Continue good nutrition.',

    // Dashboard
    dash_title: 'Dashboard - All Assessments',
    dash_current: 'Current Status',
    dash_history: 'History',
    dash_date: 'Date',
    dash_status: 'Status',
    dash_total: 'Total Assessments',
    dash_latest_muac: 'Latest MUAC',
    dash_latest_bmi: 'Latest BMI',

    // Diet Plan
    diet_title: 'Diet Plan',
    diet_area: 'Select Area',
    diet_rural: 'Rural',
    diet_urban: 'Urban',
    diet_severity: 'Select Condition',
    diet_foods: 'What is available? (Select)',
    diet_foods_desc: 'Click on items you have',
    diet_generate: 'Generate Diet Plan',
    diet_meal_time: 'Meal Schedule',
    diet_tips: 'Important Tips',
    diet_calories: 'Target Calories',

    // Hospital
    hosp_title: 'Find Nearest Hospital',
    hosp_location: 'Enter your location',
    hosp_location_placeholder: 'Village / City name',
    hosp_search: 'Search Hospitals',
    hosp_emergency: 'Emergency Numbers',
    hosp_distance: 'Distance',
    hosp_services: 'Services',
    hosp_timing: 'Timing',
    hosp_call: 'Call',
    hosp_map: 'View Map',

    // Alerts
    alert_title: 'Alert System',
    alert_current: 'Current Status',
    alert_active: 'Active Alerts',
    alert_active_desc: 'Alerts will show until Normal',
    alert_sms_title: 'SMS/WhatsApp Alert',
    alert_rules: 'Alert Rules',
    alert_all_clear: 'All alerts are off - Child is healthy!',

    // Health Score
    score_title: 'Health Score & Nearby Status',
    score_health: 'Health Score',
    score_excellent: 'Excellent',
    score_good: 'Good',
    score_at_risk: 'At Risk',
    score_critical: 'Critical',
    score_nearby: 'Malnutrition Status Near You',
    score_nearby_note: 'This data is demo/simulation. Real data will come from Anganwadi/ICDS.',
    score_guide: 'Health Score Guide',

    // Scan
    scan_title: 'Scan & Detection',
    scan_photo: 'Photo Upload (Body Detection)',
    scan_photo_desc: 'Upload full body photo of child',
    scan_edema: 'Edema Detection (Swelling Check)',
    scan_edema_desc: 'Edema = Body swelling. Bilateral Edema = SAM.',
    scan_anemia: 'Anemia Detection (Blood Deficiency Check)',
    scan_anemia_desc: 'Anemia = Hemoglobin deficiency in blood.',
    scan_check: 'Check',

    // Edema Questions
    edema_q1: 'Is there swelling in both feet?',
    edema_q1_detail: 'Does pressing foot create a pit?',
    edema_q2: 'Is there swelling in hands?',
    edema_q2_detail: 'Do fingers look swollen?',
    edema_q3: 'Is there swelling on face?',
    edema_q3_detail: 'Swelling under cheeks or eyes?',
    edema_q4: 'Does pressing skin create a pit?',
    edema_q4_detail: 'Press shin for 3 seconds',

    // Anemia Questions
    anemia_q1: 'Is the inner part of eyes pale/white?',
    anemia_q1_detail: 'Pull lower eyelid - white instead of red?',
    anemia_q2: 'Are nails pale/white?',
    anemia_q2_detail: 'White nails instead of pink = Anemia',
    anemia_q3: 'Is tongue pale/white?',
    anemia_q3_detail: 'Check tongue color - should be red',
    anemia_q4: 'Is child very weak/tired?',
    anemia_q4_detail: 'Does not play, remains dull?',
    anemia_q5: 'Is breathing fast?',
    anemia_q5_detail: 'Fast breathing even while sitting?',

    // Report
    report_title: 'Malnutrition Detection Report',
    report_subtitle: 'Malnutrition Screening Report - WHO Standards',
    report_patient: 'Patient Information',
    report_print: 'Print / Download PDF',
    report_latest: 'Latest Assessment Result',
    report_history: 'Assessment History',
    report_reference: 'WHO Z-Score Reference',

    // Chatbot
    chat_title: 'AI Health Assistant',
    chat_subtitle: 'Ask any question about malnutrition!',
    chat_placeholder: 'Type your question...',
    chat_send: 'Send',

    // Growth Reference Table
    growth_title: 'Growth Reference Table (WHO)',
    growth_age: 'Age',
    growth_normal_weight: 'Normal Weight',
    growth_normal_height: 'Normal Height',

    // Voice
    voice_female: 'Female Voice',
    voice_male: 'Male Voice',
    voice_test: 'Test Voice',
    voice_stop: 'Stop',
    voice_speak: 'Speak this page',

    // Settings Menu
    settings: 'Settings',
    language: 'Language',
    voice: 'Voice',
    theme: 'Theme',

    // Footer
    footer_line1: 'Malnutrition Detection System - National Level Hackathon',
    footer_line2: 'WHO Standards | AI-Powered | Multilingual | Made with ❤️ for India'
  },

  // ============ HINDI ============
  hi: {
    name: 'हिंदी', flag: '🇮🇳', voiceCode: 'hi-IN',
    welcome: 'स्वागत है!',
    app_title: 'कुपोषण Detection System',
    app_subtitle: 'कुपोषण पहचान AI प्रणाली - WHO मानक',
    logout: 'लॉगआउट',
    submit: 'जमा करो',
    back: 'वापस जाओ',
    next: 'अगला कदम',
    loading: 'लोड हो रहा है...',
    refresh: 'रिफ्रेश',
    no_data: 'कोई डेटा नहीं मिला। पहले डेटा दर्ज करो।',

    nav_home: 'होम', nav_data: 'डेटा एंट्री', nav_scan: 'स्कैन',
    nav_dashboard: 'डैशबोर्ड', nav_score: 'स्वास्थ्य स्कोर',
    nav_diet: 'डाइट प्लान', nav_hospital: 'अस्पताल',
    nav_alerts: 'अलर्ट', nav_chat: 'AI चैट', nav_report: 'रिपोर्ट',

    home_title: 'स्वागत है!',
    home_subtitle: 'इस ऐप से कुपोषण की जांच करो',
    home_data_desc: 'ऊंचाई, वजन, MUAC दर्ज करो',
    home_scan_desc: 'सूजन + खून की कमी जांचो',
    home_dashboard_desc: 'सारी entries देखो',
    home_score_desc: 'स्वास्थ्य स्कोर /100',
    home_diet_desc: 'ग्रामीण + शहरी डाइट',
    home_hospital_desc: 'नजदीकी अस्पताल',
    home_alerts_desc: 'SMS + आपातकालीन',
    home_chat_desc: 'स्वास्थ्य सवाल पूछो',
    home_report_desc: 'PDF रिपोर्ट डाउनलोड',

    de_title: 'डेटा एंट्री',
    de_step1_title: 'Step 1: बच्चे की बेसिक जानकारी',
    de_height: 'ऊंचाई (cm)',
    de_height_placeholder: 'जैसे: 75.5',
    de_weight: 'वजन (kg)',
    de_weight_placeholder: 'जैसे: 9.5',
    de_age: 'उम्र (महीनों में)',
    de_age_placeholder: 'जैसे: 18 (महीनों में)',
    de_gender: 'लिंग',
    de_boy: 'लड़का',
    de_girl: 'लड़की',
    de_edema: 'सूजन (Edema)',
    de_edema_no: 'नहीं (कोई सूजन नहीं)',
    de_edema_yes: 'हाँ (सूजन है)',
    de_next_muac: 'अगले Step पर जाओ → MUAC दर्ज करो',

    de_step2_title: 'Step 2: MUAC दर्ज करो',
    de_muac_method: 'MUAC कैसे माप रहे हो? (तरीका चुनो)',
    de_both: 'दोनों (Manual + Hardware)',
    de_both_desc: 'सबसे सटीक',
    de_manual: 'मैनुअल टेप',
    de_manual_desc: 'हाथ से टेप से मापो',
    de_hardware: 'हार्डवेयर डिवाइस',
    de_hardware_desc: 'डिजिटल डिवाइस से मापो',
    de_manual_muac: 'मैनुअल टेप MUAC (cm)',
    de_manual_placeholder: 'Manual MUAC दर्ज करो (cm में)',
    de_hardware_muac: 'हार्डवेयर डिवाइस MUAC (cm)',
    de_hardware_placeholder: 'Hardware MUAC दर्ज करो (cm में)',
    de_manual_instructions: 'सही तरीका:',
    de_manual_step1: '1. बायाँ बाजू 90° पर मोड़ो',
    de_manual_step2: '2. कंधे-कोहनी के बीच मध्य बिंदु खोजो',
    de_manual_step3: '3. टेप को बिना कसे आराम से लपेटो',
    de_manual_step4: '4. निकटतम 0.1 cm तक मापो',
    de_hardware_info: 'Digital MUAC Tape / Smart Device से reading डालो',
    de_notes: 'नोट्स (वैकल्पिक)',
    de_notes_placeholder: 'कोई नोट्स...',
    de_submit: 'Assessment जमा करो',
    de_processing: 'प्रोसेसिंग...',

    de_accuracy_title: 'ACCURACY तुलना - दोनों की तुलना',
    de_manual_label: 'मैनुअल',
    de_hardware_label: 'हार्डवेयर',
    de_average_label: 'औसत',
    de_difference: 'अंतर',
    de_error_percent: 'Error %',
    de_reliability: 'विश्वसनीयता',
    de_reliability_high: 'उच्च (बहुत अच्छा)',
    de_reliability_medium: 'मध्यम (ठीक है)',
    de_reliability_low: 'कम (दोबारा मापें)',
    de_remeasure_warning: 'बहुत अंतर है! कृपया दोबारा मापें!',

    res_title: 'Assessment पूरा हुआ!',
    res_sam: 'SAM - गंभीर तीव्र कुपोषण',
    res_mam: 'MAM - मध्यम तीव्र कुपोषण',
    res_normal: 'सामान्य - स्वस्थ',
    res_new: 'नया Assessment करो',
    res_conditions: 'पाए गए लक्षण:',
    res_status: 'स्थिति',
    res_advice: 'सलाह',

    z_wfa: 'वजन-उम्र अनुपात', z_hfa: 'ऊंचाई-उम्र अनुपात', z_wfh: 'वजन-ऊंचाई अनुपात',
    z_underweight: 'कम वजन', z_stunting: 'बौनापन', z_wasting: 'दुबलापन', z_normal: 'सामान्य',

    sev_sam: 'गंभीर तीव्र कुपोषण', sev_mam: 'मध्यम तीव्र कुपोषण', sev_normal: 'सामान्य',
    adv_sam: 'तुरंत अस्पताल जाएं! बच्चे को गंभीर कुपोषण है।',
    adv_mam: 'पोषण में सुधार करें। डॉक्टर से मिलें।',
    adv_normal: 'बच्चा स्वस्थ है। अच्छा पोषण जारी रखें।',

    dash_title: 'डैशबोर्ड - सभी Assessments', dash_current: 'वर्तमान स्थिति',
    dash_history: 'इतिहास', dash_date: 'तारीख', dash_status: 'स्थिति',
    dash_total: 'कुल Assessments', dash_latest_muac: 'नवीनतम MUAC', dash_latest_bmi: 'नवीनतम BMI',

    diet_title: 'डाइट प्लान', diet_area: 'क्षेत्र चुनो', diet_rural: 'ग्रामीण',
    diet_urban: 'शहरी', diet_severity: 'स्थिति चुनो',
    diet_foods: 'क्या-क्या उपलब्ध है? (चुनो)', diet_foods_desc: 'जो चीजें हैं उन पर click करो',
    diet_generate: 'डाइट प्लान बनाओ', diet_meal_time: 'खाने का समय',
    diet_tips: 'जरूरी सुझाव', diet_calories: 'लक्ष्य कैलोरी',

    hosp_title: 'नजदीकी अस्पताल खोजो', hosp_location: 'अपना स्थान बताओ',
    hosp_location_placeholder: 'गाँव / शहर का नाम', hosp_search: 'अस्पताल खोजो',
    hosp_emergency: 'आपातकालीन नंबर', hosp_distance: 'दूरी',
    hosp_services: 'सुविधाएं', hosp_timing: 'समय', hosp_call: 'फोन करो', hosp_map: 'Map देखो',

    alert_title: 'अलर्ट सिस्टम', alert_current: 'वर्तमान स्थिति',
    alert_active: 'सक्रिय अलर्ट', alert_active_desc: 'Normal आने तक अलर्ट दिखेगा',
    alert_sms_title: 'SMS/WhatsApp अलर्ट', alert_rules: 'अलर्ट नियम',
    alert_all_clear: 'सभी अलर्ट बंद हैं - बच्चा स्वस्थ है!',

    score_title: 'स्वास्थ्य स्कोर और आस-पास की स्थिति',
    score_health: 'स्वास्थ्य स्कोर', score_excellent: 'उत्कृष्ट',
    score_good: 'अच्छा', score_at_risk: 'खतरे में', score_critical: 'गंभीर',
    score_nearby: 'आपके आस-पास कुपोषण की स्थिति',
    score_nearby_note: 'यह data demo है। असली data आंगनवाड़ी/ICDS से आएगा।',
    score_guide: 'स्वास्थ्य स्कोर गाइड',

    scan_title: 'स्कैन और पहचान',
    scan_photo: 'फोटो अपलोड (शरीर पहचान)', scan_photo_desc: 'बच्चे की पूरी फोटो अपलोड करें',
    scan_edema: 'सूजन जांच (Edema Detection)',
    scan_edema_desc: 'Edema = शरीर में सूजन। दोनों तरफ सूजन = SAM।',
    scan_anemia: 'खून की कमी जांच (Anemia Detection)',
    scan_anemia_desc: 'Anemia = खून में Hemoglobin की कमी।',
    scan_check: 'जांच करो',

    edema_q1: 'क्या दोनों पैरों में सूजन है?', edema_q1_detail: 'पैर दबाने पर गड्ढा बनता है?',
    edema_q2: 'क्या हाथों में सूजन है?', edema_q2_detail: 'उँगलियाँ फूली हुई दिखती हैं?',
    edema_q3: 'क्या चेहरे पर सूजन है?', edema_q3_detail: 'गाल या आँखों के नीचे सूजन?',
    edema_q4: 'क्या त्वचा दबाने पर गड्ढा बनता है?', edema_q4_detail: 'पिंडली पर 3 सेकंड दबाएं',

    anemia_q1: 'क्या आँखों का अंदरूनी हिस्सा पीला/सफेद है?',
    anemia_q1_detail: 'नीचे की पलक खींचकर देखें',
    anemia_q2: 'क्या नाखून पीले/सफेद हैं?', anemia_q2_detail: 'गुलाबी की जगह सफेद = Anemia',
    anemia_q3: 'क्या जीभ पीली/सफेद है?', anemia_q3_detail: 'जीभ लाल होनी चाहिए',
    anemia_q4: 'क्या बच्चा बहुत कमजोर/थका हुआ है?', anemia_q4_detail: 'खेलता नहीं, सुस्त रहता है?',
    anemia_q5: 'क्या साँस तेज चलती है?', anemia_q5_detail: 'आराम से बैठे भी साँस तेज?',

    report_title: 'कुपोषण Detection रिपोर्ट',
    report_subtitle: 'कुपोषण स्क्रीनिंग रिपोर्ट - WHO मानक',
    report_patient: 'रोगी की जानकारी', report_print: 'प्रिंट / PDF डाउनलोड',
    report_latest: 'नवीनतम Assessment परिणाम', report_history: 'Assessment इतिहास',
    report_reference: 'WHO Z-Score संदर्भ',

    chat_title: 'AI स्वास्थ्य सहायक', chat_subtitle: 'कुपोषण से जुड़ा कोई भी सवाल पूछें!',
    chat_placeholder: 'अपना सवाल लिखें...', chat_send: 'भेजो',

    growth_title: 'विकास संदर्भ तालिका (WHO)', growth_age: 'उम्र',
    growth_normal_weight: 'सामान्य वजन', growth_normal_height: 'सामान्य ऊंचाई',

    voice_female: 'महिला आवाज़', voice_male: 'पुरुष आवाज़',
    voice_test: 'आवाज़ टेस्ट', voice_stop: 'बंद करो', voice_speak: 'यह पेज बोलो',

    settings: 'सेटिंग्स', language: 'भाषा', voice: 'आवाज़', theme: 'थीम',

    footer_line1: 'कुपोषण Detection System - राष्ट्रीय स्तर हैकथॉन',
    footer_line2: 'WHO मानक | AI-संचालित | बहुभाषी | भारत के लिए ❤️ से बनाया'
  },

  // ============ MARATHI ============
  mr: {
    name: 'मराठी', flag: '🇮🇳', voiceCode: 'mr-IN',
    welcome: 'स्वागत!', app_title: 'कुपोषण Detection System',
    app_subtitle: 'कुपोषण ओळख AI प्रणाली - WHO मानके',
    logout: 'लॉगआउट', submit: 'सबमिट करा', back: 'मागे जा', next: 'पुढचे पाऊल',
    loading: 'लोड होत आहे...', refresh: 'रिफ्रेश', no_data: 'डेटा सापडला नाही.',

    nav_home: 'होम', nav_data: 'डेटा एंट्री', nav_scan: 'स्कॅन',
    nav_dashboard: 'डॅशबोर्ड', nav_score: 'आरोग्य गुण', nav_diet: 'आहार योजना',
    nav_hospital: 'रुग्णालय', nav_alerts: 'सूचना', nav_chat: 'AI चॅट', nav_report: 'अहवाल',

    home_title: 'स्वागत!', home_subtitle: 'या ऐपने कुपोषण तपासा',
    home_data_desc: 'उंची, वजन, MUAC टाका', home_scan_desc: 'सूज + रक्ताल्पता तपासा',
    home_dashboard_desc: 'सर्व नोंदी पहा', home_score_desc: 'आरोग्य गुण /100',
    home_diet_desc: 'ग्रामीण + शहरी आहार', home_hospital_desc: 'जवळचे रुग्णालय',
    home_alerts_desc: 'SMS + आणीबाणी', home_chat_desc: 'आरोग्य प्रश्न विचारा',
    home_report_desc: 'PDF अहवाल डाउनलोड',

    de_title: 'डेटा एंट्री', de_step1_title: 'पायरी 1: मूलभूत माहिती',
    de_height: 'उंची (cm)', de_height_placeholder: 'उदा: 75.5',
    de_weight: 'वजन (kg)', de_weight_placeholder: 'उदा: 9.5',
    de_age: 'वय (महिन्यांत)', de_age_placeholder: 'उदा: 18',
    de_gender: 'लिंग', de_boy: 'मुलगा', de_girl: 'मुलगी',
    de_edema: 'सूज (Edema)', de_edema_no: 'नाही', de_edema_yes: 'होय, सूज आहे',
    de_next_muac: 'पुढे जा → MUAC टाका',

    de_step2_title: 'पायरी 2: MUAC टाका',
    de_muac_method: 'MUAC कसे मोजत आहात?',
    de_both: 'दोन्ही', de_both_desc: 'सर्वात अचूक',
    de_manual: 'मॅन्युअल टेप', de_manual_desc: 'हाताने मोजा',
    de_hardware: 'हार्डवेअर', de_hardware_desc: 'डिजिटल उपकरणाने',
    de_manual_muac: 'मॅन्युअल MUAC (cm)', de_manual_placeholder: 'मॅन्युअल MUAC टाका',
    de_hardware_muac: 'हार्डवेअर MUAC (cm)', de_hardware_placeholder: 'हार्डवेअर MUAC टाका',
    de_submit: 'Assessment सबमिट करा', de_processing: 'प्रक्रिया सुरू...',

    res_title: 'Assessment पूर्ण!',
    res_sam: 'SAM - गंभीर तीव्र कुपोषण', res_mam: 'MAM - मध्यम तीव्र कुपोषण',
    res_normal: 'सामान्य - निरोगी', res_new: 'नवीन Assessment करा',

    sev_sam: 'गंभीर तीव्र कुपोषण', sev_mam: 'मध्यम तीव्र कुपोषण', sev_normal: 'सामान्य',
    adv_sam: 'लगेच हॉस्पिटलला जा! मुलाला गंभीर कुपोषण आहे.',
    adv_mam: 'पोषण सुधारा. डॉक्टरांना भेटा.',
    adv_normal: 'मूल निरोगी आहे. चांगले पोषण सुरू ठेवा.',

    dash_title: 'डॅशबोर्ड', dash_current: 'सध्याची स्थिती', dash_history: 'इतिहास',

    footer_line1: 'कुपोषण Detection System - राष्ट्रीय हॅकेथॉन',
    footer_line2: 'WHO मानके | AI | बहुभाषिक | भारतासाठी ❤️'
  },

  // ============ BENGALI ============
  bn: {
    name: 'বাংলা', flag: '🇮🇳', voiceCode: 'bn-IN',
    welcome: 'স্বাগতম!', app_title: 'অপুষ্টি শনাক্তকরণ সিস্টেম',
    app_subtitle: 'অপুষ্টি শনাক্তকরণ AI - WHO মান',
    logout: 'লগআউট', submit: 'জমা দিন', back: 'ফিরে যান', next: 'পরবর্তী',
    loading: 'লোড হচ্ছে...', refresh: 'রিফ্রেশ',

    nav_home: 'হোম', nav_data: 'ডেটা এন্ট্রি', nav_scan: 'স্ক্যান',
    nav_dashboard: 'ড্যাশবোর্ড', nav_score: 'স্বাস্থ্য স্কোর',
    nav_diet: 'ডায়েট প্ল্যান', nav_hospital: 'হাসপাতাল',
    nav_alerts: 'সতর্কতা', nav_chat: 'AI চ্যাট', nav_report: 'রিপোর্ট',

    de_title: 'ডেটা এন্ট্রি', de_step1_title: 'ধাপ 1: মৌলিক তথ্য',
    de_height: 'উচ্চতা (cm)', de_weight: 'ওজন (kg)', de_age: 'বয়স (মাসে)',
    de_gender: 'লিঙ্গ', de_boy: 'ছেলে', de_girl: 'মেয়ে',
    de_submit: 'মূল্যায়ন জমা দিন',

    res_sam: 'SAM - গুরুতর তীব্র অপুষ্টি', res_mam: 'MAM - মাঝারি তীব্র অপুষ্টি',
    res_normal: 'স্বাভাবিক - সুস্থ',
    adv_sam: 'এখনই হাসপাতালে যান!', adv_mam: 'পুষ্টি উন্নত করুন।',
    adv_normal: 'শিশু সুস্থ আছে।',

    footer_line1: 'অপুষ্টি শনাক্তকরণ - জাতীয় হ্যাকাথন',
    footer_line2: 'WHO | AI | বহুভাষিক | ভারতের জন্য ❤️'
  },

  // ============ TAMIL ============
  ta: {
    name: 'தமிழ்', flag: '🇮🇳', voiceCode: 'ta-IN',
    welcome: 'வரவேற்கிறோம்!', app_title: 'ஊட்டச்சத்து குறைபாடு கண்டறிதல்',
    nav_home: 'முகப்பு', nav_data: 'தரவு பதிவு', nav_dashboard: 'டாஷ்போர்டு',
    de_title: 'தரவு பதிவு', de_height: 'உயரம் (cm)', de_weight: 'எடை (kg)',
    de_boy: 'ஆண்', de_girl: 'பெண்', de_submit: 'சமர்ப்பிக்கவும்',
    res_sam: 'SAM - கடுமையான ஊட்டச்சத்து குறைபாடு',
    adv_sam: 'உடனடியாக மருத்துவமனைக்கு செல்லுங்கள்!',
    footer_line1: 'ஊட்டச்சத்து கண்டறிதல் - தேசிய ஹேக்கத்தான்'
  },

  // ============ TELUGU ============
  te: {
    name: 'తెలుగు', flag: '🇮🇳', voiceCode: 'te-IN',
    welcome: 'స్వాగతం!', app_title: 'పోషకాహార లోపం గుర్తింపు',
    nav_home: 'హోమ్', nav_data: 'డేటా ఎంట్రీ', nav_dashboard: 'డాష్‌బోర్డ్',
    de_title: 'డేటా ఎంట్రీ', de_height: 'ఎత్తు (cm)', de_weight: 'బరువు (kg)',
    de_boy: 'అబ్బాయి', de_girl: 'అమ్మాయి', de_submit: 'సమర్పించండి',
    res_sam: 'SAM - తీవ్రమైన పోషకాహార లోపం',
    adv_sam: 'వెంటనే ఆసుపత్రికి వెళ్ళండి!',
    footer_line1: 'పోషకాహార గుర్తింపు - జాతీయ హ్యాకథాన్'
  },

  // ============ GUJARATI ============
  gu: {
    name: 'ગુજરાતી', flag: '🇮🇳', voiceCode: 'gu-IN',
    welcome: 'સ્વાગત!', app_title: 'કુપોષણ ઓળખ સિસ્ટમ',
    nav_home: 'હોમ', nav_data: 'ડેટા એન્ટ્રી', nav_dashboard: 'ડેશબોર્ડ',
    de_title: 'ડેટા એન્ટ્રી', de_height: 'ઊંચાઈ (cm)', de_weight: 'વજન (kg)',
    de_boy: 'છોકરો', de_girl: 'છોકરી', de_submit: 'સબમિટ કરો',
    res_sam: 'SAM - ગંભીર કુપોષણ',
    adv_sam: 'તાત્કાલિક હોસ્પિટલ જાઓ!',
    footer_line1: 'કુપોષણ ઓળખ - રાષ્ટ્રીય હેકેથોન'
  },

  // ============ KANNADA ============
  kn: {
    name: 'ಕನ್ನಡ', flag: '🇮🇳', voiceCode: 'kn-IN',
    welcome: 'ಸ್ವಾಗತ!', app_title: 'ಅಪೌಷ್ಟಿಕತೆ ಪತ್ತೆ ವ್ಯವಸ್ಥೆ',
    de_title: 'ಡೇಟಾ ಎಂಟ್ರಿ', de_height: 'ಎತ್ತರ', de_weight: 'ತೂಕ',
    de_boy: 'ಹುಡುಗ', de_girl: 'ಹುಡುಗಿ', de_submit: 'ಸಲ್ಲಿಸಿ',
    adv_sam: 'ತಕ್ಷಣ ಆಸ್ಪತ್ರೆಗೆ ಹೋಗಿ!',
  },

  // ============ MALAYALAM ============
  ml: {
    name: 'മലയാളം', flag: '🇮🇳', voiceCode: 'ml-IN',
    welcome: 'സ്വാഗതം!', app_title: 'പോഷകാഹാരക്കുറവ് കണ്ടെത്തൽ',
    de_title: 'ഡാറ്റ എൻട്രി', de_height: 'ഉയരം', de_weight: 'ഭാരം',
    de_boy: 'ആൺ', de_girl: 'പെൺ', de_submit: 'സമർപ്പിക്കുക',
    adv_sam: 'ഉടൻ ആശുപത്രിയിൽ പോകുക!',
  },

  // ============ ODIA ============
  od: {
    name: 'ଓଡ଼ିଆ', flag: '🇮🇳', voiceCode: 'or-IN',
    welcome: 'ସ୍ୱାଗତ!', app_title: 'କୁପୋଷଣ ଚିହ୍ନଟ ସିଷ୍ଟମ',
    de_title: 'ଡାଟା ଏଣ୍ଟ୍ରି', de_height: 'ଉଚ୍ଚତା', de_weight: 'ଓଜନ',
    de_boy: 'ପୁଅ', de_girl: 'ଝିଅ', de_submit: 'ଦାଖଲ କରନ୍ତୁ',
    adv_sam: 'ତୁରନ୍ତ ହସ୍ପିଟାଲ ଯାଆନ୍ତୁ!',
  },

  // ============ PUNJABI ============
  pa: {
    name: 'ਪੰਜਾਬੀ', flag: '🇮🇳', voiceCode: 'pa-IN',
    welcome: 'ਸੁਆਗਤ ਹੈ!', app_title: 'ਕੁਪੋਸ਼ਣ ਪਛਾਣ ਸਿਸਟਮ',
    de_title: 'ਡੇਟਾ ਐਂਟਰੀ', de_height: 'ਕੱਦ', de_weight: 'ਭਾਰ',
    de_boy: 'ਮੁੰਡਾ', de_girl: 'ਕੁੜੀ', de_submit: 'ਜਮ੍ਹਾਂ ਕਰੋ',
    adv_sam: 'ਤੁਰੰਤ ਹਸਪਤਾਲ ਜਾਓ!',
  },

  // ============ URDU ============
  ur: {
    name: 'اردو', flag: '🇮🇳', voiceCode: 'ur-IN',
    welcome: '!خوش آمدید', app_title: 'غذائی قلت کا نظام',
    de_title: 'ڈیٹا انٹری', de_height: 'قد', de_weight: 'وزن',
    de_boy: 'لڑکا', de_girl: 'لڑکی', de_submit: 'جمع کریں',
    adv_sam: '!فوری طور پر ہسپتال جائیں',
  }
};

// Helper: Get translation with fallback to Hindi then English
export const getT = (lang, key) => {
  if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) return TRANSLATIONS[lang][key];
  if (TRANSLATIONS['hi'] && TRANSLATIONS['hi'][key]) return TRANSLATIONS['hi'][key];
  if (TRANSLATIONS['en'] && TRANSLATIONS['en'][key]) return TRANSLATIONS['en'][key];
  return key;
};

export default TRANSLATIONS;