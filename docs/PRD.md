# Product Requirements Document (PRD)
# Signa — AI-Based Sign Language Learning Platform

---

## 1. Executive Summary

**Signa** is a production-ready web application that teaches sign language using real-time AI-powered gesture recognition. The platform is designed for universal accessibility — usable by deaf, blind, speech-impaired, and general users — with a strong focus on simplicity, real-time interaction, and scalability.

The platform provides structured courses (Beginner → Intermediate → Pro), real-time webcam-based feedback, gamified learning, certification, and a text-to-sign translator.

---

## 2. Problem Statement

Sign language is a critical communication tool for millions of people worldwide, yet learning resources are:
- **Fragmented**: No single platform offers structured, AI-powered learning
- **Inaccessible**: Most platforms aren't designed for users with multiple disabilities
- **Static**: Traditional courses lack real-time feedback on gesture accuracy
- **Unengaging**: Missing gamification and interactive elements that drive retention

---

## 3. Target Users

| User Segment | Needs |
|---|---|
| **Deaf/Hard-of-Hearing** | Learn sign language with visual-first UI, no audio dependency |
| **Blind/Low-Vision** | Voice assistance, screen reader support, high contrast |
| **Speech-Impaired** | Alternative communication learning, gesture-based interaction |
| **General Learners** | Structured courses, gamified experience, certification |
| **Children (5+)** | Simple UI, animations, rewards, child-friendly interactions |
| **Educators** | Course progress tracking, assessment tools |

---

## 4. Core Features

### 4.1 AI-Powered Gesture Recognition

| Aspect | Detail |
|---|---|
| **Input** | Webcam feed via WebRTC |
| **Processing** | MediaPipe extracts 21 hand landmarks → 42D feature vector |
| **Model** | Random Forest Classifier (scikit-learn) |
| **Output** | Real-time predicted sign (~25-30 FPS, CPU-optimized) |
| **Feedback** | Accuracy score, timing feedback, improvement suggestions |

### 4.2 Course System

**Three Levels:**

| Level | Content | Price Model |
|---|---|---|
| **Beginner** | Alphabets, Numbers, Basic Greetings | Free / Low cost |
| **Intermediate** | Common Phrases, Conversations | Paid |
| **Pro** | Fluent Communication, Context Signs | Paid (Premium) |

**Each Lesson Includes:**
- Animated avatar demonstrating gestures (2D/3D)
- Static reference images
- Audio explanation with mandatory subtitles
- Practice mode with webcam
- Assessment quiz

### 4.3 Assessment System

- Webcam-based tests after each lesson
- AI evaluates gesture accuracy (0-100 score)
- Personalized improvement suggestions
- Score >= 90% unlocks discount on next level
- Must pass to unlock next lesson

### 4.4 Gamification

| Element | Description |
|---|---|
| **Points** | Earned per completed lesson/quiz |
| **Stars** | Performance rating (1-5) per lesson |
| **Badges** | Achievement milestones (e.g., "First Sign", "Speed Learner") |
| **Streaks** | Daily learning streaks |
| **Mini Games** | Sign matching, speed challenges, memory games |
| **Leaderboard** | Weekly/monthly rankings |

### 4.5 Certification

- Generated PDF certificate upon course completion
- Includes unique ID + QR code for verification
- Stored in database for employer/institution verification
- Public verification endpoint

### 4.6 Text-to-Sign Translator

- Input: English text sentence
- Processing: Tokenize → Map words to gesture units
- Output: Step-by-step gesture breakdown with animations

### 4.7 Payment System

- **Provider**: Razorpay
- **Features**: Course purchase, level upgrades, discount application
- **Discount Logic**: Score >= 90% → automatic discount on next level

---

## 5. Accessibility Requirements

| Feature | Implementation |
|---|---|
| **High Contrast Mode** | Toggle for WCAG AAA contrast ratios |
| **Large Fonts** | Adjustable font sizing (minimum 16px base) |
| **Voice Assistance** | Web Speech API for screen reading |
| **Keyboard Navigation** | Full keyboard accessibility with visible focus indicators |
| **Subtitles** | Mandatory on all video/audio content |
| **Screen Reader** | ARIA labels, roles, and live regions |
| **Reduced Motion** | Respect prefers-reduced-motion |
| **Color Blind Modes** | Alternative color schemes |

---

## 6. Technical Architecture

### 6.1 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14+ (App Router), Tailwind CSS |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **AI/ML** | MediaPipe (client-side), Python microservice (model inference) |
| **Auth** | JWT + bcrypt |
| **Payments** | Razorpay SDK |
| **Deployment** | Vercel (FE), Render/AWS (BE), MongoDB Atlas (DB) |

### 6.2 Project Structure

```
/signa
├── client/                    # Next.js Frontend
│   ├── app/                   # App Router pages
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── (dashboard)/       # User dashboard
│   │   ├── courses/           # Course browsing and learning
│   │   ├── translator/        # Text-to-sign translator
│   │   ├── games/             # Mini games
│   │   └── layout.js          # Root layout
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   ├── learning/          # Lesson and practice components
│   │   ├── assessment/        # Quiz and test components
│   │   ├── webcam/            # Webcam and gesture components
│   │   └── accessibility/     # Accessibility widgets
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities and API clients
│   ├── styles/                # Global styles
│   └── public/                # Static assets
│
├── server/                    # Express.js Backend
│   ├── controllers/           # Route handlers
│   ├── routes/                # API route definitions
│   ├── models/                # Mongoose schemas
│   ├── middleware/            # Auth, validation, error handling
│   ├── services/              # Business logic
│   ├── utils/                 # Helper functions
│   └── server.js              # Entry point
│
├── ai-service/                # Python AI Microservice
│   ├── model/                 # Trained model files
│   ├── api.py                 # FastAPI endpoints
│   ├── preprocessing.py       # Data preprocessing
│   ├── train.py               # Model training script
│   └── requirements.txt       # Python dependencies
│
└── docs/                      # Documentation
    ├── PRD.md                 # This file
    ├── architecture.md        # System architecture
    └── setup.md               # Setup guide
```

### 6.3 Data Flow

```
User → Opens Lesson → Watches Animation
                    → Activates Webcam
                    → MediaPipe extracts landmarks (client-side)
                    → Landmarks sent to AI service
                    → Model predicts gesture
                    → Backend evaluates against expected
                    → Feedback rendered in UI
```

### 6.4 API Design

**Auth:**
- POST /api/auth/register — User registration
- POST /api/auth/login — User login
- POST /api/auth/refresh — Token refresh

**Courses:**
- GET /api/courses — List all courses
- GET /api/courses/:id — Course detail
- GET /api/courses/:id/lessons — Lessons in course
- GET /api/lessons/:id — Lesson detail

**Progress:**
- GET /api/progress — User progress
- POST /api/progress/submit — Submit assessment result
- GET /api/progress/achievements — User achievements

**AI:**
- POST /api/ai/predict — Predict gesture from landmarks
- POST /api/ai/evaluate — Evaluate gesture accuracy
- POST /api/ai/translate — Text to sign translation

**Payments:**
- POST /api/payments/create-order — Create Razorpay order
- POST /api/payments/verify — Verify payment

**Certificates:**
- GET /api/certificates/:id — Get certificate
- GET /api/certificates/verify/:code — Verify certificate

---

## 7. UI/UX Design Specifications

### 7.1 Design System

| Property | Value |
|---|---|
| **Style** | Glassmorphism (frosted glass, blur, soft shadows) |
| **Primary Color** | #2563EB (Blue 600) |
| **Background** | #F8FAFC (light) / #0F172A (dark) |
| **Surface** | rgba(255, 255, 255, 0.15) with backdrop-filter: blur(12px) |
| **Border Radius** | 12px-20px (rounded corners) |
| **Font** | Inter (Google Fonts) |
| **Shadows** | 0 8px 32px rgba(0, 0, 0, 0.1) |

### 7.2 Key Pages

1. **Landing Page** — Hero, features, testimonials, CTA
2. **Auth Pages** — Login, Register (glassmorphism cards)
3. **Dashboard** — Progress, achievements, continue learning
4. **Course Catalog** — Browse courses by level
5. **Lesson View** — Animation + webcam split view
6. **Assessment** — Webcam-based test with real-time scoring
7. **Translator** — Text input → gesture animation output
8. **Games** — Mini games grid
9. **Profile** — Settings, certificates, achievements
10. **Payment** — Course purchase flow

### 7.3 UX Principles

- **Maximum 3 clicks** to reach any feature
- **Progressive disclosure** — show complexity only when needed
- **Consistent navigation** — persistent sidebar/navbar
- **Immediate feedback** — loading states, success/error indicators
- **Child-friendly** — large touch targets, bright colors, encouraging messages

---

## 8. Security Requirements

| Requirement | Implementation |
|---|---|
| **Authentication** | JWT with refresh tokens |
| **Password Storage** | bcrypt with salt rounds >= 10 |
| **Input Validation** | Express-validator + Mongoose validation |
| **API Security** | Rate limiting, CORS, helmet.js |
| **HTTPS** | Enforced in production |
| **Payment Security** | Server-side Razorpay signature verification |
| **Data Privacy** | No webcam data stored on server |

---

## 9. Performance Requirements

| Metric | Target |
|---|---|
| **Gesture Recognition FPS** | 25-30 FPS (CPU) |
| **Page Load Time** | < 2 seconds (LCP) |
| **API Response Time** | < 200ms (p95) |
| **Time to Interactive** | < 3 seconds |
| **Lighthouse Score** | > 90 (all categories) |

---

## 10. Success Metrics

| Metric | Target |
|---|---|
| **User Registration** | 1000+ in first month |
| **Course Completion Rate** | > 60% |
| **Gesture Recognition Accuracy** | > 85% for trained signs |
| **User Satisfaction (NPS)** | > 8/10 |
| **Accessibility Score** | WCAG 2.1 AA compliance |

---

## 11. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Low gesture accuracy | High | Extensive training data, user feedback loop |
| Browser compatibility | Medium | Fallback modes, browser feature detection |
| WebRTC performance | Medium | Optimize frame rate, resolution settings |
| Payment failures | High | Retry logic, manual verification flow |
| Scalability bottleneck | Medium | Microservice architecture, caching |

---

## 12. Timeline (Phased Approach)

| Phase | Duration | Deliverables |
|---|---|---|
| **Phase 1: Foundation** | Week 1-2 | Project setup, auth, basic UI, database models |
| **Phase 2: Core Learning** | Week 3-4 | Course system, lesson viewer, animations |
| **Phase 3: AI Integration** | Week 5-6 | MediaPipe, gesture model, webcam practice |
| **Phase 4: Assessment and Progress** | Week 7 | Tests, scoring, badges, achievements |
| **Phase 5: Payments and Certification** | Week 8 | Razorpay, certificates, discounts |
| **Phase 6: Translator and Games** | Week 9 | Text-to-sign, mini games |
| **Phase 7: Polish and Deploy** | Week 10 | Testing, optimization, deployment |

---

*Document Version: 1.0*
*Last Updated: March 31, 2026*
*Author: Signa Development Team*
