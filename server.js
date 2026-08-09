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
app.use(express.static(path.join(__dirname)));

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

    // 🌟 LISTEN TO BOTH POSSIBLE ROUTE NAMES!
    app.post(['/api/route', '/api/navigate'], async (req, res) => {
        try {
            console.log("📡 API HIT! Request received for:", req.body.platform);
            const { platform, question, image } = req.body;
            
            if (!platform) return res.status(400).json({ error: "Missing platform!" });

            // Database logic
            let verifiedRoute = null;
            if (question && !image && localDatabase[platform]) {
                const lowerQuestion = question.toLowerCase();
                for (let task of localDatabase[platform]) {
                    if (task.task_keywords.some(k => lowerQuestion.includes(k))) {
                        verifiedRoute = task.verified_route;
                        console.log("🎯 Database match found!");
                        break;
                    }
                }
            }

            // Prompt Building
            let promptText = `You are ACE-Scholar, an AI assistant. Platform: ${platform}. Goal: ${question}. Provide a step-by-step route. Format strictly as a raw JSON array with 'title' and 'description' fields. No markdown.`;
            
            if (verifiedRoute) {
                promptText += ` EXACT STEPS TO USE: ${JSON.stringify(verifiedRoute)}`;
            }

            let contentsArray = [promptText];
            if (image) {
                const mimeType = image.substring(image.indexOf(':') + 1, image.indexOf(';'));
                const base64Data = image.substring(image.indexOf(',') + 1);
                contentsArray.push({ inlineData: { data: base64Data, mimeType } });
            }

            // Call Gemini
            const response = await ai.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: contentsArray
            });

            let rawText = response.text;
            const startIndex = rawText.indexOf('[');
            const endIndex = rawText.lastIndexOf(']');
            if (startIndex === -1) throw new Error("Invalid JSON from Gemini");

            const steps = JSON.parse(rawText.substring(startIndex, endIndex + 1));
            res.json({ steps });

        } catch (error) {
            console.error("❌ Error:", error);
            res.status(500).json({ error: "Failed to fetch steps." });
        }
    });

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
            model: 'gemini-1.5-flash', 
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

// 🛡️ THE SHIELD: Force any broken API calls to return JSON, not HTML!
app.use('/api', (req, res) => {
    res.status(404).json({ error: "API route not found!" });
});

// Serve frontend files
app.use(express.static(path.join(__dirname)));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// --- 🌟 BULLETPROOF CLOUD LAUNCHER ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`=========================================`);
    console.log(`🚀 ZEROPS CLOUD SERVER IS ALIVE!`);
    console.log(`🚀 LISTENING ON HOST: 0.0.0.0`);
    console.log(`🚀 LISTENING ON PORT: ${PORT}`);
    console.log(`=========================================`);
});
