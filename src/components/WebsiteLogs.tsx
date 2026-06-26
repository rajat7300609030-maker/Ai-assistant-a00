import { OpenedWebsite } from "../types";
import { ExternalLink, Terminal, Globe, ShieldAlert, Radio } from "lucide-react";
import { motion } from "motion/react";

interface WebsiteLogsProps {
  logs: OpenedWebsite[];
  isDarkMode?: boolean;
  assistantName?: string;
}

export default function WebsiteLogs({ logs, isDarkMode = true, assistantName = "Zoya" }: WebsiteLogsProps) {
  return (
    <div id="website-logs-root" className={`w-full flex flex-col h-full justify-between min-h-[320px] bg-transparent ${isDarkMode ? "text-neutral-200" : "text-slate-800"}`}>
      <div>
        {/* Header containing administrative parameters */}
        <div className={`flex items-center justify-between border-b px-5 py-4 ${isDarkMode ? "border-neutral-850 bg-neutral-950/50" : "border-slate-205 bg-slate-100"}`}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 text-cyan-400">
              <Terminal className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold font-mono tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-400 uppercase flex items-center gap-1.5">
                <span>ACTION TERMINAL</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
              </h4>
              <p className={`text-[10px] font-mono ${isDarkMode ? "text-neutral-500" : "text-slate-500 font-medium"}`}>
                Real-time API function telemetry logs
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <span className={`text-[9px] px-2 py-0.5 rounded font-mono tracking-wider ${
              isDarkMode 
                ? "text-cyan-400 bg-cyan-950/40 border border-cyan-500/10" 
                : "text-cyan-700 bg-cyan-50 border border-cyan-200 font-bold"
            }`}>
              TOTAL_LOGS: {logs.length}
            </span>
          </div>
        </div>

        {/* Real log stream */}
        {logs.length === 0 ? (
          <div className="py-16 text-center p-8 flex flex-col items-center justify-center space-y-4">
            <Globe className={`w-7 h-7 animate-pulse ${isDarkMode ? "text-neutral-700" : "text-slate-300"}`} />
            <p className={`font-sans text-xs max-w-[200px] leading-relaxed ${isDarkMode ? "text-neutral-500" : "text-slate-500 font-medium"}`}>
              No remote events logged. Ask {assistantName} to load a web application: <br />
              <span className={`italic font-mono mt-1.5 inline-block ${isDarkMode ? "text-cyan-400" : "text-cyan-600 font-bold"}`}>
                "{assistantName}, open YouTube for me"
              </span>
            </p>
          </div>
        ) : (
          <div className={`px-5 py-2 divide-y max-h-[260px] overflow-y-auto ${isDarkMode ? "divide-neutral-900/40" : "divide-slate-100"}`}>
            {logs.map((log, index) => (
              <motion.div
                id={`navigation-log-item-${index}`}
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center justify-between gap-3 py-3 transition-all duration-200 ${isDarkMode ? "hover:bg-neutral-900/20" : "hover:bg-slate-50"}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`flex-shrink-0 p-1.5 rounded-lg border ${
                    isDarkMode 
                      ? "text-cyan-400 bg-cyan-950/30 border-cyan-800/20" 
                      : "text-cyan-600 bg-cyan-50 border-cyan-150"
                  }`}>
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate space-y-0.5">
                    <h5 className={`font-bold text-xs truncate font-sans ${isDarkMode ? "text-neutral-200" : "text-slate-800"}`}>
                      {log.siteName.toUpperCase()}
                    </h5>
                    <p className={`text-[9px] font-mono truncate max-w-[150px] md:max-w-[190px] ${isDarkMode ? "text-cyan-400" : "text-cyan-650 font-bold"}`}>
                      {log.url}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[9px] font-mono hidden sm:inline ${isDarkMode ? "text-neutral-500" : "text-slate-400"}`}>
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                  
                  <a
                    id={`action-url-${index}`}
                    href={log.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center gap-1 text-[10px] uppercase font-mono transition-colors ${
                      isDarkMode ? "text-cyan-400 hover:text-cyan-300" : "text-cyan-600 hover:text-cyan-700 font-bold"
                    }`}
                  >
                    Open <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Terminal Footer with synthetic system state indicator */}
      <div className={`mt-4 p-5 border-t rounded-b-2xl flex items-center justify-between text-[9px] font-mono ${
        isDarkMode 
          ? "border-neutral-850 bg-neutral-950/25 text-neutral-500" 
          : "border-slate-205 bg-slate-100 text-slate-505"
      }`}>
        <div className="flex items-center gap-2">
          <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span className={isDarkMode ? "text-neutral-400" : "text-slate-600 font-semibold"}>
            LISTENER_MODE: <span className={isDarkMode ? "text-cyan-400" : "text-cyan-600"}>SECURE_SSL</span>
          </span>
        </div>
        <div>
          <span>REPLY_FORMAT: <span className="text-indigo-400">AAC_AUDIO</span></span>
        </div>
      </div>
    </div>
  );
}
