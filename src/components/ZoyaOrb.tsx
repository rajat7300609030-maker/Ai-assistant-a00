import { motion } from "motion/react";
import { AssistantState } from "../types";
import { Mic, MicOff, Power, RefreshCw, Volume2, Radio } from "lucide-react";

interface ZoyaOrbProps {
  state: AssistantState;
  userVolume: number;
  zoyaVolume: number;
  onTogglePower: () => void;
  errorMessage?: string;
  glowScale?: number; // Real working visual parameter driven by admin controllers!
  isDarkMode?: boolean;
  assistantName?: string;
}

export default function ZoyaOrb({
  state,
  userVolume,
  zoyaVolume,
  onTogglePower,
  errorMessage,
  glowScale = 1.0,
  isDarkMode = true,
  assistantName = "Zoya",
}: ZoyaOrbProps) {
  // Premium operational color specs matching top-tier administrative rigs
  const theme = (() => {
    switch (state) {
      case AssistantState.CONNECTING:
        return {
          core: "bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-500 hover:from-purple-500 hover:to-indigo-400 shadow-[0_0_60px_rgba(168,85,247,0.85)] border border-purple-400/35",
          ring: isDarkMode ? "border-purple-500/40" : "border-purple-400/60",
          glow: "rgba(168,85,247,0.35)",
          statusTag: isDarkMode 
            ? "border-purple-500/30 bg-purple-500/10 text-purple-300"
            : "border-purple-300/80 bg-purple-50 text-purple-600 font-bold",
          eqBar: "bg-purple-400",
        };
      case AssistantState.IDLE:
        return {
          core: "bg-gradient-to-tr from-emerald-500 via-teal-600 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 shadow-[0_0_60px_rgba(16,185,129,0.8)] border border-emerald-450/35",
          ring: isDarkMode ? "border-emerald-500/40" : "border-emerald-400/60",
          glow: "rgba(16,185,129,0.3)",
          statusTag: isDarkMode 
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
            : "border-emerald-300/80 bg-emerald-50 text-emerald-600 font-bold",
          eqBar: "bg-emerald-400",
        };
      case AssistantState.LISTENING:
        return {
          core: "bg-gradient-to-tr from-rose-500 via-pink-600 to-orange-500 hover:from-rose-450 hover:to-orange-450 shadow-[0_0_70px_rgba(244,63,94,0.95)] border border-rose-400/35",
          ring: isDarkMode ? "border-rose-500/45" : "border-rose-400/60",
          glow: "rgba(244,63,94,0.45)",
          statusTag: isDarkMode 
            ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
            : "border-rose-300/80 bg-rose-50 text-rose-600 font-bold",
          eqBar: "bg-rose-400",
        };
      case AssistantState.SPEAKING:
        return {
          core: "bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 hover:from-amber-450 hover:to-orange-450 shadow-[0_0_85px_rgba(245,158,11,1)] border border-amber-400/35",
          ring: isDarkMode ? "border-amber-500/50" : "border-amber-400/60",
          glow: "rgba(245,158,11,0.55)",
          statusTag: isDarkMode 
            ? "border-amber-500/35 bg-amber-500/10 text-amber-300"
            : "border-amber-300/80 bg-amber-50 text-amber-600 font-bold",
          eqBar: "bg-amber-400",
        };
      case AssistantState.ERROR:
        return {
          core: "bg-gradient-to-tr from-red-600 via-rose-600 to-orange-600 hover:from-red-500 hover:to-rose-500 shadow-[0_0_50px_rgba(220,38,38,0.85)] border border-red-500/35",
          ring: isDarkMode ? "border-red-500/40" : "border-red-405/60",
          glow: "rgba(220,38,38,0.35)",
          statusTag: isDarkMode 
            ? "border-red-500/30 bg-red-500/10 text-red-300"
            : "border-red-300 bg-red-50 text-red-600 font-bold",
          eqBar: "bg-red-400",
        };
      case AssistantState.DISCONNECTED:
      default:
        return {
          core: isDarkMode
            ? "bg-gradient-to-tr from-neutral-900 via-slate-900 to-neutral-950 hover:from-neutral-850 hover:to-neutral-900 border border-neutral-800/80 shadow-[0_0_20px_rgba(255,255,255,0.03)]"
            : "bg-gradient-to-tr from-slate-100 via-slate-200 to-slate-200 hover:from-slate-50 hover:to-slate-150 border border-slate-300/80 shadow-[0_4px_12px_rgba(0,0,0,0.05)]",
          ring: isDarkMode ? "border-neutral-800" : "border-slate-300",
          glow: isDarkMode ? "rgba(255,255,255,0.01)" : "rgba(15,23,42,0.02)",
          statusTag: isDarkMode 
            ? "border-neutral-800 bg-neutral-950 text-neutral-500"
            : "border-slate-200 bg-slate-100 text-slate-500 font-bold",
          eqBar: isDarkMode ? "bg-neutral-750" : "bg-slate-300",
        };
    }
  })();

  // Real voice level calculation from state inputs
  const currentVolume = state === AssistantState.SPEAKING
    ? zoyaVolume
    : state === AssistantState.LISTENING
    ? userVolume
    : 0;

  // Responsive scaling formula fueled by live audio signals AND admin parameter overrides!
  const soundMultiplier = 1 + Math.min(currentVolume * 3.8, 0.85);
  const scaleValue = soundMultiplier * glowScale;

  // State descriptions optimized for clean, high-tech admin operations
  const getStatusReadout = () => {
    switch (state) {
      case AssistantState.CONNECTING:
        return {
          title: `${assistantName.toUpperCase()}LINK_SYNCING`,
          subtitle: "Establishing secure voice pipeline over WebSocket gateways...",
        };
      case AssistantState.IDLE:
        return {
          title: "STANDBY_READY",
          subtitle: "Mic loop armed. Conversation is awaiting administrative audio input.",
        };
      case AssistantState.LISTENING:
        return {
          title: "NODE_CAPTURING",
          subtitle: "Sampling your mic at 16,000Hz. Speak clearly, Admin.",
        };
      case AssistantState.SPEAKING:
        return {
          title: "NEURAL_BROADCASTING",
          subtitle: "Streaming high-fidelity 24,000Hz speech response. Listening paused.",
        };
      case AssistantState.ERROR:
        return {
          title: "CHANNEL_EXCEPTION",
          subtitle: errorMessage || "Security session initialization timed out.",
        };
      case AssistantState.DISCONNECTED:
      default:
        return {
          title: "CHANNEL_OFFLINE",
          subtitle: `Access token safe. Press the central command core to initialize ${assistantName}.`,
        };
    }
  };

  const status = getStatusReadout();

  // Create an array to map high-fidelity mock frequency equalizers (react to actual amplitude)
  const barsCount = 24;
  const generateHeights = (idx: number) => {
    if (state === AssistantState.DISCONNECTED || state === AssistantState.CONNECTING) return 4;
    const baseVal = Math.sin(idx * 0.4) * 11 + 14;
    const noise = Math.random() * 8;
    return Math.max(4, Math.min(38, (baseVal + noise) * (currentVolume * 3.6 + 0.15)));
  };

  return (
    <div id="zoya-orb-root" className="w-full flex flex-col items-center justify-center relative overflow-hidden">
      

      <div className="absolute top-0 right-0 text-[8.5px] font-mono select-none">
        <span className={`px-2 py-0.5 rounded border ${theme.statusTag}`}>
          SYS: {state.toUpperCase()}
        </span>
      </div>

      {/* Visualizer Stage Container */}
      <div className="relative flex items-center justify-center w-72 h-72 select-none mt-6">
        {/* Glowing visual ambient core halo */}
        {state !== AssistantState.DISCONNECTED && (
          <motion.div
            className="absolute rounded-full w-64 h-64 filter blur-3xl opacity-35"
            style={{ backgroundColor: theme.glow }}
            animate={{
              scale: [1, 1.35 * scaleValue, 0.9, 1],
            }}
            transition={{
              duration: state === AssistantState.SPEAKING ? 1.2 : 2.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Triple Orbital Vector Rings */}
        {state !== AssistantState.DISCONNECTED && (
          <>
            {/* Outermost Ring */}
            <motion.div
              className={`absolute rounded-full border-2 ${theme.ring} w-68 h-68 flex items-center justify-center`}
              animate={{
                scale: [1, 1.45 * scaleValue, 1],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            {/* Secondary Interlocking Ring */}
            <motion.div
              className={`absolute rounded-full border border-dashed ${theme.ring} w-56 h-56 flex items-center justify-center`}
              animate={{
                scale: [1, 1.22 * scaleValue, 1],
                rotate: 360,
              }}
              transition={{
                scale: {
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                rotate: {
                  duration: 16,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
            />
            {/* Innermost Kinetic Ring */}
            <motion.div
              className={`absolute rounded-full border ${theme.ring} w-48 h-48`}
              animate={{
                scale: [1, 1.08 * scaleValue, 1],
                rotate: -360,
              }}
              transition={{
                scale: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                rotate: {
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
            />
          </>
        )}

        {/* Central Tactical Trigger Core Button */}
        <motion.button
          id="central-orb-button"
          onClick={onTogglePower}
          className={`relative z-10 flex flex-col items-center justify-center rounded-full w-40 h-40 cursor-pointer transition-all duration-300 ${theme.core}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          style={{ transformOrigin: "center" }}
        >
          {/* Internal fluid feedback layer */}
          {state === AssistantState.SPEAKING && (
            <motion.div
              className="absolute inset-0 rounded-full bg-amber-400/20"
              animate={{
                scale: [1, 1.28, 1],
              }}
              transition={{
                duration: 0.55,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}

          {/* Central Status Icon and Visual Tags */}
          <div className="z-20 text-white flex flex-col items-center gap-1.5 select-none text-center px-4">
            {state === AssistantState.DISCONNECTED && (
              <>
                <Power className="w-8 h-8 text-neutral-500 drop-shadow mb-1 animate-pulse" />
                <span className="text-[10px] uppercase tracking-widest font-mono text-neutral-400 font-bold">BOOT {assistantName.toUpperCase()}LINK</span>
                <span className="text-[8px] font-mono text-neutral-600">STATE: STANDBY</span>
              </>
            )}
            {state === AssistantState.CONNECTING && (
              <>
                <RefreshCw className="w-8 h-8 animate-spin text-purple-300 mb-1" />
                <span className="text-[10px] uppercase tracking-widest font-mono text-purple-200 font-bold">SYSLINK UP</span>
                <span className="text-[8px] font-mono text-purple-400">INIT PROTOCOL</span>
              </>
            )}
            {state === AssistantState.IDLE && (
              <>
                <Volume2 className="w-8 h-8 text-emerald-100 mb-1" />
                <span className="text-[10px] uppercase tracking-widest font-mono text-emerald-200 font-extrabold">NODE ONLINE</span>
                <span className="text-[8px] font-mono text-emerald-400">WAITING_COMMAND</span>
              </>
            )}
            {state === AssistantState.LISTENING && (
              <>
                <Mic className="w-8 h-8 text-rose-100 animate-pulse mb-1" />
                <span className="text-[10px] uppercase tracking-widest font-mono text-rose-200 font-extrabold">STREAM ACTIVE</span>
                <span className="text-[8px] font-mono text-rose-400">SPEAK TO {assistantName.toUpperCase()}</span>
              </>
            )}
            {state === AssistantState.SPEAKING && (
              <>
                <Volume2 className="w-8 h-8 text-amber-500 mb-1 animate-bounce" />
                <span className="text-[10px] uppercase tracking-widest font-mono text-amber-100 font-extrabold">VOICE FEED</span>
                <span className="text-[8px] font-mono text-amber-400">TRANSMITTING...</span>
              </>
            )}
            {state === AssistantState.ERROR && (
              <>
                <MicOff className="w-8 h-8 text-red-200 mb-1" />
                <span className="text-[10px] uppercase tracking-widest font-mono text-red-300 font-bold">REBOOT NODE</span>
                <span className="text-[8px] font-mono text-red-400">DISCONNECTED</span>
              </>
            )}
          </div>
        </motion.button>
      </div>

      {/* CSS Equalizer Audio Waveform Telemetry */}
      {state !== AssistantState.DISCONNECTED && (
        <div className="flex items-end justify-center gap-[3px] h-10 w-full max-w-sm mt-3 px-4 transition-all">
          {Array.from({ length: barsCount }).map((_, i) => (
            <motion.div
              key={i}
              className={`w-[3px] rounded-full bg-gradient-to-t transition-all duration-100 ${
                state === AssistantState.SPEAKING 
                  ? "from-amber-500 via-orange-500 to-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]" 
                  : state === AssistantState.LISTENING 
                  ? "from-rose-500 via-pink-500 to-indigo-600 shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                  : state === AssistantState.CONNECTING
                  ? "from-purple-500 to-indigo-500"
                  : "from-emerald-500 to-cyan-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
              }`}
              animate={{
                height: generateHeights(i),
              }}
              style={{ transformOrigin: "bottom" }}
            />
          ))}
        </div>
      )}

      {/* Diagnostic Labels */}
      <div className="text-center mt-4 max-w-sm px-4">
        <h3 className={`text-base font-extrabold tracking-widest font-mono uppercase bg-clip-text text-transparent bg-gradient-to-r ${
          state === AssistantState.IDLE ? "from-emerald-400 via-teal-400 to-cyan-400" :
          state === AssistantState.LISTENING ? "from-rose-400 via-pink-400 to-orange-400 animate-pulse" :
          state === AssistantState.SPEAKING ? "from-amber-400 via-orange-400 to-rose-400 animate-pulse" :
          state === AssistantState.CONNECTING ? "from-purple-400 via-violet-400 to-indigo-400" :
          state === AssistantState.ERROR ? "from-red-400 via-rose-500 to-orange-500" :
          "from-neutral-400 via-slate-500 to-neutral-500"
        } inline-block`}>
          {status.title}
        </h3>
        <p className={`text-xs mt-2 font-sans leading-relaxed tracking-normal ${isDarkMode ? "text-neutral-400" : "text-slate-600 font-medium"}`}>
          {status.subtitle}
        </p>
      </div>
    </div>
  );
}
