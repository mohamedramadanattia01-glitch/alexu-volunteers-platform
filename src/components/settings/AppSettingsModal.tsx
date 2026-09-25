import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AVAILABLE_SOUNDS, playSynthesizedSound, playCustomAudio, playAppTone } from '../../utils/soundEngine';
import { 
  X, Image as ImageIcon, Volume2, Type, Sparkles, 
  Plus, Trash2, Play, Check, Upload, RefreshCw, Sliders, Music, FileAudio
} from 'lucide-react';

interface AppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppSettingsModal: React.FC<AppSettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    branding, updateBranding, updateLogo, updateStamp, updateTickerMessages,
    soundSettings, updateSoundSettings, setFontSizeMode 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'branding' | 'ticker' | 'sounds' | 'typography'>('branding');
  
  // Local states for editing
  const [logoInputUrl, setLogoInputUrl] = useState(branding.logoUrl || '');
  const [stampInputUrl, setStampInputUrl] = useState(branding.stampUrl || '/stamp.png');
  const [appTitle, setAppTitle] = useState(branding.appTitle || 'فريق المتطوعين');
  const [appSubtitle, setAppSubtitle] = useState(branding.subtitle || '');
  
  const [messages, setMessages] = useState<string[]>(branding.tickerMessages || []);
  const [newMsgText, setNewMsgText] = useState('');
  const [tickerSpeed, setTickerSpeed] = useState(branding.tickerSpeed || 5);
  const [tickerActive, setTickerActive] = useState(branding.tickerActive !== false);

  const [selectedTaskSound, setSelectedTaskSound] = useState(soundSettings.taskSound || 'crystal_chime');
  const [selectedAlertSound, setSelectedAlertSound] = useState(soundSettings.alertSound || 'cyber_alert');
  const [selectedAnnouncementSound, setSelectedAnnouncementSound] = useState(soundSettings.announcementSound || 'fanfare_win');
  
  const [customTaskAudio, setCustomTaskAudio] = useState(soundSettings.customTaskSound || '');
  const [customAlertAudio, setCustomAlertAudio] = useState(soundSettings.customAlertSound || '');
  const [customGeneralAudio, setCustomGeneralAudio] = useState(soundSettings.customNormalSound || '');

  const [soundVolume, setSoundVolume] = useState(soundSettings.volume || 0.75);
  const [soundEnabled, setSoundEnabled] = useState(soundSettings.enabled !== false);

  const [currentFontMode, setCurrentFontMode] = useState<'compact' | 'normal' | 'large'>(branding.fontSizeMode || 'compact');

  if (!isOpen) return null;

  // Handle Logo Upload from local files
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setLogoInputUrl(result);
          updateLogo(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Stamp Upload from local files
  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setStampInputUrl(result);
          updateStamp(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Custom Audio Uploads
  const handleAudioUpload = (category: 'task' | 'alert' | 'general', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          if (category === 'task') {
            setCustomTaskAudio(result);
            updateSoundSettings({ customTaskSound: result });
            playCustomAudio(result, soundVolume);
          } else if (category === 'alert') {
            setCustomAlertAudio(result);
            updateSoundSettings({ customAlertSound: result });
            playCustomAudio(result, soundVolume);
          } else {
            setCustomGeneralAudio(result);
            updateSoundSettings({ customNormalSound: result });
            playCustomAudio(result, soundVolume);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBranding = () => {
    updateBranding({
      logoUrl: logoInputUrl,
      stampUrl: stampInputUrl,
      appTitle,
      subtitle: appSubtitle
    });
    updateStamp(stampInputUrl);
  };

  const handleAddMessage = () => {
    if (!newMsgText.trim()) return;
    const updated = [...messages, newMsgText.trim()];
    setMessages(updated);
    updateTickerMessages(updated);
    setNewMsgText('');
  };

  const handleDeleteMessage = (index: number) => {
    const updated = messages.filter((_, i) => i !== index);
    setMessages(updated);
    updateTickerMessages(updated);
  };

  const handleSaveTickerSettings = () => {
    updateBranding({
      tickerMessages: messages,
      tickerActive,
      tickerSpeed
    });
  };

  const handleSaveSounds = () => {
    updateSoundSettings({
      taskSound: selectedTaskSound,
      alertSound: selectedAlertSound,
      announcementSound: selectedAnnouncementSound,
      customTaskSound: customTaskAudio,
      customAlertSound: customAlertAudio,
      customNormalSound: customGeneralAudio,
      volume: soundVolume,
      enabled: soundEnabled
    });
  };

  const handleApplyFontMode = (mode: 'compact' | 'normal' | 'large') => {
    setCurrentFontMode(mode);
    setFontSizeMode(mode);
    updateBranding({ fontSizeMode: mode });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="glass-card max-w-2xl w-full p-6 border border-blue-500/30 shadow-2xl bg-slate-950 text-right my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">إعدادات وتخصيص المنصة</h3>
              <p className="text-[11px] text-slate-400">تعديل الشعار، شريط الجمل المتغيرة، النغمات الصوتية المخصصة، وأحجام الخطوط</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 mb-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('branding')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'branding' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>الشعار والهوية</span>
          </button>

          <button
            onClick={() => setActiveTab('ticker')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'ticker' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>شريط العبارات</span>
          </button>

          <button
            onClick={() => setActiveTab('sounds')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'sounds' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>النغمات والتنبيهات</span>
          </button>

          <button
            onClick={() => setActiveTab('typography')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'typography' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>حجم الخط للهاتف</span>
          </button>
        </div>

        {/* Tab 1: Logo & Branding */}
        {activeTab === 'branding' && (
          <div className="space-y-4 animate-in fade-in">
            
            {/* Live Logo Preview Box */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white border-2 border-blue-500/40 flex items-center justify-center overflow-hidden shadow-inner shrink-0 p-1">
                {logoInputUrl ? (
                  <img src={logoInputUrl} alt="شعار اتحاد طلاب جامعة الإسكندرية" className="w-full h-full object-contain" />
                ) : (
                  <span className="font-extrabold text-blue-600 text-xl">AU</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white mb-1">معاينة شعار المنصة الحالي</div>
                <p className="text-[11px] text-slate-400">
                  يظهر هذا الشعار في الشريط العلوي، القوائم الجانبية، كروت العرض، والتقارير المطبوعة.
                </p>
                {logoInputUrl !== '/logo.png' && (
                  <button
                    onClick={() => { setLogoInputUrl('/logo.png'); updateLogo('/logo.png'); }}
                    className="text-[10px] text-sky-400 hover:underline mt-1 cursor-pointer"
                  >
                    استعادة الشعار الرسمي المعتمد
                  </button>
                )}
              </div>
            </div>

            {/* Upload from Device */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                رفع صورة الشعار من جهازك (PNG / JPG / SVG):
              </label>
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload}
                  className="hidden" 
                  id="logo-upload-input" 
                />
                <label 
                  htmlFor="logo-upload-input"
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-blue-500/40 bg-blue-950/20 hover:bg-blue-950/40 text-blue-300 text-xs font-bold cursor-pointer transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>اضغط لاختيار ورفع صورة من جهازك</span>
                </label>
              </div>
            </div>

            {/* Direct Image URL */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                أو إدخال رابط الشعار (Image URL):
              </label>
              <input
                type="text"
                value={logoInputUrl}
                onChange={(e) => { setLogoInputUrl(e.target.value); updateLogo(e.target.value); }}
                placeholder="https://example.com/logo.png"
                className="glass-input text-xs font-mono"
              />
            </div>

            {/* Preset Logos */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">
                شعارات مقترحة جاهزة:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: 'افتراضي الاتحاد AU', url: '' },
                  { name: 'شعار ذهبي ملكي', url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=120&auto=format&fit=crop&q=80' },
                  { name: 'شعار أزرق تقني', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80' }
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setLogoInputUrl(preset.url); updateLogo(preset.url); }}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 text-[11px] text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Official Union Stamp Management */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-950 border-2 border-amber-500/50 flex items-center justify-center overflow-hidden shadow-inner shrink-0 p-1 relative">
                  {stampInputUrl ? (
                    <img src={stampInputUrl} alt="الختم الرسمي لاتحاد الطلاب" className="w-full h-full object-contain" />
                  ) : (
                    <span className="font-bold text-amber-400 text-xs text-center">الختم الرسمي</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-amber-300 mb-1">الختم الرسمي المعتمد لاتحاد الطلاب</div>
                  <p className="text-[11px] text-slate-400">
                    يظهر هذا الختم المعتمد على الكارنيه الرقمي للمتطوعين، شهادات التقدير، والـ CV التطوعي.
                  </p>
                  {stampInputUrl !== '/stamp.png' && (
                    <button
                      onClick={() => { setStampInputUrl('/stamp.png'); updateStamp('/stamp.png'); }}
                      className="text-[10px] text-amber-400 hover:underline mt-1 cursor-pointer"
                    >
                      استعادة الختم الرسمي الافتراضي
                    </button>
                  )}
                </div>
              </div>

              {/* Upload Stamp File */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  رفع صورة الختم الرسمي (PNG / شفاف):
                </label>
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleStampUpload}
                    className="hidden" 
                    id="stamp-upload-input" 
                  />
                  <label 
                    htmlFor="stamp-upload-input"
                    className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-amber-500/40 bg-amber-950/20 hover:bg-amber-950/40 text-amber-300 text-xs font-bold cursor-pointer transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    <span>اضغط لاختيار ورفع صورة الختم من جهازك</span>
                  </label>
                </div>
              </div>

              {/* Direct Stamp URL */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  أو إدخال رابط صورة الختم (Stamp URL):
                </label>
                <input
                  type="text"
                  value={stampInputUrl}
                  onChange={(e) => { setStampInputUrl(e.target.value); updateStamp(e.target.value); }}
                  placeholder="https://example.com/stamp.png"
                  className="glass-input text-xs font-mono"
                />
              </div>
            </div>

            {/* App Title & Subtitle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم الفريق / المنصة:</label>
                <input
                  type="text"
                  value={appTitle}
                  onChange={(e) => setAppTitle(e.target.value)}
                  className="glass-input text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الوصف الفرعي:</label>
                <input
                  type="text"
                  value={appSubtitle}
                  onChange={(e) => setAppSubtitle(e.target.value)}
                  className="glass-input text-xs"
                />
              </div>
            </div>

            <button
              onClick={handleSaveBranding}
              className="btn-primary w-full py-2.5 text-xs mt-2"
            >
              <Check className="w-4 h-4" />
              <span>حفظ وتطبيق تغييرات الهوية والختم</span>
            </button>

          </div>
        )}

        {/* Tab 2: Ticker Messages */}
        {activeTab === 'ticker' && (
          <div className="space-y-4 animate-in fade-in">
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <div>
                <div className="font-bold text-white">تفعيل شريط العبارات والإعلانات بأعلى المنصة</div>
                <div className="text-[10px] text-slate-400">عرض الأقوال المتغيرة والأخبار في الهيدر</div>
              </div>
              <button
                type="button"
                onClick={() => { setTickerActive(!tickerActive); updateBranding({ tickerActive: !tickerActive }); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  tickerActive ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {tickerActive ? 'مفعل ✓' : 'معطل'}
              </button>
            </div>

            {/* Speed selection */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-slate-300">سرعة تبديل العبارة:</span>
                <span className="text-sky-400 font-bold font-mono">{tickerSpeed} ثوانٍ</span>
              </div>
              <input
                type="range"
                min="2"
                max="15"
                value={tickerSpeed}
                onChange={(e) => {
                  const spd = Number(e.target.value);
                  setTickerSpeed(spd);
                  updateBranding({ tickerSpeed: spd });
                }}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Add new message */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                إضافة عبارة تشجيعية أو إعلان جديد:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMsgText}
                  onChange={(e) => setNewMsgText(e.target.value)}
                  placeholder="اكتب العبارة هنا..."
                  className="glass-input text-xs flex-1"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddMessage(); }}
                />
                <button
                  onClick={handleAddMessage}
                  className="btn-primary text-xs px-4 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة</span>
                </button>
              </div>
            </div>

            {/* List of messages */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              <label className="block text-xs font-bold text-slate-400">
                العبارات الحالية المتناوبة ({messages.length}):
              </label>
              {messages.map((msg, index) => (
                <div 
                  key={index}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-slate-200 truncate">{msg}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteMessage(index)}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-all cursor-pointer"
                    title="حذف العبارة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* Tab 3: Sounds */}
        {activeTab === 'sounds' && (
          <div className="space-y-5 animate-in fade-in">
            
            {/* Master Sound Switch & Volume */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-sky-400" />
                  <div>
                    <div className="font-bold text-white">تفعيل النغمات الصوتية التفاعلية</div>
                    <div className="text-[10px] text-slate-400">تشغيل نغمات للمهام، الطوارئ، التقييمات، والشكاوى</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const toggled = !soundEnabled;
                    setSoundEnabled(toggled);
                    updateSoundSettings({ enabled: toggled });
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    soundEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {soundEnabled ? 'مفعل ✓' : 'مكتوم 🔇'}
                </button>
              </div>

              {/* Volume Slider */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">مستوى الصوت العام:</span>
                  <span className="font-bold text-sky-400 font-mono">{Math.round(soundVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={soundVolume}
                  onChange={(e) => {
                    const vol = Number(e.target.value);
                    setSoundVolume(vol);
                    updateSoundSettings({ volume: vol });
                  }}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
            </div>

            {/* 1. Task Sound Selection & Custom Upload */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>نغمة إسناد وتسليم المهام (Task Sound):</span>
                </label>

                {customTaskAudio ? (
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                    نغمة مخصصة مرفوعة 🎵
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                    نغمة مدمجة
                  </span>
                )}
              </div>

              {/* Custom audio upload control for Task */}
              <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.ogg,.m4a"
                  id="task-audio-upload"
                  className="hidden"
                  onChange={(e) => handleAudioUpload('task', e)}
                />
                <label
                  htmlFor="task-audio-upload"
                  className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>رفع نغمة مهام من جهازك (MP3/WAV)</span>
                </label>

                {customTaskAudio && (
                  <div className="flex items-center gap-2 mr-auto">
                    <button
                      type="button"
                      onClick={() => playCustomAudio(customTaskAudio, soundVolume)}
                      className="p-1.5 bg-blue-600 text-white rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                      title="تجربة النغمة المرفوعة"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>تشغيل</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomTaskAudio('');
                        updateSoundSettings({ customTaskSound: undefined });
                      }}
                      className="p-1.5 text-rose-400 hover:bg-rose-950/40 rounded-lg text-xs cursor-pointer"
                      title="حذف النغمة المخصصة والرجوع للافتراضي"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Synthesizer Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AVAILABLE_SOUNDS.map(sound => (
                  <div
                    key={sound.id}
                    onClick={() => {
                      setSelectedTaskSound(sound.id);
                      updateSoundSettings({ taskSound: sound.id });
                    }}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                      selectedTaskSound === sound.id && !customTaskAudio
                        ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                        : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0 pr-1">
                      <div className="truncate">{sound.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{sound.description}</div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playSynthesizedSound(sound.id, soundVolume);
                      }}
                      className="p-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-white transition-all shrink-0 cursor-pointer"
                      title="استماع للنغمة"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Alert / SOS Sound Selection & Custom Upload */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>نغمة التنبيهات وبلاغات الطوارئ والشكاوى (Alert Sound):</span>
                </label>

                {customAlertAudio ? (
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30">
                    نغمة مخصصة مرفوعة 🚨
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                    نغمة مدمجة
                  </span>
                )}
              </div>

              {/* Custom audio upload control for Alert */}
              <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.ogg,.m4a"
                  id="alert-audio-upload"
                  className="hidden"
                  onChange={(e) => handleAudioUpload('alert', e)}
                />
                <label
                  htmlFor="alert-audio-upload"
                  className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>رفع نغمة طوارئ/تنبيه من جهازك (MP3/WAV)</span>
                </label>

                {customAlertAudio && (
                  <div className="flex items-center gap-2 mr-auto">
                    <button
                      type="button"
                      onClick={() => playCustomAudio(customAlertAudio, soundVolume)}
                      className="p-1.5 bg-rose-600 text-white rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                      title="تجربة النغمة المرفوعة"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>تشغيل</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomAlertAudio('');
                        updateSoundSettings({ customAlertSound: undefined });
                      }}
                      className="p-1.5 text-rose-400 hover:bg-rose-950/40 rounded-lg text-xs cursor-pointer"
                      title="حذف النغمة المخصصة والرجوع للافتراضي"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Synthesizer Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AVAILABLE_SOUNDS.map(sound => (
                  <div
                    key={sound.id}
                    onClick={() => {
                      setSelectedAlertSound(sound.id);
                      updateSoundSettings({ alertSound: sound.id });
                    }}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                      selectedAlertSound === sound.id && !customAlertAudio
                        ? 'bg-rose-600/20 border-rose-500 text-white font-bold'
                        : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0 pr-1">
                      <div className="truncate">{sound.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{sound.description}</div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playSynthesizedSound(sound.id, soundVolume);
                      }}
                      className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition-all shrink-0 cursor-pointer"
                      title="استماع للنغمة"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. General / Announcement Tone Selection */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>نغمة الإعلانات العامة والأوسمة (General / Announcement):</span>
                </label>

                {customGeneralAudio ? (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                    نغمة مخصصة مرفوعة 📢
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                    نغمة مدمجة
                  </span>
                )}
              </div>

              {/* Custom audio upload control for General */}
              <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.ogg,.m4a"
                  id="general-audio-upload"
                  className="hidden"
                  onChange={(e) => handleAudioUpload('general', e)}
                />
                <label
                  htmlFor="general-audio-upload"
                  className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>رفع نغمة إعلانات من جهازك (MP3/WAV)</span>
                </label>

                {customGeneralAudio && (
                  <div className="flex items-center gap-2 mr-auto">
                    <button
                      type="button"
                      onClick={() => playCustomAudio(customGeneralAudio, soundVolume)}
                      className="p-1.5 bg-amber-600 text-white rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                      title="تجربة النغمة المرفوعة"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>تشغيل</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomGeneralAudio('');
                        updateSoundSettings({ customNormalSound: undefined });
                      }}
                      className="p-1.5 text-rose-400 hover:bg-rose-950/40 rounded-lg text-xs cursor-pointer"
                      title="حذف النغمة المخصصة والرجوع للافتراضي"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleSaveSounds}
              className="btn-primary w-full py-2.5 text-xs"
            >
              <Check className="w-4 h-4" />
              <span>حفظ وتطبيق إعدادات الصوت</span>
            </button>

          </div>
        )}

        {/* Tab 4: Typography & Mobile Compactness */}
        {activeTab === 'typography' && (
          <div className="space-y-4 animate-in fade-in">
            
            <div className="text-xs text-slate-300 leading-relaxed bg-blue-950/30 p-3.5 rounded-xl border border-blue-500/30">
              💡 يمكنك اختيار وضع الخط المكثف (Compact Scale) لتقليل حجم الخطوط والمسافات وضمان استيعاب شاشة الهاتف لأكبر قدر من المعلومات بدون تمرير أفقي.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Compact Mode */}
              <div
                onClick={() => handleApplyFontMode('compact')}
                className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                  currentFontMode === 'compact'
                    ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-xs">📱 خط مكثف (موصى به للموبايل)</span>
                    {currentFontMode === 'compact' && <Check className="w-4 h-4 text-blue-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    أحجام خطوط مصغرة ودقيقة تناسب شاشات الهواتف الذكية بنسبة 100%.
                  </p>
                </div>
                <div className="mt-3 p-2 bg-slate-950 rounded-lg text-[10px] text-emerald-400 font-semibold text-center">
                  معاينة: نص مكثف واضح جداً
                </div>
              </div>

              {/* Normal Mode */}
              <div
                onClick={() => handleApplyFontMode('normal')}
                className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                  currentFontMode === 'normal'
                    ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-xs">💻 خط قياسي (Standard)</span>
                    {currentFontMode === 'normal' && <Check className="w-4 h-4 text-blue-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    حجم الخط القياسي للكمبيوتر والشاشات العريضة.
                  </p>
                </div>
                <div className="mt-3 p-2 bg-slate-950 rounded-lg text-xs text-sky-400 font-semibold text-center">
                  معاينة: نص قياسي متوسط
                </div>
              </div>

              {/* Large Mode */}
              <div
                onClick={() => handleApplyFontMode('large')}
                className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                  currentFontMode === 'large'
                    ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-xs">🔍 خط كبير (Large)</span>
                    {currentFontMode === 'large' && <Check className="w-4 h-4 text-blue-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    أحجام خطوط واضحة وكبيرة لسهولة القراءة السريعة.
                  </p>
                </div>
                <div className="mt-3 p-2 bg-slate-950 rounded-lg text-sm text-purple-400 font-semibold text-center">
                  معاينة: نص كبير واضح
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

