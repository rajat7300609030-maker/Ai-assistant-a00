import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AssistantState, OpenedWebsite } from "./types";
import ZoyaOrb from "./components/ZoyaOrb";
import WebsiteLogs from "./components/WebsiteLogs";
import PersonalitySheet from "./components/PersonalitySheet";
import { 
  Heart, 
  Flame, 
  HelpCircle, 
  ExternalLink,
  AlertTriangle,
  Github,
  Sliders,
  Settings2,
  Database,
  Timer,
  Cpu,
  Monitor,
  VolumeX,
  Radio,
  RadioTower,
  KeyRound,
  FileCode,
  CheckCircle,
  HelpCircle as HelpIcon,
  AudioLines,
  X,
  RefreshCw,
  LogOut,
  User,
  Moon,
  Sun,
  Wifi,
  WifiOff,
  Mic,
  MicOff,
  Volume2,
  History,
  Check,
  ChevronDown,
  Bell,
  BellRing,
  Trash2,
  Info
} from "lucide-react";

// Convert float32 array to 16-bit PCM little-endian, then encode to Base64
function float32ToPCM16Base64(floats: Float32Array): string {
  const buffer = new ArrayBuffer(floats.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < floats.length; i++) {
    const s = Math.max(-1, Math.min(1, floats[i]));
    const int16 = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(i * 2, int16, true); // true for little-endian
  }
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 16-bit integer PCM array to float32
function base64ToPCMFloat32(base64: string): Float32Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const int16Array = new Int16Array(bytes.buffer);
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768.0;
  }
  return float32Array;
}

function getISOStringForCountry(countryName: string): string {
  const timezones: Record<string, string> = {
    "India": "Asia/Kolkata",
    "United States": "America/New_York",
    "United Kingdom": "Europe/London",
    "Canada": "America/Toronto",
    "Australia": "Australia/Sydney",
    "Germany": "Europe/Berlin",
    "Japan": "Asia/Tokyo",
    "United Arab Emirates": "Asia/Dubai"
  };

  const tz = timezones[countryName] || "Asia/Kolkata";
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
    const parts = formatter.formatToParts(new Date());
    const val = (type: string) => parts.find(p => p.type === type)?.value || "";
    let hour = val("hour");
    if (hour === "24") hour = "00";
    return `${val("year")}-${val("month")}-${val("day")}T${hour}:${val("minute")}`;
  } catch (e) {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  }
}

function applyYearToDateTime(dateTimeString: string, targetYear: string): string {
  if (!dateTimeString) {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `${targetYear}-${mm}-${dd}T${hh}:${min}`;
  }
  return targetYear + dateTimeString.substring(4);
}

interface AppNotification {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'info' | 'warning' | 'tool' | 'event';
  timestamp: Date;
}

function playNotificationSound(type: 'success' | 'info' | 'warning' | 'tool' | 'event') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
      gain2.gain.setValueAtTime(0, ctx.currentTime + 0.08);
      gain2.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      
      osc.start();
      osc2.start();
      osc.stop(ctx.currentTime + 0.4);
      osc2.stop(ctx.currentTime + 0.5);
    } else if (type === 'tool') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'warning') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(180, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (err) {
    console.warn("Audio Context not yet dynamic or blocked:", err);
  }
}

export default function App() {
  const [state, setState] = useState<AssistantState>(AssistantState.DISCONNECTED);
  const [errorMessage, setErrorMessage] = useState("");
  const [websiteLogs, setWebsiteLogs] = useState<OpenedWebsite[]>([]);
  const [userVolume, setUserVolume] = useState(0);
  const [zoyaVolume, setZoyaVolume] = useState(0);
  const [currentToolCall, setCurrentToolCall] = useState<{ id: string; siteName: string; url: string } | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoInput, setDemoInput] = useState("");

  // Admin Tweakable State Overrides (Working Controllers!)
  const [interruptionThreshold, setInterruptionThreshold] = useState(0.045);
  const [glowScale, setGlowScale] = useState(1.0);
  const [sessionUptime, setSessionUptime] = useState(0);
  const [customPrompt, setCustomPrompt] = useState(() => {
    return localStorage.getItem("customPrompt") || "";
  });
  const [isSystemTuningOpen, setIsSystemTuningOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Committed General Preferences
  const [selectedCountry, setSelectedCountry] = useState("India");
  const [selectedDateTime, setSelectedDateTime] = useState(() => getISOStringForCountry("India"));
  const [customLogo, setCustomLogo] = useState<string>(() => {
    return localStorage.getItem("customLogo") || "";
  });

  // Expanded Settings and Tabs States
  const [activeSettingsTab, setActiveSettingsTab] = useState<"general" | "ai" | "design" | "history" | "notifications" | "">("");
  const [currentSystemTime, setCurrentSystemTime] = useState(() => {
    const initialISO = getISOStringForCountry("India");
    const d = new Date(initialISO);
    return isNaN(d.getTime()) ? new Date() : d;
  });

  useEffect(() => {
    const baseDate = new Date(selectedDateTime);
    setCurrentSystemTime(isNaN(baseDate.getTime()) ? new Date() : baseDate);

    const timer = setInterval(() => {
      setCurrentSystemTime((prevTime) => new Date(prevTime.getTime() + 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedDateTime]);

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isOnlineMode, setIsOnlineMode] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(true);

  // Committed AI Assistant Preferences
  const [assistantName, setAssistantName] = useState(() => {
    return localStorage.getItem("assistantName") || "Zoya";
  });
  const [assistantVoice, setAssistantVoice] = useState(() => {
    return localStorage.getItem("assistantVoice") || "Male";
  });
  const [assistantLanguage, setAssistantLanguage] = useState(() => {
    return localStorage.getItem("assistantLanguage") || "Hindi";
  });

  // Fully functional notification system state
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [visibleToasts, setVisibleToasts] = useState<AppNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [showTopBell, setShowTopBell] = useState(false);
  const bellTimeoutRef = useRef<any>(null);

  const showNotification = (
    title: string,
    description: string,
    type: 'success' | 'info' | 'warning' | 'tool' | 'event' = 'info'
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotif: AppNotification = { id, title, description, type, timestamp: new Date() };
    setNotifications((prev) => [newNotif, ...prev].slice(0, 55));
    setVisibleToasts((prev) => [newNotif, ...prev]);
    playNotificationSound(type);

    // Show top bell trigger for 5 seconds
    setShowTopBell(true);
    if (bellTimeoutRef.current) {
      clearTimeout(bellTimeoutRef.current);
    }
    bellTimeoutRef.current = setTimeout(() => {
      setShowTopBell(false);
    }, 5000);

    setTimeout(() => {
      setVisibleToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    document.title = `${assistantName} AI Assistant - Admin Console`;
  }, [assistantName]);

  // Temporary configuration drafts for Settings Save/Cancel flow
  const [draftCustomPrompt, setDraftCustomPrompt] = useState("");
  const [draftGlowScale, setDraftGlowScale] = useState(1.0);
  const [draftInterruptionThreshold, setDraftInterruptionThreshold] = useState(0.045);
  const [draftIsDemoMode, setDraftIsDemoMode] = useState(false);
  const [draftIsDarkMode, setDraftIsDarkMode] = useState(true);
  const [draftIsOnlineMode, setDraftIsOnlineMode] = useState(true);
  const [draftIsMicEnabled, setDraftIsMicEnabled] = useState(true);
  const [draftIsSpeakerEnabled, setDraftIsSpeakerEnabled] = useState(true);

  // Draft General Preferences
  const [draftCountry, setDraftCountry] = useState("India");
  const [draftDateTime, setDraftDateTime] = useState(() => getISOStringForCountry("India"));
  const [draftLogo, setDraftLogo] = useState<string>(() => {
    const savedName = localStorage.getItem("assistantName") || "Zoya";
    return localStorage.getItem("customLogo") || `https://api.dicebear.com/7.x/bottts/svg?seed=${savedName}`;
  });

  // Draft AI Assistant Preferences
  const [draftAssistantName, setDraftAssistantName] = useState(() => {
    return localStorage.getItem("assistantName") || "Zoya";
  });
  const [draftAssistantVoice, setDraftAssistantVoice] = useState(() => {
    return localStorage.getItem("assistantVoice") || "Male";
  });
  const [draftAssistantLanguage, setDraftAssistantLanguage] = useState(() => {
    return localStorage.getItem("assistantLanguage") || "Hindi";
  });

  // Copy values to draft states upon rendering the Settings drawer
  useEffect(() => {
    if (isSettingsOpen) {
      setActiveSettingsTab("");
      setDraftCustomPrompt(customPrompt);
      setDraftGlowScale(glowScale);
      setDraftInterruptionThreshold(interruptionThreshold);
      setDraftIsDemoMode(isDemoMode);
      setDraftIsDarkMode(isDarkMode);
      setDraftIsOnlineMode(isOnlineMode);
      setDraftIsMicEnabled(isMicEnabled);
      setDraftIsSpeakerEnabled(isSpeakerEnabled);
      
      setDraftCountry(selectedCountry);
      setDraftDateTime(selectedDateTime);
      setDraftLogo(customLogo);

      setDraftAssistantName(assistantName);
      setDraftAssistantVoice(assistantVoice);
      setDraftAssistantLanguage(assistantLanguage);
    }
  }, [isSettingsOpen]);

  const handleSaveSettings = () => {
    const isConnected = wsRef.current !== null;

    localStorage.setItem("customPrompt", draftCustomPrompt);
    localStorage.setItem("customLogo", draftLogo);
    localStorage.setItem("assistantName", draftAssistantName);
    localStorage.setItem("assistantVoice", draftAssistantVoice);
    localStorage.setItem("assistantLanguage", draftAssistantLanguage);

    setCustomPrompt(draftCustomPrompt);
    setGlowScale(draftGlowScale);
    setInterruptionThreshold(draftInterruptionThreshold);
    setIsDemoMode(draftIsDemoMode);
    setIsDarkMode(draftIsDarkMode);
    setIsOnlineMode(draftIsOnlineMode);
    setIsMicEnabled(draftIsMicEnabled);
    setIsSpeakerEnabled(draftIsSpeakerEnabled);
    
    setSelectedCountry(draftCountry);
    setSelectedDateTime(draftDateTime);
    setCustomLogo(draftLogo);

    setAssistantName(draftAssistantName);
    setAssistantVoice(draftAssistantVoice);
    setAssistantLanguage(draftAssistantLanguage);
    
    setIsSettingsOpen(false);

    showNotification(
      "Settings Saved Successfully",
      `${draftAssistantName} AI Assistant successfully configured.`,
      "success"
    );

    if (isConnected) {
      disconnectSession();
      setTimeout(() => {
        connectSession(draftAssistantName, draftAssistantVoice, draftAssistantLanguage);
      }, 355);
    }
  };

  const handleCancelSettings = () => {
    setIsSettingsOpen(false);
  };

  // References for full-duplex session handling
  const wsRef = useRef<WebSocket | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const activeSources = useRef<AudioBufferSourceNode[]>([]);
  const nextStartTime = useRef<number>(0);

  // Local talking threshold parameters (triggers interruption locally when user speaks)
  const speakingFrameCount = useRef(0);

  // Track session uptime timer
  useEffect(() => {
    let timerInterval: any = null;
    if (state !== AssistantState.DISCONNECTED && state !== AssistantState.ERROR && state !== AssistantState.CONNECTING) {
      timerInterval = setInterval(() => {
        setSessionUptime((prev) => prev + 1);
      }, 1000);
    } else {
      setSessionUptime(0);
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [state]);

  // Safely stop all active audio output sources
  const clearPlaybackQueue = () => {
    activeSources.current.forEach((src) => {
      try {
        src.stop();
      } catch (err) {
        // Source already completed or stopped
      }
    });
    activeSources.current = [];
    nextStartTime.current = 0;
  };

  // Close connections and reset mic capture
  const disconnectSession = (errorStateMsg?: string) => {
    const wasOpen = wsRef.current !== null;
    setState(errorStateMsg ? AssistantState.ERROR : AssistantState.DISCONNECTED);
    if (errorStateMsg) {
      setErrorMessage(errorStateMsg);
    }
    setIsDemoMode(false);

    if (wasOpen) {
      if (errorStateMsg) {
        showNotification("Gateway Error", errorStateMsg, "warning");
      } else {
        showNotification("Gateway Tunnel Offline", `Session with ${assistantName} has ended.`, "warning");
      }
    }

    // Close WebSocket
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {
        // Already closed
      }
      wsRef.current = null;
    }

    // Stop microphone stream tracks
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }

    // Disconnect processors
    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.disconnect();
      } catch (e) {}
      scriptProcessorRef.current = null;
    }

    // Close AudioContexts
    if (inputCtxRef.current) {
      try {
        inputCtxRef.current.close();
      } catch (e) {}
      inputCtxRef.current = null;
    }
    if (outputCtxRef.current) {
      try {
        outputCtxRef.current.close();
      } catch (e) {}
      outputCtxRef.current = null;
    }

    clearPlaybackQueue();
    setUserVolume(0);
    setZoyaVolume(0);
    speakingFrameCount.current = 0;
  };

  const connectSession = async (
    nameOverride?: string,
    voiceOverride?: string,
    languageOverride?: string
  ) => {
    const currentName = nameOverride || assistantName;
    const currentVoice = voiceOverride || assistantVoice;
    const currentLanguage = languageOverride || assistantLanguage;

    setErrorMessage("");
    setState(AssistantState.CONNECTING);
    console.log(`Starting ${currentName} stream capture...`);

    try {
      // 1. Initialize Web Audio Contexts
      // Input capture Context (at exactly 16kHz for Gemini requirements)
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      inputCtxRef.current = inputCtx;

      // Output render Context (at 24kHz for high-fidelity Gemini response rendering)
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });
      outputCtxRef.current = outputCtx;

      // 2. Request user microphone
      let micStream: MediaStream;
      try {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch (micErr: any) {
        console.warn("User microphone denied or unavailable, activating interactive synthetic fallback stream:", micErr);
        setIsDemoMode(true);
        const synthDest = inputCtx.createMediaStreamDestination();
        micStream = synthDest.stream;
      }
      micStreamRef.current = micStream;

      // 3. Connect audio stream processor
      const micSourceNode = inputCtx.createMediaStreamSource(micStream);
      const scriptProcessor = inputCtx.createScriptProcessor(2048, 1, 1);
      scriptProcessorRef.current = scriptProcessor;

      micSourceNode.connect(scriptProcessor);
      scriptProcessor.connect(inputCtx.destination);

      // Initialize WebSocket connection to backend
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/live?name=${encodeURIComponent(currentName)}&voice=${encodeURIComponent(currentVoice)}&language=${encodeURIComponent(currentLanguage)}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // Live Audio capture and scale calculation
      scriptProcessor.onaudioprocess = (e) => {
        const channelData = e.inputBuffer.getChannelData(0);

        // Calculate root mean square (RMS) for visualizer pulse
        let sum = 0;
        for (let i = 0; i < channelData.length; i++) {
          sum += channelData[i] * channelData[i];
        }
        const rms = Math.sqrt(sum / channelData.length);
        setUserVolume(rms);

        // Local Interruption Detection: 
        // If user talks actively (RMS > interruptionThreshold) while Zoya is speaking,
        // stop active playback instantly in real time so the user can be heard.
        if (rms > interruptionThreshold) {
          speakingFrameCount.current += 1;
          // Threshold of 3 consecutive frames to avoid clicking triggers
          if (speakingFrameCount.current >= 3 && outputCtx.state === "running") {
            // Check if Zoya is active
            if (activeSources.current.length > 0) {
              console.log("Local Interruption: User spoke over Zoya.");
              clearPlaybackQueue();
              showNotification(
                "Squelched Stream",
                `${currentName} was interrupted by your voice feedback.`,
                "info"
              );
            }
          }
        } else {
          speakingFrameCount.current = 0;
        }

        // Send raw little-endian Float PCM16 converted base64
        if (ws.readyState === WebSocket.OPEN) {
          const pcmBase64 = float32ToPCM16Base64(channelData);
          ws.send(
            JSON.stringify({
              type: "audio",
              data: pcmBase64,
            })
          );
        }
      };

      ws.onopen = () => {
        console.log("Client connected to server WebSocket gateway.");
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          
          if (msg.type === "status") {
            if (msg.status === "connected") {
              // Transition from Connecting to Idle/Listening
              setState(AssistantState.IDLE);
              // Unlock audio context inside user click handler
              if (inputCtx.state === "suspended") inputCtx.resume();
              if (outputCtx.state === "suspended") outputCtx.resume();

              showNotification(
                "Gateway Tunnel Active",
                `Secure voice connection established with ${currentName}.`,
                "success"
              );
            }
          }

          else if (msg.type === "audio" && msg.data) {
            setState(AssistantState.SPEAKING);

            // Convert raw Base64 bytes back to 24kHz Float Arrays
            const float32Array = base64ToPCMFloat32(msg.data);

            // Access output audio context & queue gapless playback
            const outCtx = outputCtxRef.current;
            if (outCtx) {
              const audioBuffer = outCtx.createBuffer(1, float32Array.length, 24000);
              audioBuffer.getChannelData(0).set(float32Array);

              const srcNode = outCtx.createBufferSource();
              srcNode.buffer = audioBuffer;
              srcNode.connect(outCtx.destination);

              // Target starting duration
              let startTime = outCtx.currentTime;
              if (nextStartTime.current > startTime) {
                startTime = nextStartTime.current;
              }

              srcNode.start(startTime);
              nextStartTime.current = startTime + audioBuffer.duration;

              // Track active sources for safe cancellation
              activeSources.current.push(srcNode);
              
              // Simple volume metric for Zoya's speaking orb
              let zoyaSum = 0;
              for (let i = 0; i < float32Array.length; i++) {
                zoyaSum += float32Array[i] * float32Array[i];
              }
              const zoyaRms = Math.sqrt(zoyaSum / float32Array.length);
              setZoyaVolume(zoyaRms);

              srcNode.onended = () => {
                activeSources.current = activeSources.current.filter((s) => s !== srcNode);
                if (activeSources.current.length === 0) {
                  setState(AssistantState.LISTENING);
                  setZoyaVolume(0);
                }
              };
            }
          }

          else if (msg.type === "interrupted") {
            console.log("Interruption signal triggered from server.");
            clearPlaybackQueue();
            setState(AssistantState.LISTENING);
            setZoyaVolume(0);
            showNotification(
              "Playback Interrupted",
              `${currentName} was interrupted by incoming voice signals.`,
              "info"
            );
          }

          else if (msg.type === "speaking") {
            if (msg.active) {
              setState(AssistantState.SPEAKING);
            } else {
              // Resetting state
              if (activeSources.current.length === 0) {
                setState(AssistantState.LISTENING);
                setZoyaVolume(0);
              }
            }
          }

          else if (msg.type === "toolCall") {
            console.log("Tool invocation requested on client:", msg);
            if (msg.name === "openWebsite") {
              const { url, siteName } = msg.args;
              setWebsiteLogs((prev) => [
                { siteName, url, timestamp: new Date() },
                ...prev,
              ]);
              
              // Set the modal toast so user is alerted and can bypass pop-up blockers
              setCurrentToolCall({ id: msg.id, siteName, url });

              showNotification(
                "Automation Intercepted",
                `${currentName} requested browsing tool to visit: ${siteName}`,
                "tool"
              );

              // Proactively try to pop the tab (browser might block popups unless initiated directly, which is why the visual button backup is beautiful)
              try {
                window.open(url, "_blank");
              } catch (e) {
                console.warn("Autoplay / popup blocked, utilizing UI backup trigger");
              }
            }
            else if (msg.name === "saveMemory") {
              const { key, value } = msg.args;
              showNotification(
                "Memory Synthesized",
                `Saved preference/fact: [${key}] = "${value}" to permanent storage bank successfully.`,
                "success"
              );
            }
            else if (msg.name === "getMemory") {
              const { key, value } = msg.args;
              showNotification(
                "Memory Recalled",
                `Looked up index for [${key}]. Recalled details: "${value}"`,
                "info"
              );
            }
            else if (msg.name === "listAllMemories") {
              const count = msg.args && msg.args.memories ? Object.keys(msg.args.memories).length : 0;
              showNotification(
                "System Audit",
                `Inspected cognitive inventory. Found ${count} permanent active memories.`,
                "info"
              );
            }
            else if (msg.name === "executeSelfAction") {
              const { actionName, details } = msg.args;
              showNotification(
                "Autonomous Action Run",
                `Job [${actionName}] run successfully: ${details}`,
                "success"
              );
            }
          }

          else if (msg.type === "error") {
            disconnectSession(msg.message);
          }

        } catch (e: any) {
          console.error("Error processing WebSocket payload:", e);
        }
      };

      ws.onclose = (ev) => {
        console.log("WebSocket gateway session completed:", ev);
        if (state !== AssistantState.ERROR) {
          disconnectSession();
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket connection failure:", err);
        disconnectSession("Unstable connection or network gateway timeout.");
      };

    } catch (e: any) {
      console.error("Client setup failure:", e);
      disconnectSession(e.message || "Failed to initialize audio peripherals.");
    }
  };

  const handleTogglePower = () => {
    if (state === AssistantState.DISCONNECTED || state === AssistantState.ERROR) {
      connectSession();
    } else {
      disconnectSession();
    }
  };

  // Auto clean up refs on component unmount
  useEffect(() => {
    return () => {
      disconnectSession();
    };
  }, []);

  // Format time formatting helper for timer
  const formatTimer = (secs: number) => {
    const mm = Math.floor(secs / 60).toString().padStart(2, "0");
    const ss = (secs % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  // Theme styling helpers based on isDarkMode
  const bgMain = isDarkMode ? "bg-[#040509] text-[#e2e8f0]" : "bg-[#f8fafc] text-[#0f172a]";
  const bgCard = isDarkMode ? "bg-neutral-900/35 border-neutral-850" : "bg-white border-slate-205/90 shadow-[0_4px_20px_rgba(0,0,0,0.04)]";
  const bgCardSecondary = isDarkMode ? "bg-neutral-950/40 border-neutral-850" : "bg-slate-50 border-slate-200";
  const bgCardHeader = isDarkMode ? "bg-neutral-950/50 border-b border-neutral-850" : "bg-slate-100 border-b border-slate-200/80";
  const textMuted = isDarkMode ? "text-neutral-400" : "text-slate-600 font-medium";
  const textTitle = isDarkMode ? "text-neutral-250" : "text-slate-800 font-semibold";

  return (
    <div 
      id="admin-main-stage" 
      className={`min-h-screen ${bgMain} flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-300 relative overflow-hidden font-sans transition-colors duration-300`}
    >
      
      {/* Cinematic Digital Background Ambient Elements */}
      <div 
        className={`absolute inset-x-0 top-0 h-[600px] ${isDarkMode ? "bg-[radial-gradient(ellipse_100%_100%_at_20%_-30%,rgba(16,185,129,0.12),rgba(0,0,0,0))]" : "bg-[radial-gradient(ellipse_100%_100%_at_20%_-30%,rgba(16,185,129,0.06),rgba(0,0,0,0))]"}`} 
        style={{ pointerEvents: "none" }}
      />
      <div 
        className={`absolute inset-x-0 top-0 h-[600px] ${isDarkMode ? "bg-[radial-gradient(ellipse_100%_100%_at_80%_-30%,rgba(99,102,241,0.09),rgba(0,0,0,0))]" : "bg-[radial-gradient(ellipse_100%_100%_at_80%_-30%,rgba(99,102,241,0.04),rgba(0,0,0,0))]"}`} 
        style={{ pointerEvents: "none" }}
      />
      <div 
        className={`absolute inset-x-0 top-0 h-[400px] ${isDarkMode ? "bg-[radial-gradient(ellipse_70%_70%_at_50%_0%,rgba(244,63,94,0.06),rgba(0,0,0,0))]" : "bg-[radial-gradient(ellipse_70%_70%_at_50%_0%,rgba(244,63,94,0.02),rgba(0,0,0,0))]"}`} 
        style={{ pointerEvents: "none" }}
      />
      <div 
        className={`absolute inset-0 ${isDarkMode ? "bg-[linear-gradient(rgba(255,255,255,0.007)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.007)_1px,transparent_1px)]" : "bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)]"} bg-[size:40px_40px]`} 
        style={{ pointerEvents: "none" }}
      />

      {/* Admin HUD Header - Minimalist and borderless */}
      <header className="relative z-20 w-full px-6 pt-5 pb-2">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
          
          {/* Logo Brand & Indicator Group */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
            {/* Logo Brand Frame with AI Assistant Details on Right */}
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                {/* Multi-color glowing ring */}
                <motion.div 
                  className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-500 via-purple-600 to-cyan-400 opacity-60 blur-[3px]"
                  animate={{
                    rotate: [0, 360],
                    scale: [0.95, 1.05, 0.95]
                  }}
                  transition={{
                    rotate: { duration: 6, repeat: Infinity, ease: "linear" },
                    scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                  }}
                />
                {/* Spinning multicolor border with full circle constraint */}
                <div className="relative w-11 h-11 rounded-full bg-neutral-950 p-[1.5px] overflow-hidden shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                  <motion.div
                    className="absolute inset-[-50%] bg-gradient-to-r from-emerald-400 via-purple-500 via-rose-500 via-amber-400 to-cyan-400"
                    animate={{
                      rotate: [0, 360]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  
                  {/* Inner dark container housing custom logo or points */}
                  <div className="relative w-full h-full rounded-full bg-[#0d0e12] overflow-hidden flex items-center justify-center">
                    {customLogo ? (
                      <div className="w-full h-full relative flex items-center justify-center">
                        <img 
                          src={customLogo} 
                          alt="Logo Brand" 
                          className="w-[85%] h-[85%] object-cover rounded-full border border-neutral-800"
                          referrerPolicy="no-referrer"
                        />
                        {/* High-tech tech overlay lines */}
                        <div className="absolute inset-0 rounded-full bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px)] pointer-events-none" />
                      </div>
                    ) : (
                      <>
                        {/* Glowing background hub */}
                        <div className="absolute inset-1.5 rounded-full bg-indigo-500/5 blur-sm" />
                        
                        {/* Tiny animated colorful points/pixels */}
                        {[
                          { color: "bg-emerald-400", x: [-3, 5, -1], y: [-5, 3, -3], scale: [0.8, 1.2, 0.8], duration: 4.2 },
                          { color: "bg-purple-400", x: [5, -3, 3], y: [3, -5, 1], scale: [1, 0.7, 1.3, 1], duration: 3.8 },
                          { color: "bg-rose-400", x: [-6, 3, -4], y: [1, -1, 5], scale: [0.9, 1.4, 0.9], duration: 4.5 },
                          { color: "bg-amber-400", x: [1, -5, 6], y: [-3, 5, -1], scale: [1.2, 0.8, 1.2], duration: 3.5 },
                          { color: "bg-cyan-400", x: [0, 3, -3, 0], y: [6, -3, 1, 6], scale: [0.7, 1.3, 0.7], duration: 4.9 },
                          { color: "bg-emerald-400", x: [-4, 2, 4], y: [2, 4, -4], scale: [1.1, 0.6, 1.1], duration: 3.2 },
                          { color: "bg-rose-500", x: [3, -6, 1], y: [-1, -1, -5], scale: [0.6, 1.2, 0.6], duration: 4.0 },
                          { color: "bg-purple-500", x: [-1, 1, -1], y: [0, 4, 0], scale: [1.3, 0.9, 1.3], duration: 3.6 },
                          { color: "bg-fuchsia-400", x: [4, -4, 2], y: [-4, 4, -2], scale: [0.7, 1.4, 0.7], duration: 3.9 },
                          { color: "bg-lime-450", x: [-5, 4, -2], y: [5, -3, 2], scale: [1.1, 0.8, 1.1], duration: 4.1 },
                          { color: "bg-orange-400", x: [2, 5, -5], y: [-2, -6, 4], scale: [0.8, 1.3, 0.8], duration: 3.4 },
                          { color: "bg-pink-400", x: [-2, -5, 3], y: [4, -2, -4], scale: [1.2, 0.7, 1.2], duration: 4.3 },
                          { color: "bg-yellow-400", x: [6, -2, -1], y: [-5, 2, 5], scale: [0.6, 1.1, 0.6], duration: 3.1 },
                          { color: "bg-sky-450", x: [-1, 6, -6], y: [3, 5, -3], scale: [1.3, 0.9, 1.3], duration: 4.7 },
                          { color: "bg-violet-400", x: [3, -1, 4], y: [-6, 1, -2], scale: [1.0, 1.4, 0.7], duration: 3.7 },
                          { color: "bg-teal-400", x: [-6, 1, -3], y: [-2, 6, -1], scale: [0.9, 1.2, 0.9], duration: 4.4 },
                          { color: "bg-indigo-300", x: [2, -3, 5], y: [5, -4, 1], scale: [1.2, 0.5, 1.2], duration: 3.3 },
                          { color: "bg-pink-500", x: [-4, 3, -2], y: [-3, -5, 3], scale: [0.7, 1.3, 0.7], duration: 4.6 },
                          { color: "bg-emerald-350", x: [5, -5, 0], y: [-1, 3, -6], scale: [1.1, 0.7, 1.1], duration: 3.0 },
                          { color: "bg-amber-300", x: [-3, 2, 6], y: [6, -4, -2], scale: [0.8, 1.2, 0.8], duration: 4.8 }
                        ].map((dot, idx) => (
                          <motion.div
                            key={idx}
                            className={`absolute w-1 h-1 rounded-full ${dot.color} shadow-sm`}
                            animate={{
                              x: dot.x,
                              y: dot.y,
                              scale: dot.scale,
                              opacity: [0.4, 0.95, 0.4]
                            }}
                            transition={{
                              duration: dot.duration,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        ))}
                      </>
                    )}
                  </div>
                </div>
                {/* Responsive dynamic status dot indicator */}
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 z-10">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    state === AssistantState.DISCONNECTED || state === AssistantState.ERROR
                      ? "bg-red-400"
                      : state === AssistantState.LISTENING
                      ? "bg-orange-400"
                      : "bg-emerald-400"
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-3.5 w-3.5 border border-slate-950 ${
                    state === AssistantState.DISCONNECTED || state === AssistantState.ERROR
                      ? "bg-red-500"
                      : state === AssistantState.LISTENING
                      ? "bg-orange-500"
                      : "bg-emerald-500"
                  }`}></span>
                </span>
              </div>

              {/* Identity metadata layout placed precisely right to the logo branding */}
              <div className="flex flex-col justify-center min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-neutral-450 font-mono tracking-wider bg-neutral-900/40 px-2.5 py-0.5 rounded border border-neutral-800/20">
                    {currentSystemTime.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })} | {currentSystemTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                  </span>
                </div>
                
                <h1 className="text-base font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 font-sans uppercase mt-0.5 leading-tight">
                  {assistantName}
                </h1>
                
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5 text-[9px] font-mono text-neutral-400 uppercase tracking-wider">
                  <span className="text-xs">🌐</span>
                  <span>{selectedCountry}</span>
                  <span className="text-neutral-700 font-bold">|</span>
                  <span className="text-[10px]">🗣️</span>
                  <span className="text-emerald-400 font-bold">{assistantLanguage} ({assistantVoice})</span>
                </div>
              </div>
            </div>
          </div>

            {/* Icons and Indicators status panel */}
            <div className="flex flex-wrap items-center justify-start gap-3">
              
              {/* Live Uptime Stopwatch */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900/40 border border-neutral-800 rounded-lg text-xs font-mono">
                <Timer className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span className="text-[10px] text-neutral-500 mr-1 uppercase">UPTIME:</span>
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                  {state !== AssistantState.DISCONNECTED && state !== AssistantState.ERROR ? formatTimer(sessionUptime) : "00:00"}
                </span>
              </div>

              {/* Live WebSocket Status Pill with Icons */}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900/40 border rounded-lg text-xs font-mono transition-colors ${
                state === AssistantState.DISCONNECTED || state === AssistantState.ERROR ? "border-rose-500/25 text-rose-300" :
                state === AssistantState.CONNECTING ? "border-purple-500/25 text-purple-300" :
                state === AssistantState.LISTENING ? "border-orange-500/25 text-orange-300" :
                "border-emerald-500/25 text-emerald-300"
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  state === AssistantState.DISCONNECTED || state === AssistantState.ERROR ? "bg-red-500" :
                  state === AssistantState.CONNECTING ? "bg-purple-500 animate-pulse" :
                  state === AssistantState.LISTENING ? "bg-orange-500 animate-pulse" :
                  "bg-emerald-400"
                }`} />
                <span className="uppercase text-[9px] font-bold">
                  STATUS_{state.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Absolute Top Right Animated Settings Deck Trigger & Notifications Gate */}
        <div className="absolute top-5 right-6 z-30 flex items-center gap-2.5">
          {/* Settings Trigger */}
          <motion.button
            id="top-settings-button"
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-emerald-500/40 hover:bg-neutral-800 text-neutral-400 hover:text-emerald-400 cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.4)] transition-all flex items-center justify-center group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Open Pro Engine Settings"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              whileHover={{ rotate: 360, transition: { duration: 3.5, repeat: Infinity, ease: "linear" } }}
            >
              <Settings2 className="w-5 h-5 transition-colors group-hover:text-emerald-400" />
            </motion.div>
          </motion.button>

          {/* Notifications Trigger */}
          <AnimatePresence>
            {showTopBell && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.25 }}
                className="relative"
              >
                <motion.button
                  id="top-notifications-button"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-emerald-500/40 hover:bg-neutral-800 text-neutral-400 hover:text-emerald-400 cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.4)] transition-all flex items-center justify-center relative group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Open System Notification Matrix"
                >
                  {notifications.length > 0 ? (
                    <BellRing className="w-5 h-5 text-emerald-400 animate-pulse" />
                  ) : (
                    <Bell className="w-5 h-5 transition-colors group-hover:text-emerald-400" />
                  )}
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative flex items-center justify-center rounded-full h-4 w-4 bg-emerald-500 text-[8.5px] font-extrabold text-black font-mono">
                        {notifications.length}
                      </span>
                    </span>
                  )}
                </motion.button>

                {/* Floating Dropdown Matrix */}
                <AnimatePresence>
                  {isNotifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className={`absolute right-0 top-13 w-80 rounded-2xl border ${
                        isDarkMode 
                          ? "bg-[#0b0c16ee] border-neutral-800/80 text-white shadow-[0_15px_40px_rgba(0,0,0,0.85)]" 
                          : "bg-white border-slate-200 text-slate-950 shadow-[0_15px_45px_rgba(0,0,0,0.12)]"
                      } backdrop-blur-2xl z-50 p-4 font-mono`}
                    >
                      <div className="flex items-center justify-between pb-2.5 border-b border-neutral-850 mb-2.5">
                        <span className="text-[9px] font-extrabold text-emerald-400 tracking-wider">SYSTEM NOTIFICATION LOGS</span>
                        {notifications.length > 0 && (
                          <button
                            onClick={() => {
                              setNotifications([]);
                              showNotification("Console Log Purged", "Saved activity sequence successfully flushed.", "info");
                            }}
                            className="text-[8.5px] text-neutral-550 hover:text-rose-400 uppercase font-extrabold cursor-pointer transition-all"
                          >
                            Clear Matrix
                          </button>
                        )}
                      </div>

                      <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-neutral-800">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-[9px] text-neutral-500 font-sans tracking-tight">
                            No active live events in memory buffer.
                          </div>
                        ) : (
                          notifications.map((n) => {
                            let colorBorder = "border-sky-500/20 text-sky-450 bg-sky-500/5";
                            if (n.type === 'success') colorBorder = "border-emerald-500/20 text-emerald-450 bg-emerald-500/5";
                            if (n.type === 'warning') colorBorder = "border-red-500/20 text-red-400 bg-red-500/5";
                            if (n.type === 'tool') colorBorder = "border-purple-500/25 text-purple-400 bg-purple-500/5";

                            return (
                              <div 
                                key={n.id} 
                                className={`p-2.5 rounded-xl border text-left text-[9px] relative flex flex-col gap-1 transition-all ${
                                  isDarkMode ? "bg-neutral-950/50 border-neutral-850" : "bg-slate-50 border-slate-150"
                                }`}
                              >
                                <div className="flex items-center gap-1.5 font-sans font-bold">
                                  <span className={`px-1.5 py-0.5 rounded border text-[7.5px] font-mono tracking-wider uppercase font-extrabold ${colorBorder}`}>
                                    {n.type}
                                  </span>
                                  <span className={`text-[9.5px] font-extrabold ${isDarkMode ? "text-neutral-200" : "text-slate-800"}`}>
                                    {n.title}
                                  </span>
                                </div>
                                <p className="text-neutral-400 font-sans leading-relaxed text-[9px] block">
                                  {n.description}
                                </p>
                                <span className="text-[7.5px] text-neutral-550 block font-mono">
                                  {n.timestamp.toLocaleTimeString()}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setNotifications((prev) => prev.filter((item) => item.id !== n.id));
                                  }}
                                  className="absolute top-2.5 right-2.5 text-neutral-600 hover:text-rose-455 cursor-pointer"
                                  title="Delete log entry"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
            {/* Core Command Center Stage - Clean and centered layout for maximum focus */}
      <main className="relative z-10 flex-grow w-full max-w-2xl mx-auto px-6 py-8 flex flex-col justify-center items-stretch gap-6">
        
        {/* The Majestic Quantum Orb Visualizer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className={`rounded-2xl p-0 overflow-hidden backdrop-blur-md relative ${bgCard}`}
        >
          <ZoyaOrb 
            state={state}
            userVolume={userVolume}
            zoyaVolume={zoyaVolume}
            onTogglePower={handleTogglePower}
            errorMessage={errorMessage}
            glowScale={glowScale}
            isDarkMode={isDarkMode}
            assistantName={assistantName}
          />
        </motion.div>

        {/* Synthetic Prompt Console: Keyboard seed input for preview containers */}
        {state !== AssistantState.DISCONNECTED && state !== AssistantState.ERROR && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-0 overflow-hidden backdrop-blur-md relative ${bgCard}`}
          >
            <div className={`flex items-center justify-between px-5 py-4 ${isDarkMode ? "bg-neutral-950/50 border-b border-neutral-850" : "bg-slate-100 border-b border-slate-200"}`}>
              <div className="flex items-center gap-1.5 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-400 font-extrabold font-mono text-[10.5px] uppercase tracking-wider">
                <AudioLines className="w-3.5 h-3.5 text-cyan-400 animate-pulse inline-block" />
                <span>DIAGNOSTIC EXECUTIVE TERMINAL</span>
              </div>
              <span className="text-[8.5px] bg-emerald-500/10 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/10 uppercase font-mono tracking-widest animate-pulse">
                Armed
              </span>
            </div>
            
            <div className="p-5 space-y-3 text-xs">
              <p className={`text-[10px] ${textMuted} font-sans leading-relaxed`}>
                Inside restrictive secure iframe previews (without direct mic input), type testing instructions below. {assistantName} responds with live full-duplex speech!
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!demoInput.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
                  
                  // Emit virtual text input
                  wsRef.current.send(JSON.stringify({
                    type: "text",
                    text: demoInput
                  }));
                  
                  showNotification(
                    "Instruction Dispatched",
                    `Sent query to ${assistantName}: "${demoInput.length > 25 ? demoInput.substring(0, 25) + "..." : demoInput}"`,
                    "info"
                  );
                  
                  // Reset and trigger speaking state visualization
                  setDemoInput("");
                  setState(AssistantState.SPEAKING);
                }}
                className="flex gap-2"
              >
                <input
                  id="virtual-text-input"
                  type="text"
                  placeholder={`Type diagnostic message for ${assistantName}...`}
                  value={demoInput}
                  onChange={(e) => setDemoInput(e.target.value)}
                  className={`flex-grow ${isDarkMode ? "bg-[#05060a] text-white border-neutral-850 focus:border-emerald-500 placeholder-neutral-600" : "bg-slate-50 text-slate-900 border-slate-200 focus:border-emerald-500 placeholder-slate-400"} rounded-xl px-3 py-2 text-xs outline-none transition-colors font-sans`}
                />
                <button
                  id="virtual-submit-button"
                  type="submit"
                  className="bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-600 hover:from-emerald-300 hover:to-indigo-500 text-black font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center gap-1 select-none cursor-pointer border border-transparent"
                >
                  Send
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Channel exceptions / permission blockers */}
        {state === AssistantState.ERROR && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neutral-900/35 border border-rose-500/20 rounded-2xl p-0 overflow-hidden backdrop-blur-md shadow-2xl w-full text-center z-20"
          >
            <div className="p-5 text-center space-y-4 bg-red-950/10">
              <div className="flex justify-center">
                <div className="p-1.5 text-red-400">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                </div>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-red-450 uppercase tracking-widest font-mono">
                  {errorMessage.toLowerCase().includes("key") ? "SECURE_API_KEY_ERROR" : "HARDWARE_CAPTURE_BLOCKED"}
                </h4>
                <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                  {errorMessage.toLowerCase().includes("key") 
                    ? `${assistantName} requires a Gemini API Key to talk. Access the Secrets menu in Settings to add GEMINI_API_KEY.`
                    : "The hosting browser blocked the microphone capture request inside our sandbox iframe."}
                </p>
              </div>

              {!errorMessage.toLowerCase().includes("key") && (
                <div className="text-left py-2 border-t border-neutral-900 space-y-2 font-mono text-[10px] text-neutral-400 leading-normal">
                  <div className="flex gap-2">
                    <span className="font-bold text-emerald-500">1.</span>
                    <span>Click the lock icon in your browser address bar.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-emerald-500">2.</span>
                    <span>Allow <strong>Microphone Permission</strong>.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-emerald-500">3.</span>
                    <span>Launch in a direct tab to unlock full hardware drivers!</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-1 font-mono">
                <a
                  id="open-new-tab-resolver"
                  href={window.location.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg transition-all"
                >
                  LAUNCH STANDALONE TAB <ExternalLink className="w-4 h-4 text-slate-950 inline" />
                </a>
                <button
                  id="retry-connector-button"
                  onClick={handleTogglePower}
                  className="text-[10px] text-neutral-500 hover:text-neutral-300 font-semibold underline cursor-pointer py-1"
                >
                  Reinitialize Secure WebSocket Channel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Floating Website Trigger Interception Modal Overlay */}
      <AnimatePresence>
        {currentToolCall && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#070913]/95 border-b-2 border-emerald-500 p-5 shadow-25 shadow-black/95 backdrop-blur-xl"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 text-emerald-400">
                <Heart className="w-5.5 h-5.5 animate-pulse" />
              </div>
              <div className="flex-grow min-w-0 space-y-1">
                <h4 className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase flex items-center gap-1.5">
                  <span>FUNCTION TRIGGERED</span>
                  <Radio className="w-3 h-3 text-emerald-400 animate-ping" />
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                  {assistantName} is navigating you to <strong className="text-white font-sans">{currentToolCall.siteName}</strong> in a new terminal tab.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <a
                    id="modal-visit-button"
                    href={currentToolCall.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-grow flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs py-2 px-3 rounded-lg transition-colors"
                    onClick={() => setCurrentToolCall(null)}
                  >
                    LAUNCH SITE <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    id="modal-dismiss-button"
                    onClick={() => setCurrentToolCall(null)}
                    className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 font-semibold text-xs py-2 px-3 rounded-lg transition-colors"
                  >
                    DISMISS
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>      {/* Slide-out settings drawer panel from the right */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            {/* Dark glassmorphic backdrop overlay */}
            <motion.div
              id="settings-overlay-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={handleCancelSettings}
              className="fixed inset-0 z-40 bg-black/75 backdrop-blur-xs"
            />

            {/* Panel Drawer Container */}
            <motion.div
              id="settings-drawer-panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-md sm:max-w-lg p-6 flex flex-col justify-between backdrop-blur-2xl h-screen overflow-y-auto duration-200 transition-colors ${
                isDarkMode 
                  ? "bg-[#07090f]/97 border-l border-neutral-805 shadow-[0_0_60px_rgba(0,0,0,0.95)] text-[#e2e8f0]" 
                  : "bg-white border-l border-slate-250 shadow-[0_0_60px_rgba(0,0,0,0.12)] text-slate-900"
              }`}
            >
              <div className="space-y-5">
                
                {/* Drawer Header Layout */}
                <div className="flex items-center justify-between pb-3.5 border-b border-neutral-850">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <span className="text-base select-none">⚙️</span>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold font-mono tracking-wider text-neutral-300 uppercase">
                        PRO AI EXECUTIVE CONTROL
                      </h3>
                      <p className="text-[10px] text-neutral-500 font-mono">
                        Direct Client Tuning Parameters
                      </p>
                    </div>
                  </div>
                  
                  {/* Close icon with hover state close effect */}
                  <button
                    id="settings-close-button"
                    onClick={handleCancelSettings}
                    className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-red-500/30 hover:bg-neutral-800 text-neutral-400 hover:text-red-400 transition-all cursor-pointer flex items-center justify-center group"
                    title="Close Panel Settings"
                  >
                    <span className="text-xs select-none transition-transform group-hover:scale-110">❌</span>
                  </button>
                </div>

                {/* Vertical Navigation Tabs System acting as stacked list (Enlarged) */}
                <div className="flex flex-col gap-2 p-1.5 bg-neutral-950/70 rounded-2xl overflow-hidden select-none">
                  <button
                    onClick={() => {
                      setActiveSettingsTab(activeSettingsTab === "general" ? "" : "general");
                    }}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center justify-between w-full ${
                      activeSettingsTab === "general"
                        ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/35 shadow-[0_0_12px_rgba(99,102,241,0.15)]"
                        : "text-neutral-500 hover:text-neutral-350 hover:bg-neutral-900/50 hover:border-indigo-500/25 border border-neutral-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base select-none">🎛️</span>
                      <span>General Settings</span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-300 shrink-0 ${
                        activeSettingsTab === "general" ? "rotate-180 text-indigo-400" : "text-neutral-600"
                      }`}
                    />
                  </button>

                  {/* Animated dropdown configuration card just below the General Settings tab with custom options */}
                  <AnimatePresence>
                    {activeSettingsTab === "general" && (
                      <motion.div
                        id="general-tab-optionscard"
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: "auto", opacity: 1, marginTop: 8 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="overflow-hidden w-full px-1 mb-2"
                      >
                        <div className="space-y-4 p-5 rounded-2xl bg-[#090b11] border border-indigo-500/35 hover:border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)] relative overflow-hidden backdrop-blur-md">
                          {/* Country Selector */}
                          <div className="space-y-1.5 p-3 bg-neutral-950/40 border border-neutral-850 rounded-xl hover:border-neutral-800 transition-colors">
                            <label className="text-[10px] font-bold text-neutral-200 font-sans block uppercase">
                              Select Country / Region
                            </label>
                            <p className="text-[8px] text-neutral-500 font-mono block uppercase mb-1">
                              Establishes legal and geographical locale limits
                            </p>
                            <div className="relative">
                              <select
                                id="country-selector"
                                value={draftCountry}
                                onChange={(e) => {
                                  const c = e.target.value;
                                  setDraftCountry(c);
                                  setDraftDateTime(getISOStringForCountry(c));
                                }}
                                className="w-full bg-neutral-950 border border-neutral-850 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-white outline-none transition-colors appearance-none cursor-pointer font-mono"
                              >
                                <option value="India">🇮🇳 India</option>
                                <option value="United States">🇺🇸 United States</option>
                                <option value="United Kingdom">🇬🇧 United Kingdom</option>
                                <option value="Canada">🇨🇦 Canada</option>
                                <option value="Australia">🇦🇺 Australia</option>
                                <option value="Germany">🇩🇪 Germany</option>
                                <option value="Japan">🇯🇵 Japan</option>
                                <option value="United Arab Emirates">🇦🇪 United Arab Emirates</option>
                              </select>
                              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500 text-[10px]">▼</span>
                            </div>
                          </div>

                          {/* Date/Time Selector */}
                          <div className="space-y-1.5 p-3 bg-neutral-950/40 border border-neutral-850 rounded-xl hover:border-neutral-800 transition-colors">
                            <label className="text-[10px] font-bold text-neutral-200 block uppercase">
                              System Date & Time Override
                            </label>
                            <p className="text-[8px] text-neutral-500 font-mono block uppercase mb-1">
                              Inject precise timestamp seeds into terminal clocks
                            </p>
                            <input
                              id="datetime-selector"
                              type="datetime-local"
                              value={draftDateTime}
                              onChange={(e) => setDraftDateTime(e.target.value)}
                              className="w-full bg-neutral-950 border border-neutral-850 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-white outline-none transition-colors font-mono"
                            />
                          </div>

                          {/* Century / Epoch Presets */}
                          <div className="space-y-1.5 p-3 bg-neutral-950/40 border border-neutral-850 rounded-xl hover:border-neutral-800 transition-colors">
                            <label className="text-[10px] font-bold text-neutral-200 block uppercase">
                              Chronos Century Preset
                            </label>
                            <p className="text-[8px] text-neutral-500 font-mono block uppercase mb-2">
                              Fast-forward temporal seeds into chosen historic or sci-fi era
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { label: "20th Century (1986)", year: "1986" },
                                { label: "21st Century (2026)", year: "2026" },
                                { label: "22nd Century (2126)", year: "2126" },
                                { label: "25th Century (2426)", year: "2426" },
                              ].map((century) => {
                                const currentYearStr = draftDateTime ? draftDateTime.substring(0, 4) : "";
                                const isSelected = currentYearStr === century.year;
                                return (
                                  <button
                                    key={century.year}
                                    type="button"
                                    onClick={() => {
                                      setDraftDateTime(applyYearToDateTime(draftDateTime, century.year));
                                    }}
                                    className={`py-2 px-3 rounded-lg border text-center transition-all cursor-pointer font-mono font-bold text-[8.5px] uppercase ${
                                      isSelected
                                        ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.1)]"
                                        : "bg-neutral-950 border-neutral-850 text-neutral-500 hover:text-neutral-350"
                                    }`}
                                  >
                                    {century.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Logo Loader */}
                          <div className="space-y-2.5 p-3 bg-neutral-950/40 border border-neutral-850 rounded-xl hover:border-neutral-800 transition-colors">
                            <div>
                              <label className="text-[10px] font-bold text-neutral-200 font-sans block uppercase">
                                Brand Logo Update
                              </label>
                              <p className="text-[8px] text-neutral-500 font-mono block uppercase">
                                Upload logo image file or pick quick template
                              </p>
                            </div>

                            {/* Drag & Drop uploader */}
                            <div className="relative flex flex-col gap-2">
                              <div className="border border-dashed border-neutral-800 hover:border-indigo-500/50 bg-neutral-950/65 rounded-xl p-3 text-center cursor-pointer relative group transition-colors">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        if (typeof reader.result === "string") {
                                          setDraftLogo(reader.result);
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <span className="text-base mb-1 block select-none">📁</span>
                                <span className="text-[9px] font-bold text-neutral-300 block uppercase">
                                  Upload Logo Image
                                </span>
                                <span className="text-[7.5px] text-neutral-550 font-mono block uppercase mt-0.5">
                                  Click / Drag to upload png, jpg or svg
                                </span>
                              </div>

                              {/* Custom URL */}
                              <div className="space-y-0.5">
                                <span className="text-[7.5px] text-neutral-550 font-mono uppercase tracking-widest block font-bold">
                                  Or Enter External Logo URL
                                </span>
                                <input
                                  type="text"
                                  placeholder="https://example.com/logo.png"
                                  value={draftLogo}
                                  onChange={(e) => setDraftLogo(e.target.value)}
                                  className="w-full bg-neutral-950 border border-neutral-850 focus:border-indigo-500 rounded-lg p-2 text-[11px] text-white outline-none transition-colors font-mono"
                                />
                              </div>

                              {/* Presets */}
                              <div className="space-y-0.5">
                                <span className="text-[7.5px] text-neutral-550 font-mono uppercase tracking-widest block font-bold">
                                  Quick Branding Preset Logos
                                </span>
                                <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                                  {[
                                    { label: "Default Bot", url: `https://api.dicebear.com/7.x/bottts/svg?seed=${draftAssistantName}` },
                                    { label: "Pixel Art", url: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${draftAssistantName}` },
                                    { label: "Abstract", url: "https://api.dicebear.com/7.x/identicon/svg?seed=Admin" },
                                    { label: "Initials", url: `https://api.dicebear.com/7.x/initials/svg?seed=${draftAssistantName}` },
                                  ].map((preset) => (
                                    <button
                                      key={preset.url}
                                      type="button"
                                      onClick={() => setDraftLogo(preset.url)}
                                      className={`text-[8.5px] py-1 px-1 rounded-lg border text-center transition-all cursor-pointer font-mono font-bold hover:bg-neutral-900 ${
                                        draftLogo === preset.url
                                          ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/40"
                                          : "bg-neutral-950 border-neutral-850 text-neutral-450"
                                      }`}
                                    >
                                      {preset.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Logo Preview */}
                              <div className="flex items-center gap-3 p-2 bg-neutral-950/60 rounded-xl border border-neutral-850">
                                <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
                                  {draftLogo ? (
                                    <img
                                      src={draftLogo}
                                      alt="Draft Preview"
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <span className="text-[9px] text-neutral-600">No Image</span>
                                  )}
                                </div>
                                <div>
                                  <span className="text-[9px] font-bold text-neutral-205 block uppercase">Logo Live Preview</span>
                                  <span className="text-[7.5px] text-neutral-500 font-mono block uppercase">Displays on system dashboard</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Save & Reset controls */}
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setDraftCountry(selectedCountry);
                                setDraftDateTime(selectedDateTime);
                                setDraftLogo(customLogo);
                                setDraftIsOnlineMode(isOnlineMode);
                                setDraftIsMicEnabled(isMicEnabled);
                                setDraftIsSpeakerEnabled(isSpeakerEnabled);
                                setActiveSettingsTab("");
                              }}
                              className="py-2.5 bg-neutral-955 hover:bg-neutral-900 border border-neutral-850 hover:border-red-500/20 text-neutral-450 hover:text-red-400 rounded-xl font-bold font-mono text-[9px] uppercase tracking-wider cursor-pointer transition-colors text-center inline-flex items-center justify-center gap-1"
                            >
                              <span>❌</span>
                              CANCEL
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                localStorage.setItem("customLogo", draftLogo);
                                setSelectedCountry(draftCountry);
                                setSelectedDateTime(draftDateTime);
                                setCustomLogo(draftLogo);
                                setIsOnlineMode(draftIsOnlineMode);
                                setIsMicEnabled(draftIsMicEnabled);
                                setIsSpeakerEnabled(draftIsSpeakerEnabled);
                                setActiveSettingsTab("");
                                showNotification(
                                  "Settings Saved",
                                  "General control parameters successfully updated.",
                                  "success"
                                );
                              }}
                              className="py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-555 hover:to-indigo-450 text-white rounded-xl font-extrabold text-[9px] uppercase font-mono tracking-wider cursor-pointer transition-all text-center inline-flex items-center justify-center gap-1 shadow-[0_0_12px_rgba(99,102,241,0.2)]"
                            >
                              <span>💾</span>
                              SAVE GENERAL
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <button
                    onClick={() => {
                      setActiveSettingsTab(activeSettingsTab === "ai" ? "" : "ai");
                    }}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center justify-between w-full ${
                      activeSettingsTab === "ai"
                        ? "bg-emerald-500/10 text-emerald-350 border border-emerald-500/35 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                        : "text-neutral-500 hover:text-neutral-350 hover:bg-neutral-900/50 hover:border-emerald-500/25 border border-neutral-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base select-none">🧠</span>
                      <span>Ai Assistant</span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-300 shrink-0 ${
                        activeSettingsTab === "ai" ? "rotate-180 text-emerald-400" : "text-neutral-600"
                      }`}
                    />
                  </button>

                  {/* Animated dropdown configuration card just below the Ai Assistant tab with custom options */}
                  <AnimatePresence>
                    {activeSettingsTab === "ai" && (
                      <motion.div
                        id="ai-tab-optionscard"
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: "auto", opacity: 1, marginTop: 8 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="overflow-hidden w-full px-1 mb-2"
                      >
                        <div className="space-y-4 p-5 rounded-2xl bg-[#090b11] border border-emerald-500/35 hover:border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] relative overflow-hidden backdrop-blur-md">
                          {/* AI Assistant Name Input */}
                          <div className="space-y-1.5 p-3 bg-neutral-950/40 border border-neutral-850 rounded-xl hover:border-neutral-800 transition-colors">
                            <label className="text-[10px] font-bold text-neutral-200 font-sans block uppercase">
                              AI Assistant Name
                            </label>
                            <p className="text-[8px] text-neutral-500 font-mono block uppercase mb-1">
                              Modify the core designation of your stream intelligence
                            </p>
                            <input
                              type="text"
                              value={draftAssistantName}
                              onChange={(e) => setDraftAssistantName(e.target.value)}
                              className="w-full bg-neutral-950 border border-neutral-850 focus:border-emerald-500 rounded-xl p-2.5 text-xs text-white outline-none transition-colors font-mono"
                              placeholder="e.g. Zoya, Alexa, Jarvis"
                            />
                          </div>

                          {/* Voice Selector */}
                          <div className="space-y-1.5 p-3 bg-neutral-950/40 border border-neutral-850 rounded-xl hover:border-neutral-800 transition-colors">
                            <label className="text-[10px] font-bold text-neutral-200 font-sans block uppercase">
                              Voice Gender Tone Selection
                            </label>
                            <p className="text-[8px] text-neutral-500 font-mono block uppercase mb-2">
                              Configure audio synthesis frequency values
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setDraftAssistantVoice("Male")}
                                className={`py-2 px-3 rounded-lg border text-center transition-all cursor-pointer font-mono font-bold text-[9px] uppercase ${
                                  draftAssistantVoice === "Male"
                                    ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.1)]"
                                    : "bg-neutral-950 border-neutral-850 text-neutral-500 hover:text-neutral-350"
                                }`}
                              >
                                🤵 MALE VOICE
                              </button>
                              <button
                                type="button"
                                onClick={() => setDraftAssistantVoice("Female")}
                                className={`py-2 px-3 rounded-lg border text-center transition-all cursor-pointer font-mono font-bold text-[9px] uppercase ${
                                  draftAssistantVoice === "Female"
                                    ? "bg-emerald-500/15 text-emerald-350 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                                    : "bg-neutral-950 border-neutral-850 text-neutral-500 hover:text-neutral-350"
                                }`}
                              >
                                👩 FEMALE VOICE
                              </button>
                            </div>
                          </div>

                          {/* Language Choice */}
                          <div className="space-y-1.5 p-3 bg-neutral-950/40 border border-neutral-850 rounded-xl hover:border-neutral-800 transition-colors">
                            <label className="text-[10px] font-bold text-neutral-200 font-sans block uppercase">
                              Primary Native Language
                            </label>
                            <p className="text-[8px] text-neutral-500 font-mono block uppercase mb-2">
                              Default speech dictionary translations
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setDraftAssistantLanguage("Hindi")}
                                className={`py-2 px-3 rounded-lg border text-center transition-all cursor-pointer font-mono font-bold text-[9px] uppercase ${
                                  draftAssistantLanguage === "Hindi"
                                    ? "bg-amber-500/15 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
                                    : "bg-neutral-950 border-neutral-850 text-neutral-500 hover:text-neutral-350"
                                }`}
                              >
                                🇮🇳 HINDI (हिन्दी)
                              </button>
                              <button
                                type="button"
                                onClick={() => setDraftAssistantLanguage("English")}
                                className={`py-2 px-3 rounded-lg border text-center transition-all cursor-pointer font-mono font-bold text-[9px] uppercase ${
                                  draftAssistantLanguage === "English"
                                    ? "bg-purple-500/15 text-purple-300 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.1)]"
                                    : "bg-neutral-950 border-neutral-850 text-neutral-500 hover:text-neutral-350"
                                }`}
                              >
                                🇺🇸 ENGLISH (US)
                              </button>
                            </div>
                          </div>

                          {/* Custom Prompt Override Textarea */}
                          <div className="space-y-1.5 p-3 bg-neutral-950/40 border border-neutral-850 rounded-xl hover:border-neutral-800 transition-colors">
                            <label className="text-[10px] font-bold text-neutral-200 font-sans block uppercase">
                              System Persona Override Directive
                            </label>
                            <p className="text-[8px] text-neutral-500 font-mono block uppercase mb-2">
                              Inject cognitive traits or persona instructions to modify Pro AI's dialogue stream
                            </p>
                            <textarea
                              id="drawer-custom-prompt"
                              rows={3}
                              placeholder="Inject cognitive traits or persona instructions..."
                              value={draftCustomPrompt}
                              onChange={(e) => setDraftCustomPrompt(e.target.value)}
                              className="w-full bg-neutral-950 border border-neutral-850 focus:border-emerald-500 rounded-xl p-3 text-xs text-white placeholder-neutral-600 outline-none transition-colors font-sans leading-relaxed resize-none font-mono"
                            />
                          </div>

                          {/* SYSTEM BEHAVIOR PROTOCOLS PANEL */}
                          <div className={`border rounded-xl overflow-hidden shadow-md ${isDarkMode ? "border-emerald-500/20 bg-neutral-950/40" : "border-emerald-500/35 bg-slate-50"}`}>
                            <PersonalitySheet isDarkMode={isDarkMode} assistantName={assistantName} />
                          </div>

                          {/* Save & Reset card level buttons */}
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setDraftAssistantName(assistantName);
                                setDraftAssistantVoice(assistantVoice);
                                setDraftAssistantLanguage(assistantLanguage);
                                setDraftCustomPrompt(customPrompt);
                                setActiveSettingsTab("");
                              }}
                              className="py-2.5 bg-neutral-955 hover:bg-neutral-900 border border-neutral-850 hover:border-red-500/20 text-neutral-450 hover:text-red-400 rounded-xl font-bold font-mono text-[9px] uppercase tracking-wider cursor-pointer transition-colors text-center inline-flex items-center justify-center gap-1"
                            >
                              <span>❌</span>
                              CANCEL
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const isConnected = wsRef.current !== null;
                                localStorage.setItem("assistantName", draftAssistantName);
                                localStorage.setItem("assistantVoice", draftAssistantVoice);
                                localStorage.setItem("assistantLanguage", draftAssistantLanguage);
                                localStorage.setItem("customPrompt", draftCustomPrompt);

                                setAssistantName(draftAssistantName);
                                setAssistantVoice(draftAssistantVoice);
                                setAssistantLanguage(draftAssistantLanguage);
                                setCustomPrompt(draftCustomPrompt);
                                setActiveSettingsTab("");
                                showNotification(
                                  "Assistant Profile Updated",
                                  `Modified name to "${draftAssistantName}" with ${draftAssistantVoice} voice successfully.`,
                                  "success"
                                );

                                if (isConnected) {
                                  disconnectSession();
                                  setTimeout(() => {
                                    connectSession(draftAssistantName, draftAssistantVoice, draftAssistantLanguage);
                                  }, 355);
                                }
                              }}
                              className="py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-555 hover:to-teal-450 text-black rounded-xl font-extrabold text-[9px] uppercase font-mono tracking-wider cursor-pointer transition-all text-center inline-flex items-center justify-center gap-1 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                            >
                              <span>💾</span>
                              SAVE ASSISTANT
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <button
                    onClick={() => {
                      setActiveSettingsTab(activeSettingsTab === "design" ? "" : "design");
                    }}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center justify-between w-full ${
                      activeSettingsTab === "design"
                        ? "bg-purple-500/10 text-purple-300 border border-purple-500/35 shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                        : "text-neutral-500 hover:text-neutral-350 hover:bg-neutral-900/50 hover:border-purple-500/25 border border-neutral-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base select-none">🎨</span>
                      <span>Design & Layout</span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-300 shrink-0 ${
                        activeSettingsTab === "design" ? "rotate-180 text-purple-400" : "text-neutral-600"
                      }`}
                    />
                  </button>

                  {/* Animated dropdown configuration card just below the Design & Layout tab */}
                  <AnimatePresence>
                    {activeSettingsTab === "design" && (
                      <motion.div
                        id="design-tab-optionscard"
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: "auto", opacity: 1, marginTop: 8 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="overflow-hidden w-full px-1 mb-2"
                      >
                        <div className="space-y-4 p-5 rounded-2xl bg-[#090b11] border border-purple-500/35 hover:border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)] relative overflow-hidden backdrop-blur-md">
                          {/* Dark/Light mode Toggle Switch */}
                          <div className="flex items-center justify-between p-3 bg-neutral-950/40 border border-neutral-850 rounded-xl hover:border-neutral-800 transition-colors">
                            <div className="flex items-center gap-2.5">
                              <div className={`p-1.5 rounded-lg flex items-center justify-center ${draftIsDarkMode ? "bg-slate-500/10 text-slate-300" : "bg-amber-500/10 text-amber-500"}`}>
                                {draftIsDarkMode ? <span className="text-[12px] select-none">🌙</span> : <span className="text-[12px] select-none">☀️</span>}
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-bold text-neutral-200 font-sans block uppercase">INTERFACE THEME</span>
                                <span className="text-[8px] text-neutral-500 font-mono block uppercase">{draftIsDarkMode ? "DARK MODE DEEP" : "LIGHT MODE GLOW"}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setDraftIsDarkMode(!draftIsDarkMode)}
                              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                draftIsDarkMode ? "bg-emerald-500" : "bg-neutral-800"
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                  draftIsDarkMode ? "translate-x-5" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>

                          {/* Dynamics & Control Deck inside Design Settings */}
                          <div className="border border-purple-500/20 bg-neutral-950/40 rounded-xl overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between border-b border-neutral-850 px-4 py-3 bg-neutral-950/60">
                              <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400">
                                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                                <span>DYNAMICS & CONTROL DECK</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setIsSystemTuningOpen(!isSystemTuningOpen)}
                                className="text-[8px] font-mono text-cyan-400 hover:text-cyan-300 uppercase tracking-widest bg-cyan-950/20 px-1.5 py-0.5 rounded border border-cyan-500/10 cursor-pointer"
                              >
                                {isSystemTuningOpen ? "[ Hide Logs ]" : "[ Show Config ]"}
                              </button>
                            </div>

                            <div className="p-4 space-y-3 text-xs">
                              {/* Visual Glow Scale Override slider */}
                              <div className="space-y-1">
                                <div className="flex justify-between font-mono text-[9px] mb-1">
                                  <span className="text-neutral-400 uppercase tracking-wider">AURA AMPLITUDE RANGE</span>
                                  <span className="text-cyan-400 font-extrabold bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/15">{(draftGlowScale * 100).toFixed(0)}%</span>
                                </div>
                                <input 
                                  type="range"
                                  min="0.5"
                                  max="1.8"
                                  step="0.05"
                                  value={draftGlowScale}
                                  onChange={(e) => setDraftGlowScale(parseFloat(e.target.value))}
                                  className="w-full h-1 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                                />
                              </div>

                              {/* Voice Interrupt sensitivity slider */}
                              <div className="space-y-1">
                                <div className="flex justify-between font-mono text-[9px] mb-1">
                                  <span className="text-neutral-400 uppercase tracking-wider">BARGE-IN SENSITIVITY</span>
                                  <span className="text-rose-450 font-extrabold bg-rose-950/30 px-1.5 py-0.5 rounded border border-rose-500/15">{(draftInterruptionThreshold * 1000).toFixed(0)} RMS</span>
                                </div>
                                <input 
                                  type="range"
                                  min="0.010"
                                  max="0.100"
                                  step="0.005"
                                  value={draftInterruptionThreshold}
                                  onChange={(e) => setDraftInterruptionThreshold(parseFloat(e.target.value))}
                                  className="w-full h-1 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                />
                                <p className="text-[8px] text-neutral-500 font-sans tracking-tight">
                                  Lower RMS triggers instant interrupts quicker as you talk over {assistantName}.
                                </p>
                              </div>
                            </div>

                            {/* Extra telemetry readings when toggled */}
                            {isSystemTuningOpen && (
                              <div className="px-4 pb-3 border-t border-neutral-850 bg-neutral-950/25 space-y-1.5 text-[9px] font-mono text-neutral-400 py-2.5">
                                <div className="flex items-center justify-between">
                                  <span>HOST PROTOCOL:</span>
                                  <span className="text-cyan-400">secure-wss://gateway</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>{assistantName.toUpperCase()}LINK FREQUENCY:</span>
                                  <span className="text-indigo-400">24,000Hz PCM Stereo</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>MIC SAMPLING VALUE:</span>
                                  <span className="text-rose-400">16,000Hz PCM Mono</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>LATENCY_STATIONARY:</span>
                                  <span className="text-emerald-400 flex items-center gap-1 text-[8.5px]">
                                    <RadioTower className="w-2.5 h-2.5" /> Optimal Channel (Dynamic)
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Virtual workspace Toggle */}
                          <div className="flex items-center justify-between p-3 bg-neutral-950/40 border border-neutral-850 rounded-xl">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-neutral-300 font-sans block uppercase">WORKSPACE DIAGNOSTIC</span>
                              <span className="text-[8px] text-neutral-500 font-sans block">Force layout debugging grid</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setDraftIsDemoMode(!draftIsDemoMode)}
                              className={`text-[8.5px] font-mono px-2 py-0.5 src-demo-toggle rounded border font-bold uppercase transition-all ${
                                draftIsDemoMode 
                                  ? "bg-indigo-500/10 border-indigo-500 text-indigo-400" 
                                  : "bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-300"
                              }`}
                            >
                              {draftIsDemoMode ? "Active" : "Disabled"}
                            </button>
                          </div>

                          {/* Save & Reset controls */}
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setDraftIsDarkMode(isDarkMode);
                                setDraftGlowScale(glowScale);
                                setDraftInterruptionThreshold(interruptionThreshold);
                                setDraftIsDemoMode(isDemoMode);
                                setActiveSettingsTab("");
                              }}
                              className="py-2.5 bg-neutral-955 hover:bg-neutral-900 border border-neutral-850 hover:border-red-500/20 text-neutral-450 hover:text-red-400 rounded-xl font-bold font-mono text-[9px] uppercase tracking-wider cursor-pointer transition-colors text-center inline-flex items-center justify-center gap-1"
                            >
                              <span>❌</span>
                              CANCEL
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsDarkMode(draftIsDarkMode);
                                setGlowScale(draftGlowScale);
                                setInterruptionThreshold(draftInterruptionThreshold);
                                setIsDemoMode(draftIsDemoMode);
                                setActiveSettingsTab("");
                                showNotification(
                                  "Design Settings Saved",
                                  "Interface colors and dynamic canvas visuals updated successfully.",
                                  "success"
                                );
                              }}
                              className="py-2.5 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-555 hover:to-indigo-450 text-white rounded-xl font-extrabold text-[9px] uppercase font-mono tracking-wider cursor-pointer transition-all text-center inline-flex items-center justify-center gap-1 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                            >
                              <span>💾</span>
                              SAVE DESIGN
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <button
                    onClick={() => {
                      setActiveSettingsTab(activeSettingsTab === "history" ? "" : "history");
                    }}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center justify-between w-full ${
                      activeSettingsTab === "history"
                        ? "bg-amber-500/10 text-amber-300 border border-amber-500/35 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                        : "text-neutral-500 hover:text-neutral-350 hover:bg-neutral-900/50 hover:border-amber-500/25 border border-neutral-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base select-none">📜</span>
                      <span>Session History</span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-300 shrink-0 ${
                        activeSettingsTab === "history" ? "rotate-180 text-amber-500" : "text-neutral-600"
                      }`}
                    />
                  </button>

                  {/* Animated dropdown configuration card just below the Session History tab */}
                  <AnimatePresence>
                    {activeSettingsTab === "history" && (
                      <motion.div
                        id="history-tab-optionscard"
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: "auto", opacity: 1, marginTop: 8 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="overflow-hidden w-full px-1 mb-2"
                      >
                        <div className={`space-y-4 p-5 rounded-2xl relative overflow-hidden backdrop-blur-md border ${isDarkMode ? "bg-[#090b11] border-amber-500/35 hover:border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]" : "bg-white border-amber-550/30 shadow-sm text-slate-900"}`}>
                          {/* Rich Website logs container */}
                          <div className={`border rounded-xl overflow-hidden shadow-md ${isDarkMode ? "border-amber-500/20 bg-neutral-950/40" : "border-amber-500/35 bg-slate-50"}`}>
                            <WebsiteLogs logs={websiteLogs} isDarkMode={isDarkMode} assistantName={assistantName} />
                          </div>

                          <div className="pt-2 border-t border-neutral-850/85">
                            <span className="text-[8.5px] font-mono text-neutral-450 block uppercase tracking-widest font-extrabold pb-2">
                              Advanced System Settings Matrix
                            </span>

                            <div className="space-y-1.5 font-mono text-[9px] text-neutral-400 bg-neutral-950/60 p-3 rounded-xl border border-neutral-850">
                              <div className="flex items-center justify-between py-0.5">
                                <span className="text-neutral-500">SYSTEM STATE:</span>
                                <span className="text-emerald-400 font-extrabold">{state.toUpperCase()}</span>
                              </div>
                              <div className="flex items-center justify-between py-0.5">
                                <span className="text-neutral-500">GATEWAY STREAM:</span>
                                <span className="text-cyan-400">secure-wss://live</span>
                              </div>
                              <div className="flex items-center justify-between py-0.5">
                                <span className="text-neutral-500">SAMPLING HZ:</span>
                                <span className="text-indigo-400">24kHz playback</span>
                              </div>
                            </div>
                          </div>

                          {/* Audio connection action */}
                          <button
                            id="drawer-hard-reset"
                            type="button"
                            onClick={() => {
                              handleTogglePower();
                            }}
                            className={`w-full py-2.5 rounded-xl font-bold font-mono text-[9.5px] uppercase tracking-wider select-none cursor-pointer transition-all border flex items-center justify-center gap-1.5 ${
                              state !== AssistantState.DISCONNECTED && state !== AssistantState.ERROR
                                ? "bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-500 hover:text-red-400"
                                : "bg-emerald-500 text-black hover:bg-emerald-400 border-transparent animate-pulse"
                            }`}
                          >
                            <span className="text-xs select-none">⚡</span>
                            {state !== AssistantState.DISCONNECTED && state !== AssistantState.ERROR
                              ? "TERMINATE WEB AUDIO STREAM"
                              : "LAUNCH SECURE GATEWAY"
                            }
                          </button>

                          {/* Close Button at bottom of card */}
                          <div className="pt-1 border-t border-neutral-850/40">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveSettingsTab(""); // Collapse!
                              }}
                              className="w-full py-2 bg-neutral-955 hover:bg-neutral-900 border border-neutral-850 text-neutral-405 hover:text-neutral-300 rounded-xl font-bold font-mono text-[9px] uppercase tracking-wider cursor-pointer transition-colors text-center inline-flex items-center justify-center gap-1"
                            >
                              <span>❌</span>
                              CLOSE PANEL
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Notification Details Tab */}
                  <button
                    onClick={() => {
                      setActiveSettingsTab(activeSettingsTab === "notifications" ? "" : "notifications");
                    }}
                    className={`py-2.5 px-4 mt-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center justify-between w-full ${
                      activeSettingsTab === "notifications"
                        ? "bg-rose-500/10 text-rose-300 border border-rose-500/35 shadow-[0_0_12px_rgba(244,63,94,0.15)]"
                        : "text-neutral-500 hover:text-neutral-350 hover:bg-neutral-900/50 hover:border-rose-500/25 border border-neutral-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base select-none">🔔</span>
                      <span>Notification Details</span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-300 shrink-0 ${
                        activeSettingsTab === "notifications" ? "rotate-180 text-rose-500" : "text-neutral-600"
                      }`}
                    />
                  </button>

                  {/* Animated dropdown container for Notification Details */}
                  <AnimatePresence>
                    {activeSettingsTab === "notifications" && (
                      <motion.div
                        id="notifications-tab-optionscard"
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: "auto", opacity: 1, marginTop: 8 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="overflow-hidden w-full px-1 mb-2"
                      >
                        <div className={`space-y-4 p-5 rounded-2xl relative overflow-hidden backdrop-blur-md border ${isDarkMode ? "bg-[#090b11] border-rose-500/35 hover:border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)]" : "bg-white border-rose-550/30 text-slate-900 shadow-sm"}`}>
                          <div className="flex items-center justify-between pb-2.5 border-b border-rose-500/20 mb-2">
                            <span className="text-[10px] font-extrabold text-rose-400 tracking-wider font-mono">NOTIFICATIONS ARCHIVE ({notifications.length})</span>
                            {notifications.length > 0 && (
                              <button
                                onClick={() => {
                                  setNotifications([]);
                                  showNotification("Console Log Purged", "Saved activity sequence successfully flushed.", "info");
                                }}
                                className="text-[8.5px] text-neutral-550 hover:text-red-400 uppercase font-extrabold cursor-pointer transition-all font-mono"
                              >
                                Clear All Logs
                              </button>
                            )}
                          </div>

                          <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-neutral-850">
                            {notifications.length === 0 ? (
                              <div className="py-12 text-center text-[10px] text-neutral-500 font-sans tracking-tight">
                                No historical notifications inside memory buffer.
                              </div>
                            ) : (
                              notifications.map((n) => {
                                let colorBorder = "border-sky-500/20 text-sky-450 bg-sky-500/5";
                                if (n.type === 'success') colorBorder = "border-emerald-500/20 text-emerald-450 bg-emerald-500/5";
                                if (n.type === 'warning') colorBorder = "border-red-500/20 text-red-150 bg-red-550/5";
                                if (n.type === 'tool') colorBorder = "border-purple-500/25 text-purple-400 bg-purple-500/5";

                                return (
                                  <div 
                                    key={n.id} 
                                    className={`p-3 rounded-xl border text-left text-[9.5px] relative flex flex-col gap-1.5 transition-all ${
                                      isDarkMode ? "bg-neutral-950/40 border-neutral-850 text-white" : "bg-slate-50 border-slate-150 text-slate-950"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1.5 font-sans font-bold">
                                        <span className={`px-1.5 py-0.5 rounded border text-[7px] font-mono tracking-wider uppercase font-extrabold ${colorBorder}`}>
                                          {n.type}
                                        </span>
                                        <span className={`text-[10px] font-extrabold ${isDarkMode ? "text-neutral-200" : "text-slate-800"}`}>
                                          {n.title}
                                        </span>
                                      </div>
                                      <span className="text-[7.5px] text-neutral-550 block font-mono">
                                        {n.timestamp instanceof Date ? n.timestamp.toLocaleTimeString() : new Date(n.timestamp).toLocaleTimeString()}
                                      </span>
                                    </div>
                                    <p className="text-neutral-400 font-sans leading-relaxed text-[9.5px]">
                                      {n.description}
                                    </p>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setNotifications((prev) => prev.filter((item) => item.id !== n.id));
                                      }}
                                      className="absolute top-3 right-3 text-neutral-600 hover:text-rose-455 cursor-pointer"
                                      title="Delete notification entry"
                                    >
                                      <X className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          <div className="pt-2 border-t border-rose-500/20">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveSettingsTab("");
                              }}
                              className="w-full py-2 bg-neutral-955 hover:bg-neutral-900 border border-neutral-850 text-neutral-405 hover:text-neutral-300 rounded-xl font-bold font-mono text-[9px] uppercase tracking-wider cursor-pointer transition-colors text-center inline-flex items-center justify-center gap-1"
                            >
                              <span>❌</span>
                              CLOSE PANEL
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Hardware Peripheral Settings (Positioned out in the open below stacked list) */}
                <div className={`p-4 rounded-2xl border transition-all select-none space-y-3 mt-2 ${isDarkMode ? "bg-neutral-950/70 border-neutral-850 hover:border-neutral-800" : "bg-slate-100/90 border-slate-200 hover:border-slate-300 shadow-sm"}`}>
                  <div className={`flex items-center gap-2 font-bold font-mono text-[11px] uppercase tracking-wider pb-2 border-b ${isDarkMode ? "text-neutral-200 border-neutral-850" : "text-slate-800 border-slate-205"}`}>
                    <span className="text-sm select-none">⚙️</span>
                    <span>Hardware & Interface Controls</span>
                  </div>

                  <div className="space-y-3">
                    {/* Online/Offline presence Switch */}
                    <div className={`flex items-center justify-between p-3 border rounded-xl transition-colors ${isDarkMode ? "bg-neutral-950/40 border-neutral-850 hover:border-neutral-800" : "bg-white border-slate-200 hover:border-slate-300"}`}>
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg flex items-center justify-center ${draftIsOnlineMode ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-450"}`}>
                          {draftIsOnlineMode ? <span className="text-[12px] select-none animate-pulse">📡</span> : <span className="text-[12px] select-none">🔌</span>}
                        </div>
                        <div className="space-y-0.5">
                          <span className={`text-[10px] font-bold font-sans block uppercase ${isDarkMode ? "text-neutral-200" : "text-slate-800"}`}>SYSTEM CONNECTION</span>
                          <span className="text-[8px] text-neutral-500 font-mono block uppercase">{draftIsOnlineMode ? "Workspace Online" : "Workspace Offline"}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const val = !draftIsOnlineMode;
                          setDraftIsOnlineMode(val);
                          setIsOnlineMode(val);
                        }}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          draftIsOnlineMode ? "bg-emerald-500" : "bg-neutral-805"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            draftIsOnlineMode ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Microphone On/Off Switch */}
                    <div className={`flex items-center justify-between p-3 border rounded-xl transition-colors ${isDarkMode ? "bg-neutral-950/40 border-neutral-850 hover:border-neutral-800" : "bg-white border-slate-200 hover:border-slate-300"}`}>
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg flex items-center justify-center ${draftIsMicEnabled ? "bg-[#38bdf8]/15 text-[#38bdf8]" : "bg-neutral-800 text-neutral-600"}`}>
                          {draftIsMicEnabled ? <span className="text-[12px] select-none">🎙️</span> : <span className="text-[12px] select-none">🔇</span>}
                        </div>
                        <div className="space-y-0.5">
                          <span className={`text-[10px] font-bold font-sans block uppercase ${isDarkMode ? "text-neutral-200" : "text-slate-800"}`}>MICROPHONE SENSOR</span>
                          <span className="text-[8px] text-neutral-500 font-mono block uppercase">{draftIsMicEnabled ? "Capture Active" : "Hardware Muted"}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const val = !draftIsMicEnabled;
                          setDraftIsMicEnabled(val);
                          setIsMicEnabled(val);
                        }}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          draftIsMicEnabled ? "bg-emerald-500" : "bg-neutral-805"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            draftIsMicEnabled ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Speaker On/Off Switch */}
                    <div className={`flex items-center justify-between p-3 border rounded-xl transition-colors ${isDarkMode ? "bg-[#000000]/40 border-neutral-850 hover:border-neutral-800" : "bg-white border-slate-200 hover:border-slate-300"}`}>
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg flex items-center justify-center ${draftIsSpeakerEnabled ? "bg-teal-500/10 text-teal-400" : "bg-neutral-800 text-neutral-600"}`}>
                          {draftIsSpeakerEnabled ? <span className="text-[12px] select-none">🔊</span> : <span className="text-[12px] select-none">🔇</span>}
                        </div>
                        <div className="space-y-0.5">
                          <span className={`text-[10px] font-bold font-sans block uppercase ${isDarkMode ? "text-neutral-200" : "text-slate-800"}`}>SPEAKER PLAYBACK</span>
                          <span className="text-[8px] text-neutral-500 font-mono block uppercase">{draftIsSpeakerEnabled ? "Audio Feed Enabled" : "Playback Silenced"}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const val = !draftIsSpeakerEnabled;
                          setDraftIsSpeakerEnabled(val);
                          setIsSpeakerEnabled(val);
                        }}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          draftIsSpeakerEnabled ? "bg-emerald-500" : "bg-neutral-805"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            draftIsSpeakerEnabled ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Interface Mode Light/Dark switch (4th switch) */}
                    <div className={`flex items-center justify-between p-3 border rounded-xl transition-colors ${isDarkMode ? "bg-neutral-950/40 border-neutral-850 hover:border-neutral-800" : "bg-white border-slate-200 hover:border-slate-300"}`}>
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg flex items-center justify-center ${draftIsDarkMode ? "bg-purple-500/10 text-purple-400" : "bg-amber-500/10 text-amber-550"}`}>
                          {draftIsDarkMode ? <span className="text-[12px] select-none">🌙</span> : <span className="text-[12px] select-none">☀️</span>}
                        </div>
                        <div className="space-y-0.5">
                          <span className={`text-[10px] font-bold font-sans block uppercase ${isDarkMode ? "text-neutral-200" : "text-slate-800"}`}>INTERFACE THEME</span>
                          <span className="text-[8px] text-neutral-500 font-mono block uppercase">{draftIsDarkMode ? "DARK MODE DEEP" : "LIGHT MODE GLOW"}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const val = !draftIsDarkMode;
                          setDraftIsDarkMode(val);
                          setIsDarkMode(val);
                        }}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          draftIsDarkMode ? "bg-emerald-500" : "bg-neutral-855"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            draftIsDarkMode ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* User Credentials & Details Section */}
                <div className="pt-2 border-t border-neutral-900">
                  <div className="p-3 bg-neutral-900/40 border border-neutral-850 rounded-2xl select-none">
                    {isUserLoggedIn ? (
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          {/* Rich glowing gradient profile container */}
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 via-teal-400 to-indigo-500 p-[1.5px] shadow-[0_0_10px_rgba(16,185,129,0.15)] select-none">
                            <div className="w-full h-full rounded-full bg-neutral-950 flex items-center justify-center">
                              <span className="text-[10px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-350 to-indigo-400 uppercase font-sans">
                                R
                              </span>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-[10px] font-extrabold text-neutral-200 tracking-wide font-sans block leading-tight">Rajat</h4>
                            <span className="text-[8px] text-neutral-500 font-mono block tracking-tight truncate max-w-[150px]">rajat9084666347@gmail.com</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setIsUserLoggedIn(false)}
                          className="px-2 py-1 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 text-[8px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                          title="Terminate Account login session"
                        >
                          <span className="text-[10px] select-none leading-none">🚪</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-2 space-y-2 text-center">
                        <div className="p-1.5 bg-neutral-950 rounded-full border border-neutral-850 text-neutral-600 flex items-center justify-center">
                          <span className="text-sm select-none animate-pulse">👤</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-neutral-400 block uppercase">SESSION INACTIVE</span>
                          <span className="text-[8px] text-neutral-605 font-mono block">Log back in to activate executive privileges</span>
                        </div>
                        <button
                          onClick={() => setIsUserLoggedIn(true)}
                          className="w-full py-1.5 bg-emerald-500 hover:bg-[#10b981]/90 text-black rounded-lg font-extrabold text-[8.5px] uppercase tracking-wider transition-colors select-none cursor-pointer"
                        >
                          REACTIVATE SESSION
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast notifications high-fidelity visual overlays */}
      <div className="fixed top-24 right-6 z-50 flex flex-col gap-2.5 max-w-[calc(100vw-3rem)] sm:max-w-sm pointer-events-none items-end">
        <AnimatePresence>
          {visibleToasts.map((toast) => {
            let iconColor = "text-sky-400 bg-sky-500/10";
            let IconC = Info;
            if (toast.type === "success") { IconC = CheckCircle; iconColor = "text-emerald-400 bg-emerald-500/10"; }
            else if (toast.type === "warning") { IconC = AlertTriangle; iconColor = "text-red-400 bg-red-500/10"; }
            else if (toast.type === "tool") { IconC = Cpu; iconColor = "text-purple-400 bg-purple-500/10"; }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 80, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.9 }}
                className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-2xl border w-[320px] max-w-full ${
                  isDarkMode 
                    ? "bg-[#070914e6] border-neutral-850 text-white shadow-black/80" 
                    : "bg-white/95 border-slate-200/95 text-slate-900 shadow-slate-200/50"
                } backdrop-blur-2xl`}
              >
                <div className={`p-2 rounded-lg flex-shrink-0 flex items-center justify-center ${iconColor}`}>
                  <IconC className="w-4 h-4" />
                </div>
                <div className="flex-grow min-w-0 space-y-0.5 mt-0.5">
                  <h4 className="text-[9.5px] uppercase font-mono font-extrabold tracking-wider text-emerald-400">
                    {toast.title}
                  </h4>
                  <p className="text-[9px] leading-relaxed text-neutral-400 font-sans font-medium">
                    {toast.description}
                  </p>
                </div>
                <button
                  onClick={() => setVisibleToasts((prev) => prev.filter((item) => item.id !== toast.id))}
                  className="text-neutral-500 hover:text-rose-455 transition-all p-1 cursor-pointer flex-shrink-0"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Corporate Admin Footer */}
      <footer className="relative z-20 w-full py-4 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] font-mono text-neutral-500">
          <div>
            &copy; 2026 {assistantName.toUpperCase()} ADMINISTRATIVE INTERFACE. PROPERTY OF CHIEF COMMAND CENTER. SECURE ACCESS PROTOCOL 45-B.
          </div>
          <div className="flex items-center gap-1.5 text-emerald-500">
            <span>AUDITED SYSTEM ENCRYPTED</span>
            <Heart className="w-3 h-3 fill-emerald-500" />
          </div>
        </div>
      </footer>
    </div>
  );
}
