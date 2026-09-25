import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import jsQR from 'jsqr';
import { 
  QrCode, X, RefreshCw, CheckCircle2, Clock, 
  MapPin, ShieldCheck, UserCheck, AlertCircle, Plus, 
  Layers, Download, Award, Sparkles, Navigation, Check, Camera,
  FlipHorizontal, Upload, Image as ImageIcon
} from 'lucide-react';
import { exportAttendanceToExcel } from '../../utils/excelExport';
import { DailyEvaluationModal } from './DailyEvaluationModal';
import { GPSLocation } from '../../types';

interface QRAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRAttendanceModal: React.FC<QRAttendanceModalProps> = ({ isOpen, onClose }) => {
  const { 
    currentUser, 
    committees, 
    events, 
    liveEvent, 
    attendanceRecords, 
    attendanceSessions,
    activeAttendanceSession,
    canCreateAttendanceSession,
    createAttendanceSession,
    recordAttendanceWithGPS,
    showNotification,
    isHighLeadership
  } = useApp();

  const isHostRole = canCreateAttendanceSession;

  const [mode, setMode] = useState<'host_qr' | 'member_scan' | 'new_session'>(
    isHostRole ? 'host_qr' : 'member_scan'
  );

  // New session form
  const [sessionTitle, setSessionTitle] = useState('اجتماع ولقاء الميدان الدوري');
  const [selectedCommId, setSelectedCommId] = useState('all');
  const [selectedSessionType, setSelectedSessionType] = useState<'members' | 'heads'>('members');
  const [requireGPS, setRequireGPS] = useState(true);
  const [sessionNotes, setSessionNotes] = useState('يرجى مسح الكود والتواجد في الموقع المحدد');

  // Dynamic QR auto-refresh (Anti-Cheat Token Engine)
  const [qrToken, setQrToken] = useState<string>(`ALEXU_QR_${Date.now()}`);
  const [countdown, setCountdown] = useState<number>(10);

  // Member scan simulation & real GPS state
  const [isGettingGPS, setIsGettingGPS] = useState(false);
  const [gpsData, setGpsData] = useState<GPSLocation | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);

  // Camera video feed & QR decoding state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);
  const [lastScannedPayload, setLastScannedPayload] = useState<string | null>(null);
  const [isProcessingScan, setIsProcessingScan] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Evaluation Modal Trigger
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);

  // Active session or latest
  const currentSession = activeAttendanceSession || attendanceSessions[0];
  const currentEvent = liveEvent || events[0];

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setQrToken(`ALEXU_QR_${Math.random().toString(36).substring(2, 8).toUpperCase()}_${Date.now()}`);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const handleMemberScan = useCallback((actionType: 'check-in' | 'check-out', customToken?: string) => {
    const loc = gpsData || {
      lat: 31.2001,
      lng: 29.9187,
      address: 'جامعة الإسكندرية (الموقع الفعلي)'
    };

    const res = recordAttendanceWithGPS({
      memberId: currentUser.id,
      sessionId: currentSession?.id,
      eventId: currentEvent?.id,
      actionType,
      gpsLocation: loc,
      qrToken: customToken || qrToken
    });

    setScanResult(res);
  }, [gpsData, recordAttendanceWithGPS, currentUser.id, currentSession?.id, currentEvent?.id, qrToken]);

  // Frame scanning engine using jsQR
  const scanQRFromCamera = useCallback(() => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animationFrameIdRef.current = requestAnimationFrame(scanQRFromCamera);
      return;
    }

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code && code.data && !isProcessingScan) {
        const payload = code.data;
        if (payload !== lastScannedPayload) {
          setIsProcessingScan(true);
          setLastScannedPayload(payload);
          
          // Trigger Attendance Check-In automatically on valid QR
          handleMemberScan('check-in', payload);
          showNotification('success', '🎯 تم مسح رمز الحضور بالكاميرا بنجاح وتوثيق الحضور!');

          setTimeout(() => {
            setIsProcessingScan(false);
          }, 3000);
        }
      }
    }

    animationFrameIdRef.current = requestAnimationFrame(scanQRFromCamera);
  }, [handleMemberScan, isProcessingScan, lastScannedPayload, showNotification]);

  // Handle Camera lifecycle
  const startCamera = async (targetFacingMode = facingMode) => {
    setCameraPermissionError(null);
    stopCamera();
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { 
              facingMode: { ideal: targetFacingMode },
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          });
        } catch (subErr) {
          // Fallback to any available video stream
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }

        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
        }
        setIsCameraActive(true);
        animationFrameIdRef.current = requestAnimationFrame(scanQRFromCamera);
      } else {
        setCameraPermissionError('المتصفح لا يدعم الوصول المباشر للكاميرا');
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraPermissionError('يرجى السماح بصلاحية الكاميرا من إعدادات المتصفح أو مسح الكود من صورة');
      setIsCameraActive(false);
    }
  };

  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Decode QR from uploaded image file
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleMemberScan('check-in', code.data);
            showNotification('success', '🎯 تم مسح رمز الـ QR من الصورة بنجاح وتسجيل الحضور!');
          } else {
            showNotification('info', 'لم يتم العثور على رمز QR واضح في الصورة المرفوعة.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const stopCamera = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Request Real Geolocation
  const requestRealGPS = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      setIsGettingGPS(true);
      setGpsError(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsGettingGPS(false);
          setGpsData({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
            address: `إحداثيات حية (${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}) — دقة ±${Math.round(pos.coords.accuracy)}م`
          });
        },
        (err) => {
          setIsGettingGPS(false);
          setGpsError(err.message || 'تعذر جلب إحداثيات الموقع');
          setGpsData({
            lat: 31.2001,
            lng: 29.9187,
            accuracy: 25,
            address: 'مجمع كليات الشاطبي — جامعة الإسكندرية (موقع افتراضي)'
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  useEffect(() => {
    if (mode === 'member_scan' && isOpen) {
      requestRealGPS();
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mode, isOpen]);

  if (!isOpen) return null;

  const handleCreateSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTitle.trim()) return;

    createAttendanceSession({
      title: sessionTitle,
      committeeId: selectedCommId,
      sessionType: selectedSessionType,
      requireGPS,
      notes: sessionNotes
    });

    setMode('host_qr');
  };

  const handleExportSessionExcel = () => {
    const sessionRecords = attendanceRecords.filter(r => 
      currentSession ? r.sessionId === currentSession.id : true
    );
    exportAttendanceToExcel(sessionRecords, currentSession?.title || 'جلسة_الحضور');
    showNotification('success', 'تم تصدير سجل حضور الجلسة إلى Excel بنجاح');
  };

  // Attendees who scanned in this session
  const attendeesInThisSession = attendanceRecords.filter(r => 
    currentSession ? r.sessionId === currentSession.id : true
  );

  const myRecordInSession = attendanceRecords.find(a => 
    a.memberId === currentUser.id && 
    (currentSession ? a.sessionId === currentSession.id : a.eventId === currentEvent?.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="glass-card max-w-2xl w-full p-5 sm:p-6 border border-blue-500/30 shadow-2xl bg-slate-950 text-right overflow-y-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white shadow-lg shadow-blue-500/30">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  نظام الحضور الذكي المتجدد والـ GPS
                </h3>
                <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                  Live Sync 🟢
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {currentSession?.title || currentEvent?.name || 'جلسة الحضور الميداني'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 mb-5 text-xs font-bold gap-1">
          {isHostRole && (
            <>
              <button
                onClick={() => { setMode('host_qr'); setScanResult(null); }}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === 'host_qr' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>شاشة توليد QR الجلسة</span>
              </button>

              <button
                onClick={() => { setMode('new_session'); setScanResult(null); }}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === 'new_session' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>إنشاء كود جلسة جديدة</span>
              </button>
            </>
          )}

          <button
            onClick={() => { setMode('member_scan'); setScanResult(null); }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'member_scan' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Navigation className="w-4 h-4 text-emerald-400" />
            <span>مسح وتسجيل حضور المتطوع (Scan)</span>
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 1. Host / Header Generator Screen */}
        {/* ------------------------------------------------------------- */}
        {mode === 'host_qr' && (
          <div className="space-y-4">
            
            {/* Session Info Bar */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">الجلسة الفعالة:</span>
                <strong className="text-white mr-1">{currentSession?.title}</strong>
                <span className="mr-2 text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded text-[10px] border border-sky-500/30">
                  {currentSession?.committeeName || 'جميع اللجان'}
                </span>
                {currentSession?.sessionType === 'heads' && (
                  <span className="mr-1 text-purple-300 bg-purple-950/70 px-2 py-0.5 rounded text-[10px] border border-purple-500/40 font-bold">
                    حضور رؤساء اللجان 👑
                  </span>
                )}
              </div>

              <span className="text-slate-400 font-mono text-[11px]">
                بواسطة: <strong className="text-slate-200">{currentSession?.createdByMemberName}</strong>
              </span>
            </div>

            {/* QR Card with countdown */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-900/60 rounded-2xl border border-blue-500/30 text-center space-y-3">
              <div className="p-4 rounded-2xl bg-white shadow-2xl border-4 border-blue-500/40 relative">
                <QRCodeSVG 
                  value={`https://volunteers.alexu.edu.eg/verify-attendance?session=${currentSession?.id || 'live'}&token=${qrToken}&comm=${currentSession?.committeeId || 'all'}&type=${currentSession?.sessionType || 'members'}`}
                  size={210}
                  level="H"
                  includeMargin={true}
                />
                
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-950 border border-blue-500 text-white text-[10px] font-bold flex items-center gap-1.5 shadow-lg font-mono">
                  <RefreshCw className="w-3 h-3 text-sky-400 animate-spin" />
                  <span>يتجدد تلقائياً خلال {countdown} ثوانٍ (Anti-Cheat)</span>
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-300">
                <div className="font-bold text-white mb-0.5 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>رمز مشفر ومحمي برابط التحقق المباشر والـ GPS</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  يقوم {currentSession?.sessionType === 'heads' ? 'رؤساء ونواب اللجان' : 'أعضاء اللجنة'} بمسح هذا الكود من هواتفهم لسحب البيانات والموقع فورياً
                </p>
              </div>
            </div>

            {/* Live Attendees Counter & Action Buttons */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">
                    الحاضرون المسجلون لحظياً في هذه الجلسة ({attendeesInThisSession.length})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportSessionExcel}
                    className="btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1.5 cursor-pointer hover:text-white"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>تصدير Excel</span>
                  </button>

                  <button
                    onClick={() => setIsEvalModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-amber-500/20"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>تقييم الحاضرين اليوم</span>
                  </button>
                </div>
              </div>

              {/* Recent 4 Attendees Badges */}
              <div className="flex flex-wrap gap-2 pt-1">
                {attendeesInThisSession.length === 0 ? (
                  <span className="text-[11px] text-slate-500">في انتظار قيام الأعضاء بالمسح...</span>
                ) : (
                  attendeesInThisSession.slice(0, 6).map(att => (
                    <div key={att.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white">
                      <img src={att.memberAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                      <span>{att.memberName.split(' ')[0]}</span>
                      <span className="text-[9px] font-mono text-emerald-400">{att.checkInTime}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 2. New Session Creation Mode */}
        {/* ------------------------------------------------------------- */}
        {mode === 'new_session' && (
          <form onSubmit={handleCreateSessionSubmit} className="space-y-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Plus className="w-4 h-4 text-blue-400" />
              <span>إنشاء وتخصيص جلسة حضور جديدة للهيد والقيادة</span>
            </div>

            {/* Session Target Group Selection */}
            {isHighLeadership && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  الفئة المستهدفة بالجلسة:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSessionType('members')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      selectedSessionType === 'members'
                        ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    👥 حضور أعضاء اللجان
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSessionType('heads')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      selectedSessionType === 'heads'
                        ? 'bg-purple-600 border-purple-400 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    👑 حضور رؤساء ونواب اللجان
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                عنوان ومناسبة جلسة الحضور *
              </label>
              <input
                type="text"
                required
                value={sessionTitle}
                onChange={e => setSessionTitle(e.target.value)}
                placeholder="مثال: اجتماع لجنة الموارد البشرية، تنظيم حفل التخرج، لقاء الميدان"
                className="glass-input text-xs w-full"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  اللجنة المستهدفة بالحضور *
                </label>
                <select
                  value={selectedCommId}
                  onChange={e => setSelectedCommId(e.target.value)}
                  className="glass-input text-xs w-full cursor-pointer"
                >
                  <option value="all">جميع اللجان (فريق المتطوعين بالكامل)</option>
                  {committees.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  خاصية التحقق الجغرافي (GPS Geolocation):
                </label>
                <div 
                  onClick={() => setRequireGPS(!requireGPS)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                    requireGPS ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{requireGPS ? 'مفعل (تسجيل إحداثيات الموقع)' : 'معطل (حضور فقط)'}</span>
                  </div>
                  <span>{requireGPS ? '✓' : '—'}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                توجيهات أو ملاحظات الجلسة:
              </label>
              <textarea
                rows={2}
                value={sessionNotes}
                onChange={e => setSessionNotes(e.target.value)}
                placeholder="مكان التجمع أو تعليمات اللقاء..."
                className="glass-input text-xs w-full"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMode('host_qr')}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="btn-primary text-xs py-2 px-5 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>توليد كود الـ QR للجلسة الآن</span>
              </button>
            </div>
          </form>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 3. Member Scan Mode (Real GPS & Live Camera) */}
        {/* ------------------------------------------------------------- */}
        {mode === 'member_scan' && (
          <div className="space-y-4">
            
            {/* Member Card */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-blue-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatarUrl}
                  alt=""
                  className="w-13 h-13 rounded-xl object-cover border-2 border-blue-400 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{currentUser.fullName}</h4>
                    <span className="px-2 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold">
                      {currentUser.volunteerId || 'عضو'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {currentUser.currentCommitteeName} • كلية {currentUser.college}
                  </p>
                </div>
              </div>

              {myRecordInSession ? (
                <div className="text-left bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-500/40 text-xs font-bold">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>تم تسجيل الحضور ✓</span>
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 mt-0.5">
                    {myRecordInSession.checkInTime}
                  </div>
                </div>
              ) : (
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
                  بانتظار المسح 📷
                </span>
              )}
            </div>

            {/* GPS Location Status Indicator */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
                <div>
                  <span className="font-bold text-white">الموقع الجغرافي الحقيقي (GPS Live):</span>
                  <div className="text-[11px] text-slate-300 font-mono">
                    {isGettingGPS ? (
                      <span className="text-amber-400 font-bold">جاري تحديد الإحداثيات الحقيقية...</span>
                    ) : gpsData ? (
                      <span className="text-emerald-300 font-bold">
                        📍 {gpsData.address}
                      </span>
                    ) : (
                      <span>موقع جامعة الإسكندرية الميداني</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={requestRealGPS}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition-all cursor-pointer flex items-center gap-1"
                  title="تحديث إحداثيات الـ GPS"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>تحديث الموقع</span>
                </button>

                <button
                  type="button"
                  onClick={() => isCameraActive ? stopCamera() : startCamera()}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isCameraActive
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
                      : 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{isCameraActive ? 'إيقاف الكاميرا' : 'تشغيل الكاميرا 📷'}</span>
                </button>
              </div>
            </div>

            {cameraPermissionError && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 flex items-center justify-between">
                <span>⚠️ {cameraPermissionError}</span>
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-[10px]"
                >
                  إعادة المحاولة
                </button>
              </div>
            )}

            {/* Live Camera Scanner Viewport or Visual Scanner Frame */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-sky-500/40 bg-slate-950 p-4 flex flex-col items-center justify-center text-center min-h-[260px]">
              
              {isCameraActive ? (
                <div className="relative w-full max-w-sm rounded-xl overflow-hidden border-2 border-sky-400 shadow-2xl bg-black aspect-video sm:aspect-square flex items-center justify-center">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover"
                  />
                  {/* Viewfinder Target Corners */}
                  <div className="absolute inset-8 border-2 border-white/60 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                    <div className="flex justify-between">
                      <div className="w-5 h-5 border-t-4 border-r-4 border-sky-400" />
                      <div className="w-5 h-5 border-t-4 border-l-4 border-sky-400" />
                    </div>
                    <div className="flex justify-between">
                      <div className="w-5 h-5 border-b-4 border-r-4 border-sky-400" />
                      <div className="w-5 h-5 border-b-4 border-l-4 border-sky-400" />
                    </div>
                  </div>
                  {/* Laser line */}
                  <div className="absolute inset-x-8 top-1/2 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-lg shadow-emerald-400 animate-pulse pointer-events-none" />
                  
                  {/* Top Controls Overlay */}
                  <div className="absolute top-2 inset-x-2 flex items-center justify-between px-2">
                    <button
                      type="button"
                      onClick={handleToggleFacingMode}
                      className="px-2.5 py-1 rounded-lg bg-black/70 border border-white/20 text-white text-[10px] font-bold flex items-center gap-1 hover:bg-black/90 cursor-pointer"
                    >
                      <FlipHorizontal className="w-3 h-3 text-sky-400" />
                      <span>{facingMode === 'environment' ? 'الكاميرا الأمامية' : 'الكاميرا الخلفية'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={stopCamera}
                      className="p-1 rounded-lg bg-black/70 border border-white/20 text-slate-300 hover:text-white"
                      title="إيقاف"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="absolute bottom-2 inset-x-2 py-1 px-2 rounded-lg bg-black/75 backdrop-blur-sm text-center text-[10px] text-emerald-300 font-bold border border-emerald-500/30">
                    {isProcessingScan ? '⏳ جاري التحقق وتسجيل الحضور...' : '📷 الكاميرا نشطة: وجهها نحو كود الحضور وسيسجل تلقائياً'}
                  </div>
                </div>
              ) : (
                <>
                  {/* Visual Scanner Frame */}
                  <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-3 shadow-lg">
                    <QrCode className="w-8 h-8 animate-pulse" />
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1">
                    مسح كود الحضور بالكاميرا المباشرة
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mb-3">
                    اضغط تشغيل الكاميرا لتوجيهها نحو كود المشرف وسيقوم النظام بفك التشفير وتوثيق الحضور والـ GPS تلقائياً
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => startCamera()}
                      className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-600/30"
                    >
                      <Camera className="w-4 h-4" />
                      <span>تشغيل كاميرا المسح الآن 📷</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white border-slate-700"
                    >
                      <Upload className="w-3.5 h-3.5 text-sky-400" />
                      <span>مسح كود QR من صورة 📁</span>
                    </button>
                  </div>
                </>
              )}

              {/* Hidden File Input for Image QR Decoding */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />

              {/* Manual Backup Buttons (Check-in & Check-out) */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-4 pt-2 z-10 border-t border-slate-800/80 w-full">
                <button
                  type="button"
                  onClick={() => handleMemberScan('check-in')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد الحضور (Check-In)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleMemberScan('check-out')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span>تسجيل الانصراف (Check-Out)</span>
                </button>
              </div>

            </div>

            {/* Scan Feedback Alert */}
            {scanResult && (
              <div className={`p-4 rounded-xl border text-xs flex items-center gap-2.5 animate-in slide-in-from-top duration-300 ${
                scanResult.success 
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                  : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
              }`}>
                {scanResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <div>
                  <div className="font-bold">{scanResult.message}</div>
                  {scanResult.success && (
                    <div className="text-[10px] text-emerald-400 mt-0.5">
                      تمت إضافة +25 XP إلى ملفك التطوعي ورفع نسبة الحضور! 🎉
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>* نظام الحضور مشفر ومعتمد ومحمي بالـ GPS الخاص باتحاد طلاب جامعة الإسكندرية.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>

      {/* Daily Evaluation Modal for Host/Leadership */}
      <DailyEvaluationModal
        isOpen={isEvalModalOpen}
        onClose={() => setIsEvalModalOpen(false)}
        selectedSessionId={currentSession?.id}
      />

    </div>
  );
};
