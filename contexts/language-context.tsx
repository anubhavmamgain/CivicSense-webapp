"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "hi"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    // Navigation
    home: "Home",
    reportIssue: "Report Issue",
    trackReport: "Track Report",
    admin: "Admin",
    logout: "Logout",

    // Hero Section
    heroTitle: "Empowering Communities Through",
    heroTitleHighlight: "Civic Engagement",
    heroDescription:
      "Report civic issues, track their progress, and help build stronger communities. CivicSense makes it easy for citizens to connect with local authorities and drive positive change.",
    reportAnIssue: "Report an Issue",
    adminDashboard: "Admin Dashboard",

    // Stats
    issuesReported: "Issues Reported",
    issuesResolved: "Issues Resolved",
    avgResolutionTime: "Avg. Resolution Time",
    activeCommunities: "Active Communities",

    // Features
    keyFeatures: "Key Features",
    keyFeaturesDescription: "Discover how CivicSense streamlines civic issue reporting and resolution",
    multiChannelReporting: "Multi-Channel Reporting",
    multiChannelDescription: "Report issues via web interface or WhatsApp for maximum accessibility",
    smartLocationDetection: "Smart Location Detection",
    smartLocationDescription: "AI-powered duplicate detection and hotspot clustering for efficient resolution",
    communityDriven: "Community Driven",
    communityDrivenDescription: "Crowdsourced reporting helps build stronger, more responsive communities",
    realTimeTracking: "Real-time Tracking",
    realTimeTrackingDescription: "Track your reports from submission to resolution with courier-style updates",

    // How It Works
    howItWorks: "How It Works",
    howItWorksDescription: "Simple steps to report and track civic issues in your community",
    report: "Report",
    reportDescription: "Submit civic issues via web or WhatsApp with photos and location details",
    track: "Track",
    trackDescription: "Monitor your report's progress with real-time updates and status changes",
    resolve: "Resolve",
    resolveDescription: "Local authorities address the issue and update the community on resolution",

    // CTA Section
    readyToMakeDifference: "Ready to Make a Difference?",
    ctaDescription: "Join thousands of citizens working together to improve their communities",
    reportFirstIssue: "Report Your First Issue",
    trackExistingReport: "Track Existing Report",

    // Report Form
    reportCivicIssue: "Report a Civic Issue",
    reportFormDescription:
      "Help improve your community by reporting issues. Photos are required for verification, videos are optional.",
    issueTitle: "Issue Title",
    issueTitlePlaceholder: "Brief description of the issue (e.g., Pothole on Main Street)",
    detailedDescription: "Detailed Description",
    detailedDescriptionPlaceholder:
      "Provide more details about the issue, including any safety concerns or impact on the community...",
    category: "Category",
    selectCategory: "Select category",
    location: "Location",
    useMyLocation: "Use My Location",
    gettingLocation: "Getting Location...",
    selectLocationOnMap: "Select Location on Map",
    interactiveMap: "Interactive Map",
    address: "Address",
    addressPlaceholder: "Address will be auto-filled when you select location on map",
    coordinates: "Coordinates",
    photos: "Photos",
    photosRequired: "Photos * (Required - At least 1 photo)",
    addPhotos: "Add Photos",
    videos: "Videos",
    videosOptional: "Videos (Optional)",
    addVideos: "Add Videos",
    submitReport: "Submit Report",
    submittingReport: "Submitting Report...",

    // Map Controls
    zoomIn: "Zoom In",
    zoomOut: "Zoom Out",
    resetToJharkhand: "Reset to Jharkhand",
    zoom: "Zoom",
    clickToPlace: "Click to place a marker, drag to pan around, and use zoom controls for precise location selection.",

    // Categories
    roadInfrastructure: "Road & Infrastructure",
    waterSanitation: "Water & Sanitation",
    wasteManagement: "Waste Management",
    streetLighting: "Street Lighting",
    publicSafety: "Public Safety",
    parksRecreation: "Parks & Recreation",
    trafficTransportation: "Traffic & Transportation",
    other: "Other",

    // Error Messages
    geolocationNotSupported: "Geolocation is not supported by this browser",
    unableToRetrieveLocation: "Unable to retrieve your location. Please select location on map.",
    fillRequiredFields: "Please fill in all required fields",
    atLeastOnePhoto: "At least one photo is required to submit the report",
    selectLocationOnMapError: "Please select a location on the map",
    errorSubmittingReport: "Error submitting report. Please try again.",

    // File Selection
    photoSelected: "photo selected",
    photosSelected: "photos selected",
    videoSelected: "video selected",
    videosSelected: "videos selected",

    // Footer
    footerText: "© 2025 CivicSense. Empowering communities through technology.",

    // Common
    loading: "Loading...",
    user: "User",
    days: "days",

    // Track Report
    trackYourReport: "Track Your Report",
    trackReportDescription: "Enter your report ID to check the current status and progress of your civic issue report.",
    reportId: "Report ID",
    reportIdPlaceholder: "Enter Report ID (e.g., R-123456789)",
    searching: "Searching...",
    search: "Search",
    reportNotFound: "Report not found. Please check the ID and try again.",
    errorSearchingReport: "Error searching for report. Please try again.",
    pleaseEnterReportId: "Please enter a report ID",

    // Status Labels
    submitted: "Submitted",
    acknowledged: "Acknowledged",
    inProgress: "In Progress",
    resolved: "Resolved",

    // Status Descriptions
    submittedDescription: "Report has been submitted and is awaiting review",
    acknowledgedDescription: "Report has been reviewed and acknowledged by authorities",
    inProgressDescription: "Work has begun to address the reported issue",
    resolvedDescription: "Issue has been successfully resolved",

    // Urgency Labels
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",

    // Report Details
    reportDetails: "Report Details",
    title: "Title",
    description: "Description",
    urgency: "Urgency",
    submittedVia: "Submitted Via",
    submittedOn: "Submitted On",
    locationAndMedia: "Location & Media",
    photoEvidence: "Photo Evidence",
    progressTimeline: "Progress Timeline",
    timelineDescription: "Track the progress of your report from submission to resolution",

    // Actions
    simulateNextStatus: "Simulate Next Status",
    rateResolution: "Rate Resolution",
    yourRating: "Your Rating",
    stars: "stars",

    // Login Page
    "login.welcome": "Welcome to",
    "login.subtitle": "Empowering communities through civic engagement and technology",
    "login.title": "Login or Sign Up",
    "login.description":
      "Access your dashboard to track reports and manage civic issues, or create a new account to get started",

    // About Section
    "about.title": "About CivicSense",
    "about.subtitle": "Learn more about our mission and impact",
    "about.mission.title": "Our Mission",
    "about.mission.description":
      "Bridging citizens and authorities through seamless civic issue reporting and tracking.",
    "about.values.title": "Our Values",
    "about.values.transparency": "Transparency",
    "about.values.empowerment": "Community empowerment",
    "about.values.technology": "Technology for good",
    "about.features.title": "Key Features",
    "about.features.reporting": "Multi-channel reporting",
    "about.features.location": "Smart location detection",
    "about.features.tracking": "Real-time tracking",
    "about.impact.title": "Impact Stats",
    "about.impact.communities": "Communities",
    "about.impact.successRate": "Success Rate",
    "about.impact.satisfaction": "Satisfaction",

    // FAQ Section
    "faq.title": "Frequently Asked Questions",
    "faq.subtitle": "Find answers to common questions about using CivicSense",
    "faq.reportIssue.question": "How do I report a civic issue?",
    "faq.reportIssue.answer":
      "You can report issues through our web interface or WhatsApp bot. Simply provide details about the issue, add photos if available, and include the location. Our AI will help categorize and route your report to the appropriate authorities.",
    "faq.security.question": "Is my personal information secure?",
    "faq.security.answer":
      "Yes, we take privacy seriously. Your personal information is encrypted and only used for report tracking and communication. We never share your data with third parties without your consent.",
    "faq.resolution.question": "How long does it take to resolve issues?",
    "faq.resolution.answer":
      "Resolution times vary by issue type and complexity. On average, issues are resolved within 4.2 days. You'll receive real-time updates throughout the process.",
    "faq.tracking.question": "Can I track multiple reports?",
    "faq.tracking.answer":
      "Once logged in, you can track all your submitted reports from your dashboard. Each report has a unique ID and status tracking.",
    "faq.issueTypes.question": "What types of issues can I report?",
    "faq.issueTypes.answer":
      "You can report various civic issues including road problems, water supply issues, waste management, street lighting, public safety concerns, and infrastructure problems.",
    "faq.account.question": "Do I need to create an account?",
    "faq.account.answer":
      "While you can submit reports without an account, creating one allows you to track your reports, receive updates, and access additional features like the admin dashboard (for authorized users).",
    "faq.whatsapp.question": "How does the WhatsApp bot work?",
    "faq.whatsapp.answer":
      "Our WhatsApp assistant allows you to report issues through natural conversation. Simply describe the problem, and the bot will guide you through the reporting process step by step.",
    "faq.afterSubmit.question": "What happens after I submit a report?",
    "faq.afterSubmit.answer":
      "Your report is automatically categorized, checked for duplicates, and forwarded to the relevant authorities. You'll receive a unique tracking ID and regular status updates via your preferred communication method.",

    // Contact Section
    "contact.title": "Contact Information",
    "contact.email": "Email Support",
    "contact.phone": "Phone Support",
    "contact.website": "Website",

    // Mobile Login
    "mobile.selectLoginType": "Select Login Type",
    "mobile.selectLoginDescription": "Choose whether you're logging in as a user or admin",
    "mobile.user": "User",
    "mobile.admin": "Admin",
    "mobile.continueAs": "Continue as",
    "mobile.backToLoginOptions": "Back to Login Options",
    "mobile.mobileLogin": "Mobile Login",
    "mobile.mobileLoginDescription": "Enter your Indian mobile number to receive a verification code",
    "mobile.mobileNumber": "Mobile Number",
    "mobile.sendOTP": "Send OTP",
    "mobile.sendingOTP": "Sending OTP...",
    "mobile.backToRoleSelection": "Back to Role Selection",
    "mobile.smsAgreement": "By continuing, you agree to receive SMS messages for verification purposes.",
    "mobile.verifyOTP": "Verify OTP",
    "mobile.verifyOTPDescription": "Enter the 6-digit code sent to +91",
    "mobile.verificationCode": "Verification Code",
    "mobile.verifying": "Verifying...",
    "mobile.resendOTPIn": "Resend OTP in",
    "mobile.resendOTP": "Resend OTP",
    "mobile.changePhoneNumber": "Change Phone Number",
    "mobile.didntReceiveCode": "Didn't receive the code? Check your SMS or try resending.",
    "mobile.invalidPhoneNumber": "Please enter a valid Indian mobile number (10 digits starting with 6-9)",
    "mobile.enterSixDigitOTP": "Please enter a 6-digit OTP",
    "mobile.otpSessionExpired": "OTP session expired. Please try again.",
    "mobile.otpExpired": "OTP has expired. Please request a new one.",
    "mobile.invalidOTP": "Invalid OTP. Please try again.",

    // AI Urgency Detection
    aiDetectedUrgency: "AI Detected Urgency",
    urgencyAutoDetected: "Automatically detected based on issue content",
    urgencyDetectionNote:
      "Our AI analyzes your report content to determine urgency level. This helps prioritize response times.",
  },
  hi: {
    // Navigation
    home: "होम",
    reportIssue: "समस्या रिपोर्ट करें",
    trackReport: "रिपोर्ट ट्रैक करें",
    admin: "एडमिन",
    logout: "लॉगआउट",

    // Hero Section
    heroTitle: "समुदायों को सशक्त बनाना",
    heroTitleHighlight: "नागरिक सहभागिता",
    heroDescription:
      "नागरिक समस्याओं की रिपोर्ट करें, उनकी प्रगति को ट्रैक करें, और मजबूत समुदाय बनाने में मदद करें। CivicSense नागरिकों के लिए स्थानीय अधिकारियों से जुड़ना और सकारात्मक बदलाव लाना आसान बनाता है।",
    reportAnIssue: "समस्या रिपोर्ट करें",
    adminDashboard: "एडमिन डैशबोर्ड",

    // Stats
    issuesReported: "रिपोर्ट की गई समस्याएं",
    issuesResolved: "हल की गई समस्याएं",
    avgResolutionTime: "औसत समाधान समय",
    activeCommunities: "सक्रिय समुदाय",

    // Features
    keyFeatures: "मुख्य विशेषताएं",
    keyFeaturesDescription: "जानें कि CivicSense नागरिक समस्या रिपोर्टिंग और समाधान को कैसे सुव्यवस्थित करता है",
    multiChannelReporting: "मल्टी-चैनल रिपोर्टिंग",
    multiChannelDescription: "अधिकतम पहुंच के लिए वेब इंटरफेस या WhatsApp के माध्यम से समस्याओं की रिपोर्ट करें",
    smartLocationDetection: "स्मार्ट लोकेशन डिटेक्शन",
    smartLocationDescription: "कुशल समाधान के लिए AI-संचालित डुप्लिकेट डिटेक्शन और हॉटस्पॉट क्लस्टरिंग",
    communityDriven: "समुदाय संचालित",
    communityDrivenDescription: "क्राउडसोर्स्ड रिपोर्टिंग मजबूत, अधिक उत्तरदायी समुदाय बनाने में मदद करती है",
    realTimeTracking: "रियल-टाइम ट्रैकिंग",
    realTimeTrackingDescription: "कूरियर-स्टाइल अपडेट के साथ सबमिशन से समाधान तक अपनी रिपोर्ट की प्रगति को ट्रैक करें",

    // How It Works
    howItWorks: "यह कैसे काम करता है",
    howItWorksDescription: "अपने समुदाय में नागरिक समस्याओं की रिपोर्ट और ट्रैक करने के सरल चरण",
    report: "रिपोर्ट",
    reportDescription: "फोटो और स्थान विवरण के साथ वेब या WhatsApp के माध्यम से नागरिक समस्याएं सबमिट करें",
    track: "ट्रैक",
    trackDescription: "रियल-टाइम अपडेट और स्थिति परिवर्तन के साथ अपनी रिपोर्ट की प्रगति की निगरानी करें",
    resolve: "समाधान",
    resolveDescription: "स्थानीय अधिकारी समस्या का समाधान करते हैं और समुदाय को समाधान पर अपडेट करते हैं",

    // CTA Section
    readyToMakeDifference: "बदलाव लाने के लिए तैयार हैं?",
    ctaDescription: "अपने समुदायों को बेहतर बनाने के लिए मिलकर काम करने वाले हजारों नागरिकों से जुड़ें",
    reportFirstIssue: "अपनी पहली समस्या रिपोर्ट करें",
    trackExistingReport: "मौजूदा रिपोर्ट ट्रैक करें",

    // Report Form
    reportCivicIssue: "नागरिक समस्या रिपोर्ट करें",
    reportFormDescription:
      "समस्याओं की रिपोर्ट करके अपने समुदाय को बेहतर बनाने में मदद करें। सत्यापन के लिए फोटो आवश्यक हैं, वीडियो वैकल्पिक हैं।",
    issueTitle: "समस्या का शीर्षक",
    issueTitlePlaceholder: "समस्या का संक्षिप्त विवरण (जैसे, मुख्य सड़क पर गड्ढा)",
    detailedDescription: "विस्तृत विवरण",
    detailedDescriptionPlaceholder:
      "समस्या के बारे में अधिक विवरण प्रदान करें, जिसमें कोई सुरक्षा चिंता या समुदाय पर प्रभाव शामिल है...",
    category: "श्रेणी",
    selectCategory: "श्रेणी चुनें",
    location: "स्थान",
    useMyLocation: "मेरा स्थान उपयोग करें",
    gettingLocation: "स्थान प्राप्त कर रहे हैं...",
    selectLocationOnMap: "मानचित्र पर स्थान चुनें",
    interactiveMap: "इंटरैक्टिव मानचित्र",
    address: "पता",
    addressPlaceholder: "जब आप मानचित्र पर स्थान चुनेंगे तो पता अपने आप भर जाएगा",
    coordinates: "निर्देशांक",
    photos: "फोटो",
    photosRequired: "फोटो * (आवश्यक - कम से कम 1 फोटो)",
    addPhotos: "फोटो जोड़ें",
    videos: "वीडियो",
    videosOptional: "वीडियो (वैकल्पिक)",
    addVideos: "वीडियो जोड़ें",
    submitReport: "रिपोर्ट सबमिट करें",
    submittingReport: "रिपोर्ट सबमिट कर रहे हैं...",

    // Map Controls
    zoomIn: "ज़ूम इन",
    zoomOut: "ज़ूम आउट",
    resetToJharkhand: "झारखंड पर रीसेट करें",
    zoom: "ज़ूम",
    clickToPlace: "मार्कर लगाने के लिए क्लिक करें, चारों ओर घुमाने के लिए ड्रैग करें, और सटीक स्थान चयन के लिए ज़ूम नियंत्रण का उपयोग करें।",

    // Categories
    roadInfrastructure: "सड़क और बुनियादी ढांचा",
    waterSanitation: "पानी और स्वच्छता",
    wasteManagement: "अपशिष्ट प्रबंधन",
    streetLighting: "सड़क प्रकाश व्यवस्था",
    publicSafety: "सार्वजनिक सुरक्षा",
    parksRecreation: "पार्क और मनोरंजन",
    trafficTransportation: "यातायात और परिवहन",
    other: "अन्य",

    // Error Messages
    geolocationNotSupported: "इस ब्राउज़र द्वारा भौगोलिक स्थान समर्थित नहीं है",
    unableToRetrieveLocation: "आपका स्थान प्राप्त करने में असमर्थ। कृपया मानचित्र पर स्थान चुनें।",
    fillRequiredFields: "कृपया सभी आवश्यक फ़ील्ड भरें",
    atLeastOnePhoto: "रिपोर्ट सबमिट करने के लिए कम से कम एक फोटो आवश्यक है",
    selectLocationOnMapError: "कृपया मानचित्र पर एक स्थान चुनें",
    errorSubmittingReport: "रिपोर्ट सबमिट करने में त्रुटि। कृपया पुनः प्रयास करें।",

    // File Selection
    photoSelected: "फोटो चुनी गई",
    photosSelected: "फोटो चुनी गईं",
    videoSelected: "वीडियो चुना गया",
    videosSelected: "वीडियो चुने गए",

    // Footer
    footerText: "© 2025 CivicSense। प्रौद्योगिकी के माध्यम से समुदायों को सशक्त बनाना।",

    // Common
    loading: "लोड हो रहा है...",
    user: "उपयोगकर्ता",
    days: "दिन",

    // Track Report
    trackYourReport: "अपनी रिपोर्ट ट्रैक करें",
    trackReportDescription: "अपनी नागरिक समस्या रिपोर्ट की वर्तमान स्थिति और प्रगति जांचने के लिए अपना रिपोर्ट ID दर्ज करें।",
    reportId: "रिपोर्ट ID",
    reportIdPlaceholder: "रिपोर्ट ID दर्ज करें (जैसे, R-123456789)",
    searching: "खोज रहे हैं...",
    search: "खोजें",
    reportNotFound: "रिपोर्ट नहीं मिली। कृपया ID जांचें और पुनः प्रयास करें।",
    errorSearchingReport: "रिपोर्ट खोजने में त्रुटि। कृपया पुनः प्रयास करें।",
    pleaseEnterReportId: "कृपया एक रिपोर्ट ID दर्ज करें",

    // Status Labels
    submitted: "सबमिट की गई",
    acknowledged: "स्वीकार की गई",
    inProgress: "प्रगति में",
    resolved: "हल हो गई",

    // Status Descriptions
    submittedDescription: "रिपोर्ट सबमिट की गई है और समीक्षा की प्रतीक्षा में है",
    acknowledgedDescription: "रिपोर्ट की समीक्षा की गई है और अधिकारियों द्वारा स्वीकार की गई है",
    inProgressDescription: "रिपोर्ट की गई समस्या के समाधान का काम शुरू हो गया है",
    resolvedDescription: "समस्या का सफलतापूर्वक समाधान हो गया है",

    // Urgency Labels
    low: "कम",
    medium: "मध्यम",
    high: "उच्च",
    critical: "गंभीर",

    // Report Details
    reportDetails: "रिपोर्ट विवरण",
    title: "शीर्षक",
    description: "विवरण",
    urgency: "तात्कालिकता",
    submittedVia: "के माध्यम से सबमिट की गई",
    submittedOn: "सबमिट की गई तारीख",
    locationAndMedia: "स्थान और मीडिया",
    photoEvidence: "फोटो प्रमाण",
    progressTimeline: "प्रगति समयरेखा",
    timelineDescription: "सबमिशन से समाधान तक अपनी रिपोर्ट की प्रगति को ट्रैक करें",

    // Actions
    simulateNextStatus: "अगली स्थिति का अनुकरण करें",
    rateResolution: "समाधान को रेट करें",
    yourRating: "आपकी रेटिंग",
    stars: "सितारे",

    // Login Page
    "login.welcome": "स्वागत है",
    "login.subtitle": "नागरिक सहभागिता और प्रौद्योगिकी के माध्यम से समुदायों को सशक्त बनाना",
    "login.title": "लॉगिन या साइन अप करें",
    "login.description":
      "रिपोर्ट ट्रैक करने और नागरिक समस्याओं का प्रबंधन करने के लिए अपने डैशबोर्ड तक पहुंचें, या शुरुआत करने के लिए एक नया खाता बनाएं",

    // About Section
    "about.title": "CivicSense के बारे में",
    "about.subtitle": "हमारे मिशन और प्रभाव के बारे में और जानें",
    "about.mission.title": "हमारा मिशन",
    "about.mission.description":
      "निर्बाध नागरिक समस्या रिपोर्टिंग और ट्रैकिंग के माध्यम से नागरिकों और अधिकारियों के बीच सेतु का काम करना।",
    "about.values.title": "हमारे मूल्य",
    "about.values.transparency": "पारदर्शिता",
    "about.values.empowerment": "समुदायिक सशक्तिकरण",
    "about.values.technology": "अच्छे के लिए प्रौद्योगिकी",
    "about.features.title": "मुख्य विशेषताएं",
    "about.features.reporting": "मल्टी-चैनल रिपोर्टिंग",
    "about.features.location": "स्मार्ट लोकेशन डिटेक्शन",
    "about.features.tracking": "रियल-टाइम ट्रैकिंग",
    "about.impact.title": "प्रभाव आंकड़े",
    "about.impact.communities": "समुदाय",
    "about.impact.successRate": "सफलता दर",
    "about.impact.satisfaction": "संतुष्टि",

    // FAQ Section
    "faq.title": "अक्सर पूछे जाने वाले प्रश्न",
    "faq.subtitle": "CivicSense का उपयोग करने के बारे में सामान्य प्रश्नों के उत्तर खोजें",
    "faq.reportIssue.question": "मैं नागरिक समस्या की रिपोर्ट कैसे करूं?",
    "faq.reportIssue.answer":
      "आप हमारे वेब इंटरफेस या WhatsApp बॉट के माध्यम से समस्याओं की रिपोर्ट कर सकते हैं। बस समस्या के बारे में विवरण प्रदान करें, यदि उपलब्ध हो तो फोटो जोड़ें, और स्थान शामिल करें। हमारा AI आपकी रिपोर्ट को वर्गीकृत करने और उपयुक्त अधिकारियों तक पहुंचाने में मदद करेगा।",
    "faq.security.question": "क्या मेरी व्यक्तिगत जानकारी सुरक्षित है?",
    "faq.security.answer":
      "हां, हम गोपनीयता को गंभीरता से लेते हैं। आपकी व्यक्तिगत जानकारी एन्क्रिप्टेड है और केवल रिपोर्ट ट्रैकिंग और संचार के लिए उपयोग की जाती है। हम आपकी सहमति के बिना तीसरे पक्ष के साथ आपका डेटा साझा नहीं करते हैं।",
    "faq.resolution.question": "समस्याओं को हल करने में कितना समय लगता है?",
    "faq.resolution.answer":
      "समाधान का समय समस्या के प्रकार और जटिलता के अनुसार अलग होता है। औसतन, समस्याओं का समाधान 4.2 दिनों के भीतर हो जाता है। आपको पूरी प्रक्रिया के दौरान रियल-टाइम अपडेट मिलेंगे।",
    "faq.tracking.question": "क्या मैं कई रिपोर्ट ट्रैक कर सकता हूं?",
    "faq.tracking.answer":
      "लॉगिन करने के बाद, आप अपने डैशबोर्ड से अपनी सभी सबमिट की गई रिपोर्ट को ट्रैक कर सकते हैं। प्रत्येक रिपोर्ट का एक अनूठा ID और स्थिति ट्रैकिंग होती है।",
    "faq.issueTypes.question": "मैं किस प्रकार की समस्याओं की रिपोर्ट कर सकता हूं?",
    "faq.issueTypes.answer":
      "आप विभिन्न नागरिक समस्याओं की रिपोर्ट कर सकते हैं जिनमें सड़क की समस्याएं, पानी की आपूर्ति की समस्याएं, अपशिष्ट प्रबंधन, सड़क प्रकाश व्यवस्था, सार्वजनिक सुरक्षा चिंताएं, और बुनियादी ढांचे की समस्याएं शामिल हैं।",
    "faq.account.question": "क्या मुझे खाता बनाने की आवश्यकता है?",
    "faq.account.answer":
      "जबकि आप बिना खाते के रिपोर्ट सबमिट कर सकते हैं, खाता बनाने से आप अपनी रिपोर्ट को ट्रैक कर सकते हैं, अपडेट प्राप्त कर सकते हैं, और एडमिन डैशबोर्ड (अधिकृत उपयोगकर्ताओं के लिए) जैसी अतिरिक्त सुविधाओं तक पहुंच सकते हैं।",
    "faq.whatsapp.question": "WhatsApp बॉट कैसे काम करता है?",
    "faq.whatsapp.answer":
      "हमारा WhatsApp असिस्टेंट आपको प्राकृतिक बातचीत के माध्यम से समस्याओं की रिपोर्ट करने की अनुमति देता है। बस समस्या का वर्णन करें, और बॉट आपको रिपोर्टिंग प्रक्रिया के माध्यम से चरणबद्ध तरीके से मार्गदर्शन करेगा।",
    "faq.afterSubmit.question": "रिपोर्ट सबमिट करने के बाद क्या होता है?",
    "faq.afterSubmit.answer":
      "आपकी रिपोर्ट स्वचालित रूप से वर्गीकृत की जाती है, डुप्लिकेट के लिए जांची जाती है, और संबंधित अधिकारियों को भेजी जाती है। आपको एक अनूठा ट्रैकिंग ID और आपकी पसंदीदा संचार विधि के माध्यम से नियमित स्थिति अपडेट मिलेंगे।",

    // Contact Section
    "contact.title": "संपर्क जानकारी",
    "contact.email": "ईमेल सहायता",
    "contact.phone": "फोन सहायता",
    "contact.website": "वेबसाइट",

    // Mobile Login
    "mobile.selectLoginType": "लॉगिन प्रकार चुनें",
    "mobile.selectLoginDescription": "चुनें कि आप उपयोगकर्ता या एडमिन के रूप में लॉगिन कर रहे हैं",
    "mobile.user": "उपयोगकर्ता",
    "mobile.admin": "एडमिन",
    "mobile.continueAs": "के रूप में जारी रखें",
    "mobile.backToLoginOptions": "लॉगिन विकल्पों पर वापस जाएं",
    "mobile.mobileLogin": "मोबाइल लॉगिन",
    "mobile.mobileLoginDescription": "सत्यापन कोड प्राप्त करने के लिए अपना भारतीय मोबाइल नंबर दर्ज करें",
    "mobile.mobileNumber": "मोबाइल नंबर",
    "mobile.sendOTP": "OTP भेजें",
    "mobile.sendingOTP": "OTP भेज रहे हैं...",
    "mobile.backToRoleSelection": "भूमिका चयन पर वापस जाएं",
    "mobile.smsAgreement": "जारी रखकर, आप सत्यापन उद्देश्यों के लिए SMS संदेश प्राप्त करने के लिए सहमत हैं।",
    "mobile.verifyOTP": "OTP सत्यापित करें",
    "mobile.verifyOTPDescription": "+91 पर भेजे गए 6-अंकीय कोड को दर्ज करें",
    "mobile.verificationCode": "सत्यापन कोड",
    "mobile.verifying": "सत्यापित कर रहे हैं...",
    "mobile.resendOTPIn": "में OTP पुनः भेजें",
    "mobile.resendOTP": "OTP पुनः भेजें",
    "mobile.changePhoneNumber": "फोन नंबर बदलें",
    "mobile.didntReceiveCode": "कोड नहीं मिला? अपना SMS जांचें या पुनः भेजने का प्रयास करें।",
    "mobile.invalidPhoneNumber": "कृपया एक वैध भारतीय मोबाइल नंबर दर्ज करें (6-9 से शुरू होने वाले 10 अंक)",
    "mobile.enterSixDigitOTP": "कृपया 6-अंकीय OTP दर्ज करें",
    "mobile.otpSessionExpired": "OTP सत्र समाप्त हो गया। कृपया पुनः प्रयास करें।",
    "mobile.otpExpired": "OTP समाप्त हो गया है। कृपया नया अनुरोध करें।",
    "mobile.invalidOTP": "अमान्य OTP। कृपया पुनः प्रयास करें।",

    // AI Urgency Detection
    aiDetectedUrgency: "AI द्वारा पहचानी गई तात्कालिकता",
    urgencyAutoDetected: "समस्या की सामग्री के आधार पर स्वचालित रूप से पहचाना गया",
    urgencyDetectionNote:
      "हमारा AI तात्कालिकता स्तर निर्धारित करने के लिए आपकी रिपोर्ट सामग्री का विश्लेषण करता है। यह प्रतिक्रिया समय को प्राथमिकता देने में मदद करता है।",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("civicsense_language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "hi")) {
      setLanguage(savedLanguage)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("civicsense_language", lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)["en"]] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
