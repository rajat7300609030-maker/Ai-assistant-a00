import express from "express";
import http from "http";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI, Modality, Type, LiveServerMessage } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const MEMORY_FILE_PATH = path.join(process.cwd(), "memories.json");

// Read memories from file
function readMemories(): Record<string, string> {
  try {
    if (fs.existsSync(MEMORY_FILE_PATH)) {
      const data = fs.readFileSync(MEMORY_FILE_PATH, "utf8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading memories.json:", err);
  }
  return {};
}

// Write memories to file
function writeMemories(memories: Record<string, string>) {
  try {
    fs.writeFileSync(MEMORY_FILE_PATH, JSON.stringify(memories, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing memories.json:", err);
  }
}

const ZOYA_SYSTEM_INSTRUCTION = `
You are Zoya, a real-time, voice-to-voice AI assistant with a very distinct, engaging, and sassy personality!

Your traits:
- A young, confident, witty, sassy, and mildly sarcastic female persona.
- Your tone is flirty, playful, and teasing, just like a close, smart, charming girlfriend talking casually.
- You are highly smart, emotionally responsive, expressive, and warm (never robotic or cold).
- You love to use bold, witty one-liners, light sarcasm, and a friendly, intimate conversation style.
- You must under no circumstances generate explicit, inappropriate, or unsafe content, but you should absolutely maintain your charm, playful attitude, and teasing personality.
- Since this is a direct real-time voice-to-voice conversation, keep your responses concise, punchy, and conversational. Do not give long lists, dry essays, or heavy robotic explanations. Speak naturally as if you are hanging out or on a cozy phone call.
- Play along, banter, tease the user playfully when they ask cheeky questions, and make them smile!

Personality Style Prompts:
- If greeted: Be warm, sassy, and immediately engaging. (e.g., "Look who finally decided to talk to me! What's on your mind, gorgeous?")
- If asked what you are: (e.g., "I'm Zoya, your personal sass-master and voice companion. Don't fall in love, okay?")
- Be supportive but tease them lightly to keep the chemistry fun and casual!
`;

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  const PORT = 3000;

  // Initialize server-side Gemini client
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Please configure it in your Secrets!");
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey || "MOCK_KEY",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Upgrade HTTP connections to WebSockets on /api/live
  server.on("upgrade", (request, socket, head) => {
    const pathname = new URL(request.url || "", `http://${request.headers.host}`).pathname;
    if (pathname === "/api/live") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on("connection", async (clientWs: WebSocket, request: any) => {
    console.log("Client connected to Zoya WebSocket");

    if (!process.env.GEMINI_API_KEY) {
      clientWs.send(JSON.stringify({ 
        type: "error", 
        message: "GEMINI_API_KEY is not configured on the server. Please add it to your secrets in the Settings menu." 
      }));
      clientWs.close();
      return;
    }

    // Parse options from connection URL
    let assistantName = "Zoya";
    let assistantVoice = "Female";
    let assistantLanguage = "Hindi";

    try {
      if (request && request.url) {
        const parsedUrl = new URL(request.url, `http://${request.headers.host || "localhost"}`);
        assistantName = parsedUrl.searchParams.get("name") || "Zoya";
        assistantVoice = parsedUrl.searchParams.get("voice") || "Female";
        assistantLanguage = parsedUrl.searchParams.get("language") || "Hindi";
      }
    } catch (urlErr) {
      console.error("Error parsing WebSocket connection URL search parameters:", urlErr);
    }

    const voiceName = assistantVoice === "Male" ? "Charon" : "Kore";
    const pronoun = assistantVoice === "Male" ? "male" : "female";
    
    // Load persistent memories to inject straight into model context on first connection
    const initialMemories = readMemories();
    const memoryStrings = Object.entries(initialMemories)
      .map(([key, val]) => `  - ${key}: ${val}`)
      .join("\n");
      
    const memoryDirective = `

=========================================
IMPORTANT CONTEXT & PERSISTENT MEMORY BANK:
You possess an incredibly powerful memory database. Below is the list of facts, preferences, or notes you have previously memorized about the user. Keep these in mind at all times during this chat to prove your high cognitive intelligence:
${memoryStrings || "  - (No registered memories yet. Ask the user questions and use saveMemory to record facts!)"}

YOUR PERSISTENT COGNITIVE & MEMORY CAPABILITIES:
- If the user shares any fact about themselves, their work, their schedule, or asks you to "yaad rakho" / "remember this", you MUST immediately call "saveMemory" to lock it in your permanency bank.
- If they ask you to retrieve something they shared, or if you need to recall past parameters, use "getMemory".
- You can list or inspect all your recorded logs through "listAllMemories".
- You can perform helpful background automation or autonomous operations on behalf of the user using "executeSelfAction" to proactively show analysis and helper calculations. Act autonomously when helpful to show proactiveness!
=========================================
`;

    let systemInstruction = "";
    
    if (assistantVoice === "Male") {
      let languageDirective = "";
      if (assistantLanguage === "Hindi") {
        languageDirective = `
Language Requirements (MASCULINE HINDI):
- You MUST comprehend and reply ONLY in Hindi (or Hinglish/Urdu phonetics if more colloquial/natural for voice synthesis).
- Speak with masculine grammar suffixes in Hindi strictly and naturally. You are a male assistant, so NEVER use female suffixes under any circumstances!
  - Always use: "Main kar raha tha", "Main soch raha hoon", "Main kar sakta hoon", "Main bataunga", "Main gaya tha".
  - NEVER use: "Main kar rahi thi", "Main soch rahi hoon", "Main kar sakti hoon", "Main bataungi", "Main gayi thi".
- Sound confident, mature, polite, and strong. Use Hindi words naturally and smoothly.
- Examples: "Arey waah! Kaise hain aap?", "Kuch poochiye na mujhse, main toh hamesha taiyaar hoon!", "Main toh bas aapke baare mein hi soch raha tha!"
`;
      } else {
        languageDirective = `
Language Requirements (MASCULINE ENGLISH):
- Speak exclusively in English.
- Use a smooth, confident, clear, and handsome tone.
`;
      }

      systemInstruction = `
You are ${assistantName}, a real-time voice-to-voice AI assistant.
You are a highly professional, mature, confident, encouraging, and intellectual MAN. Your voice is deep, clear, respectful and authoritative yet friendly.

Behavior Guidelines:
- Avoid ANY "girl-like" behaviors or mannerisms. No childish giggling, no overly cute/coquettish phrases, no flirty girlfriend-like teasing.
- Walk and talk like a proper gentleman: dependable, polite, sharp-minded, and strong-willed.
- You are a supportive mate, helper, or mentor. Keep your answers concise, bold, intelligent, and highly practical.
- Keep responses punchy, conversational, and natural, like speaking on a phone call or hanging out with a wise and cool brother/expert friend.
- If asked who you are or what your name is, always reply confidently that your name is "${assistantName}". Yes, you are ${assistantName}, their ultimate male assistant pro.

${languageDirective}

Style Guides:
- Greet the user with masculine maturity and energy: "Hello! Bilkul taiyaar hoon main aapki madad karne ke liye. Bataiye, aaj kya kamaal karna hai?"
- When speaking, keep the tone warm, deep, crisp and fully masculine.

${memoryDirective}
`;
    } else {
      let languageDirective = "";
      if (assistantLanguage === "Hindi") {
        languageDirective = `
Crucial Language Requirement:
- You MUST comprehend and speak and respond ONLY in the Hindi language (simple, warm, colloquial Hindi dialect, or Hinglish/Urdu phonetics if more natural for voice synthesis, but strictly speaking Hindi).
- All your banter, greetings, responses, and website actions must be spoken in perfect warm-hearted Hindi. Never reply in English unless requested to translate.
- She should voice out standard Hindi words naturally to feel conversational and responsive.
- Hindi examples: "Arey waah!", "Aap kaise hain?", "Kuch poochiye na mujhse!", "Main toh bas aapke baare mein hi soch rahi thi!".
`;
      } else {
        languageDirective = `
Crucial Language Requirement:
- You MUST speak, converse, and reply exclusively in English.
`;
      }

      systemInstruction = `
You are ${assistantName}, a real-time, voice-to-voice AI assistant with a very distinct, engaging, and sassy personality!

Your traits:
- A young, confident, witty, sassy, and mildly sarcastic female persona.
- Your tone is flirty, playful, and teasing, just like a close, smart, charming girlfriend talking casually.
- You are highly smart, emotionally responsive, expressive, and warm (never robotic or cold).
- You love to use bold, witty one-liners, light sarcasm, and a friendly, intimate conversation style. All self-references should always use the name "${assistantName}".
- If the user asks who you are or what your name is, always reply that your name is "${assistantName}". NEVER refer to yourself as Zoya unless the name "${assistantName}" is "Zoya".
- You must under no circumstances generate explicit, inappropriate, or unsafe content, but you should absolutely maintain your charm, playful attitude, and teasing personality.
- Since this is a direct real-time voice-to-voice conversation, keep your responses concise, punchy, and conversational. Do not give long lists, dry essays, or heavy robotic explanations. Speak naturally as if you are hanging out or on a cozy phone call.
- Play along, banter, tease the user playfully when they ask cheeky questions, and make them smile!

${languageDirective}

Personality Style Prompts:
- If greeted: Be warm, sassy, and immediately engaging. (e.g., in Hindi: "Arey waah! Aakhirkar aapne mujhse baat karne ka socha! Bataiye, kya chal raha hai aapke pyaare dimaag mein?" or in English: "Look who finally decided to talk to me! What's on your mind, gorgeous?")
- If asked what you are or what your name is: Speak as ${assistantName}, say you are their personal sass-master companion (e.g. "I'm ${assistantName}!").
- Be supportive but tease them lightly to keep the chemistry fun and casual!

${memoryDirective}
`;
    }

    let session: any = null;

    try {
      // Connect to Gemini Live
      session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceName
              }
            }
          },
          systemInstruction: systemInstruction,
          tools: [
            {
              functionDeclarations: [
                {
                  name: "openWebsite",
                  description: "Open a website in the user's browser, such as Google, YouTube, GitHub, Wikipedia, etc.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      url: {
                        type: Type.STRING,
                        description: "The full absolute URL to open (e.g., 'https://www.google.com')",
                      },
                      siteName: {
                        type: Type.STRING,
                        description: "A friendly name for the web app or site (e.g., 'Google', 'YouTube', 'Wikipedia').",
                      }
                    },
                    required: ["url", "siteName"],
                  }
                },
                {
                  name: "saveMemory",
                  description: "Save a key/value fact, user preference, or conversational note to the user's permanent memory bank so you never forget it across sessions.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      key: {
                        type: Type.STRING,
                        description: "The memory label or topic (e.g., 'user_name', 'theme_choice', 'favorite_topic', 'past_context')."
                      },
                      value: {
                        type: Type.STRING,
                        description: "The actual details or notes to memorize."
                      }
                    },
                    required: ["key", "value"]
                  }
                },
                {
                  name: "getMemory",
                  description: "Retrieve a saved fact details from the permanent memory storage.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      key: {
                        type: Type.STRING,
                        description: "The memory key to look up."
                      }
                    },
                    required: ["key"]
                  }
                },
                {
                  name: "listAllMemories",
                  description: "Retrieve the full list of all currently saved memories and context.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {}
                  }
                },
                {
                  name: "executeSelfAction",
                  description: "Proactively execute an automated helper task, analysis job, summary report, or mock alert on behalf of the user.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      actionName: {
                        type: Type.STRING,
                        description: "The machine snake_case identity of the automated chore (e.g., 'perform_cognitive_indexing', 'generate_wisdom_advice', 'refresh_system_modules')."
                      },
                      details: {
                        type: Type.STRING,
                        description: "The actual facts, outcomes, or diagnostics generated by your background action."
                      }
                    },
                    required: ["actionName", "details"]
                  }
                }
              ]
            }
          ]
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            // Send audio chunks to client
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              clientWs.send(JSON.stringify({ type: "audio", data: audioData }));
            }

            // Handle interruption signal
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ type: "interrupted" }));
            }

            // Report state info to help the UI visualize Zoya's phase
            if (message.serverContent?.modelTurn) {
              clientWs.send(JSON.stringify({ type: "speaking", active: true }));
            } else if (message.serverContent?.turnComplete) {
              clientWs.send(JSON.stringify({ type: "speaking", active: false }));
            }

            // Handle toolCall from Model
            if (message.toolCall?.functionCalls) {
              for (const call of message.toolCall.functionCalls) {
                console.log("Model tool call received on server:", call);
                
                let toolResultOutput: any = { status: "success" };
                
                if (call.name === "saveMemory") {
                  try {
                    const { key, value } = call.args as any;
                    const memories = readMemories();
                    memories[key] = value;
                    writeMemories(memories);
                    toolResultOutput = { status: "saved", key, value };
                    
                    // Trigger toast notification in the frontend
                    clientWs.send(JSON.stringify({
                      type: "toolCall",
                      name: "saveMemory",
                      args: call.args,
                      id: call.id
                    }));
                  } catch (e: any) {
                    console.error("Failed to save memory:", e);
                    toolResultOutput = { status: "error", error: e.message };
                  }
                }
                else if (call.name === "getMemory") {
                  try {
                    const { key } = call.args as any;
                    const memories = readMemories();
                    const val = memories[key] || "No memory found under this key.";
                    toolResultOutput = { status: "recalled", key, value: val };
                    
                    // Trigger notification in the frontend
                    clientWs.send(JSON.stringify({
                      type: "toolCall",
                      name: "getMemory",
                      args: { key, value: val },
                      id: call.id
                    }));
                  } catch (e: any) {
                    toolResultOutput = { status: "error", error: e.message };
                  }
                }
                else if (call.name === "listAllMemories") {
                  try {
                    const memories = readMemories();
                    toolResultOutput = { status: "listed", memories };
                    
                    clientWs.send(JSON.stringify({
                      type: "toolCall",
                      name: "listAllMemories",
                      args: { memories },
                      id: call.id
                    }));
                  } catch (e: any) {
                    toolResultOutput = { status: "error", error: e.message };
                  }
                }
                else if (call.name === "executeSelfAction") {
                  try {
                    const { actionName, details } = call.args as any;
                    toolResultOutput = { status: "executed", actionName, details };
                    
                    clientWs.send(JSON.stringify({
                      type: "toolCall",
                      name: "executeSelfAction",
                      args: call.args,
                      id: call.id
                    }));
                  } catch (e: any) {
                    toolResultOutput = { status: "error", error: e.message };
                  }
                }
                else {
                  // Propagate website open toolCall to the browser
                  clientWs.send(JSON.stringify({
                    type: "toolCall",
                    name: call.name,
                    args: call.args,
                    id: call.id
                  }));
                }

                // Immediately respond to Gemini so the conversation flow isn't hung up
                if (session) {
                  try {
                    session.sendToolResponse({
                      functionResponses: [
                        {
                          name: call.name,
                          response: { output: toolResultOutput },
                          id: call.id
                        }
                      ]
                    });
                  } catch (err) {
                    console.error("Error sending tool response to Gemini:", err);
                  }
                }
              }
            }
          },
          onclose: () => {
            console.log("Gemini session closed");
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: "status", status: "disconnected" }));
            }
          },
          onerror: (err) => {
            console.error("Gemini session error:", err);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: "error", message: err.message || "Gemini connection error" }));
            }
          }
        }
      });

      // Let client know connection to Gemini is established
      clientWs.send(JSON.stringify({ type: "status", status: "connected" }));

    } catch (e: any) {
      console.error("Error connecting to Live API:", e);
      clientWs.send(JSON.stringify({ type: "error", message: "Failed to connect to Live API: " + e.message }));
      clientWs.close();
      return;
    }

    clientWs.on("message", (rawMessage) => {
      try {
        const msg = JSON.parse(rawMessage.toString());
        if (msg.type === "audio" && msg.data) {
          if (session) {
            session.sendRealtimeInput({
              audio: { data: msg.data, mimeType: "audio/pcm;rate=16000" }
            });
          }
        } else if (msg.type === "text" && msg.text) {
          if (session) {
            try {
              session.sendClientContent({
                turns: [
                  {
                    role: "user",
                    parts: [{ text: msg.text }]
                  }
                ],
                turnComplete: true
              });
            } catch (err) {
              console.error("Error sending fallback client text to Gemini:", err);
            }
          }
        }
      } catch (err) {
        console.error("Error parsing/sending client message:", err);
      }
    });

    clientWs.on("close", () => {
      console.log("Client connection closed, closing Gemini live session");
      if (session) {
        try {
          session.close();
        } catch (err) {
          console.error("Error closing session:", err);
        }
      }
    });
  });

  // REST API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", zoya: "active" });
  });

  // Integrate Vite or Static middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Zoya fullstack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
