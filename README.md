# ⌖ ACE-Scholar | Your Academic Compass

**Stop Wasting Your Time. Just get your work done.**

ACE-Scholar is an AI-powered navigation assistant designed to help students and faculty navigate confusing, complex academic platforms (like DigiCampus, Moodle, and Canvas). Whether you're trying to find your attendance, upload an assignment, or check your grades, ACE-Scholar calculates the exact route so you don't have to click around aimlessly.

If you are totally lost, just upload a screenshot of your screen! The AI vision engine will analyze the UI and tell you exactly where to click next.

---

## 🛠️ The Tech Stack
* **Frontend:** HTML/CSS/VanillaJS with a custom retro-cyberpunk Monocraft aesthetic.
* **Backend:** Node.js & Express.js API.
* **Database:** Local JSON high-speed routing index.
* **AI Engine:** Google Gemini 3.5 Flash (Multimodal Vision & Text).
* **Infrastructure:** [Zerops](https://zerops.io) Cloud Deployment.

---

## ☁️ How I Used Zerops (Hackathon Architecture)
This project relies entirely on **Zerops** for its cloud-native infrastructure, ensuring high availability and secure routing.
1. **Node.js Service:** The entire Express backend and static frontend are served via a unified Zerops Node.js container, connected directly to this GitHub repository for automated CI/CD pipelines.
2. **Environment Variable Security:** I utilized the Zerops dashboard to securely inject my `GEMINI_API_KEY` directly into the container runtime. This ensures my Google credentials are never leaked in this public codebase.
3. **Public Cloud Routing:** I configured the Zerops load balancer to securely expose the application to the public internet on port 3000, creating the live `.zerops.app` URL.

---

## 🤖 AI Disclosure (Code of Conduct)
Transparency is important! Here is how AI was utilized in this project:
* **The Core Product:** The application itself actively uses the Google Gemini API to dynamically process user prompts and visually analyze uploaded screenshots of academic portals.
* **Development Assistance:** During the hackathon, I utilized an AI coding assistant to help me troubleshoot complex Git rebase merge conflicts, debug Express.js routing middleware bugs, and correctly format my Zerops environment configurations when the deployment threw a 502 error. 

---

## 👨‍💻 Developer
Designed & Encoded by **Nandini Sharma** for the WeMakeDevs x Zerops Challenge.
