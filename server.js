const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenAI } = require('@google/genai');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Safely load the database
let localDatabase = {};
try {
    const dbPath = path.join(__dirname, 'database.json');
    if (fs.existsSync(dbPath)) {
        const rawData = fs.readFileSync(dbPath, 'utf8');
        localDatabase = JSON.parse(rawData);
        console.log("✅ Database parsed successfully!");
    } else {
        console.log("⚠️ database.json file not found.");
    }
} catch (error) {
    console.error("❌ Error loading database.json:", error.message);
}

// 🌟 FIXED ENDPOINT: It MUST be exactly /api/route to match the frontend
app.post('/api/route', async (req, res) => {
    try {
        const { platform, question, image } = req.body;
        console.log(`📡 Request received for platform: ${platform}`);

        if (!platform) {
            return res.status(400).json({ error: "Missing platform!" });
        }

        // 1. SEARCH THE DATABASE (Only if there is no image)
        let verifiedRoute = null;
        const platformTasks = localDatabase[platform];
        
        if (question && !image && platformTasks) {
            const lowerQuestion = question.toLowerCase();
            
            for (let task of platformTasks) {
                let hasKeyword = false;
                for (let keyword of task.task_keywords) {
                    if (lowerQuestion.includes(keyword)) {
                        hasKeyword = true;
                        break;
                    }
                }

                if (hasKeyword) {
                    verifiedRoute = task.verified_route;
                    console.log(`🎯 Match found in database!`);
                    break;
                }
            }
        }

        // 2. PROMPT BUILDING (Dynamic grounding for visual query)
        let promptText = `You are ACE-Scholar, an expert academic navigation AI. Platform: "${platform}". `;
        
        if (image && question) {
            promptText += `
            The user uploaded a screenshot of their current screen and has a specific question.
            USER'S GOAL: "${question}"
            
            Analyze this UI image carefully. Identify where the user currently is, find the specific buttons or sections visible on this screen that relate to their goal, and tell them exactly where to click next from this current state.
            `;
        } else if (image) {
            promptText += `
            The user uploaded a screenshot of their current screen. Analyze the UI. 
            Identify where they are on this academic platform and give them a general overview of the next logical steps they can take on this specific page.
            `;
        } else if (question) {
            promptText += `Their goal is: "${question}". `;
            
            if (verifiedRoute) {
                promptText += `CRITICAL INSTRUCTION: I have retrieved the exact verified steps from our official database: ${JSON.stringify(verifiedRoute)} You MUST use these exact steps. Do not invent or guess buttons.`;
            } else {
                promptText += `CRITICAL INSTRUCTION: We do not have a verified route for this in our database. However, use your advanced AI knowledge of how academic platforms like ${platform} generally work to estimate the best route. IMPORTANT: You must make the VERY FIRST step a warning label. Format the first step exactly like this: {"title": "⚠️ AI Estimated Route", "description": "This path isn't officially mapped yet. These are estimated steps. If buttons look different, use the 'Show us' screenshot tool below!"} Then, follow that with logical steps to complete the user's goal.`;
            }
        }

        promptText += ` Provide a clear, step-by-step navigation route. Use as many steps as necessary. Format your response strictly as a raw JSON array of objects with "title" and "description" fields. Do NOT include markdown like \`\`\`json.`;

        let contentsArray = new Array();
        contentsArray.push(promptText);

        if (image) {
            const mimeType = image.substring(image.indexOf(':') + 1, image.indexOf(';'));
            const commaIndex = image.indexOf(',');
            const base64Data = image.substring(commaIndex + 1);
            
            contentsArray.push({
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            });
        }

        // 3. CALL THE ACTIVE GEMINI MODEL
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', 
            contents: contentsArray
        });
        
        let rawText = response.text;
        
        // 🛡️ Safe JSON Extractor
        const startIndex = rawText.indexOf('[');
        const endIndex = rawText.lastIndexOf(']');
        
        if (startIndex === -1 || endIndex === -1) {
            throw new Error("Gemini did not return a valid JSON array.");
        }
        
        let cleanJsonString = rawText.substring(startIndex, endIndex + 1);
        const steps = JSON.parse(cleanJsonString);
        
        res.json({ steps });

    } catch (error) {
        console.error("❌ Gemini/Parsing Error:", error);
        res.status(500).json({ error: "Failed to fetch navigation steps." });
    }
});

app.use(express.static(path.join(__dirname)));

// --- 🌟 BULLETPROOF CLOUD LAUNCHER ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`=========================================`);
    console.log(`🚀 ZEROPS CLOUD SERVER IS ALIVE!`);
    console.log(`🚀 LISTENING ON HOST: 0.0.0.0`);
    console.log(`🚀 LISTENING ON PORT: ${PORT}`);
    console.log(`=========================================`);
});
