# 🌟 AuraMail  
### AI-Powered Placement Email Analyzer (Fully Dockerized)

AuraMail is an AI-driven, Dockerized email intelligence platform designed to help students and job-seekers efficiently manage placement-related communication. Instead of manually scanning through different emails about different topics, AuraMail automatically gathers placement mails, summarizes them, and extracts the essential information in a clean, organized format.

---

## 📨 Email Processing via Gmail API (Google Cloud)

AuraMail uses the **official Gmail API provided by Google Cloud** to securely fetch emails.  
Key aspects include:

- Google Cloud–based Gmail API integration  
- OAuth2-based secure authentication  
- Permission-scoped access (read-only, user-approved)  
- Safe and reliable email retrieval without exposing credentials  

This ensures highly secure, permission-controlled access to users’ inboxes.

---

## 🔐 Authentication via Google Cloud (OAuth Login)

The platform supports **Google Login** using Google Cloud OAuth for seamless and secure user authentication.

- Direct Google Sign-In  
- Tokens handled securely  
- No password storage  
- Simple, frictionless user onboarding  

AuraMail ties your Gmail account authorization directly with the processing engine, allowing the system to fetch and analyze only the emails you permit.

---

## 🤖 AI Summary & Information Extraction

AuraMail uses LLM-powered AI pipelines to:

### ✨ Summarize Emails  
Converts long placement announcements into short, understandable summaries.

### 🔎 Extract Key Data Points
Automatically identifies critical details such as:

- Cutoff percentages  
- Eligibility criteria  
- Company name  
- Role and job description  
- Package / CTC  
- Location  
- Application deadlines  
- Required documents  
- Instructions  
- Other highlighted keywords  
- **Apply links (cleaned and separated)**  

Everything is structured into well-defined sections for quick reading.

---

## 🧩 Core Objectives

- Reduce the time students spend reading repeated placement emails  
- Provide clarity by extracting only the *useful* information  
- Centralize and structure important details  
- Make application decisions easier and faster  

---

## 🐳 Fully Dockerized Application

AuraMail is shipped as a **fully Dockerized application** for easy deployment across any system or server.

Includes:

- `Dockerfile` for containerized backend  
- `docker-compose.yml` for orchestrating services  
- Environment-driven configuration  
- Portable infrastructure, consistent behavior everywhere  

This ensures AuraMail can run reliably on any environment with Docker installed.

---

## 📂 High-Level System Overview

User → Google Login (OAuth) → Gmail API Access → Email Fetching →
AI Summarization & Extraction → Organized Structured Output


---

## 📘 What AuraMail Delivers

- A clean summary of each placement email  
- Extracted eligibility and cutoff details  
- Extracted dates and deadlines  
- Easily accessible apply links  
- Company & job role metadata  
- Organized, student-friendly interface  

Designed specifically for placement preparation and campus recruitment workflows.

---

## 🎯 Target Users

- University students  
- Job seekers  
- Placement cells  
- Anyone receiving a high volume of recruitment emails  

---

## 🛡️ Security Considerations

- Uses OAuth2 — no passwords stored  
- Read-only Gmail scopes  
- Tokens securely processed  
- Emails never stored unless explicitly configured  

---

## ⭐ Support

If you find AuraMail useful, please consider giving the repository a **star ⭐** to support development.
