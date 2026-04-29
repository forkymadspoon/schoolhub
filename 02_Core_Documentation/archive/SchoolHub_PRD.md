# SchoolHub PRD
## Adaptive Learning & Study Scheduling Platform for Singapore

**Version:** 1.0  
**Date:** April 23, 2026  
**Market:** Singapore (K-12 equivalent: Preschool → Secondary School)  
**Status:** Hackathon MVP → Commercial Product

---

## 1. VISION & MISSION

### Vision
Every student in Singapore has access to personalized, structured study support that eliminates academic stress, prevents burnout, and enables consistent, sustainable learning.

### Mission
Build an intelligent study companion that helps busy parents create adaptive, curriculum-aligned study schedules, and helps students learn through bite-size, engaging lessons—transforming exam preparation from chaotic cramming into organized, confident success.

---

## 2. PROBLEM STATEMENT

### Core Problems

**For Parents:**
- Struggle to create effective study schedules aligned with Singapore's curriculum (MOE, IB, other international schools)
- Don't know how much time their child should spend on each topic
- Lack visibility into what their child actually understands
- Can't adjust plans when child falls behind or struggles
- Stressed during major exam periods (PSLE, O-Levels, A-Levels, IB exams)

**For Students:**
- Study plans are vague ("Study Chapter 3 on Tuesday") — don't know where to start
- Large topics feel overwhelming, leading to procrastination
- No scaffolding between "I don't understand" and "I get it"
- Inconsistent study habits lead to burnout
- No personalization for different learning styles

**For Schools (Secondary Goal):**
- Limited visibility into student study habits outside school
- Can't intervene early when students fall behind
- One-size-fits-all curricula don't adapt to individual learning speed

### Market Gap
- **Scheduling apps** (Google Calendar, Notion): No curriculum awareness, no adaptation
- **Content platforms** (Khan Academy, YouTube): No personalization to school's pace/exams
- **Tutoring apps** (Tueetor, local tutors): Expensive, inconsistent, no holistic study plan
- **Nothing** combines: Curriculum parsing + Adaptive scheduling + Bite-size learning + Parent oversight

---

## 3. GOALS & SUCCESS METRICS

### Business Goals
1. **Validation:** 500 active users in Singapore within 6 months of launch
2. **Retention:** 60%+ monthly active retention after 2 months
3. **Monetization:** Achieve $5K MRR within 12 months
4. **B2B Growth:** 3-5 schools piloting SchoolHub within Year 1

### User Goals

**Parents:**
- Create a study plan in <5 minutes (vs. 2-3 hours manual planning)
- See real-time progress + early struggle alerts
- Reduce exam-prep stress from "chaotic" → "manageable"
- Get actionable recommendations (tutor, adjust schedule, etc.)

**Students:**
- Complete daily study goals without feeling overwhelmed
- Understand *why* they're learning each topic
- See consistent progress → motivation
- Feel confident on exam day

**Teachers/Schools:**
- Identify at-risk students early
- See which topics need more teaching time
- Reduce out-of-school study burden on families

### Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| **User Acquisition** | 500 users (Month 6) | Signup count |
| **Monthly Retention** | 60%+ | Day 30 / Day 1 active users |
| **Parent Engagement** | 4+ schedule interactions/month | Parent dashboard analytics |
| **Student Engagement** | 3.5+ bites/week average | Bite completion tracking |
| **Curriculum Coverage** | 90%+ of uploaded syllabi parsed correctly | Manual review + accuracy testing |
| **Academic Outcomes** | +12% avg grade improvement | Parent survey (post-exam) |
| **NPS (Parents)** | 50+ | Post-exam feedback survey |
| **Bite Completion Rate** | 70%+ of scheduled bites | Completion logging |
| **Freemium→Paid** | 8-12% conversion | Signup to paid subscription |
| **Churn Rate** | <5% MoM | Cancellation tracking |

---

## 4. TARGET USERS & PERSONAS

### 4.1 Primary User: Parent (Decision Maker)

**Persona: Priya (Mother, 40, Singapore)**
- **Background:** Working professional, 2 kids (ages 10 & 14)
- **Pain:** "I want my kids to do well, but I don't have time to organize their study. My older one has O-Levels in 18 months and I'm stressed."
- **Motivation:** Education = future opportunities; willing to invest in tools
- **Tech Comfort:** Moderate (uses WhatsApp, apps, but not power user)
- **Budget:** Willing to pay $10-20/month for peace of mind
- **Jobs to be Done:**
  - Create a study plan that actually works
  - Know if my child is on track
  - Get early warnings about struggles
  - Reduce my own stress during exam season

**Who they are:**
- Middle-to-upper income families
- Time-constrained (working parents)
- Education-conscious
- Willing to pay for quality tools
- Motivated by child's academic success

**Needs:**
- Simple setup (upload syllabus, get plan in minutes)
- Real-time visibility (app notifications, dashboard)
- Actionable insights (not just data, but recommendations)
- Flexibility (adjust when life happens)

---

### 4.2 Secondary User: Student (Primary User of Learning Features)

**Persona: Aiden (14, Secondary 2)**
- **Background:** Good student, gets As & Bs, but struggles with exam prep
- **Pain:** "I don't know how to start studying. It feels like too much. I end up cramming the night before."
- **Motivation:** Wants good grades; wants to feel confident; avoids overwhelm
- **Tech Comfort:** High (native on apps, responsive to notifications)
- **Budget:** No direct purchasing power (parent decides)
- **Jobs to be Done:**
  - Know what to study TODAY (not "sometime this week")
  - Understand topics, not just memorize
  - Track my own progress
  - Feel less stressed about exams

**Who they are:**
- Primary school → Secondary school students
- Varying ability levels
- Different learning styles (visual, auditory, kinesthetic)
- Prefer clarity over ambiguity

**Needs:**
- Clear daily goals ("5-min bite on photosynthesis")
- Multiple formats (some prefer text, some visuals)
- Instant feedback ("You got this!" or "Let's try differently")
- Sense of progress (visible completion)

---

### 4.3 Tertiary User: Teacher/School (B2B, Future)

**Persona: Mr. Tan (Secondary School Teacher)**
- **Background:** Physics teacher, 12 years experience, 150 students
- **Pain:** "I don't know how much students study outside class. Some fall behind and I don't find out until exams."
- **Motivation:** Improve student outcomes; reduce last-minute cramming
- **Tech Comfort:** Moderate (uses LMS, but not tech-savvy)
- **Budget:** School allocates budget for edu tools
- **Jobs to be Done:**
  - See which topics need more teaching time
  - Identify struggling students early
  - Understand student study habits
  - Reduce pressure on families during exam season

**Who they are:**
- School administrators + subject teachers
- Interested in data-driven insights
- Want to improve student outcomes
- May have limited budget/adoption resistance

**Needs:**
- Simple reporting (no complex setup)
- Classroom-level analytics (not individual surveillance)
- Alignment with MOE curriculum
- Integration with school systems (Google Classroom, eventually)

---

## 5. SCOPE & FEATURES

### 5.1 MVP (Hackathon + First 3 Months)

#### **For Parents:**

**5.1.1 Automated Curriculum Ingestion from MOE & International Sources**

**Option A: MOE Curriculum (Singapore — Primary & Secondary)**
- System automatically fetches & parses official MOE syllabi from:
  - MOE official website (www.moe.gov.sg/primary/curriculum, www.moe.gov.sg/secondary)
  - data.gov.sg API (school information, curriculum metadata)
  - Direct PDF downloads from MOE's syllabus repository
- Covers:
  - Primary 1-6 (2021 updated syllabus, P1-P5 + 2013 P6 until 2026)
  - Secondary 1-4 (Express, Normal Academic, Normal Technical courses)
  - Subjects: English, Mathematics, Science, Mother Tongue Language, Social Studies, etc.
  - O-Levels, N(A)-Levels, N(T)-Levels

**Option B: International Curricula (IB, Cambridge, AS/A-Levels)**
- Fetch from public curriculum databases:
  - IB curriculum guides (publicly available)
  - Cambridge International Examinations specifications
  - EdExcel/Pearson exam board syllabi
  - Use web scraping to monitor for updates

**Option C: School-Specific Curriculum (Fallback)**
- If school uses customized/proprietary curriculum:
  - Parent provides school name → system searches for official syllabus PDF
  - If not found, parent uploads school syllabus PDF as backup
  - Claude parses the upload

**How It Works:**

```
1. AUTOMATED FETCH (Daily/Weekly Scheduler)
   ├─ GitHub Actions / Cloud Scheduler triggers
   ├─ Fetch latest MOE syllabi from:
   │  ├─ data.gov.sg API (metadata)
   │  ├─ MOE website direct downloads
   │  └─ Known syllabus URLs (hardcoded)
   ├─ Detect changes (hash comparison, version number)
   ├─ Store new versions in database
   └─ Alert: "New curriculum version detected"

2. PARSING WITH CLAUDE OPUS 4.7 (On-demand)
   ├─ Claude extracts from PDF:
   │  ├─ Topics/chapters
   │  ├─ Learning objectives
   │  ├─ Exam dates (if available)
   │  ├─ Content strands / weightages
   │  ├─ Prerequisites & dependencies
   │  └─ Recommended study hours
   ├─ Store parsed curriculum in database
   └─ Mark version as "processed"

3. PARENT SETUP (Simple)
   ├─ Parent selects:
   │  ├─ Country: Singapore / Malaysia / etc.
   │  ├─ Curriculum type: MOE / IB / Cambridge
   │  ├─ Grade level: Primary 5 / Secondary 2 / etc.
   │  └─ Subject: Mathematics / English / etc.
   ├─ System auto-loads parsed curriculum
   ├─ Parent reviews & confirms (optional manual edits)
   └─ Done in <2 minutes

4. AUTO-UPDATE (Quarterly/Annually)
   ├─ System detects new MOE syllabus release
   ├─ Claude re-parses new version
   ├─ Update stored curriculum
   ├─ Alert parent: "New curriculum available — update scheduled?"
   └─ Option to manually approve update
```

**Acceptance Criteria:**
- [ ] Fetch latest MOE syllabi successfully from 3+ sources
- [ ] Detect curriculum changes (version updates, new files)
- [ ] Parse 5 sample MOE syllabi with 90%+ accuracy
- [ ] Support: MOE (Primary 1-6, Secondary 1-4), IB, Cambridge
- [ ] Store curriculum versions in database with timestamps
- [ ] Parent can select curriculum in <2 minutes
- [ ] Alert system for new curriculum versions
- [ ] Quarterly/annual auto-update checks (configurable)

---

**5.1.2 Adaptive Study Schedule Generation**
- Parent inputs:
  - Exam date
  - Available study hours/week
  - Child's current performance (optional)
  - Subject priorities (optional)
- Claude Opus 4.7 generates:
  - Week-by-week study plan
  - Daily study goals
  - Built-in spacing effect (revisit topics after 2-3 weeks)
  - Buffer time before exam
  - Difficulty progression (easy → hard)
- Schedule auto-adjusts if parent changes available hours or exam date

**Acceptance Criteria:**
- [ ] Generate schedule in <5 seconds
- [ ] Display 12+ week plan in calendar view
- [ ] Show daily goals (e.g., "Ch 3: Intro to Photosynthesis + Review Ch 1-2")
- [ ] Auto-adjust schedule when parent updates availability
- [ ] Include buffer time (2 weeks before exam = review only)

---

**5.1.3 Parent Dashboard**
- **Overview:** Child's name, exam date, overall progress %
- **Calendar view:** 4-week lookahead of scheduled study topics
- **Progress tracking:** 
  - Topics completed vs. scheduled
  - Daily completion status
  - On-track / behind indicator
- **Alerts:** 
  - Child marked topic as "struggling"
  - Missed 2+ scheduled study days
  - Approaching exam date with incomplete topics
- **Quick actions:**
  - View child's bite performance
  - Adjust schedule (extend deadline, reduce hours, etc.)
  - Generate summary report

**Acceptance Criteria:**
- [ ] Dashboard loads in <3 seconds
- [ ] Calendar shows next 4 weeks with visual coding (completed/pending/struggle)
- [ ] Real-time struggle alerts from student app
- [ ] One-click schedule adjustments
- [ ] Export progress report (PDF for teacher/tutor)

---

#### **For Students:**

**5.1.4 Bite-Size Learning App (Web, Mobile-Responsive)**
- **Daily Goal View:**
  - Shows today's study goals (e.g., "Ch 3: 5 bites, 34 minutes total")
  - Clear, non-overwhelming layout
  - Progress bar (X/5 bites completed)
  
- **Bite Interaction:**
  - Each bite: 5-15 min learning chunk
  - Content types: Text explanation, diagram, practice problem, quiz
  - Instant feedback ("Correct!" or "Try again — here's why...")
  - Mood tracking: "How's this topic feeling?" (Struggling / Okay / Got it)
  - Navigation: Next bite / Skip to next / Return to goal
  
- **Adaptive Features:**
  - If student marks "struggling" on a bite → Claude generates simpler explanation
  - If student completes bites fast → Unlock enrichment bites
  - Time estimates adapt based on actual time spent
  
- **Mobile Responsiveness:**
  - Touch-friendly buttons
  - Full-screen mode for focus
  - Offline reading (sync when online)

**Acceptance Criteria:**
- [ ] Display daily goals in <2 seconds
- [ ] Bite content renders correctly (text + embedded diagrams)
- [ ] Mood tracking logs to database
- [ ] Progress syncs to parent dashboard in real-time
- [ ] Mobile responsive (375px+ screens)
- [ ] Accessible (WCAG AA standard)

---

**5.1.5 Bite Generation Engine (AI Backend)**
- Claude Opus 4.7 generates bites from curriculum:
  - Input: "Chapter 3: Photosynthesis (25 pages, exam in 6 weeks)"
  - Output: 7 bites with learning objectives, content, quiz, time estimate
  
- Bite structure:
  ```
  Bite 1: "What is photosynthesis?" (5 min, Foundation)
  ├─ Learning objective
  ├─ Text explanation (2 paragraphs)
  ├─ Key terms (bolded)
  ├─ Diagram (ASCII or React SVG)
  ├─ Practice: Label the diagram
  └─ Feedback logic
  
  Bite 2: "Light reactions" (8 min, Intermediate)
  ├─ Prerequisite: Bite 1
  ├─ Text + more complex diagram
  ├─ Quiz: 3 MCQ
  └─ Explain wrong answers
  ```

- Pedagogical sequencing:
  - Foundation bites first (simple concepts)
  - Build on prerequisites
  - Progressive complexity
  - Mix of content types (read, diagram, quiz, application)

**Acceptance Criteria:**
- [ ] Generate 5-7 bites per chapter in <10 seconds
- [ ] Each bite has clear learning objective + content
- [ ] Quiz questions generated with plausible wrong answers
- [ ] Time estimates match actual student time (refine after beta)
- [ ] Spacing logic: revisit concepts after 2-3 weeks

---

**5.1.6 Authentication & User Accounts**
- Sign up: Email + password
- User roles: Parent, Student
- Parent can create multiple child profiles
- Student login tied to parent account
- Password reset, email verification

**Acceptance Criteria:**
- [ ] Sign up takes <1 minute
- [ ] Secure password hashing
- [ ] Email verification before account activation
- [ ] Parent can add multiple children
- [ ] Student login separate (parent controls access)

---

#### **Analytics & Data Tracking (Parent + Backend):**

**5.1.7 Student Progress Analytics**
- **Parent sees (in dashboard):**
  - Bite completion rate (% of scheduled bites done)
  - Time spent per topic
  - Struggle flags (topics marked "struggling")
  - Learning style preference (deduced from engagement)
  - Pacing: ahead/on-track/behind exam preparation
  
- **Backend tracks (in database):**
  - Bite completion (timestamp, time spent, mood)
  - Learning pattern analysis
  - Difficulty adaptations
  - Engagement metrics

**Acceptance Criteria:**
- [ ] Track bite completion, time spent, mood per student
- [ ] Aggregate data by topic + week
- [ ] Display trends to parent (ahead/behind/on-track)
- [ ] Flag struggle patterns (2+ "struggling" marks)
- [ ] Data export for parent reference

---

### 5.2 NOT in MVP (Explicit Out of Scope)

- ❌ Video content (text + diagrams only for now)
- ❌ Gamification (badges, leaderboards, XP) — keep simple
- ❌ Tutor marketplace / booking system
- ❌ School/teacher dashboard
- ❌ Google Classroom integration
- ❌ Collaborative group study
- ❌ AI chatbot tutor (future: student can ask Claude questions)
- ❌ Mobile native app (web-only for now)
- ❌ Offline mode (future)

---

## 6. USER FLOWS

### 6.1 Parent Onboarding

```
1. Sign up (email, password, school name)
   ↓
2. Add child (name, grade, school)
   ↓
3. Upload syllabus (PDF/Word/image)
   ↓
4. Claude parses → shows results
   ↓
5. Parent reviews & edits (optional)
   ↓
6. Set exam dates & available study hours/week
   ↓
7. Claude generates schedule
   ↓
8. Review schedule (4-week calendar view)
   ↓
9. "Activate" → share login with child
   ↓
10. Dashboard ready (see progress in real-time)
```

**Time to first study plan: 5-8 minutes**

---

### 6.2 Student Daily Study Flow

```
1. Log in (password provided by parent)
   ↓
2. See "Today's Goal" (e.g., "Ch 3: Photosynthesis — 5 bites, 34 min")
   ↓
3. Tap "Start"
   ↓
4. Bite 1 loads: "What is photosynthesis?"
   ├─ Read explanation (2 min)
   ├─ Look at diagram (1 min)
   ├─ Complete practice task (2 min)
   ↓
5. "Mark as complete" → Bite 2 unlocks
   ↓
6. Repeat for Bites 2-5
   ↓
7. Daily goal complete! Mark mood ("Got it") → Parent notified
   ↓
8. Next day: New goal appears
```

**Typical session: 30-40 minutes (flexible — can do multiple short sessions)**

---

### 6.3 Parent Monitoring Flow

```
1. Open dashboard
   ↓
2. See: "Alex has 2/5 bites done today (27 min completed)"
   ↓
3. See struggle alert: "Marked 'struggling' on photosynthesis"
   ↓
4. Click: View this topic → see which bites are hard
   ↓
5. Options:
   ├─ "Generate simpler explanation" (Claude regenerates bite)
   ├─ "Extend deadline" (reschedule remaining bites)
   ├─ "View recommended tutoring" (future feature)
   ↓
6. Make adjustment → Schedule auto-updates
   ↓
7. Next day: See if child improved on topic
```

---

## 7. TECHNICAL ARCHITECTURE

### 7.1 Tech Stack

```
FRONTEND:
├── React 18 (UI framework)
├── TypeScript (type safety)
├── Tailwind CSS (styling)
├── Shadcn/ui (component library)
├── Recharts (analytics charts)
├── React Calendar (schedule visualization)
└── Responsive design (mobile-first)

BACKEND:
├── Node.js + Express (REST API)
├── TypeScript (type safety)
├── Claude Opus 4.7 API (curriculum parsing, bite generation, recommendations)
├── Web search tool (fetch current curriculum info if needed)
└── Environment variables (API keys, secrets)

DATABASE:
├── Supabase (PostgreSQL)
├── Authentication (Supabase Auth)
├── File storage (Supabase Storage for PDFs)
├── Real-time subscriptions (for parent dashboard updates)

DEPLOYMENT:
├── Frontend: Vercel
├── Backend: Vercel (serverless) or Railway
├── Database: Supabase (managed)
└── CDN: Vercel global CDN

THIRD-PARTY:
├── Claude API (Anthropic)
├── Google Drive API (future: sync documents)
├── Google Calendar API (future: sync exam dates)
```

---

### 7.2 Data Architecture

#### **Database Schema (Core Tables)**

```sql
-- Users & Authentication
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  role ENUM ('parent', 'student') NOT NULL,
  password_hash VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Parent-Student Relationship
CREATE TABLE parent_child (
  id UUID PRIMARY KEY,
  parent_id UUID REFERENCES users(id),
  student_id UUID REFERENCES users(id),
  relationship VARCHAR (e.g., "parent", "guardian"),
  created_at TIMESTAMP
);

-- Child Profile
CREATE TABLE children (
  id UUID PRIMARY KEY,
  parent_id UUID REFERENCES users(id),
  name VARCHAR NOT NULL,
  grade VARCHAR (e.g., "Primary 6", "Secondary 2"),
  school_name VARCHAR,
  date_of_birth DATE,
  created_at TIMESTAMP
);

-- Curriculum & Syllabi
CREATE TABLE curricula (
  id UUID PRIMARY KEY,
  child_id UUID REFERENCES children(id),
  subject VARCHAR (e.g., "Mathematics", "Science"),
  curriculum_type VARCHAR (e.g., "MOE", "IB", "Cambridge"),
  exam_date DATE,
  uploaded_file_path VARCHAR,
  parsed_topics JSONB, -- Claude extraction result
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Topics (extracted from curriculum)
CREATE TABLE topics (
  id UUID PRIMARY KEY,
  curriculum_id UUID REFERENCES curricula(id),
  title VARCHAR,
  description TEXT,
  chapter_number INT,
  difficulty_level INT (1-5),
  estimated_hours FLOAT,
  prerequisites UUID[] (references to other topics),
  created_at TIMESTAMP
);

-- Study Schedules
CREATE TABLE schedules (
  id UUID PRIMARY KEY,
  curriculum_id UUID REFERENCES curricula(id),
  child_id UUID REFERENCES children(id),
  exam_date DATE,
  available_hours_per_week INT,
  schedule_json JSONB, -- Week-by-week plan
  status ENUM ('active', 'completed', 'paused'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Study Plan Items (daily goals)
CREATE TABLE study_items (
  id UUID PRIMARY KEY,
  schedule_id UUID REFERENCES schedules(id),
  topic_id UUID REFERENCES topics(id),
  scheduled_date DATE,
  status ENUM ('not_started', 'in_progress', 'completed', 'skipped'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Bite-Size Learning Content
CREATE TABLE bites (
  id UUID PRIMARY KEY,
  topic_id UUID REFERENCES topics(id),
  bite_number INT,
  title VARCHAR,
  learning_objective TEXT,
  difficulty_level INT (1-5),
  time_estimate INT (minutes),
  content_json JSONB, -- { text, diagram, quiz, etc. }
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Student Bite Interactions
CREATE TABLE bite_attempts (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES users(id),
  bite_id UUID REFERENCES bites(id),
  completed_at TIMESTAMP,
  time_spent INT (seconds),
  mood ENUM ('struggling', 'okay', 'got_it'),
  quiz_score FLOAT (0-1),
  created_at TIMESTAMP
);

-- Learning Preferences (deduced from behavior)
CREATE TABLE learning_preferences (
  student_id UUID PRIMARY KEY REFERENCES users(id),
  preferred_content_type ENUM ('text', 'diagram', 'quiz', 'visual', 'mixed'),
  avg_bite_duration INT,
  peak_study_hours VARCHAR (e.g., "7-9pm"),
  struggle_topics UUID[],
  engagement_score FLOAT,
  updated_at TIMESTAMP
);

-- Parent Notifications & Alerts
CREATE TABLE alerts (
  id UUID PRIMARY KEY,
  parent_id UUID REFERENCES users(id),
  student_id UUID REFERENCES users(id),
  alert_type ENUM ('struggle', 'behind_schedule', 'completed_goal', 'exam_approaching'),
  description TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP
);
```

---

### 7.3 API Endpoints (MVP)

#### **Authentication**
```
POST   /auth/signup              → Register parent/student
POST   /auth/login               → Login
POST   /auth/logout              → Logout
POST   /auth/refresh-token       → Refresh JWT
POST   /auth/forgot-password     → Password reset
```

#### **Curriculum**
```
POST   /curriculum/upload        → Upload syllabus PDF
GET    /curriculum/:id           → Get parsed curriculum
POST   /curriculum/:id/parse     → Trigger Claude parsing
PATCH  /curriculum/:id           → Edit parsed topics (parent approval)
```

#### **Schedules**
```
POST   /schedule/generate        → Generate study plan (Claude)
GET    /schedule/:id             → Get schedule details
PATCH  /schedule/:id             → Update available hours, adjust dates
GET    /schedule/:id/items       → Get week's daily goals
PATCH  /schedule/:id/adjust      → Reschedule after parent change
```

#### **Bites**
```
GET    /bites/:id                → Get bite content
POST   /bites/:id/attempt        → Submit bite completion + mood
GET    /bites/:topicId           → Get all bites for topic
POST   /bites/regenerate         → Claude regenerate simpler bite
```

#### **Parent Dashboard**
```
GET    /parent/dashboard         → Overview + alerts
GET    /parent/child/:childId    → Child progress summary
GET    /parent/analytics         → Detailed analytics (charts, trends)
GET    /parent/alerts            → List all alerts
PATCH  /parent/alerts/:id        → Mark alert as read
```

#### **Student App**
```
GET    /student/daily-goal       → Today's study plan
GET    /student/progress         → Personal progress summary
PATCH  /student/profile          → Update student preferences
```

---

### 7.4 Claude Opus 4.7 Integration Points

#### **1. Curriculum Parsing**
```
PROMPT:
"Extract the following from this school syllabus:
- All topics/chapters
- Exam date and weightage per topic
- Prerequisites and learning dependencies
- Recommended study time per topic
- Learning objectives

Respond in JSON format:
{
  topics: [
    { name, chapter, weight%, prereqs, study_hours, objectives }
  ],
  exam_date, 
  total_hours_recommended
}"

INPUT: Uploaded PDF (vision-capable)
OUTPUT: Structured JSON → stored in DB
LATENCY: <5 sec per curriculum
```

#### **2. Schedule Generation**
```
PROMPT:
"Create an adaptive study schedule with these constraints:
- Topics: [parsed from curriculum]
- Exam date: {date}
- Available hours/week: {hours}
- Learning curve: {student_performance_if_available}
- Child's preferred study times: {if_known}

Apply these principles:
- Spacing effect (revisit topics after 2-3 weeks)
- Progressive complexity (simple → hard)
- Prerequisite sequencing
- Buffer time (2 weeks before exam = review)

Output JSON with week-by-week plan:
{
  week: {
    topics: [topic names],
    hours_scheduled: X,
    review_topics: [previous topics to revisit],
    daily_breakdown: {...}
  }
}"

INPUT: Curriculum JSON + parent inputs
OUTPUT: 12-16 week study plan
LATENCY: <5 sec
```

#### **3. Bite Generation**
```
PROMPT:
"Create 5-7 bite-size learning chunks for this topic:
Topic: {topic_name}
Duration: {total_hours}
Learning level: {foundation/intermediate/advanced}
Prerequisite knowledge: {from curriculum}

Each bite should:
- Have clear learning objective (1-2 sentences)
- Include explanation text (100-300 words)
- Include ASCII diagram OR description of visual
- Include practice task or quiz
- Time estimate (5-15 minutes)
- Link to prerequisites

Format as JSON:
{
  bites: [
    {
      title, objective, text, diagram, practice_task, 
      quiz: [{question, options, correct_answer, explanation}],
      time_estimate, difficulty, prerequisites
    }
  ]
}"

INPUT: Topic from curriculum
OUTPUT: 5-7 bites
LATENCY: <10 sec
```

#### **4. Adaptive Recommendations**
```
PROMPT:
"Based on this student's learning data, recommend optimizations:
- Student: {name, grade, subject}
- Progress so far: {bites completed, time spent, moods}
- Struggle patterns: {topics marked 'struggling'}
- Exam: {date, current pace}

Analyze and recommend:
1. Schedule adjustments (extend time on hard topics?)
2. Content adjustments (simpler bites needed?)
3. Tutoring suggestions (should parent hire tutor?)
4. Time optimization (when should they study?)

Output:
{
  recommendations: [{priority, action, rationale}]
}"

INPUT: Student progress data
OUTPUT: 3-5 actionable recommendations
LATENCY: <5 sec (async)
```

#### **5. Bite Regeneration (Adaptive)**
```
PROMPT:
"This student marked 'struggling' on this bite 2x.
Original bite: {original content}
Student performance: {quiz score, time spent}

Create a SIMPLER version using:
- Shorter sentences
- More examples
- Simpler diagram
- Scaffolded quiz (easier questions first)

Output same JSON structure as before"

INPUT: Original bite + feedback
OUTPUT: Regenerated bite
LATENCY: <3 sec
```

---

---

## 7.6 Automated Curriculum Sync System

### 7.6.1 Architecture Overview

```
MOE/Education Authorities
        ↓
   (Websites + PDFs + APIs)
        ↓
Web Scraping Layer (Scheduled)
├─ GitHub Actions / Cloud Scheduler
├─ Fetch: MOE syllabi, data.gov.sg API, IB guides
├─ Detect: Changes (hash comparison, version numbers)
└─ Store: Raw PDFs + metadata in Supabase Storage
        ↓
Claude Parsing Layer (Async)
├─ Trigger on new curriculum detection
├─ Claude Opus 4.7 extracts topics, objectives, prerequisites
├─ Store: Structured curriculum JSON in database
└─ Index: For fast parent lookup
        ↓
Parent-Facing Layer
├─ Parent selects: Country → Type → Grade → Subject
├─ System loads pre-parsed curriculum instantly
├─ Parent reviews (optional edits)
└─ Updates triggered automatically on new releases
```

### 7.6.2 Curriculum Data Sources

| Source | Coverage | Update Frequency | Method |
|--------|----------|------------------|--------|
| **MOE Website** | Singapore primary/secondary | 1-2x per year | Web scrape PDFs |
| **data.gov.sg API** | School metadata, policy changes | Quarterly | REST API calls |
| **IB Curriculum Centre** | IB syllabi, exam guides | Annually | Download + hash check |
| **Cambridge Assessment** | IGCSE, A-Level specs | Annually | Web scrape public docs |
| **EdExcel/Pearson** | GCE syllabi | Annually | Download + parse |
| **School-Uploaded** | Custom/proprietary curricula | On-demand | Parent upload |

### 7.6.3 Automated Fetch Schedule

```javascript
// Scheduled tasks (Cloud Scheduler / GitHub Actions)

// MOE Syllabi - Weekly check
Every Monday 2 AM Singapore Time:
├─ Fetch MOE primary syllabi (P1-6)
├─ Fetch MOE secondary syllabi (S1-4, O/N-Levels)
├─ Compare with stored hashes
├─ If changed:
│  ├─ Queue for Claude parsing
│  ├─ Log version update
│  └─ Alert admin panel
└─ Retry on failure (3x with exponential backoff)

// International curricula - Monthly check
Every 1st of month 2 AM:
├─ Fetch IB curriculum guides
├─ Fetch Cambridge syllabi
├─ Fetch EdExcel specs
├─ Store new versions
└─ Parse if changed

// data.gov.sg API - Weekly
Every Friday 10 PM:
├─ Query school information updates
├─ Update school-to-curriculum mapping
├─ Detect policy changes
└─ Alert if MOE curriculum changes announced
```

### 7.6.4 Change Detection & Versioning

```sql
-- Curriculum versions table
CREATE TABLE curriculum_versions (
  id UUID PRIMARY KEY,
  source VARCHAR (e.g., 'MOE_primary_math_p5'),
  curriculum_type VARCHAR (MOE, IB, Cambridge),
  version_code VARCHAR (e.g., '2021_updated_p5'),
  release_date DATE,
  file_hash VARCHAR (SHA256 of PDF),
  parsed_topics JSONB, -- Claude extraction
  status ENUM ('new', 'parsed', 'published'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Track change events
CREATE TABLE curriculum_change_log (
  id UUID PRIMARY KEY,
  curriculum_version_id UUID,
  change_type VARCHAR (new_release, updated_topics, new_exam_dates),
  description TEXT,
  affected_grades VARCHAR[],
  affected_subjects VARCHAR[],
  parent_notification_sent BOOLEAN,
  timestamp TIMESTAMP
);
```

**Change Detection Logic:**
```
1. HASH COMPARISON:
   - Download new PDF
   - Calculate SHA256 hash
   - Compare with stored hash
   - If different → New version detected

2. CONTENT COMPARISON (for PDFs with same hash):
   - Parse with Claude
   - Compare extracted topics
   - If significant differences → Alert

3. SEMANTIC VERSIONING:
   - Check document metadata (version number, date)
   - MOE usually updates July/Aug (new academic year)
   - Alert if version > stored version

4. ALERT SYSTEM:
   If changed:
   ├─ Log to curriculum_change_log
   ├─ Queue for Claude parsing (async)
   ├─ Notify admin panel
   └─ Email school contact (if available)
```

### 7.6.5 Claude Parsing Pipeline (Async)

```javascript
// Triggered when new curriculum detected

async function parseCurriculumAsync(curriculumVersionId) {
  const curriculum = await db.getCurriculumVersion(curriculumVersionId);
  
  // Fetch PDF from storage
  const pdfPath = curriculum.file_path;
  const pdfBuffer = await supabaseStorage.getFile(pdfPath);
  
  // Claude Vision: Extract structured data
  const extracted = await claude.messages.create({
    model: "claude-opus-4.7",
    max_tokens: 4000,
    messages: [{
      role: "user",
      content: [
        {
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: pdfBuffer.toString('base64')
          }
        },
        {
          type: "text",
          text: `Extract curriculum structure:
          - Topics/chapters (with numbers)
          - Learning objectives (per topic)
          - Estimated study hours
          - Prerequisites
          - Exam weightages
          - Recommended teaching time
          
          Output JSON: {
            topics: [{ name, objectives[], hours, weight%, prereqs }]
          }`
        }
      ]
    }]
  });
  
  // Parse + validate
  const parsedTopics = JSON.parse(extracted.content[0].text);
  
  // Store in database
  await db.updateCurriculumVersion(curriculumVersionId, {
    parsed_topics: parsedTopics,
    status: 'parsed',
    updated_at: new Date()
  });
  
  // Index for search
  await searchIndex.index(curriculumVersionId, parsedTopics);
  
  // Notify admin
  await notifications.send('admin', {
    type: 'curriculum_parsed',
    curriculum: curriculum.source,
    topics_count: parsedTopics.length
  });
}

// Schedule async processing
when_new_curriculum_detected → queue_parse_job(curriculumVersionId)
process_parse_queue_hourly()
```

### 7.6.6 Parent Curriculum Selection Flow

```
PARENT DASHBOARD:
┌─────────────────────────────────────────┐
│ New Study Plan for: Alex (Sec 2)        │
├─────────────────────────────────────────┤
│ 1. Select Curriculum Type:              │
│    [v] MOE (Singapore)                  │
│       ☐ IB                              │
│       ☐ Cambridge                       │
│       ☐ Custom (Upload)                 │
│                                         │
│ 2. Select Grade/Level:                  │
│    [v] Secondary 2                      │
│                                         │
│ 3. Select Subject:                      │
│    [v] Mathematics (Express)            │
│                                         │
│ ✓ Curriculum Loaded:                    │
│  "MOE Secondary 2 Mathematics (2024)"   │
│   Last updated: Oct 2024                │
│                                         │
│ 📋 Topics found: 12                     │
│ ⏱️  Recommended hours: 120               │
│                                         │
│ 4. Exam Date:                           │
│    [Nov 15, 2024        ]               │
│                                         │
│ 5. Available study hours/week:          │
│    [10              ] hours             │
│                                         │
│    [Generate Schedule]                  │
└─────────────────────────────────────────┘

BEHIND THE SCENES:
Parent selects → System queries curriculum_versions table
  ↓
Find latest MOE Secondary 2 Math (status: 'parsed')
  ↓
Load pre-parsed topics from database (instant)
  ↓
Display curriculum info (already extracted by Claude)
  ↓
Parent clicks Generate → Schedule generation happens
```

### 7.6.7 Curriculum Update Notifications

```
SCENARIO: MOE releases updated Secondary 2 Math syllabus

1. DETECTION (Automated):
   - Weekly scraper detects new syllabus
   - Hash comparison: 2024_old ≠ 2024_new
   - Version: 2024 vs 2025 detected
   - Queue for parsing

2. PARSING (Async, within 1 hour):
   - Claude parses new version
   - Extract topics, objectives, changes
   - Store as curriculum_version (status: 'parsed')
   - Log changes in curriculum_change_log

3. NOTIFICATION:
   Parent Dashboard Alert:
   ┌──────────────────────────────────────┐
   │ ℹ️  New Curriculum Update Available   │
   ├──────────────────────────────────────┤
   │ MOE has released the 2025 update     │
   │ for Secondary 2 Mathematics.         │
   │                                      │
   │ Your current plan uses: 2024 version │
   │ New topics added: 3                  │
   │ Topics modified: 2                   │
   │ No topics removed                    │
   │                                      │
   │ [View Comparison] [Update Plan]      │
   │            [Later]                   │
   └──────────────────────────────────────┘

4. PARENT ACTION:
   Option A: "Update Plan"
   - Re-generate schedule with new curriculum
   - Preserve exam date
   - Redistribute study hours
   - Alex's plan updated automatically
   
   Option B: "View Comparison"
   - Show what changed (topic-by-topic)
   - Show impact on study time
   
   Option C: "Later"
   - Remind in 2 weeks

5. LOGGING:
   - Log update event in curriculum_change_log
   - Track: which parents updated, when, impact
   - Send to analytics
```

### 7.6.8 Supported Curricula (MVP Launch)

```
SINGAPORE:
├─ MOE Primary (P1-6)
│  ├─ English Language
│  ├─ Mathematics
│  ├─ Science
│  └─ Mother Tongue Language
│
├─ MOE Secondary (S1-4)
│  ├─ English Language
│  ├─ Mathematics (Standard, Foundation)
│  ├─ Science (Physics, Chemistry, Biology)
│  ├─ Additional Mathematics
│  └─ Mother Tongue Language
│
├─ MOE O-Levels / N(A)-Levels
│  └─ Same subjects as Secondary
│
└─ IB (International Schools)
   ├─ IB Middle Years (Grades 6-10)
   └─ IB Diploma (Grades 11-12)

PLANNED (Phase 2):
├─ Cambridge IGCSE
├─ UK A-Levels
├─ Australia's VCE
└─ Malaysia's SPM
```

---

---

### 7.7 Deployment Pipeline

```
Development:
├── Local: Next.js dev server + Supabase local
├── Git: Push to GitHub
└── Preview: Vercel preview deployment

Staging:
├── Deploy to staging.schoolhub.sg
├── Test with real syllabi
├── Load testing (concurrent users)
├── Test web scraping jobs

Production:
├── Main branch → prod deployment
├── Database migrations (tested in staging)
├── Monitoring: Sentry (errors), LogRocket (user behavior)
├── Scaling: Vercel auto-scaling + Supabase read replicas
├── Scheduled jobs: GitHub Actions for curriculum fetching
├── Logging: CloudWatch / Datadog for scraper health
```

---

### 8.1 Pricing Model

| Tier | Price | Features | Target |
|------|-------|----------|--------|
| **Free** | Free | 1 child, 1 study plan/year, basic dashboard, 50 bites/month | Awareness + conversion funnel |
| **Scholar** | $9.99/mo (SGD) | 1-2 children, unlimited schedules, all bites, full dashboard, parent alerts | Individual families |
| **Scholar Pro** | $19.99/mo (SGD) | 3+ children, advanced analytics, learning style insights, priority support, future tutor marketplace | Serious families |
| **School License** | $3-5/student/year | School deploys for all students, teacher dashboard (future), curriculum integration, bulk administration | Schools (MOE, private) |

**Rationale:**
- Free tier: Acquire users, prove value, convert to paid
- Scholar: Core monetization, targets busy parents ($100/year for 1 child)
- Scholar Pro: Upsell for multi-child families
- School License: B2B recurring revenue, high LTV

---

### 8.2 Revenue Projections (Year 1)

```
Assumption: Singapore market = 300K school-age children

Month 3:
├── 200 users acquired
├── 20% conversion to paid (40 Scholar customers)
└── MRR: $400

Month 6:
├── 500 users
├── 12% conversion (60 Scholar + 5 Scholar Pro)
└── MRR: $700

Month 12:
├── 1,500 users
├── 10% conversion (150 Scholar + 15 Scholar Pro)
├── 2 schools piloting (100 students = $300/mo)
└── MRR: $2,400

Year 1 Total Revenue: ~$15,000

Breakeven: Month 18-20 (assuming $5K/mo operational costs)
```

---

### 8.3 Future Revenue Streams (Post-MVP)

1. **Tutor Marketplace** (10-15% referral fee on bookings)
2. **Premium Content** (exam-specific guides, curated by educators)
3. **School Advanced Features** (real-time monitoring, deeper integrations)
4. **B2B Analytics** (anonymized insights sold to ed-tech companies, MOE?)
5. **Professional Development** (teacher training on using SchoolHub)

---

## 9. ROADMAP

### Phase 1: MVP (Hackathon → 3 Months Post)
- [x] Curriculum upload & parsing
- [x] Schedule generation
- [x] Parent dashboard
- [x] Student bite-size learning app
- [x] Real-time progress tracking
- [x] Launch in Singapore
- [ ] Beta: 500 users, validate problem

**Success Criteria:** 60% retention after 2 months, 10% freemium→paid conversion

---

### Phase 2: Growth & Monetization (Months 4-9)
- [ ] Freemium model: 500 → 2,000 users
- [ ] Enhanced parent recommendations (tutor matching)
- [ ] Learning style detection (infer from bite completion patterns)
- [ ] School pilot program (2-3 schools, refined teacher dashboard)
- [ ] Student referral program (friend joins, both get discount)
- [ ] Content curation: Partner with educators for bite verification

**Success Criteria:** 1,500+ active users, $2K+ MRR, 3 schools in pilot

---

### Phase 3: Expansion & Platforms (Months 10-15)
- [ ] Video content (commission educators or partner with platforms)
- [ ] Google Classroom integration (sync assignments → study plan)
- [ ] Mobile native app (iOS + Android)
- [ ] Expand to: Malaysia, Hong Kong, India
- [ ] AI tutoring chatbot (students ask questions, Claude explains)
- [ ] School admin dashboard (full institutional deployment)

**Success Criteria:** 5K+ users, $5K+ MRR, 1st school production deployment

---

### Phase 4: Scale & Sustainability (Year 2+)
- [ ] Expand to 5+ countries across Asia
- [ ] Enterprise contracts (MOE integration)
- [ ] Advanced features: Group study, peer collaboration
- [ ] Adaptive AI tutoring (student-specific coaching)
- [ ] Research partnerships (publish insights on learning effectiveness)

---

## 10. SUCCESS METRICS & KPIs

### User Acquisition
- **Signup rate:** Target 50/week by Month 3
- **CAC (Customer Acquisition Cost):** Target <$5 by Month 6
- **Channels:** Organic (parents), school partnerships, Facebook ads

### Engagement
- **DAU (Daily Active Users):** Target 40% of active users
- **Bite completion rate:** Target 70%+ of scheduled bites
- **Session duration:** 30-45 minutes for study sessions
- **Return rate:** % of users returning 7 days later

### Monetization
- **Freemium conversion:** Target 8-12%
- **ARPU (Average Revenue Per User):** Target $3/month by Month 6
- **Churn rate:** Target <5% MoM
- **LTV (Lifetime Value):** Target 12x CAC by Month 12

### Academic Outcomes (Validation)
- **Grade improvement:** Parent survey post-exam (target +10% improvement)
- **Student confidence:** NPS score for student experience
- **Parent satisfaction:** NPS for parent dashboard

### Operational
- **API latency:** <5 sec for parsing, <10 sec for schedule generation
- **Uptime:** 99.5%+
- **Error rate:** <0.1% of API calls

---

## 11. CONSTRAINTS & ASSUMPTIONS

### Assumptions
1. **Singapore education market** is underserved for adaptive study tools
2. **Parents are willing to pay $10-20/month** for organized study support
3. **Claude Opus 4.7** can accurately parse diverse Singapore syllabi
4. **Curriculum alignment** (MOE, IB, international schools) is key differentiator
5. **Student engagement** improves with bite-size + progress visualization
6. **Network effects** via school adoption will drive growth

### Constraints
1. **Regulation:** PDPA (Singapore personal data protection) compliance required
2. **Education authority approval:** MOE may require curriculum alignment review
3. **Competition:** May face adoption from established ed-tech players
4. **Localization:** Singapore-specific content + language (English + Chinese support?)
5. **Seasonality:** Exam periods (Nov-Dec, May-June) drive peak usage
6. **Mobile:** Limited mobile app in MVP (web-first approach)

### Technical Constraints
- Claude API costs: Budget $500-1K/month for MVP usage
- Supabase scale: Handle 1K concurrent users by end of Year 1
- Curriculum parsing: Requires human review for accuracy (not fully automated)

---

## 12. GO-TO-MARKET STRATEGY

### Phase 1: Launch (Month 1-2)
1. **Beta launch:** Invite 50-100 parents (friends, referrals, edu forums)
2. **Feedback loop:** Weekly surveys, iterate on UX
3. **Press/PR:** Local edu blogs, parenting forums (HardwareZone, EDMW, etc.)
4. **Word-of-mouth:** Referral incentive (3 months free for refer)

### Phase 2: Growth (Month 3-6)
1. **School partnerships:** Approach 5-10 secondary schools for pilots
2. **Paid acquisition:** Facebook/Instagram ads targeting parents with school-age kids
3. **Content marketing:** Blog posts ("How to study smarter, not harder")
4. **Partnership:** Align with tuition centers, cram schools for cross-promotion

### Phase 3: Enterprise (Month 6-12)
1. **School sales:** Demo to MOE/private schools, establish school tier
2. **Institutional adoption:** Approach IB/Cambridge schools
3. **Corporate wellness:** Partner with companies offering family benefits

---

## 13. RISK MITIGATION

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|-----------|
| **Curriculum parsing errors** | High | Medium | Manual review process, educator validation, user feedback |
| **Poor student engagement** | Medium | High | A/B test bite formats, gamification, parent motivation |
| **Freemium conversion fails** | Medium | High | Adjust pricing, premium features, school partnerships for revenue |
| **School integration complexity** | Medium | Medium | Start with 1 school pilot, learn, scale |
| **Claude API costs too high** | Low | Medium | Optimize prompts, caching, move to cheaper model for production |
| **Data privacy violations** | Low | Critical | PDPA compliance review, audit, secure data handling |
| **Competitor enters market** | Medium | Medium | Focus on curriculum expertise, school relationships, retention |

---

## 14. SUCCESS STORY (Post-Launch Vision)

**Priya's Journey:**
1. **Week 1:** Uploads syllabus in 2 min. Gets 12-week study plan. Shares login with son.
2. **Week 2-4:** Son completes daily bite-size lessons (30-40 min/day). Priya gets progress notifications.
3. **Week 8:** Son marked "struggling" on 2 topics. Priya sees recommendation: "Consider 2h tutoring." Books tutor via SchoolHub marketplace.
4. **Week 12:** Exam review phase. Son has completed 95% of curriculum. Confident.
5. **Post-exam:** Son scores A. Priya renews subscription for next semester. Refers 2 friends.

**Impact:**
- Priya: Stress ↓, confidence ↑, better grade for son
- Son: Consistent studying ↓ cramming, confident exam approach
- School: Better outcomes, reduced parent stress
- SchoolHub: Happy user, referral, retention

---

## 15. APPENDIX

### A. Sample Curriculum Parsing (Example Output)

**Input:** MOE Secondary 2 Physics Syllabus (PDF, 30 pages)

**Claude Output (JSON):**
```json
{
  "curriculum": {
    "subject": "Physics",
    "level": "Secondary 2",
    "curriculum_type": "MOE",
    "exam_date": "2026-11-15",
    "total_study_hours": 120,
    "topics": [
      {
        "id": "topic_1",
        "name": "Measurement",
        "chapters": ["1.1 Physical quantities", "1.2 SI Units"],
        "estimated_hours": 8,
        "weight": 10,
        "prerequisites": [],
        "learning_objectives": [
          "Understand SI units",
          "Convert between units",
          "Understand significant figures"
        ]
      },
      {
        "id": "topic_2",
        "name": "Kinematics",
        "chapters": ["2.1 Motion", "2.2 Acceleration"],
        "estimated_hours": 15,
        "weight": 15,
        "prerequisites": ["topic_1"],
        "learning_objectives": [
          "Define velocity and acceleration",
          "Use kinematic equations",
          "Interpret motion graphs"
        ]
      }
      // ... more topics
    ]
  }
}
```

---

### B. Sample Schedule (Example Output)

**Input:** Exam date: Nov 15, 2026. Available: 10 hours/week. Grade: Secondary 2.

**Claude Output:**
```json
{
  "schedule": {
    "start_date": "2026-08-01",
    "exam_date": "2026-11-15",
    "total_weeks": 16,
    "weeks": [
      {
        "week": 1,
        "dates": "Aug 1-7",
        "topics": ["Measurement: Unit conversion"],
        "hours_scheduled": 8,
        "daily_breakdown": {
          "Monday": "Measurement intro (2h)",
          "Wednesday": "Unit conversion practice (2h)",
          "Friday": "Quiz & review (2h)"
        }
      },
      {
        "week": 2,
        "dates": "Aug 8-14",
        "topics": ["Kinematics: Intro"],
        "review_topics": ["Measurement: Unit conversion"],
        "hours_scheduled": 10
      }
      // ... weeks 3-14
      {
        "week": 15,
        "dates": "Nov 1-7",
        "topics": [],
        "review_topics": ["All physics topics"],
        "hours_scheduled": 10,
        "activity": "Mock exam + weak areas"
      }
    ]
  }
}
```

---

### C. Sample Bite (Example Output)

**Topic:** Photosynthesis (Biology)

```json
{
  "topic": "Photosynthesis",
  "bites": [
    {
      "bite_id": "bite_1",
      "title": "What is photosynthesis?",
      "learning_objective": "Understand the definition and importance of photosynthesis",
      "difficulty": 1,
      "time_estimate": 5,
      "content": {
        "text": "Photosynthesis is the process by which plants use light energy to convert water and carbon dioxide into glucose and oxygen. It occurs in the chloroplasts of plant cells. The equation is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. Photosynthesis is essential for life on Earth because it produces oxygen and forms the base of most food chains.",
        "key_terms": ["photosynthesis", "chloroplasts", "glucose", "oxygen"],
        "diagram": "ASCII diagram of leaf cross-section with chloroplast"
      },
      "practice": {
        "type": "fill_blanks",
        "prompt": "Complete the equation: __ + __ + light energy → glucose + __",
        "feedback": "Correct! The reactants are CO₂ and H₂O, and O₂ is produced."
      }
    },
    {
      "bite_id": "bite_2",
      "title": "Light reactions vs. Dark reactions",
      "learning_objective": "Differentiate between the two stages of photosynthesis",
      "difficulty": 2,
      "time_estimate": 8,
      "prerequisites": ["bite_1"],
      "content": {
        "text": "Photosynthesis has two main stages. Light reactions occur in the thylakoids and require light. They produce ATP and NADPH, which are used in the dark reactions. Dark reactions (Calvin cycle) occur in the stroma and don't directly require light—they use ATP and NADPH from light reactions to convert CO₂ into glucose.",
        "diagram": "Table comparing light vs. dark reactions"
      },
      "quiz": [
        {
          "question": "Where do light reactions occur in the chloroplast?",
          "options": ["Stroma", "Thylakoids", "Nucleus", "Cytoplasm"],
          "correct": "Thylakoids",
          "explanation": "Light reactions happen in the thylakoid membranes where chlorophyll captures light."
        }
      ]
    }
    // ... more bites
  ]
}
```

---

### D. Parent Notification Examples

```
ALERT 1 (Struggle Detection):
"Alex marked 'struggling' on photosynthesis twice today. 
This topic may need more explanation. 
[View bite] [Regenerate simpler version] [Get tutoring help]"

ALERT 2 (Behind Schedule):
"Alex has completed 4 of 8 scheduled topics. 
At current pace, exam prep will finish 5 days late. 
[Adjust schedule] [Extend study hours] [View recommendations]"

ALERT 3 (Positive):
"Alex completed all today's bites! 
Topics mastered: Photosynthesis basics, Light reactions. 
Mood: 'Got it' on most topics. Great progress!"
```

---

## 16. DOCUMENT METADATA

| Field | Value |
|-------|-------|
| **Document Version** | 1.0 |
| **Last Updated** | April 23, 2026 |
| **Status** | Approved for Hackathon Development |
| **Owner** | SchoolHub Team |
| **Target Launch** | June 2026 (Beta) |
| **Primary Market** | Singapore |
| **Next Review** | Post-Hackathon (May 2026) |

---

**END OF PRD**

---

## Key Approval Sign-offs (To be completed)

- [ ] Product Owner: __________ (Signature)
- [ ] Engineering Lead: __________ (Signature)
- [ ] Design Lead: __________ (Signature)
- [ ] Business Lead: __________ (Signature)

**Date:** ________________
