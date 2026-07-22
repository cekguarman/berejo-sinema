import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, deleteDoc, getDocs, onSnapshot, query, serverTimestamp } from 'firebase/firestore';
import { 
  Sparkles, 
  Copy, 
  Download, 
  History as HistoryIcon, 
  Trash2, 
  RefreshCw, 
  Languages, 
  Zap, 
  Clock, 
  User, 
  Sun,
  Moon, 
  CheckCircle2,
  Wand2, 
  Type,
  Upload,
  X,
  Camera, 
  Timer,
  Maximize,
  Users,
  Shirt,
  UserCheck,
  AlertTriangle,
  Lightbulb,
  Ban, 
  ShieldCheck, 
  Mic,
  ScrollText,
  Activity,
  Image as ImageIcon,
  Settings2,
  Thermometer,
  Gauge,
  CircleDot,
  PlusCircle,
  PlayCircle,
  Film,
  Move,
  Focus,
  Eye,
  Monitor
} from 'lucide-react';

// Firebase Configuration
// Firebase Configuration (Aman untuk Vercel & Canvas Gemini)
const defaultFirebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:demo"
};

const getFirebaseConfig = () => {
  try {
    return typeof __firebase_config !== 'undefined' 
      ? JSON.parse(__firebase_config) 
      : defaultFirebaseConfig;
  } catch (e) {
    return defaultFirebaseConfig;
  }
};

const app = initializeApp(getFirebaseConfig());
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'sinema-berejo';
const apiKey = ""; 

// --- Constants ---
const SHUTTER_SPEEDS = ["1/15s", "1/30s", "1/60s", "1/125s", "1/250s", "1/500s", "1/1000s", "1/2000s", "1/4000s", "1/8000s"];
const APERTURES = ["f/1.4", "f/1.8", "f/2.8", "f/4.0", "f/5.6", "f/8.0", "f/11", "f/16", "f/22"];

const STYLES = ["Realistic", "Cinematic", "Clay motion", "3D Video", "Animated Cartoon (2D)", "Wes Anderson style", "Kinetic typography", "Cyberpunk Aesthetic", "Lego", "Anime", "Studio Ghibli", "3D Render", "Pixar-style"];
const PACINGS = ["Ikut Prompt", "Slow Burn", "Rhythmic Pulse", "Frantic Energy", "Gradual Build", "Quick Cut Rhythm"];

const DIRECTIONS_CATEGORIZED = [
  { category: "Gerak Dasar", items: ["Static", "Handheld", "Locked shot"] },
  { category: "Gerak Horizontal & Vertikal", items: ["Pan left / right", "Tilt up / down", "Whip pan"] },
  { category: "Gerak Maju & Mundur", items: ["Dolly in", "Dolly out", "Push in", "Pull out"] },
  { category: "Gerak Mengikuti Subjek", items: ["Tracking shot", "Follow shot", "Arc shot"] },
  { category: "Gerak Atas–Bawah & Ruang", items: ["Crane up / down", "Jib shot", "Top down", "Low angle rise"] },
  { category: "Gerak Sinematik Kompleks", items: ["Orbit shot", "Parallax movement", "Reveal shot", "Dolly zoom"] },
  { category: "Fokus & Optik", items: ["Rack focus", "Shallow depth of field", "Deep focus"] }
];

const RIGS = ["Ikut Prompt", "Steadicam Flow", "Drone Aerials", "Handheld Urgency", "Crane Elegance", "Dolly Precision", "VR 360", "Multi-Angle Rig", "Static Tripod", "Gimbal Smoothness"];
const WEATHERS = ["Default (Ikut Prompt)", "Cerah (Sunny)", "Cerah Berawan (partly cloudy)", "Berawan (Cloudy)", "Mendung (Overcast)", "Dingin (cold)", "Bersalju (snowy)", "Hujan (rainy)", "Hujan Deras (heavy rain)", "Badai Petir (thunder storm)", "Kabut (foggy)"];
const TIMES = ["Default (Ikut Prompt)", "Fajar (Dawn)", "Pagi (Morning)", "Siang (Noon)", "Sore (Afternoon)", "Petang (Dusk)", "Malam (Night)"];

const SHOT_TYPES = [
  { label: "Ikut Prompt", alt: "Mengikuti instruksi di Detail Gerakan" },
  { label: "Extreme Wide Shot (EWS)", alt: "Subjek sangat kecil, fokus lingkungan luas" },
  { label: "Wide Shot (WS)", alt: "Tubuh subjek terlihat penuh" },
  { label: "Full Shot (FS)", alt: "Karakter utuh dengan fokus ke tubuh" },
  { label: "Medium Wide Shot (MWS)", alt: "Terlihat dari lutut ke atas" },
  { label: "Medium Shot (MS)", alt: "Terlihat dari pinggang ke atas" },
  { label: "Medium Close Up (MCU)", alt: "Terlihat dari dada ke atas" },
  { label: "Close Up (CU)", alt: "Wajah memenuhi frame" },
  { label: "Extreme Close Up (ECU)", alt: "Detail sangat dekat (mata, tangan, bibir)" },
  { label: "Over The Shoulder (OTS)", alt: "Kamera dari belakang bahu karakter lain" },
  { label: "Point of View (POV)", alt: "Sudut pandang mata karakter" },
  { label: "Insert Shot", alt: "Detail objek penting" },
  { label: "Cutaway Shot", alt: "Shot selingan untuk konteks" }
];

const LENS_TYPES = [
  { label: "Default (Ikut Prompt)", alt: "Mengikuti instruksi lensa di Detail Gerakan" },
  { label: "Ultra Wide (10–20mm)", alt: "Sudut sangat lebar, distorsi kuat" },
  { label: "Wide (24–28mm)", alt: "Lebar, dinamis, relatif natural" },
  { label: "Standard (35mm)", alt: "Perspektif natural seperti mata manusia" },
  { label: "Normal / Portrait (50mm)", alt: "Sinematik klasik, depth seimbang" },
  { label: "Portrait / Tele Short (85mm)", alt: "Latar sangat blur, fokus ekspresi" },
  { label: "Telephoto (100–200mm)", alt: "Ruang terkompresi, jarak terasa dekat" },
  { label: "Super Tele (300mm+)", alt: "Kompresi ekstrem, perspektif jauh" },
  { label: "Zoom Lens (24–70mm / 70–200mm)", alt: "Fleksibel, multi jarak fokus" }
];

const ASPECT_RATIOS = [
  { label: "16:9 (Horizontal)", desc: "Standard for YouTube, TV, and desktop viewing." },
  { label: "9:16 (Vertical)", desc: "Standard for TikTok, Instagram Reels, and YouTube Shorts." },
  { label: "1:1 (Square)", desc: "Often used for social media posts on Instagram and Facebook." },
  { label: "4:3 (Classic)", desc: "Used for retro styles or older television formats." },
  { label: "2.35:1 (Cinematic)", desc: "Provides a wide, theatrical feel." }
];

const NEGATIVE_TAGS = [
  "blurry", "heavy flicker", "posterization", "excessive noise", "distorted", "artifacts", 
  "cropped", "deformed", "bad proportions", "missing arms", "extra legs", "long neck", 
  "polar lowres", "bad teeth", "bad mouth", "low contrast", "overprocessed", "anime", 
  "painting", "concept art", "sci-fi", "violence", "text overlay", "extra limbs", 
  "random logos", "low quality", "overexposed", "signature", "out of frame", "mutation", 
  "extra fingers", "missing legs", "fused fingers", "cross-eyed", "bad body", "bad eyes", 
  "abdominal stretch", "oversaturated", "HDR", "3d render", "illustration", "unrealistic", 
  "horror", "nudity", "watermark", "harsh aliasing", "over-smoothing", "pixelated", 
  "underexposed", "duplicate", "disfigured", "bad anatomy", "fewer fingers", "extra arms", 
  "too many fingers", "mutated hands", "bad face", "bad nose", "glitchy", "undersaturated", 
  "cartoon", "drawing", "digital art", "fantasy", "gore", "sexual content"
];

const INITIAL_FORM_STATE = {
  theme: '',
  masterPrompt: '',
  style: 'Realistic',
  details: '',
  location: '',
  shotType: 'Ikut Prompt',
  lensType: 'Default (Ikut Prompt)',
  aspectRatio: '16:9 (Horizontal)',
  weather: 'Default (Ikut Prompt)',
  time: 'Default (Ikut Prompt)',
  duration: '8s',
  cameraDirection: 'Ikut Prompt',
  cameraRig: 'Ikut Prompt',
  pacing: 'Ikut Prompt',
  specialEffect: 'Ikut Prompt',
  realism: 8,
  cfgScale: 0.7, 
  hasHuman: 'No',
  faceType: 'Ikut Prompt',
  costume: 'Ikut Prompt',
  skinTone: 'Ikut Prompt',
  keepOriginalFace: true, 
  backgroundConsistency: false,
  useKeylight: false,
  keylightPosition: 'Key Light',
  useNegativePrompt: false, 
  selectedNegativeTags: [], 
  noSubtitles: true,
  dialogueLanguage: 'Ikut Prompt',
  customLanguage: '',
  useAdvancedCamera: false,
  whiteBalance: 'Ikut Prompt',
  shutterSpeedIdx: 2, 
  apertureIdx: 2, 
};

const App = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [prompt, setPrompt] = useState('');
  const [jsonPrompt, setJsonPrompt] = useState('');
  const [activeTab, setActiveTab] = useState('text'); 
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); 
  const [history, setHistory] = useState([]);
  const [notification, setNotification] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [refImage, setRefImage] = useState(null); 
  const [imagePreview, setImagePreview] = useState(null);
  const [originalFile, setOriginalFile] = useState(null);

  const fileInputRef = useRef(null);

  // Validation
  const isFormReady = formData.details && formData.details.trim().length > 0;

  // --- STYLES HELPER ---
  const labelClass = `text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] flex items-center gap-2 ${darkMode ? 'text-yellow-400' : 'text-indigo-950'}`;
  const subLabelClass = `text-[10px] font-black uppercase tracking-[0.2em] ml-1 sm:ml-2 ${darkMode ? 'text-yellow-400/80' : 'text-slate-800'}`;
  const sliderSubtextClass = `flex justify-between text-[11px] sm:text-[13px] font-black uppercase tracking-tighter px-1 mt-2 ${darkMode ? 'text-white' : 'text-slate-950'}`;
  const cardClass = `p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] border transition-all duration-500 ${darkMode ? 'bg-[#080808]/90 border-white/5 backdrop-blur-3xl shadow-2xl' : 'bg-white border-slate-300 shadow-xl'}`;

  // Safe wrapper class calculation to avoid complex nested ternary compilation errors
  const negativePromptWrapperClass = `p-8 rounded-[2.5rem] border transition-all ${
    formData.useNegativePrompt 
      ? (darkMode ? 'bg-red-900/10 border-red-900/40 shadow-lg' : 'bg-red-50 border-red-300 shadow-lg') 
      : 'bg-slate-800/10 border-slate-700/10'
  }`;

  // Auth & Sync
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const historyCollection = collection(db, 'artifacts', appId, 'users', user.uid, 'history');
    const unsubscribe = onSnapshot(historyCollection, (snapshot) => {
      const historyData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistory(historyData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    }, (error) => console.error(error));
    return () => unsubscribe();
  }, [user]);

  // Actions
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const copyToClipboard = () => {
    const textToCopy = activeTab === 'text' ? prompt : jsonPrompt;
    if (!textToCopy) return;
    const textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    showNotification("Berhasil disalin!");
    document.body.removeChild(textArea);
  };

  const downloadPrompt = () => {
    const content = activeTab === 'text' ? prompt : jsonPrompt;
    if (!content) return;
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `sinema-prompt-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleNewProject = () => {
    setFormData({...INITIAL_FORM_STATE});
    setPrompt('');
    setJsonPrompt('');
    setRefImage(null);
    setImagePreview(null);
    setOriginalFile(null);
    setProgress(0);
    setLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    showNotification("Proyek baru dimulai!");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalFile(file);
        setRefImage(reader.result.split(',')[1]); 
        setImagePreview(reader.result);
        showNotification("Foto referensi diunggah!");
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setRefImage(null);
    setImagePreview(null);
    setOriginalFile(null);
    setFormData(prev => ({ ...prev, backgroundConsistency: false }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleNegativeTag = (tag) => {
    setFormData(prev => {
      const current = prev.selectedNegativeTags || [];
      const updated = current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag];
      return { ...prev, selectedNegativeTags: updated };
    });
  };

  const handleSelectAllNegative = () => {
    const allSelected = formData.selectedNegativeTags.length === NEGATIVE_TAGS.length;
    setFormData(prev => ({ ...prev, selectedNegativeTags: allSelected ? [] : [...NEGATIVE_TAGS] }));
    showNotification(allSelected ? "Semua tag dihapus." : "Semua tag dipilih.");
  };

  const callGemini = async (userQuery, systemPrompt, base64Image = null) => {
    let delay = 1000;
    const model = "gemini-2.5-flash-preview-09-2025";
    const contents = [{ parts: [{ text: userQuery }, ...(base64Image ? [{ inlineData: { mimeType: "image/png", data: base64Image } }] : [])] }];
    for (let i = 0; i < 5; i++) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: contents, systemInstruction: { parts: [{ text: systemPrompt }] }, generationConfig: { responseMimeType: "application/json" } })
        });
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text;
      } catch (error) {
        if (i === 4) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  };

  const saveToCloudHistory = async (standard, json) => {
    if (!user) return;
    try {
      const historyCollection = collection(db, 'artifacts', appId, 'users', user.uid, 'history');
      const shouldSaveImage = originalFile && originalFile.size <= 700000;
      await addDoc(historyCollection, {
        theme: formData.theme || 'Vision',
        content: standard,
        jsonContent: json,
        refImage: shouldSaveImage ? imagePreview : null, 
        timestamp: new Date().toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }),
        settings: { ...formData },
        createdAt: serverTimestamp()
      });
    } catch (e) { console.error("Cloud History Error:", e); }
  };

  const handleGenerate = async () => {
    if (!formData.theme) { showNotification("Silakan isi tema!"); return; }
    setLoading(true);
    setProgress(0);
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        const diff = Math.random() * 10;
        return Math.min(prev + diff, 95);
      });
    }, 450);

    // AI Instruction Construction - ENSURE ALL SELECTED FEATURES ARE INCLUDED
    const systemPrompt = `Expert AI Cinematographer and Prompt Engineer for Google Veo 3. 
    You MUST read every parameter selected by the user below and include it EXPLICITLY in the generated prompt output. 
    
    PARAMETERS TO INCLUDE:
    1. Facial Consistency: ${formData.hasHuman === 'Yes' && refImage && formData.keepOriginalFace ? 'Maintain 100% face consistency from reference' : 'Default'}
    2. Background Consistency: ${refImage && formData.backgroundConsistency ? 'Maintain original background details exactly' : 'Default'}
    3. Human Character: Face Type: ${formData.faceType}, Costume: ${formData.costume}, Skin Tone: ${formData.skinTone}
    4. Visual Style: ${formData.style}
    5. Video Ratio (Aspect Ratio): ${formData.aspectRatio}
    6. Duration: ${formData.duration}
    7. Dialogue Language: ${formData.dialogueLanguage}
    8. Shot Selection: Type: ${formData.shotType}, Lens: ${formData.lensType}
    9. Camera Control: Pacing: ${formData.pacing}, Direction: ${formData.cameraDirection}, Rig: ${formData.cameraRig}
    10. Environment: Weather: ${formData.weather}, Time: ${formData.time}
    11. Technical Sliders: Realism: ${formData.realism}/10, CFG Scale: ${formData.cfgScale}
    12. Advanced Camera: White Balance: ${formData.whiteBalance}, Shutter Speed: ${SHUTTER_SPEEDS[formData.shutterSpeedIdx]}, Aperture: ${APERTURES[formData.apertureIdx]}
    13. Composition: Light Setup: ${formData.useKeylight ? formData.keylightPosition : 'Natural'}, Clean Render: ${formData.noSubtitles ? 'Strictly no subtitles/watermarks' : 'Standard'}
    14. Negative Filter: ${formData.useNegativePrompt ? formData.selectedNegativeTags.join(', ') : 'None'}
    
    User Context (Master Prompt): ${formData.masterPrompt}
    Specific Movement Details: ${formData.details}
    
    Output Format: Return JSON with "standard" (string) and "structured" (metadata object).`;

    try {
      const result = await callGemini(JSON.stringify(formData), systemPrompt, refImage);
      if (!result) throw new Error("API No Response");
      const json = JSON.parse(result.replace(/```json|```/g, '').trim());
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        setPrompt(json.standard || ""); 
        setJsonPrompt(JSON.stringify(json.structured, null, 2));
        saveToCloudHistory(json.standard, JSON.stringify(json.structured, null, 2));
        setLoading(false);
        showNotification("Sinema berhasil dibuat!");
      }, 500);
    } catch (err) { 
      clearInterval(progressInterval);
      setLoading(false);
      showNotification("Gagal memproses vision."); 
    } 
  };

  const handleTranslateInput = async () => {
    if (!formData.theme && !formData.masterPrompt) { showNotification("Input kosong."); return; }
    setIsTranslating(true);
    const systemPrompt = `Translate into descriptive English video prompt. Return JSON with keys "theme", "masterPrompt", "details".`;
    try {
      const result = await callGemini(JSON.stringify(formData), systemPrompt);
      const json = JSON.parse(result.replace(/```json|```/g, '').trim());
      setFormData(prev => ({ ...prev, ...json }));
      showNotification("Terjemahan sukses!");
    } catch (err) { showNotification("Gagal menerjemahkan."); } finally { setIsTranslating(false); }
  };

  const handleAiSuggest = async () => {
    if (!formData.theme) { showNotification("Isi tema video."); return; }
    setIsAiSuggesting(true);
    const systemPrompt = `Suggest cinematic details for video generation. Return JSON: "masterPrompt", "details", "style", "weather", "time", "pacing", "cameraDirection", "cameraRig", "shotType", "lensType".`;
    try {
      const result = await callGemini(`Theme: ${formData.theme}`, systemPrompt);
      const json = JSON.parse(result.replace(/```json|```/g, '').trim());
      setFormData(prev => ({ ...prev, ...json }));
      showNotification("AI Suggestion diterapkan!");
    } catch (e) { showNotification("Gagal mendapatkan saran."); } finally { setIsAiSuggesting(false); }
  };

  const loadFromHistory = (item) => {
    setPrompt(item.content || ''); 
    setJsonPrompt(item.jsonContent || '');
    if (item.settings) setFormData(item.settings);
    if (item.refImage) {
      setImagePreview(item.refImage);
      setRefImage(item.refImage.split(',')[1]);
    } else {
      setImagePreview(null);
      setRefImage(null);
    }
    showNotification("Proyek histori dimuat!");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllHistory = async () => {
    if (!user || !window.confirm("Hapus histori cloud?")) return;
    const querySnapshot = await getDocs(collection(db, 'artifacts', appId, 'users', user.uid, 'history'));
    await Promise.all(querySnapshot.docs.map(d => deleteDoc(d.ref)));
    showNotification("Dibersihkan.");
  };

  const deleteHistoryItem = async (id) => {
    await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'history', id));
    showNotification("Item terhapus.");
  };

  // --- Render Helpers ---
  const currentShotDesc = SHOT_TYPES.find(s => s.label === formData.shotType)?.alt || "";
  const currentLensDesc = LENS_TYPES.find(l => l.label === formData.lensType)?.alt || "";
  const currentRatioDesc = ASPECT_RATIOS.find(r => r.label === formData.aspectRatio)?.desc || "";

  return (
    <div className={`min-h-screen transition-all duration-700 ${darkMode ? 'bg-[#050505] text-slate-200' : 'bg-[#fcfcfc] text-slate-900'}`}>
      
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-24 -right-24 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] rounded-full blur-[100px] sm:blur-[160px] transition-all duration-1000 ${darkMode ? 'bg-blue-900/10' : 'bg-blue-100/50'}`} />
        <div className={`absolute -bottom-24 -left-24 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] rounded-full blur-[100px] sm:blur-[160px] transition-all duration-1000 ${darkMode ? 'bg-purple-900/10' : 'bg-purple-100/40'}`} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12">
        
        {/* Header Section */}
        <header className="flex flex-col items-center mb-16 text-center">
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter mb-4">
            <span className={darkMode ? 'text-white' : 'text-slate-950'}>BEREJO</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 px-2 italic uppercase">SINEMA</span>
          </h1>
          <div className="text-[12px] md:text-[14px] font-bold text-slate-500 tracking-[0.2em] space-y-1 sm:space-y-2">
            <div className="mb-4">
              <span className={`text-[10px] px-4 py-1 rounded-full border font-mono ${darkMode ? 'bg-white/5 border-white/10 text-white/50' : 'bg-black/5 border-slate-300 text-black/60'}`}>Version 1.22.19 Master Edition</span>
            </div>
            <p className={darkMode ? '' : 'text-slate-950 font-black'}>Dibuat Oleh : Armansyah, S.Kom, M.Pd, Gr.</p>
            <p className={`text-[10px] sm:text-[11px] font-black uppercase tracking-widest ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
               Narasumber Koding & Kecerdasan Artifisial Kemendikdasmen 2025
            </p>
            <div className="flex justify-center gap-4 text-xs font-black uppercase pt-4">
              <a href="https://www.youtube.com/@CekguArman" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-all">Youtube</a>
              <span className={darkMode ? 'text-white/40' : 'text-slate-400'}>|</span>
              <a href="https://www.tiktok.com/@cekguarman" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 transition-all">Tiktok</a>
            </div>
          </div>
          
          <div className="flex gap-4 mt-10">
             <button onClick={handleNewProject} title="Buat Proyek Baru" className={`p-4 rounded-full border transition-all shadow-xl ${darkMode ? 'bg-white/5 border-white/10 hover:bg-green-500/20 text-green-400 shadow-green-900/20' : 'bg-white border-slate-300 hover:bg-green-50'}`}>
              <PlusCircle size={24} />
            </button>
             <button onClick={handleTranslateInput} disabled={isTranslating} title="Translate Input" className={`p-4 rounded-full border transition-all shadow-xl disabled:opacity-50 ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-blue-400 shadow-2xl' : 'bg-white border-slate-300 hover:bg-slate-50'}`}>
              <Languages size={24} className={isTranslating ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className={`p-4 rounded-full border transition-all shadow-xl ${darkMode ? 'bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10' : 'bg-white border-slate-300 text-indigo-600 hover:bg-slate-50'}`}>
              {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-8">
            <div className={cardClass}>
              <div className="space-y-8">
                {/* Referensi Foto & Background Consistency */}
                <div className="space-y-4">
                  <label className={labelClass}><Camera size={16} /> Foto Referensi Subjek</label>
                  {!imagePreview ? (
                    <div onClick={() => fileInputRef.current.click()} className={`group cursor-pointer border-2 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center gap-4 transition-all ${darkMode ? 'border-white/10 bg-white/5 hover:border-indigo-500/50' : 'border-slate-300 bg-slate-50 hover:border-indigo-400 shadow-inner'}`}>
                      <Upload size={32} className="text-indigo-500" />
                      <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 text-center">Klik atau Drag Foto (Tanpa Batas Ukuran)</p>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in duration-500">
                      <div className="relative w-full max-h-[400px] rounded-[2rem] overflow-hidden border border-white/10 bg-black flex items-center justify-center group shadow-2xl">
                        <img src={imagePreview} className="max-w-full max-h-[400px] object-contain" alt="Ref" />
                        <button onClick={removeImage} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={32} className="text-white bg-red-600 p-2 rounded-full" /></button>
                      </div>
                      <div onClick={() => setFormData({...formData, backgroundConsistency: !formData.backgroundConsistency})} className={`p-5 rounded-3xl border flex items-center gap-4 cursor-pointer transition-all ${formData.backgroundConsistency ? 'bg-teal-500/10 border-teal-500/30' : 'bg-slate-500/5 border-slate-300'}`}>
                         <div className="relative">
                            <input type="checkbox" className="sr-only" checked={formData.backgroundConsistency} readOnly />
                            <div className={`w-12 h-6 rounded-full flex items-center px-1 transition-all ${formData.backgroundConsistency ? 'bg-teal-600' : 'bg-slate-400'}`}>
                               <div className={`w-4 h-4 rounded-full bg-white transition-transform ${formData.backgroundConsistency ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                         </div>
                         <span className={`text-[10px] font-black uppercase tracking-widest ${formData.backgroundConsistency ? 'text-teal-500' : 'text-slate-500'}`}>Konsistensi Background Aktif</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className={labelClass}><Type size={16} /> Tema Cerita</label>
                  <input type="text" placeholder="Tulis tema pokok sinema..." className={`w-full bg-transparent border-b-2 py-4 focus:border-indigo-500 outline-none transition-all text-xl font-bold ${darkMode ? 'border-white/10 text-white' : 'border-slate-300 text-slate-950'}`} value={formData.theme} onChange={(e) => setFormData({...formData, theme: e.target.value})} />
                </div>

                {/* Karakter Section */}
                <div className={`p-6 sm:p-8 rounded-[2.5rem] space-y-8 border transition-all ${darkMode ? 'bg-white/5 border-white/5 shadow-inner' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <label className={labelClass}><Users size={18} /> Karakter Manusia</label>
                    <div className={`flex p-1 rounded-2xl shadow-inner ${darkMode ? 'bg-black/40' : 'bg-slate-200'}`}>
                      <button onClick={() => setFormData({...formData, hasHuman: 'Yes'})} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${formData.hasHuman === 'Yes' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500'}`}>Ada</button>
                      <button onClick={() => setFormData({...formData, hasHuman: 'No'})} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${formData.hasHuman === 'No' ? (darkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900 shadow-md') : (darkMode ? 'text-slate-500' : 'text-slate-500')}`}>Tanpa</button>
                    </div>
                  </div>
                  
                  {formData.hasHuman === 'Yes' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                      {imagePreview && (
                        <div className="p-5 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-4">
                          <UserCheck size={24} className="text-orange-500 shrink-0" />
                          <div className="space-y-1">
                             <p className={`text-[11px] font-black uppercase tracking-tighter ${darkMode ? 'text-orange-400' : 'text-orange-700'}`}>AI Prioritas: Menjaga Konsistensi Wajah</p>
                             <p className="text-[9px] opacity-70">Fitur wajah diambil dari foto referensi.</p>
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-1">
                          <span className={subLabelClass}>Perwajahan</span>
                          <select className={`w-full bg-transparent border-2 rounded-2xl p-4 outline-none font-bold text-sm ${darkMode ? 'border-white/5 text-white' : 'border-slate-400 text-slate-950'}`} value={formData.faceType} onChange={(e) => setFormData({...formData, faceType: e.target.value})}>
                            {[
                                'Ikut Prompt', 'Wajah Indonesia (Melayu Sumatra)', 'Wajah Indonesia (Sunda)',
                                'Wajah Indonesia (Jawa)', 'Wajah Indonesia (Medan)', 'Wajah Indonesia (Papua)',
                                'Wajah Cina', 'Wajah Eropa'
                            ].map(f => <option key={f} value={f} className="text-black">{f}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <span className={subLabelClass}>Kostum</span>
                          <select className={`w-full bg-transparent border-2 rounded-2xl p-4 outline-none font-bold text-sm ${darkMode ? 'border-white/5 text-white' : 'border-slate-300 text-slate-950'}`} value={formData.costume} onChange={(e) => setFormData({...formData, costume: e.target.value})}>
                            {['Ikut Prompt', 'Modern', "Muslim/Syar'i", 'Klasik 70-an', 'Kerajaan Majapahit', 'Kesultanan'].map(c => <option key={c} value={c} className="text-black">{c}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <span className={subLabelClass}>Warna Kulit</span>
                          <select className={`w-full bg-transparent border-2 rounded-2xl p-4 outline-none font-bold text-sm ${darkMode ? 'border-white/5 text-white' : 'border-slate-300 text-slate-950'}`} value={formData.skinTone} onChange={(e) => setFormData({...formData, skinTone: e.target.value})}>
                             {['Ikut Prompt', 'Fair (putih)', 'Pale (pucat)', 'Brown (sawo matang)', 'Ebony (Hitam legam)', 'Rosy (Putih merona)'].map(s => <option key={s} value={s} className="text-black">{s}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Gaya & Durasi Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <span className={subLabelClass}>Gaya Visual</span>
                     <select className={`w-full bg-transparent border-2 rounded-2xl p-4 outline-none font-bold text-sm ${darkMode ? 'border-white/5 text-white' : 'border-slate-300 text-slate-950'}`} value={formData.style} onChange={(e) => setFormData({...formData, style: e.target.value})}>
                       {STYLES.map(s => <option key={s} value={s} className="text-black">{s}</option>)}
                     </select>
                   </div>
                   <div className="space-y-2">
                     <span className={subLabelClass}>Durasi Video</span>
                     <select className={`w-full bg-transparent border-2 rounded-2xl p-4 outline-none font-bold text-sm transition-all ${darkMode ? 'border-white/10 text-white' : 'border-slate-400 text-slate-950'}`} value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})}>
                        <option value="5s" className="text-black">5 Detik (standar Meta Ai)</option>
                        <option value="8s" className="text-black">8 Detik (standar Veo3)</option>
                        <option value="10s" className="text-black">10 Detik (Standar Grok)</option>
                        <option value="15s" className="text-black">15 Detik</option>
                     </select>
                   </div>
                </div>

                {/* RASIO VIDEO */}
                <div className="space-y-2">
                  <span className={subLabelClass}><Monitor size={14} /> Rasio Video</span>
                  <div className="space-y-2">
                    <select className={`w-full bg-transparent border-2 rounded-2xl p-4 outline-none font-bold text-sm transition-all ${darkMode ? 'border-white/5 text-white' : 'border-slate-400 text-slate-950'}`} value={formData.aspectRatio} onChange={(e) => setFormData({...formData, aspectRatio: e.target.value})}>
                       {ASPECT_RATIOS.map(r => <option key={r.label} value={r.label} className="text-black">{r.label}</option>)}
                    </select>
                    {currentRatioDesc && (
                      <p className={`text-[9px] font-bold italic px-2 animate-in fade-in duration-300 ${darkMode ? 'text-teal-400/70' : 'text-teal-900/70'}`}>
                        {currentRatioDesc}
                      </p>
                    )}
                  </div>
                </div>

                {/* JENIS SHOT & JENIS LENSA GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* JENIS SHOT */}
                  <div className="space-y-2">
                    <span className={subLabelClass}>Jenis Shot</span>
                    <div className="space-y-2">
                      <select className={`w-full bg-transparent border-2 rounded-2xl p-4 outline-none font-bold text-sm transition-all ${darkMode ? 'border-white/5 text-white' : 'border-slate-400 text-slate-950'}`} value={formData.shotType} onChange={(e) => setFormData({...formData, shotType: e.target.value})}>
                         {SHOT_TYPES.map(s => <option key={s.label} value={s.label} className="text-black">{s.label}</option>)}
                      </select>
                      {currentShotDesc && (
                        <p className={`text-[9px] font-bold italic px-2 animate-in fade-in duration-300 ${darkMode ? 'text-yellow-400/70' : 'text-indigo-900/70'}`}>
                          {currentShotDesc}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* JENIS LENSA */}
                  <div className="space-y-2">
                    <span className={subLabelClass}>Jenis Lensa</span>
                    <div className="space-y-2">
                      <select className={`w-full bg-transparent border-2 rounded-2xl p-4 outline-none font-bold text-sm transition-all ${darkMode ? 'border-white/5 text-white' : 'border-slate-400 text-slate-950'}`} value={formData.lensType} onChange={(e) => setFormData({...formData, lensType: e.target.value})}>
                         {LENS_TYPES.map(l => <option key={l.label} value={l.label} className="text-black">{l.label}</option>)}
                      </select>
                      {currentLensDesc && (
                        <p className={`text-[9px] font-bold italic px-2 animate-in fade-in duration-300 ${darkMode ? 'text-blue-400/70' : 'text-blue-900/70'}`}>
                          {currentLensDesc}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Irama, Arah, Rig Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                   <div className="space-y-2">
                     <span className={subLabelClass}>Irama / Pacing</span>
                     <select className={`w-full bg-transparent border-2 rounded-2xl p-4 outline-none font-bold text-sm ${darkMode ? 'border-white/5 text-white' : 'border-slate-300 text-slate-955'}`} value={formData.pacing} onChange={(e) => setFormData({...formData, pacing: e.target.value})}>
                       {PACINGS.map(s => <option key={s} value={s} className="text-black">{s}</option>)}
                     </select>
                   </div>
                   <div className="space-y-2">
                     <span className={subLabelClass}>Arah Kamera</span>
                     <select className={`w-full bg-transparent border-2 rounded-2xl p-4 outline-none font-bold text-sm transition-all ${darkMode ? 'border-white/5 text-white' : 'border-slate-400 text-slate-950'}`} value={formData.cameraDirection} onChange={(e) => setFormData({...formData, cameraDirection: e.target.value})}>
                       <option value="Ikut Prompt" className="text-black">Ikut Prompt</option>
                       {DIRECTIONS_CATEGORIZED.map(cat => (
                         <optgroup label={cat.category} key={cat.category} className="font-black bg-slate-100 text-indigo-900">
                           {cat.items.map(item => <option key={item} value={item} className="text-black font-normal bg-white">{item}</option>)}
                         </optgroup>
                       ))}
                     </select>
                   </div>
                   <div className="space-y-2">
                     <span className={subLabelClass}>Rig Kamera</span>
                     <select className={`w-full bg-transparent border-2 rounded-2xl p-4 outline-none font-bold text-sm ${darkMode ? 'border-white/5 text-white' : 'border-slate-300 text-slate-950'}`} value={formData.cameraRig} onChange={(e) => setFormData({...formData, cameraRig: e.target.value})}>
                       {RIGS.map(s => <option key={s} value={s} className="text-black">{s}</option>)}
                     </select>
                   </div>
                </div>

                {/* Cuaca & Waktu Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <span className={subLabelClass}>Kondisi Cuaca</span>
                     <select className={`w-full bg-transparent border-2 rounded-2xl p-4 outline-none font-bold text-sm transition-all ${darkMode ? 'border-white/5 text-white' : 'border-slate-400 text-slate-950'}`} value={formData.weather} onChange={(e) => setFormData({...formData, weather: e.target.value})}>
                       {WEATHERS.map(s => <option key={s} value={s} className="text-black">{s}</option>)}
                     </select>
                   </div>
                   <div className="space-y-2">
                     <span className={subLabelClass}>Suasana Waktu</span>
                     <select className={`w-full bg-transparent border-2 rounded-2xl p-4 outline-none font-bold text-sm transition-all ${darkMode ? 'border-white/5 text-white' : 'border-slate-400 text-slate-950'}`} value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})}>
                       {TIMES.map(s => <option key={s} value={s} className="text-black">{s}</option>)}
                     </select>
                   </div>
                </div>

                {/* Slider Kontrol Realisme & CFG */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className={labelClass}><Sparkles size={14} /> Realisme: {formData.realism}</label>
                    <input type="range" min="1" max="10" step="1" className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500 shadow-inner" value={formData.realism} onChange={(e) => setFormData({...formData, realism: parseInt(e.target.value)})} />
                    <div className={sliderSubtextClass}><span>Draft</span><span>Neutral</span><span>Photo</span></div>
                  </div>
                  <div className="space-y-4">
                    <label className={labelClass}><Activity size={14} /> CFG Scale: {formData.cfgScale}</label>
                    <input type="range" min="0" max="1" step="0.1" className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500 shadow-inner" value={formData.cfgScale} onChange={(e) => setFormData({...formData, cfgScale: parseFloat(e.target.value)})} />
                    <div className={sliderSubtextClass}><span>Flexible</span><span>Balanced</span><span>Strict</span></div>
                  </div>
                </div>

                {/* KAMERA LANJUTAN */}
                <div className={`p-8 rounded-[2.5rem] border-2 transition-all ${formData.useAdvancedCamera ? (darkMode ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-indigo-400 bg-indigo-50 shadow-xl') : (darkMode ? 'border-white/5 bg-white/5' : 'border-slate-200 bg-slate-50')}`}>
                  <label className="flex items-center gap-4 cursor-pointer mb-8 group">
                    <div className="relative">
                      <input type="checkbox" className="sr-only" checked={formData.useAdvancedCamera} onChange={(e) => setFormData({...formData, useAdvancedCamera: e.target.checked})} />
                      <div className={`w-14 h-7 rounded-full transition-all flex items-center px-1 ${formData.useAdvancedCamera ? 'bg-indigo-600' : 'bg-slate-400'}`}>
                        <div className={`w-5 h-5 rounded-full bg-white transition-transform transform ${formData.useAdvancedCamera ? 'translate-x-7' : 'translate-x-0'}`} />
                      </div>
                    </div>
                    <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${formData.useAdvancedCamera ? (darkMode ? 'text-yellow-400' : 'text-indigo-950') : (darkMode ? 'text-yellow-400/50' : 'text-slate-600')}`}>Pengaturan Kamera Lanjutan</span>
                  </label>

                  {formData.useAdvancedCamera && (
                    <div className="space-y-12 animate-in slide-in-from-top-6 duration-700">
                      <div className="space-y-4">
                        <label className={labelClass}><Thermometer size={14} /> White Balance</label>
                        <select className={`w-full bg-transparent border-b-2 py-4 outline-none font-bold text-lg ${darkMode ? 'border-white/10 text-white' : 'border-slate-400 text-slate-950'}`} value={formData.whiteBalance} onChange={(e) => setFormData({...formData, whiteBalance: e.target.value})}>{['Ikut Prompt', 'AWB', 'Daylight', 'Shade'].map(wb => <option key={wb} value={wb} className="text-black">{wb}</option>)}</select>
                      </div>
                      <div className="space-y-6">
                        <div className="flex justify-between items-center"><label className={labelClass}><Gauge size={16} /> Shutter Speed</label><span className={`text-sm font-black font-mono ${darkMode ? 'text-indigo-500' : 'text-indigo-700'}`}>{SHUTTER_SPEEDS[formData.shutterSpeedIdx]}</span></div>
                        <input type="range" min="0" max={SHUTTER_SPEEDS.length - 1} className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500" value={formData.shutterSpeedIdx} onChange={(e) => setFormData({...formData, shutterSpeedIdx: parseInt(e.target.value)})} />
                      </div>
                      <div className="space-y-6">
                        <div className="flex justify-between items-center"><label className={labelClass}><CircleDot size={16} /> Aperture</label><span className={`text-sm font-black font-mono ${darkMode ? 'text-purple-500' : 'text-purple-700'}`}>{APERTURES[formData.apertureIdx]}</span></div>
                        <input type="range" min="0" max={APERTURES.length - 1} className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-purple-500" value={formData.apertureIdx} onChange={(e) => setFormData({...formData, apertureIdx: parseInt(e.target.value)})} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Master & Details Position (BOTTOM) */}
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2 animate-in slide-in-from-top-4 duration-500">
                    <label className={`${labelClass} text-indigo-500`}><ScrollText size={16} /> Master Prompt</label>
                    <textarea rows="3" placeholder="Poin-poin pokok panduan utama video..." className={`w-full bg-indigo-500/5 border-2 rounded-[2rem] p-6 outline-none transition-all ${darkMode ? 'border-indigo-500/10 text-indigo-200 shadow-inner' : 'border-indigo-200 text-indigo-950 focus:border-indigo-400 shadow-sm'}`} value={formData.masterPrompt} onChange={(e) => setFormData({...formData, masterPrompt: e.target.value})} />
                  </div>
                  <div className="space-y-2 animate-in slide-in-from-top-4 duration-500">
                    <label className={labelClass}><Zap size={16} /> Detail Gerakan & Efek</label>
                    <textarea rows="4" placeholder="Deskripsikan gerakan kamera, subjek, secara rinci..." className={`w-full bg-transparent border-2 rounded-[2rem] p-6 outline-none transition-all ${darkMode ? 'border-white/5 focus:border-indigo-500/50 text-white shadow-inner' : 'border-slate-300 text-slate-900 focus:border-indigo-400'}`} value={formData.details} onChange={(e) => setFormData({...formData, details: e.target.value})} />
                  </div>
                </div>

                {/* Light & Optimasi Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className={`p-8 rounded-[2.5rem] border transition-all ${darkMode ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-300 shadow-md'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <label className={labelClass}><Lightbulb size={18} /> Light</label>
                      <button onClick={() => setFormData({...formData, useKeylight: !formData.useKeylight})} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase ${formData.useKeylight ? 'bg-yellow-600 text-white shadow-xl' : 'bg-slate-700 text-white shadow-sm'}`}>{formData.useKeylight ? 'On' : 'Off'}</button>
                    </div>
                    {formData.useKeylight && (
                      <select className={`w-full bg-transparent border-b-2 py-2 outline-none font-bold text-sm transition-all ${darkMode ? 'border-white/10 text-white' : 'border-slate-400 text-slate-950'}`} value={formData.keylightPosition} onChange={(e) => setFormData({...formData, keylightPosition: e.target.value})}>
                        {['Key Light', 'Fill light', 'Back Light'].map(type => <option key={type} value={type} className="text-black">{type}</option>)}
                      </select>
                    )}
                  </div>

                  <div className={`p-8 rounded-[2.5rem] border-2 transition-all ${darkMode ? 'bg-blue-900/10 border-blue-900/20 shadow-md' : 'bg-blue-50 border-blue-200'}`}>
                     <h3 className={labelClass}><ShieldCheck size={18} /> Clean Render</h3>
                     <label className="flex items-center gap-4 cursor-pointer mt-4">
                        <input type="checkbox" className="sr-only" checked={formData.noSubtitles} onChange={(e) => setFormData({...formData, noSubtitles: e.target.checked})} />
                        <div className={`w-12 h-6 rounded-full flex items-center px-1 transition-all ${formData.noSubtitles ? 'bg-blue-600' : 'bg-slate-400'}`}>
                           <div className={`w-4 h-4 rounded-full bg-white transition-transform ${formData.noSubtitles ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                        <span className={`text-[12px] sm:text-[14px] font-black uppercase tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Hapus Subtitles & Watermark</span>
                     </label>
                  </div>
                </div>

                {/* Negative Prompt - Compiled Error Fixed Wrapper */}
                <div className={negativePromptWrapperClass}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                    <label className={labelClass}><Ban size={16} /> Negative Prompt</label>
                    <div className="flex gap-2">
                       <button onClick={() => setFormData({...formData, useNegativePrompt: !formData.useNegativePrompt})} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${formData.useNegativePrompt ? 'bg-red-600 text-white' : 'bg-slate-700 text-white'}`}>{formData.useNegativePrompt ? 'Aktif' : 'Mati'}</button>
                       {formData.useNegativePrompt && (
                          <button onClick={handleSelectAllNegative} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${darkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
                             {formData.selectedNegativeTags.length === NEGATIVE_TAGS.length ? 'Hapus Semua' : 'Pilih Semua'}
                          </button>
                       )}
                    </div>
                  </div>
                  {formData.useNegativePrompt && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto no-scrollbar p-2 border-t border-red-500/20 animate-in slide-in-from-top-4 duration-500">
                       {NEGATIVE_TAGS.map(tag => (
                          <label key={tag} className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${formData.selectedNegativeTags.includes(tag) ? 'bg-red-600 border-red-500 text-white shadow-lg' : (darkMode ? 'bg-white/5 border-white/5 text-slate-400' : 'bg-white border-slate-200 text-slate-600')}`}>
                             <input type="checkbox" className="sr-only" checked={formData.selectedNegativeTags.includes(tag)} onChange={() => toggleNegativeTag(tag)} />
                             <span className="text-[10px] font-bold uppercase truncate">{tag}</span>
                          </label>
                       ))}
                    </div>
                  )}
                </div>

                <button onClick={handleGenerate} disabled={loading || !user || !isFormReady} className={`w-full py-8 rounded-[2.5rem] flex items-center justify-center gap-4 font-black text-xl tracking-[0.4em] shadow-2xl transition-all active:scale-95 ${loading || !isFormReady ? 'bg-slate-800 text-slate-600 opacity-50' : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:scale-[1.01] shadow-indigo-500/40'}`}>
                   {loading ? (
                    <span className="flex items-center gap-2">
                       <RefreshCw className="animate-spin" size={24} /> 
                       Mohon Tunggu {Math.round(progress)}%
                    </span>
                   ) : 'BUAT SINEMA'}
                </button>
              </div>
            </div>
          </div>

          <div id="result-area" className="lg:col-span-5 space-y-10">
            <div className={`p-10 rounded-[3rem] border shadow-2xl transition-all ${darkMode ? 'bg-[#080808]/90 border-white/5' : 'bg-white border-slate-300 shadow-2xl'}`}>
               <div className="flex flex-col gap-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className={`flex w-full sm:w-auto p-1 rounded-xl sm:rounded-2xl shadow-inner ${darkMode ? 'bg-black/40' : 'bg-slate-100'}`}>
                    <button onClick={() => setActiveTab('text')} className={`flex-1 sm:flex-none px-8 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'text' ? 'bg-blue-600 text-white shadow-lg' : (darkMode ? 'text-slate-500' : 'text-slate-600')}`}>TEXT</button>
                    <button onClick={() => setActiveTab('json')} className={`flex-1 sm:flex-none px-8 py-2 rounded-xl text-[10px] font-black transition-all ${activeTab === 'json' ? 'bg-purple-600 text-white shadow-lg' : (darkMode ? 'text-slate-500' : 'text-slate-600')}`}>JSON</button>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto justify-center">
                    <button onClick={copyToClipboard} title="Copy" className={`p-4 rounded-2xl border transition-all ${darkMode ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-slate-300 text-slate-900 shadow-sm'}`}><Copy size={18} /></button>
                    <button onClick={downloadPrompt} title="Download" className={`p-4 rounded-2xl border transition-all ${darkMode ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-slate-300 text-slate-900 shadow-sm'}`}><Download size={18} /></button>
                  </div>
                </div>
                <div className={`relative min-h-[400px] rounded-[2.5rem] border-2 border-dashed ${darkMode ? 'bg-black/40 border-white/10' : 'bg-slate-100 border-slate-300 shadow-inner'}`}>
                  {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                      <div className="w-24 h-24 mb-8 relative">
                        <div className="absolute inset-0 border-4 border-indigo-600/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center font-black text-lg">{Math.round(progress)}%</div>
                      </div>
                    </div>
                  ) : prompt ? (
                    <textarea readOnly className={`w-full h-[400px] bg-transparent p-8 outline-none resize-none font-mono text-[11px] leading-loose ${activeTab === 'json' ? 'text-purple-400 font-bold' : (darkMode ? 'text-indigo-100' : 'text-slate-950 font-bold')}`} value={activeTab === 'text' ? prompt : jsonPrompt} />
                  ) : (
                    <div className="flex items-center justify-center h-full opacity-20"><Sparkles size={48} /></div>
                  )}
                </div>
              </div>
            </div>

            <div className={`p-10 rounded-[3rem] border transition-all shadow-xl ${darkMode ? 'bg-white/5 border-white/5 backdrop-blur-md' : 'bg-slate-100 border-slate-300 shadow-xl'}`}>
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <HistoryIcon size={18} className="text-indigo-500" />
                  <h3 className={`text-sm font-black uppercase tracking-[0.3em] ${darkMode ? 'text-yellow-400' : 'text-indigo-950'}`}>Cloud History</h3>
                </div>
                <button onClick={clearAllHistory} className="text-[10px] font-black text-red-500/80 hover:text-red-500 uppercase tracking-widest flex items-center gap-2"><Trash2 size={14} /> Clear</button>
              </div>
              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 no-scrollbar">
                {history.length === 0 ? (
                  <div className="text-center py-20 opacity-20 flex flex-col items-center gap-4"><ScrollText size={48} /><p className="text-xs font-black uppercase tracking-[0.3em]">No Data Found</p></div>
                ) : history.map((item) => (
                  <div key={item.id} className={`group p-6 rounded-[2rem] border transition-all cursor-pointer relative overflow-hidden ${darkMode ? 'bg-white/5 border-white/5 hover:border-indigo-500/30' : 'bg-white border-slate-300 hover:border-indigo-400 shadow-md'}`} onClick={() => loadFromHistory(item)}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-4 items-center overflow-hidden">
                         {item.refImage && (
                           <img src={item.refImage} className="w-10 h-10 rounded-lg object-cover border border-indigo-500/30 shrink-0" alt="Thumb" />
                         )}
                         <span className={`text-[11px] font-black uppercase truncate pr-8 ${darkMode ? 'text-indigo-500' : 'text-indigo-700'}`}>{String(item.theme || 'Vision')}</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteHistoryItem(item.id); }} className="opacity-0 group-hover:opacity-100 p-1 text-red-500 transition-opacity"><X size={14} /></button>
                    </div>
                    <p className={`text-[10px] line-clamp-2 italic leading-relaxed ${darkMode ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>{String(item.content || '')}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${darkMode ? 'bg-white/10 text-white/40' : 'bg-slate-200 text-slate-600'}`}>{String(item.timestamp || '')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <footer className="mt-10 py-10 border-t border-white/5">
               <div className="space-y-6">
                  <div className="text-center">
                    <h3 className={`text-xs font-black uppercase tracking-[0.3em] mb-4 ${darkMode ? 'text-yellow-400' : 'text-indigo-950'}`}>Informasi Sistem & Disclaimer</h3>
                  </div>
                  <div className={`space-y-4 text-[10px] sm:text-[11px] leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    <div className="flex gap-3">
                      <span className="text-blue-500 text-lg leading-none">•</span>
                      <p>
                        <strong className={darkMode ? 'text-white' : 'text-black'}>Berejo (Being Researcher and Innovator with Joyful Experiment):</strong> Inisiatif kreatif Bapak Armansyah untuk memberdayakan pengguna melalui eksperimen AI berbasis riset.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-blue-500 text-lg leading-none">•</span>
                      <p>
                        Istilah <strong className={darkMode ? 'text-yellow-400' : 'text-indigo-900'}>"Berejo"</strong> dalam bahasa Palembang berarti ikhtiar nyata atau upaya bersungguh-sungguh dalam menyelesaikan tantangan. Istilah Berejo digunakan karena Cekguarman ini adalah orang Palembang asli (sebagai bentuk promosi dan pelestarian bahasa daerah).
                      </p>
                    </div>
                  </div>

                  {/* Donasi Sukarela Section */}
                  <div className={`p-6 rounded-[2rem] border text-center ${darkMode ? 'bg-green-500/5 border-green-500/10' : 'bg-green-50 border-green-200 shadow-sm'}`}>
                     <h4 className={`text-xs font-black uppercase tracking-[0.2em] mb-3 ${darkMode ? 'text-green-400' : 'text-green-800'}`}>Donasi Sukarela</h4>
                     <div className={`text-[10px] sm:text-[11px] space-y-1 font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        <p>Gopay dan Dana: <span className="font-mono tracking-wider text-xs">0816355539</span></p>
                        <p>Saweria: <a href="https://saweria.co/armansyah" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">https://saweria.co/armansyah</a></p>
                     </div>
                  </div>

                  <div className={`p-6 rounded-[2rem] border mt-6 text-center ${darkMode ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
                    <p className={`text-[10px] font-bold leading-relaxed ${darkMode ? 'text-red-400/90' : 'text-red-800'}`}>
                      Berejo Sinema can make mistakes. Check your result wisely. AI results are not always accurate and AI output requires human review.
                    </p>
                  </div>
               </div>
            </footer>
          </div>
        </main>
      </div>

      {notification && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-bounce-in w-[90%] sm:w-auto text-center">
          <div className="bg-blue-600 text-white px-8 py-3 rounded-2xl shadow-2xl flex items-center justify-center gap-3"><CheckCircle2 size={20} /><span className="text-xs font-black uppercase tracking-wider">{notification}</span></div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-in { 0% { transform: translate(-50%, 40px); opacity: 0; } 100% { transform: translate(-50%, 0); opacity: 1; } }
        .animate-bounce-in { animation: bounce-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; height: 22px; width: 22px; border-radius: 50%; background: white; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.5); border: 4px solid #4f46e5; }
        @media (min-width: 640px) { input[type="range"]::-webkit-slider-thumb { height: 24px; width: 24px; } }
        select option { color: #000 !important; background-color: #fff !important; }
        optgroup { font-weight: 900 !important; font-style: normal !important; color: #1e1b4b !important; background: #f1f5f9 !important; }
      `}} />
    </div>
  );
};

export default App;
