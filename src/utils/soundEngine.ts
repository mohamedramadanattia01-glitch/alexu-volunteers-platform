// Web Audio API Synthesizer Sound Engine
// 100% Offline, Zero external assets needed, ultra crisp and low latency

export interface SoundOption {
  id: string;
  name: string;
  category: 'task' | 'alert' | 'general';
  description: string;
}

export const AVAILABLE_SOUNDS: SoundOption[] = [
  { id: 'crystal_chime', name: 'رنين الكريستال (Crystal Chime)', category: 'task', description: 'نغمة هادئة وراقية وواضحة للمهام الجديدة' },
  { id: 'modern_ping', name: 'بينج عصري (Modern Ping)', category: 'task', description: 'نغمة سريعة ومميزة للإنجازات والمهام' },
  { id: 'soft_bell', name: 'جرس ناعم (Soft Bell)', category: 'task', description: 'نغمة ماريمبا دافئة ومريحة للأذن' },
  { id: 'cyber_alert', name: 'إنذار سايبر (Cyber Alert)', category: 'alert', description: 'تنبيه إلكتروني متصاعد للبلاغات والطوارئ' },
  { id: 'radar_pulse', name: 'نبض الرادار (Radar Pulse)', category: 'alert', description: 'تنبيه مزدوج قوي ومثالي لحالات SOS والشكاوى' },
  { id: 'fanfare_win', name: 'موسيقى الانتصار (Victory Fanfare)', category: 'general', description: 'نغمة احتفالية متتالية لتقييم المهام والأوسمة' },
  { id: 'bubble_pop', name: 'فقاعة ناعمة (Soft Pop)', category: 'general', description: 'صوت ميكرو خفيف للتفاعل السريع' },
];

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (err) {
    console.warn('Web Audio API not supported in this browser', err);
    return null;
  }
}

/**
 * Play a synthesized sound tone based on soundId and volume
 */
export function playSynthesizedSound(soundId: string, volume: number = 0.8) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), ctx.currentTime);
  masterGain.connect(ctx.destination);

  const now = ctx.currentTime;

  switch (soundId) {
    case 'crystal_chime': {
      // 3 Harmonic crystalline sine tones
      const freqs = [1046.5, 1318.5, 1567.98]; // C6, E6, G6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.35, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.7);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.75);
      });
      break;
    }

    case 'modern_ping': {
      // High-tech smooth double blip
      [1200, 1800].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);

        gain.gain.setValueAtTime(0, now + idx * 0.09);
        gain.gain.linearRampToValueAtTime(0.4, now + idx * 0.09 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.35);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.38);
      });
      break;
    }

    case 'soft_bell': {
      // Marimba / warm acoustic bell
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.5);

      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.65);
      break;
    }

    case 'cyber_alert': {
      // Urgent pulsating alert tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      
      // Pitch sweep up and down
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.12);
      osc.frequency.linearRampToValueAtTime(440, now + 0.24);
      osc.frequency.linearRampToValueAtTime(880, now + 0.36);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.5);
      break;
    }

    case 'radar_pulse': {
      // Dual resonant radar chirp
      [587.33, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.4, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.3);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.32);
      });
      break;
    }

    case 'fanfare_win': {
      // Major triad arpeggio (C5, E5, G5, C6)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);

        gain.gain.setValueAtTime(0.4, now + idx * 0.09);
        gain.gain.linearRampToValueAtTime(0.4, now + idx * 0.09 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + (idx === 3 ? 0.8 : 0.25));

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.85);
      });
      break;
    }

    case 'bubble_pop':
    default: {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.12);
      break;
    }
  }
}

/**
 * Play uploaded custom audio file (Data URL or Blob URL)
 */
export function playCustomAudio(audioDataUrl: string, volume: number = 0.8): Promise<void> {
  return new Promise((resolve) => {
    try {
      const audio = new Audio(audioDataUrl);
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.onended = () => resolve();
      audio.onerror = () => {
        console.warn('Failed to play custom audio file, falling back to synthesizer');
        resolve();
      };
      audio.play().catch(err => {
        console.warn('Playback prevented or interrupted:', err);
        resolve();
      });
    } catch (err) {
      console.warn('Error initiating audio playback:', err);
      resolve();
    }
  });
}

/**
 * Unified smart audio dispatcher that checks for custom uploaded audio first, then falls back to synthesized tone
 */
export function playAppTone(
  category: 'task' | 'alert' | 'announcement' | 'normal',
  settings: {
    enabled: boolean;
    volume: number;
    taskSound: string;
    alertSound: string;
    announcementSound?: string;
    customTaskSound?: string;
    customAlertSound?: string;
    customNormalSound?: string;
  }
) {
  if (!settings.enabled) return;

  const vol = settings.volume ?? 0.8;

  if (category === 'task') {
    if (settings.customTaskSound) {
      playCustomAudio(settings.customTaskSound, vol);
    } else {
      playSynthesizedSound(settings.taskSound || 'crystal_chime', vol);
    }
  } else if (category === 'alert') {
    if (settings.customAlertSound) {
      playCustomAudio(settings.customAlertSound, vol);
    } else {
      playSynthesizedSound(settings.alertSound || 'cyber_alert', vol);
    }
  } else if (category === 'announcement') {
    if (settings.customNormalSound) {
      playCustomAudio(settings.customNormalSound, vol);
    } else {
      playSynthesizedSound(settings.announcementSound || 'fanfare_win', vol);
    }
  } else {
    // Normal / general
    if (settings.customNormalSound) {
      playCustomAudio(settings.customNormalSound, vol);
    } else {
      playSynthesizedSound('modern_ping', vol);
    }
  }
}

