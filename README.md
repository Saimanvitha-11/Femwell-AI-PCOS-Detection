FemWell – AI-Powered PCOS Screening

📌 Project Overview

FemWell is an AI-powered web application developed during Forge Alumunus – Inspira 2025 (24-Hour Hackathon).
It assists in women’s health screening by analyzing ultrasound images, survey responses, and lab results, providing early screening insights for PCOS using machine learning.

You can check out the live project via this link : ` "https://femwell.netlify.app/" `

⚠️ FemWell is a screening tool and not a substitute for professional medical diagnosis.

🛠️ Features

User Authentication – Secure login & registration

Analysis Dashboard – Centralized access to screening tools

Ultrasound Image Analysis – AI-based image classification

Survey-Based Screening – Personalized questionnaire analysis

Lab Results Comparison – Hormone-level evaluation

Web Interface – Responsive and user-friendly UI

🎯 Tech Stack
Backend
Technology	Purpose
Flask	ML inference & API services
Express.js	Main REST API
Supabase	Authentication & data services
scikit-learn	ML model pipeline
Docker	Deployment packaging
Frontend
Technology	Purpose
React	UI framework
Vite	Fast frontend tooling
Node.js	Build & dev environment
Netlify	Frontend hosting

📂 Project Structure
```
FemWell-AI-PCOS-Detection/
├── client/          # Frontend (React + Vite)
├── server/          # Backend (Express API)
├── shared/          # Shared types & schemas (Zod)
├── dataset/         # ML scripts & model artifacts (train/predict)
├── Dockerfile       # Render deployment (Node + Python)
├── render.yaml      # Render blueprint (optional)
├── netlify.toml     # Netlify config + /api proxy
└── README.md        # Project documentation
```

🔗 API Routes (Core)
```
Route	Method	Description
/api/health	GET	Health check
/api/auth/register	POST	Register user (email & password)
/api/auth/login	POST	Login & create session
/api/auth/logout	POST	Logout & revoke session
/api/auth/user	GET	Get authenticated user
/api/assessments	POST	Submit assessment & save result
/api/assessments/latest	GET	Fetch latest assessment
/api/assessments/:id	GET	Fetch assessment by ID
/api/profile	GET / PUT / DELETE	Profile read / update / delete
```
🤖 AI Model Details

Model Type: scikit-learn pipeline (Logistic Regression)

Outputs:

pcosProbability → value between 0 and 1

pcosLikelihood → Unlikely / Possible / Likely

Purpose: Early screening support (not a medical diagnosis)

🚀 Deployment (Current Setup)

Backend + ML: Render (Dockerized)

Frontend: Netlify

API Proxy: Netlify forwards /api/* → Render backend

Backend Health Check
https://<your-render-service>.onrender.com/api/health

📞 Contact

For questions, feedback, or collaboration:

📧 karrinileshreddy@gmail.com

📧 saimanvitha.chevuru.1@gmail.com
