##you can check the website here- : https://green-garv-6zuv.vercel.app/
# 🌱 GreenGarv  
### A Gamified Sustainability & Green Action Platform

GreenGarv is a full-stack web application designed to incentivize environmentally responsible behavior through gamification, tracking, and community engagement.

The platform enables users to log eco-friendly activities, earn points, view leaderboards, and build sustainable habits — transforming climate awareness into measurable action.

---

## 📌 Problem Statement

Most sustainability platforms focus on awareness but fail at:
- Sustained user engagement  
- Measurable impact tracking  
- Incentivization mechanisms  
- Community-driven participation  

GreenGarv addresses this by combining:

- Gamification mechanics  
- User progress tracking  
- Structured eco-actions  
- Community comparison (leaderboards)  

---

## 🎯 Core Objectives

- Encourage daily sustainable actions
- Provide measurable impact visibility
- Introduce reward-based engagement
- Build community-driven accountability

---

## 🧱 Architecture Overview

GreenGarv follows a modern full-stack architecture:

### 1️⃣ Frontend
- React (Vite-based setup)
- Component-driven UI architecture
- Responsive design
- Tailwind CSS styling
- Clean dashboard structure

### 2️⃣ Backend
- Node.js + Express
- RESTful API design
- MongoDB database integration
- Mongoose models for structured data

### 3️⃣ Database Layer
- User schema
- Activity logs
- Points tracking
- Leaderboard data

---

## ✨ Features

### 🔐 User Authentication
- Secure login & registration
- User session management

### 🌍 Activity Logging
Users can log sustainable activities such as:
- Tree plantation
- Waste segregation
- Public transport usage
- Water conservation
- Energy-saving actions

Each activity:
- Grants points
- Updates sustainability score
- Contributes to leaderboard ranking

### 🏆 Leaderboard System
- Displays top eco-contributors
- Encourages competition
- Promotes community engagement

### 📊 Dashboard Analytics
- Personal eco-score
- Activity history
- Progress visualization
- Habit tracking overview

### 🎮 Gamification Layer
- Points system
- Ranking system
- Reward-driven behavioral reinforcement

---

## 📂 Project Structure


GreenGarv-master/
│
├── client/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── context/
│ │ ├── App.jsx
│ │ └── main.jsx
│ │
│ ├── index.html
│ └── package.json
│
├── server/
│ ├── controllers/
│ ├── routes/
│ ├── models/
│ ├── config/
│ ├── server.js
│ └── package.json
│
└── README.md


---

## 🛠 Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Axios
- React Router

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (Authentication)

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone <repository-url>
cd GreenGarv-master
2️⃣ Setup Backend
cd server
npm install
```
Create a .env file:

MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<your-secret>
PORT=5000

Run the server:

npm run start
3️⃣ Setup Frontend
cd client
npm install
npm run dev
🔄 API Structure (High-Level)
Auth Routes

POST /api/auth/register

POST /api/auth/login

Activity Routes

POST /api/activity/add

GET /api/activity/user/:id

Leaderboard Route

GET /api/leaderboard

🧠 Design Considerations

RESTful architecture for scalability

Modular backend structure

Separation of concerns (MVC pattern)

Stateless authentication using JWT

Gamification-first UX strategy

🚧 Limitations

No third-party verification for activity authenticity

No carbon footprint quantification engine

Limited analytics visualization

No mobile application yet

Reward redemption not integrated

🔮 Future Enhancements

AI-based activity validation (image verification)

Carbon impact estimation engine

Corporate sponsorship & rewards system

NGO collaboration dashboard

Mobile app (React Native)

Real-world incentive marketplace

Blockchain-backed impact verification

🎯 Use Cases

College sustainability drives

Corporate ESG programs

Community eco-challenges

Climate awareness campaigns

Environmental hackathons

📜 License

MIT License

👤 Author

Developed as a sustainability-driven digital engagement platform to bridge awareness and action.
