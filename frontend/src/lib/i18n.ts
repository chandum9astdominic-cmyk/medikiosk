import { SupportedLanguage } from './types';

export interface UIStrings {
  appName: string;
  appTagline: string;
  welcomeDescription: string;
  startBtn: string;
  selectLanguage: string;
  english: string;
  hindi: string;
  kannada: string;
  demoModeNotice: string;
  loadDemoPatient: string;
  
  // Consent
  consentTitle: string;
  consentSummary: string;
  consentPoint1: string;
  consentPoint2: string;
  consentPoint3: string;
  consentPoint4: string;
  agreeBtn: string;
  declineBtn: string;
  consentDeclinedTitle: string;
  consentDeclinedMessage: string;
  returnToStart: string;

  // Patient Info
  patientInfoTitle: string;
  patientInfoSubtitle: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  ageLabel: string;
  agePlaceholder: string;
  sexLabel: string;
  male: string;
  female: string;
  other: string;
  preferNotToSay: string;
  mrnLabel: string;
  mrnPlaceholder: string;
  abhaLabel: string;
  abhaPlaceholder: string;
  mockAbhaBtn: string;
  startIntakeBtn: string;

  // Questions
  questionProgress: string;
  typeAnswerPlaceholder: string;
  submitAnswerBtn: string;
  nextBtn: string;
  backBtn: string;
  dontKnowBtn: string;
  preferNotToAnswerBtn: string;
  skipBtn: string;
  speakBtn: string;
  stopListeningBtn: string;
  voicePlaceholderNotice: string;
  voiceSimulatedNotice: string;
  listeningActive: string;
  
  // Red Flag
  redFlagTitle: string;
  redFlagMessage: string;

  // Review
  reviewTitle: string;
  reviewSubtitle: string;
  chiefComplaint: string;
  statusAnswered: string;
  statusUnknown: string;
  statusDeclined: string;
  statusSkipped: string;
  editAnswer: string;
  confirmAndCompleteBtn: string;

  // Completion
  completionTitle: string;
  completionSubtitle: string;
  completionInstruction: string;
  completionNote: string;
  startNewSessionBtn: string;

  // Accessibility & Chrome
  fontSize: string;
  normalText: string;
  largeText: string;
  highContrast: string;
  emergencyNotice: string;
  sessionResumedNotice: string;
  loading: string;
  errorTitle: string;
  retryBtn: string;
  networkErrorMessage: string;
}

export const translations: Record<SupportedLanguage, UIStrings> = {
  en: {
    appName: "MediKiosk",
    appTagline: "Pre-Consultation Clinical Intake Kiosk",
    welcomeDescription: "Welcome. This kiosk securely collects your health history before you see the doctor. It helps the clinical team understand your symptoms thoroughly and prepares a structured summary for your physician.",
    startBtn: "Touch Here to Start",
    selectLanguage: "Choose Your Language / भाषा चुनें / ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    english: "English",
    hindi: "हिन्दी (Hindi)",
    kannada: "ಕನ್ನಡ (Kannada)",
    demoModeNotice: "Demonstration Mode: Uses synthetic test patient data only",
    loadDemoPatient: "Load 45yo Male Demo Patient (Abdominal Pain)",

    // Consent
    consentTitle: "Informed Pre-Consultation Consent",
    consentSummary: "Please review how your health information will be collected and used:",
    consentPoint1: "You are answering questions about your current symptoms and medical background.",
    consentPoint2: "This information will generate a clinical briefing for your doctor.",
    consentPoint3: "This kiosk does NOT diagnose conditions or prescribe medications.",
    consentPoint4: "Your doctor remains fully responsible for all clinical assessments and decisions.",
    agreeBtn: "I Understand and Agree",
    declineBtn: "I Decline to Use Kiosk",
    consentDeclinedTitle: "Consent Declined",
    consentDeclinedMessage: "You have chosen not to use the automated kiosk. Please proceed directly to the registration counter or waiting area to see the doctor in person.",
    returnToStart: "Return to Home",

    // Patient Info
    patientInfoTitle: "Patient Information",
    patientInfoSubtitle: "Please provide your basic details so we can connect your responses to your consultation.",
    fullNameLabel: "Full Name",
    fullNamePlaceholder: "Enter your full name",
    ageLabel: "Age (Years)",
    agePlaceholder: "e.g. 45",
    sexLabel: "Sex / Gender",
    male: "Male",
    female: "Female",
    other: "Other",
    preferNotToSay: "Prefer not to say",
    mrnLabel: "Patient ID / Hospital Number (Optional)",
    mrnPlaceholder: "e.g. MRN-10293",
    abhaLabel: "ABHA Number (Optional)",
    abhaPlaceholder: "e.g. 91-xxxx-xxxx-xxxx",
    mockAbhaBtn: "Mock Verify ABHA",
    startIntakeBtn: "Begin Health Questions",

    // Questions
    questionProgress: "History Progress",
    typeAnswerPlaceholder: "Type your answer or touch a response button below...",
    submitAnswerBtn: "Submit & Next",
    nextBtn: "Next Question",
    backBtn: "Previous",
    dontKnowBtn: "I Don't Know",
    preferNotToAnswerBtn: "Prefer Not to Answer",
    skipBtn: "Skip Question",
    speakBtn: "Touch to Speak (Voice)",
    stopListeningBtn: "Stop Recording",
    voicePlaceholderNotice: "Voice Assistant Input (UI Placeholder)",
    voiceSimulatedNotice: "Voice recognition simulated for kiosk prototype.",
    listeningActive: "Listening... speak clearly into the microphone.",

    // Red Flag
    redFlagTitle: "Important Clinical Note",
    redFlagMessage: "Based on your answer, an urgent symptom alert has been flagged for the medical team. Please inform the nurse or doctor immediately upon entering the consultation room.",

    // Review
    reviewTitle: "Review Your Health History",
    reviewSubtitle: "Please verify that your recorded answers are accurate. You can edit any response before finalizing.",
    chiefComplaint: "Chief Reason for Visit",
    statusAnswered: "Recorded",
    statusUnknown: "Not Known",
    statusDeclined: "Declined",
    statusSkipped: "Skipped",
    editAnswer: "Change",
    confirmAndCompleteBtn: "Confirm & Submit to Doctor",

    // Completion
    completionTitle: "Health History Recorded Successfully",
    completionSubtitle: "Your pre-consultation summary is now ready for your physician.",
    completionInstruction: "Please take your token number and proceed to the designated consultation room or waiting area.",
    completionNote: "Notice: MediKiosk is a clinical intake tool. All diagnoses, examinations, and treatment plans will be conducted by your licensed medical practitioner.",
    startNewSessionBtn: "Finish and Return to Home",

    // Accessibility & Chrome
    fontSize: "Text Size",
    normalText: "Standard",
    largeText: "Large",
    highContrast: "High Contrast",
    emergencyNotice: "If this is a severe emergency (e.g. chest pain, severe bleeding, difficulty breathing), please alert hospital staff immediately.",
    sessionResumedNotice: "Active consultation session restored.",
    loading: "Loading...",
    errorTitle: "Notice",
    retryBtn: "Retry",
    networkErrorMessage: "Unable to reach the server. Please check your connection or contact kiosk support."
  },
  hi: {
    appName: "मेडीकियोस्क (MediKiosk)",
    appTagline: "परामर्श-पूर्व स्वास्थ्य इतिहास कियोस्क",
    welcomeDescription: "स्वागत है। यह कियोस्क डॉक्टर से मिलने से पहले आपके स्वास्थ्य इतिहास को सुरक्षित रूप से एकत्र करता है ताकि डॉक्टर आपकी स्थिति को बेहतर समझ सकें।",
    startBtn: "शुरू करने के लिए यहाँ स्पर्श करें",
    selectLanguage: "भाषा चुनें (Choose Language)",
    english: "English",
    hindi: "हिन्दी (Hindi)",
    kannada: "ಕನ್ನಡ (Kannada)",
    demoModeNotice: "डेमो मोड: केवल कृत्रिम परीक्षण डेटा का उपयोग करता है",
    loadDemoPatient: "45 वर्षीय पुरुष डेमो रोगी लोड करें (पेट दर्द)",

    // Consent
    consentTitle: "परामर्श-पूर्व सहमति",
    consentSummary: "कृपया समझें कि आपकी स्वास्थ्य जानकारी कैसे एकत्र की जाएगी:",
    consentPoint1: "आप अपने वर्तमान लक्षणों और चिकित्सा पृष्ठभूमि के बारे में उत्तर दे रहे हैं।",
    consentPoint2: "यह जानकारी डॉक्टर के लिए एक सारांश तैयार करेगी।",
    consentPoint3: "यह कियोस्क किसी बीमारी का निदान या दवा नहीं लिखता है।",
    consentPoint4: "आपके डॉक्टर सभी नैदानिक निर्णयों के लिए पूरी तरह से जिम्मेदार हैं।",
    agreeBtn: "मैं समझता हूँ और सहमत हूँ",
    declineBtn: "मैं अस्वीकार करता हूँ",
    consentDeclinedTitle: "सहमति अस्वीकृत",
    consentDeclinedMessage: "आपने कियोस्क का उपयोग न करने का विकल्प चुना है। कृपया डॉक्टर से मिलने के लिए सीधे पंजीकरण काउंटर पर जाएं।",
    returnToStart: "मुखपृष्ठ पर वापस जाएं",

    // Patient Info
    patientInfoTitle: "रोगी की जानकारी",
    patientInfoSubtitle: "कृपया अपना विवरण दर्ज करें।",
    fullNameLabel: "पूरा नाम",
    fullNamePlaceholder: "अपना नाम दर्ज करें",
    ageLabel: "आयु (वर्ष)",
    agePlaceholder: "उदा. 45",
    sexLabel: "लिंग",
    male: "पुरुष",
    female: "महिला",
    other: "अन्य",
    preferNotToSay: "नहीं बताना चाहते",
    mrnLabel: "रोगी पहचान संख्या (वैकल्पिक)",
    mrnPlaceholder: "उदा. MRN-10293",
    abhaLabel: "ABHA Number (Optional)",
    abhaPlaceholder: "e.g. 91-xxxx-xxxx-xxxx",
    mockAbhaBtn: "Mock Verify ABHA",
    startIntakeBtn: "स्वास्थ्य प्रश्न शुरू करें",

    // Questions
    questionProgress: "इतिहास प्रगति",
    typeAnswerPlaceholder: "अपना उत्तर लिखें या नीचे दिए गए विकल्पों को स्पर्श करें...",
    submitAnswerBtn: "उत्तर जमा करें",
    nextBtn: "अगला प्रश्न",
    backBtn: "पिछला",
    dontKnowBtn: "मुझे नहीं पता",
    preferNotToAnswerBtn: "उत्तर नहीं देना चाहते",
    skipBtn: "प्रश्न छोड़ें",
    speakBtn: "बोलने के लिए स्पर्श करें",
    stopListeningBtn: "रिकॉर्डिंग रोकें",
    voicePlaceholderNotice: "ध्वनि सहायक (प्रोटोटाइप UI)",
    voiceSimulatedNotice: "डेमो के लिए वॉइस इनपुट सिमुलेटेड है।",
    listeningActive: "सुन रहे हैं... कृपया स्पष्ट बोलें।",

    // Red Flag
    redFlagTitle: "महत्वपूर्ण नैदानिक सूचना",
    redFlagMessage: "आपके उत्तर के आधार पर एक महत्वपूर्ण लक्षण नोट किया गया है। कृपया परामर्श कक्ष में प्रवेश करते ही तुरंत डॉक्टर या नर्स को बताएं।",

    // Review
    reviewTitle: "अपने स्वास्थ्य इतिहास की समीक्षा करें",
    reviewSubtitle: "कृपया पुष्टि करें कि दर्ज किए गए उत्तर सही हैं।",
    chiefComplaint: "मुख्य समस्या",
    statusAnswered: "दर्ज किया गया",
    statusUnknown: "अज्ञात",
    statusDeclined: "अस्वीकृत",
    statusSkipped: "छोड़ा गया",
    editAnswer: "बदलें",
    confirmAndCompleteBtn: "पुष्टि करें और डॉक्टर को भेजें",

    // Completion
    completionTitle: "स्वास्थ्य इतिहास सफलतापूर्वक दर्ज हुआ",
    completionSubtitle: "आपका विवरण डॉक्टर के लिए तैयार है।",
    completionInstruction: "कृपया अपना टोकन नंबर लें और निर्दिष्ट परामर्श कक्ष में जाएं।",
    completionNote: "सूचना: मेडीकियोस्क एक जानकारी संग्रह उपकरण है। सभी जांच और उपचार केवल योग्य चिकित्सक द्वारा किए जाएंगे।",
    startNewSessionBtn: "समाप्त करें और मुखपृष्ठ पर जाएं",

    // Accessibility & Chrome
    fontSize: "अक्षर का आकार",
    normalText: "सामान्य",
    largeText: "बड़ा",
    highContrast: "उच्च कंट्रास्ट",
    emergencyNotice: "यदि यह आपातकालीन स्थिति है (उदा. सीने में दर्द, अत्यधिक रक्तस्राव), तो तुरंत अस्पताल कर्मचारियों से संपर्क करें।",
    sessionResumedNotice: "पिछला सत्र पुनः प्राप्त कर लिया गया है।",
    loading: "लोड हो रहा है...",
    errorTitle: "सूचना",
    retryBtn: "पुनः प्रयास करें",
    networkErrorMessage: "सर्वर से संपर्क नहीं हो सका। कृपया कनेक्शन जांचें।"
  },
  kn: {
    appName: "ಮೆಡಿಕಿಯೋಸ್ಕ್ (MediKiosk)",
    appTagline: "ವೈದ್ಯರ ಸಮಾಲೋಚನೆಗೆ ಮುಂಚಿನ ಆರೋಗ್ಯ ಇತಿಹಾಸ ಕಿಯೋಸ್ಕ್",
    welcomeDescription: "ಸ್ವಾಗತ. ಈ ಕಿಯೋಸ್ಕ್ ವೈದ್ಯರನ್ನು ಭೇಟಿಯಾಗುವ ಮುನ್ನ ನಿಮ್ಮ ಆರೋಗ್ಯ ಇತಿಹಾಸವನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಸಂಗ್ರಹಿಸುತ್ತದೆ.",
    startBtn: "ಪ್ರಾರಂಭಿಸಲು ಇಲ್ಲಿ ಸ್ಪರ್ಶಿಸಿ",
    selectLanguage: "ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ (Select Language)",
    english: "English",
    hindi: "हिन्दी (Hindi)",
    kannada: "ಕನ್ನಡ (Kannada)",
    demoModeNotice: "ಡೆಮೊ ಮೋಡ್: ಕೇವಲ ಪರೀಕ್ಷಾ ರೋಗಿ ಡೇಟಾವನ್ನು ಬಳಸುತ್ತದೆ",
    loadDemoPatient: "45 ವರ್ಷದ ಪುರುಷ ಡೆಮೊ ರೋಗಿ (ಹೊಟ್ಟೆ ನೋವು)",

    // Consent
    consentTitle: "ಮಾಹಿತಿಯುಕ್ತ ಸಮ್ಮತಿ",
    consentSummary: "ನಿಮ್ಮ ಮಾಹಿತಿಯನ್ನು ಹೇಗೆ ಸಂಗ್ರಹಿಸಲಾಗುತ್ತದೆ ಎಂಬುದನ್ನು ದಯವಿಟ್ಟು ಗಮನಿಸಿ:",
    consentPoint1: "ನೀವು ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಲಕ್ಷಣಗಳು ಮತ್ತು ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಉತ್ತರಿಸುತ್ತಿದ್ದೀರಿ.",
    consentPoint2: "ಈ ಮಾಹಿತಿಯು ವೈದ್ಯರಿಗೆ ಸಂಕ್ಷಿಪ್ತ ವರದಿಯನ್ನು ಸಿದ್ಧಪಡಿಸುತ್ತದೆ.",
    consentPoint3: "ಈ ಕಿಯೋಸ್ಕ್ ರೋಗನಿರ್ಣಯ ಮಾಡುವುದಿಲ್ಲ ಅಥವಾ ಔಷಧಿಗಳನ್ನು ನೀಡುವುದಿಲ್ಲ.",
    consentPoint4: "ಎಲ್ಲಾ ಚಿಕಿತ್ಸಾ ನಿರ್ಧಾರಗಳಿಗೆ ನಿಮ್ಮ ವೈದ್ಯರೇ ಜವಾಬ್ದಾರರಾಗಿರುತ್ತಾರೆ.",
    agreeBtn: "ನಾನು ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ ಮತ್ತು ಒಪ್ಪುತ್ತೇನೆ",
    declineBtn: "ನಾನು ತಿರಸ್ಕರಿಸುತ್ತೇನೆ",
    consentDeclinedTitle: "ಸಮ್ಮತಿಯನ್ನು ತಿರಸ್ಕರಿಸಲಾಗಿದೆ",
    consentDeclinedMessage: "ನೀವು ಕಿಯೋಸ್ಕ್ ಬಳಸದಿರಲು ನಿರ್ಧರಿಸಿದ್ದೀರಿ. ದಯವಿಟ್ಟು ನೋಂದಣಿ ಕೌಂಟರ್‌ಗೆ ತೆರಳಿ.",
    returnToStart: "ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ",

    // Patient Info
    patientInfoTitle: "ರೋಗಿಯ ಮಾಹಿತಿ",
    patientInfoSubtitle: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಮೂಲ ವಿವರಗಳನ್ನು ಒದಗಿಸಿ.",
    fullNameLabel: "ಪೂರ್ಣ ಹೆಸರು",
    fullNamePlaceholder: "ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಿ",
    ageLabel: "ವಯಸ್ಸು (ವರ್ಷಗಳು)",
    agePlaceholder: "ಉದಾ. 45",
    sexLabel: "ಲಿಂಗ",
    male: "ಪುರುಷ",
    female: "ಮಹಿಳೆ",
    other: "ಇತರ",
    preferNotToSay: "ಹೇಳಲು ಇಚ್ಛಿಸುವುದಿಲ್ಲ",
    mrnLabel: "ರೋಗಿ ಸಂಖ್ಯೆ (ಐಚ್ಛಿಕ)",
    mrnPlaceholder: "ಉದಾ. MRN-10293",
    abhaLabel: "ABHA Number (Optional)",
    abhaPlaceholder: "e.g. 91-xxxx-xxxx-xxxx",
    mockAbhaBtn: "Mock Verify ABHA",
    startIntakeBtn: "ಆರೋಗ್ಯ ಪ್ರಶ್ನೆಗಳನ್ನು ಪ್ರಾರಂಭಿಸಿ",

    // Questions
    questionProgress: "ಪ್ರಶ್ನಾವಳಿ ಪ್ರಗತಿ",
    typeAnswerPlaceholder: "ನಿಮ್ಮ ಉತ್ತರವನ್ನು ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಕೆಳಗಿನ ಆಯ್ಕೆಗಳನ್ನು ಸ್ಪರ್ಶಿಸಿ...",
    submitAnswerBtn: "ಉತ್ತರ ಸಲ್ಲಿಸಿ",
    nextBtn: "ಮುಂದಿನ ಪ್ರಶ್ನೆ",
    backBtn: "ಹಿಂದಿನದು",
    dontKnowBtn: "ಗೊತ್ತಿಲ್ಲ",
    preferNotToAnswerBtn: "ಉತ್ತರಿಸಲು ಇಷ್ಟವಿಲ್ಲ",
    skipBtn: "ಪ್ರಶ್ನೆ ಬಿಟ್ಟುಬಿಡಿ",
    speakBtn: "ಮಾತನಾಡಲು ಸ್ಪರ್ಶಿಸಿ",
    stopListeningBtn: "ರೆಕಾರ್ಡಿಂಗ್ ನಿಲ್ಲಿಸಿ",
    voicePlaceholderNotice: "ಧ್ವನಿ ಇನ್‌ಪುಟ್ (UI ಮಾದರಿ)",
    voiceSimulatedNotice: "ಡೆಮೊಗಾಗಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಅನುಕರಿಸಲಾಗಿದೆ.",
    listeningActive: "ಆಲಿಸಲಾಗುತ್ತಿದೆ... ದಯವಿಟ್ಟು ಸ್ಪಷ್ಟವಾಗಿ ಮಾತನಾಡಿ.",

    // Red Flag
    redFlagTitle: "ಪ್ರಮುಖ ವೈದ್ಯಕೀಯ ಸೂಚನೆ",
    redFlagMessage: "ನಿಮ್ಮ ಉತ್ತರದ ಆಧಾರದ ಮೇಲೆ ತುರ್ತು ಲಕ್ಷಣವನ್ನು ಗುರುತಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ವೈದ್ಯರಿಗೆ ತಕ್ಷಣ ತಿಳಿಸಿ.",

    // Review
    reviewTitle: "ನಿಮ್ಮ ಆರೋಗ್ಯ ಇತಿಹಾಸವನ್ನು ಪರಿಶೀಲಿಸಿ",
    reviewSubtitle: "ದಾಖಲಾದ ಉತ್ತರಗಳು ಸರಿಯಾಗಿವೆಯೇ ಎಂದು ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ.",
    chiefComplaint: "ಮುಖ್ಯ ಸಮಸ್ಯೆ",
    statusAnswered: "ದಾಖಲಿಸಲಾಗಿದೆ",
    statusUnknown: "ತಿಳಿದಿಲ್ಲ",
    statusDeclined: "ತಿರಸ್ಕರಿಸಲಾಗಿದೆ",
    statusSkipped: "ಬಿಟ್ಟುಬಿಡಲಾಗಿದೆ",
    editAnswer: "ಬದಲಾಯಿಸಿ",
    confirmAndCompleteBtn: "ದೃಢೀಕರಿಸಿ ಮತ್ತು ವೈದ್ಯರಿಗೆ ಸಲ್ಲಿಸಿ",

    // Completion
    completionTitle: "ಆರೋಗ್ಯ ಇತಿಹಾಸ ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ",
    completionSubtitle: "ನಿಮ್ಮ ವಿವರಗಳು ವೈದ್ಯರಿಗೆ ಸಿದ್ಧವಾಗಿವೆ.",
    completionInstruction: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಟೋಕನ್ ಸಂಖ್ಯೆಯೊಂದಿಗೆ ವೈದ್ಯರ ಕೊಠಡಿಗೆ ತೆರಳಿ.",
    completionNote: "ಸೂಚನೆ: ಮೆಡಿಕಿಯೋಸ್ಕ್ ಕೇವಲ ಮಾಹಿತಿ ಸಂಗ್ರಹ ಕಿಯೋಸ್ಕ್ ಆಗಿದೆ. ಎಲ್ಲಾ ಪರೀಕ್ಷೆ ಮತ್ತು ಚಿಕಿತ್ಸೆ ವೈದ್ಯರಿಂದಲೇ ನಡೆಯುತ್ತದೆ.",
    startNewSessionBtn: "ಮುಕ್ತಾಯಗೊಳಿಸಿ",

    // Accessibility & Chrome
    fontSize: "ಅಕ್ಷರದ ಗಾತ್ರ",
    normalText: "ಸಾಮಾನ್ಯ",
    largeText: "ದೊಡ್ಡದು",
    highContrast: "ಹೆಚ್ಚಿನ ಕಾಂಟ್ರಾಸ್ಟ್",
    emergencyNotice: "ಇದು ತೀವ್ರ ತುರ್ತು ಪರಿಸ್ಥಿತಿಯಾಗಿದ್ದರೆ (ಉದಾ: ಎದೆ ನೋವು, ರಕ್ತಸ್ರಾವ), ದಯವಿಟ್ಟು ಆಸ್ಪತ್ರೆಯ ಸಿಬ್ಬಂದಿಗೆ ತಕ್ಷಣ ತಿಳಿಸಿ.",
    sessionResumedNotice: "ಹಿಂದಿನ ಸೆಷನ್ ಮರುಸ್ಥಾಪಿಸಲಾಗಿದೆ.",
    loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    errorTitle: "ಸೂಚನೆ",
    retryBtn: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
    networkErrorMessage: "ಸರ್ವರ್ ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಸಂಪರ್ಕವನ್ನು ಪರಿಶೀಲಿಸಿ."
  }
};
