# 🌟 AuraMail  
### AI-Powered Placement Email Analyzer (Fully Dockerized)

AuraMail is an AI-driven, Dockerized email intelligence platform that helps students and job seekers instantly understand placement-related emails. It fetches mails directly from Gmail using the official Google Cloud APIs, summarizes them with OpenAI GPT-4.0 Mini, extracts key information, and organizes it into an easy-to-read format.

---

## 📨 Email Processing via Gmail API (Google Cloud)

AuraMail integrates directly with the **Gmail API** through Google Cloud, offering:

- Secure OAuth2-based email access  
- Permission-scoped (read-only) inbox retrieval  
- Reliable processing of placement mails  
- No password handling, only token-based authentication  

This ensures fully secure, compliant, and user-approved access to email data.

---

## 🔐 Authentication: Google OAuth (Google Cloud)

User login and authorization is handled via **Google Cloud OAuth**, meaning:

- One-click Google Login  
- No credential storage  
- Secure token-based authentication  
- Smooth onboarding and session management  

OAuth also grants the app secure permission to read only the emails necessary for processing.

---

## 🤖 AI Engine (OpenAI GPT-4.0 Mini)

AuraMail uses the **OpenAI GPT-4.0 Mini model** to power all AI functionality, including:

### ✔️ AI Summarization  
Long placement emails → short, clear summaries.

### ✔️ AI Extraction  
Structured extraction of key details including:

- Cutoff percentage  
- Eligibility criteria  
- Company information  
- Role & job description  
- CTC / package  
- Location  
- Application deadlines  
- Required documents  
- Important instructions  
- **Apply links (cleanly separated)**  

All processed using the GPT-4.0 Mini LLM for fast, efficient, high-quality outputs.

---

## 🧩 Tech Stack

### **Frontend**
- **Next.js (TypeScript)**  
- **shadcn/ui**  
- **TailwindCSS**  
- **Lucide Icons**  
- **Framer Motion** (animations)

### **Backend**
- **Node.js**  
- **Express.js (TypeScript)**  
- **Zod** for validation  
- **OpenAI SDK (`openai` package)**  
- **Google APIs (`googleapis`, `google-auth-library`)**  
- **Node-cron** for periodic tasks  
- **Helmet + CORS** for security  
- **Dotenv** for environment configuration  

### **AI**
- **OpenAI GPT-4.0 Mini model**  
- AI-based summarization + extraction logic  

### **Security**
- Google OAuth (no passwords stored)  
- Read-only Gmail scopes  
- JWT-based sessions  
- Helmet-enhanced API security  

### **Containerization**
- Fully dockerized  
- `Dockerfile` + `docker-compose.yml`  
- Portable across systems  
- Consistent dev, test, and production environments  

---

## 🐳 Dockerized Architecture

AuraMail runs entirely through Docker:

- **Backend container** (Express + AI + Gmail processing)  
- **Frontend container** (Next.js UI)  
- Optional additional service containers  
- Shared environment variables using a `.env` file  
- One-command startup with Docker Compose  

This ensures consistency, reliability, and easy deployment.

---

## 📂 High-Level System Overview
User Login → Google OAuth → Gmail API Access → Email Fetch →
AI Processing (GPT-4.0 Mini) → Extraction & Summary →
Frontend Display (Next.js + shadcn/ui)


---

## 📘 What AuraMail Provides

- Concise summary of each placement email  
- Extracted eligibility & cutoff details  
- Highlighted apply links  
- Company + job info  
- Dates, deadlines & required documents  
- Clean, organized, student-friendly output  

---

## 🎯 Target Users

- University students  
- Job seekers  
- Placement cells  
- Anyone receiving frequent recruitment emails  

---

## 🛡️ Security Highlights

- OAuth2 login  
- Read-only Gmail data access  
- No password storage  
- Secure token management  
- Backend protected with Helmet, CORS, and validated input (Zod)  

---

## ⭐ Support

If you find AuraMail helpful, consider giving the repo a **star ⭐** to support future development.


