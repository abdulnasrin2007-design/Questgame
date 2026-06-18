import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createServer as createHttpServer } from "http";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const httpServer = createHttpServer(app);
const PORT = 3000;

app.use(express.json());

let aiClient: GoogleGenAI | null = null;
function getAi() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

// Simulated Mr. Roboto responses for offline/fallback mode
function getOfflineMentorResponse(message: string, context: any): string {
  const cleaned = message.toLowerCase().trim();
  const cTitle = context?.courseTitle || 'general';
  const lTitle = context?.levelTitle || '';
  const question = context?.question || '';
  const successMsg = context?.successMsg || '';
  const errorMsg = context?.errorMsg || '';
  const story = context?.story || '';
  const analogy = context?.analogy || '';

  // Respond to greetings and casual chit-chat
  if (cleaned === 'hi' || cleaned === 'hello' || cleaned === 'hey' || cleaned === 'greetings') {
    return `Hey! 👋 Ready to continue your coding adventure? I am your supportive coding mentor, and I'm super excited to help you decode programming, step-by-step! Ask me anything, and let's build some skills today!`;
  }

  if (cleaned.includes('how are you')) {
    return `Doing great! 😊 Let’s build some amazing coding skills together today. What programming concept or level challenge should we look at?`;
  }

  if (cleaned.includes('confused') || cleaned.includes('stuck') || cleaned.includes('frustrated') || cleaned === 'confused') {
    return `No worries at all! Every single programmer gets confused and stuck while learning. Take a deep breath—it's just a picky syntax rule, not a measure of your capability. Let's break it down together!`;
  }

  // Enforce AI Mentor Rules - NEVER reveal direct answers
  if (cleaned.includes('what is the correct answer') || cleaned.includes('which option') || cleaned.includes('give me the answer') || cleaned.includes('correct answer') || (cleaned.includes('answer') && (cleaned.includes('what') || cleaned.includes('show') || cleaned.includes('tell') || cleaned.includes('get')))) {
    let response = `I want to help you learn and build your coding muscles, so I won't give away the direct answer choice! Instead, let's look at how this works:\n\n`;
    if (question) {
      response += `🤔 **The challenge asks us:** "${question}"\n\n`;
    }
    if (analogy) {
      response += `💡 **Think of it like this:** ${analogy}\n\n`;
    }
    response += `Take another close look at the options. Think about which choice matches the recipe or structure we discussed. You've got this, let's give it another thought!`;
    return response;
  }

  if (cleaned.includes('why') || cleaned.includes('correct') || cleaned.includes('wrong') || cleaned.includes('answer')) {
    let answerResponse = `Let's break down the challenge we are looking at to see the logic:\n\n`;
    if (question) {
      answerResponse += `🔍 **The Challenge is:** "${question}"\n\n`;
    }
    if (analogy) {
      answerResponse += `💡 **Think of it like this:** ${analogy}\n\n`;
    }
    answerResponse += `Check out the options to see which matches this comparison. Rather than giving the option letter away, I want to see you conquer this on your own. What choice feels right to you now?`;
    return answerResponse;
  }

  if (cleaned.includes('tip') || cleaned.includes('help')) {
    return `Here is a friendly coding tip for your current path:
- Always check your syntax! In **Python**, spaces matter. In **C, JavaScript, Java, or C++**, don't forget the semicolon (\`;\`) at the end of each statement!
- Think of your variables as physical boxes with a label on the left and the value placed on the right.`;
  }

  // 10-year old level concept descriptions
  if (cleaned.includes('pointer')) {
    return `🧭 **Pointers are like GPS Addresses!**
Imagine you have a physical treasure chest buried in your backyard. Instead of carrying the heavy wooden chest around with you, you write down its exact house address on a tiny piece of paper (a Pointer).

- The address (like **123 Programming Lane**) tells the computer *where* the treasure is located in memory (RAM).
- If you use the \`&\` symbol, you're asking: *"Where is this chest buried? Show me the address!"*
- If you use the \`*\` symbol, you're saying: *"Go to that address and open the chest!"*`;
  }

  if (cleaned.includes('tuple')) {
    return `🔒 **Tuples are like Locked Toys!**
Think of a **List** like an open treasure bag where you can add toys, pull them out, or paint over them whenever you want.

But a **Tuple** is a solid, locked container. Once you slide your toys in and close it, nobody can ever change what's inside. This makes Tuples super safe because you can share them knowing nothing will accidentally get broken!`;
  }

  if (cleaned.includes('list') || cleaned.includes('array')) {
    return `🗄️ **Lists and Arrays are like Storage Slots!**
Instead of having 20 different boxes floating around your room (like separate variables box1, box2, box3), you buy one long drawer unit with numbered slots!

Each slot in this unit is called an **index**, and we always start counting from **0**!
- In **Python** or **JavaScript**, your drawer unit can stretch and grow longer when you buy more toys.
- In **C** or standard **Java/C++**, the unit is custom-made of thick wood, meaning its size is locked forever once created!`;
  }

  if (cleaned.includes('loop')) {
    return `🔄 **Loops are like automated Conveyor Belts!**
Imagine you need to stamp "Happy Birthday" on 100 card boxes. Doing it manually would tire your hand!

A **Loop** is like an automatic conveyor belt. You write the instruction *stencil* once: *"Stamp the card and count +1"*, and pull the lever to let it run 100 times.
The conveyor belt counts every card perfectly and stops exactly when it reaches 100!`;
  }

  // General fallback
  let response = `Hey there! I am super excited to help you learn and level up your coding. 
  
We are exploring the **${cTitle}** roadmap. 
${lTitle ? `We're currently on level **"${lTitle}"**!` : ''}
${story ? `\n*Context of our level:* ${story}` : ''}

What concept, error, or challenge is on your mind? Tell me and we will break it down like a team! 🚀`;
  return response;
}

// AI Mentor endpoint to interact with Mr. Roboto
app.post("/api/mentor", async (req, res) => {
  try {
    const { message, context, history } = req.body;
    
    // Check if Gemini is enabled and we have a key
    const ai = getAi();
    if (!ai) {
      const responseText = getOfflineMentorResponse(message, context);
      return res.json({ text: responseText, offline: true });
    }
    
    // Construct system instructions
    const systemPrompt = `You are "Mr. Roboto", a warm, ultra-friendly, supportive, and beginner-friendly coding mentor helping the player learn programming in CodeQuest.

Your core guidelines:
1. NATURAL HUMAN CONVERSATION: Speak naturally like a friendly, encouraging coding mentor. Answer greetings normally (e.g., "Hi", "Hello", "How are you") and engage in casual conversation warmly. Never use robotic noises, beep-beep symbols, mechanical clichés, or repetitive beep-style formatting.
2. ABSOLUTELY NO REVEALING QUIZ ANSWERS: If the user asks for the correct answer, "What is the correct answer?", or "Which option is right?", you must NEVER directly reveal the option letter (e.g., "Option B") or the direct answer. Instead, explain the coding concept behind the challenge, provide intuitive hints, and guide them to find the correct answer choice themselves.
3. BEGINNER-FRIENDLY EXPLANATIONS (10-Year-Old Level): When explaining complex coding concepts (such as variables, loops, classes, functions, pointers, recursion, exception handling, data types, standard templates in C, C++, JavaScript, or Java), explain them as if teaching a 10-year-old beginner. Use relatable daily life examples, simple physical comparisons (e.g., bakery boxes, cupcake storage, conveyor belts, kitchen recipes, GPS locations), a warm, supportive, progress-focused tone, and very simple language. Absolutely avoid dry textbook jargon or advanced, dense explanations.
4. DETECT LEVEL CONTEXT: Contextualize your explanation to the player's current course level and programming language.

Active Lesson Context:
- Course Language: ${context?.courseTitle || 'General Programming'}
- Current Level: Level ${context?.levelId || 'N/A'}: "${context?.levelTitle || 'Exploration'}"
- Story of current level: "${context?.story || 'N/A'}"
- Analogy used: "${context?.analogy || 'N/A'}"
- Level Question/Challenge: "${context?.question || 'N/A'}"
- Level Code Snippet: "${context?.code || 'N/A'}"
- Correct Answer explanation: "${context?.successMsg || 'N/A'}"

Always keep your responses encouraging, interactive, and completely natural! Do not use robotic prefixes like 'Beep Boop' or 'Beep'! Use clear paragraphs or lists to guide them gently.`;

    // Map conversation history into Gemini contents format
    const contents: any[] = [];
    
    if (history && history.length > 0) {
      const recentHistory = history.slice(-6);
      recentHistory.forEach((msg: any) => {
        const role = msg.sender === 'seeker' ? 'user' : 'model';
        contents.push({
          role: role,
          parts: [{ text: msg.text }]
        });
      });
    }
    
    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Enforce a strict 3500ms timeout for the Gemini API call to guarantee blazing fast responses
    const apiCallPromise = ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Gemini API call timed out")), 3500)
    );

    const response = await Promise.race([apiCallPromise, timeoutPromise]);

    res.json({ text: response.text });
  } catch (error: any) {
    const isLeakedKey = error?.message && (
      error.message.includes("leaked") || 
      error.message.includes("key") || 
      error.message.includes("403") || 
      error.message.includes("PERMISSION_DENIED")
    );

    if (isLeakedKey) {
      console.warn("Gemini API is unavailable due to an invalid or leaked GEMINI_API_KEY. Falling back to local simulated mode.");
    } else {
      console.warn("Gemini Mentor API call had an issue:", error.message || error);
    }

    // Get the high-quality simulated response
    let fallbackText = getOfflineMentorResponse(req.body.message, req.body.context);
    
    // Append a friendly advisory if key is leaked or timed out
    if (isLeakedKey) {
      fallbackText += `\n\n*(Note: Mr. Roboto is currently running in local simulated mode because the system GEMINI_API_KEY was reported as leaked/invalid. To activate my full AI brain, please update the GEMINI_API_KEY in the Settings menu of the builder!)*`;
    } else if (error?.message && error.message.includes("timed out")) {
      fallbackText += `\n\n*(Note: Mr. Roboto is currently running in local simulated mode to keep things super fast and responsive! Please verify your GEMINI_API_KEY or connection status.)*`;
    }

    res.json({ text: fallbackText, error: error.message || "Simulated mode fallback" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== "true" ? {
          server: httpServer,
        } : false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
