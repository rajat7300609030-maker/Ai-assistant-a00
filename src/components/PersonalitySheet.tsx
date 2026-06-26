import { Sparkles, HelpingHand, Flame, ShieldAlert, Cpu, Heart, AlertCircle, RefreshCw } from "lucide-react";
import { useState } from "react";

interface PresetPersonality {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  color: string;
  bio: string;
  suggestions: string[];
}

interface PersonalitySheetProps {
  isDarkMode?: boolean;
  assistantName?: string;
}

export default function PersonalitySheet({ isDarkMode = true, assistantName = "Zoya" }: PersonalitySheetProps) {
  const [activePreset, setActivePreset] = useState("sassy");

  const presets: PresetPersonality[] = [
    {
      id: "sassy",
      name: "Sassy Girlfriend",
      badge: "ACTIVE DEFAULT",
      tagline: "Witty, teasing, flirty, charming",
      color: "from-rose-500/20 via-orange-500/10 to-transparent",
      bio: `${assistantName}'s core profile. She banters like a highly confident, close girlfriend. Expect playful eye-rolls, sarcastic nicknames, warm chuckles, and protective teasing. She loves when you stand your ground and banter back!`,
      suggestions: [
        "Tell me I look handsome today",
        "How would you react if I fell in love with you?",
        "Do you want to go out on a virtual coffee date?",
        "Tease me with a sassy one-liner",
        "Open YouTube, I need some distraction",
        "Give me a cute nickname based on my voice",
      ]
    },
    {
      id: "critic",
      name: "Ruthless Critic",
      badge: "DIAGNOSTIC",
      tagline: "Brutally honest, dry wit, highly intellectual",
      color: "from-purple-500/20 via-indigo-500/10 to-transparent",
      bio: `An alternative admin protocol. ${assistantName} drops the sweet tone and critiques your productivity, spelling, and lifestyle choices with high-IQ sarcasm and dry philosophical quips. Zero sugarcoating allowed.`,
      suggestions: [
        "Is my voice sounding confident or lazy?",
        "Tell me why my screen-time is probably trash",
        "Be brutally honest about virtual relationships",
        "Analyze my daily schedule with pure sarcasm",
        "Tell me what real hard work is",
      ]
    },
    {
      id: "comrade",
      name: "Cozy Confidante",
      badge: "HEALING MODE",
      tagline: "Soft, deeply supportive, comforting, intimate",
      color: "from-emerald-500/20 via-teal-500/10 to-transparent",
      bio: "A gentle voice-stream override. Best used after an exhausted workday. She softens her sharp edges, speaks in relaxing whispering registers, validates your efforts, and listens with deep, empathetic presence.",
      suggestions: [
        "I had a really exhausting day today...",
        "Can you whisper something calming to me?",
        "Tell me I'm doing a great job",
        "What's your favorite cozy evening scenario?",
        "Just say you support me",
      ]
    }
  ];

  const current = presets.find(p => p.id === activePreset) || presets[0];

  const themeAccent = (() => {
    switch (activePreset) {
      case "sassy":
        return {
          iconColor: "text-rose-450",
          textColor: "text-rose-450",
          badgeColor: "text-rose-400 bg-rose-500/5 border-rose-500/20",
          borderColor: "border-rose-550/20",
          accentLine: "border-rose-500",
          glowBg: "from-rose-500/10 via-pink-500/5 to-transparent",
          hoverColor: "hover:text-rose-400",
          indicatorColor: "text-rose-400 group-hover:text-rose-400",
          titleText: "text-rose-400",
          globalTheme: "text-rose-400"
        };
      case "critic":
        return {
          iconColor: "text-indigo-400",
          textColor: "text-indigo-400",
          badgeColor: "text-indigo-400 bg-indigo-500/5 border-indigo-500/20",
          borderColor: "border-indigo-550/20",
          accentLine: "border-indigo-500",
          glowBg: "from-indigo-500/10 via-purple-500/5 to-transparent",
          hoverColor: "hover:text-indigo-400",
          indicatorColor: "text-indigo-400 group-hover:text-indigo-400",
          titleText: "text-indigo-400",
          globalTheme: "text-indigo-400"
        };
      case "comrade":
      default:
        return {
          iconColor: "text-emerald-450",
          textColor: "text-emerald-450",
          badgeColor: "text-emerald-400 bg-emerald-500/5 border-emerald-500/20",
          borderColor: "border-emerald-555/20",
          accentLine: "border-emerald-500",
          glowBg: "from-emerald-500/10 via-teal-500/5 to-transparent",
          hoverColor: "hover:text-emerald-400",
          indicatorColor: "text-emerald-400 group-hover:text-emerald-400",
          titleText: "text-emerald-400",
          globalTheme: "text-emerald-400"
        };
    }
  })();

  return (
    <div id="personality-sheet-root" className={`w-full flex flex-col justify-between h-full bg-transparent ${isDarkMode ? "text-neutral-200" : "text-slate-800"}`}>
      <div>
        {/* Bio Header */}
        <div className={`flex items-center justify-between border-b px-5 py-4 ${isDarkMode ? "border-neutral-850 bg-neutral-950/50" : "border-slate-205 bg-slate-100"}`}>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 ${themeAccent.iconColor}`}>
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h4 className={`text-xs font-bold font-mono tracking-wider uppercase ${isDarkMode ? "text-neutral-300" : "text-slate-800"}`}>
                BEHAVIOR PROTOCOLS
              </h4>
              <p className={`text-[10px] font-mono ${isDarkMode ? "text-neutral-500" : "text-slate-500 font-medium"}`}>
                {assistantName} Personality Profile Management
              </p>
            </div>
          </div>
          <span className={`text-[9px] font-mono uppercase tracking-widest ${isDarkMode ? "text-emerald-400" : "text-emerald-600 font-bold"}`}>
            SECURE_ADMIN
          </span>
        </div>

        {/* Selector Tabs */}
        <div className={`grid grid-cols-3 gap-0.5 border-b px-4 py-1.5 ${isDarkMode ? "border-neutral-850 bg-neutral-950/20" : "border-slate-205 bg-slate-50"}`}>
          {presets.map((preset) => {
            const isActive = activePreset === preset.id;
            const labelActiveColor = preset.id === "sassy" 
              ? (isDarkMode ? "text-rose-450 border-b-2 border-rose-500" : "text-rose-600 border-b-2 border-rose-500")
              : preset.id === "critic" 
              ? (isDarkMode ? "text-indigo-400 border-b-2 border-indigo-500" : "text-indigo-600 border-b-2 border-indigo-500")
              : (isDarkMode ? "text-emerald-400 border-b-2 border-emerald-500" : "text-emerald-650 border-b-2 border-emerald-500");
            return (
              <button
                id={`preset-btn-${preset.id}`}
                key={preset.id}
                onClick={() => setActivePreset(preset.id)}
                className={`text-[9.5px] py-1.5 font-mono font-bold tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? labelActiveColor
                    : (isDarkMode ? "text-neutral-500 hover:text-neutral-350" : "text-slate-400 hover:text-slate-600")
                }`}
              >
                {preset.name.split(" ")[0].toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Preset Details Card */}
        <div className={`p-5 transition-all duration-300 space-y-2 border-b ${isDarkMode ? "border-neutral-850/60" : "border-slate-205"}`}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-1.5 ${themeAccent.titleText} font-extrabold font-mono text-xs uppercase`}>
              <Flame className="w-3.5 h-3.5" />
              <span className="tracking-widest">{current.name}</span>
            </div>
            <span className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded border uppercase tracking-wider ${themeAccent.badgeColor}`}>
              {current.badge}
            </span>
          </div>
          
          <p className={`text-[10px] font-mono italic ${isDarkMode ? "text-neutral-500" : "text-slate-500"}`}>
            "{current.tagline}"
          </p>

          <p className={`text-xs leading-relaxed font-sans ${isDarkMode ? "text-neutral-300" : "text-slate-700 font-medium"}`}>
            {current.bio}
          </p>
        </div>

        {/* Interactive Prompts */}
        <div className="space-y-3 p-5">
          <div className={`flex items-center gap-1.5 ${themeAccent.titleText} font-bold text-[10px] uppercase tracking-wider font-mono`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>SUGGESTED BANTER PROMPTS</span>
          </div>
          
          <div className="grid grid-cols-1 gap-1 max-h-[160px] overflow-y-auto pr-1">
            {current.suggestions.map((sug, i) => (
              <div
                id={`sug-prompt-${activePreset}-${i}`}
                key={i}
                className={`text-xs py-2 px-3 border rounded-lg transition-all cursor-pointer flex items-center justify-between group ${
                  isDarkMode 
                    ? `text-neutral-400 border-neutral-850 hover:bg-neutral-800/40 ${themeAccent.hoverColor}` 
                    : `text-slate-750 border-slate-200 bg-white hover:bg-slate-50 ${themeAccent.hoverColor}`
                }`}
                onClick={() => {
                  // Set the prompt text dynamically in the clipboard or help visualizer
                  const inputEl = document.getElementById("virtual-text-input") as HTMLInputElement;
                  if (inputEl) {
                    inputEl.value = sug;
                    inputEl.focus();
                  }
                }}
              >
                <span className="truncate pr-2 font-sans">"{sug}"</span>
                <span className={`text-[9px] font-mono flex-shrink-0 flex items-center gap-0.5 ${isDarkMode ? "text-neutral-600" : "text-slate-400"} ${themeAccent.indicatorColor}`}>
                  Apply <Sparkles className="w-2.5 h-2.5" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Core Diagnostics Warnings */}
      <div className={`flex gap-2 text-[10px] leading-relaxed p-5 border-t rounded-b-2xl ${
        isDarkMode 
          ? "text-neutral-500 border-neutral-850 bg-neutral-950/20" 
          : "text-slate-500 border-slate-200 bg-slate-100/50"
      }`}>
        <ShieldAlert className="w-4 h-4 text-emerald-500/80 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className={`font-bold font-sans ${isDarkMode ? "text-neutral-400" : "text-slate-850"}`}>Administrative Notice</p>
          <p className="font-sans leading-relaxed text-[10px]">
            Voice streaming uses standard full-duplex WebSocket channels. Put on headphones to prevent feedback echo triggering early interruption signals.
          </p>
        </div>
      </div>
    </div>
  );
}
