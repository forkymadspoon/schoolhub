**SCHOOLHUB**

*Product Requirements Document*

Adaptive Learning & Study Scheduling Platform · Singapore

  ---------------------------- ------------------------------------------
  **Version**                  3.0 --- SEN & Mental Health Update

  **Updated**                  April 2026

  **Market**                   Singapore (K2 → Primary 6)

  **Target Launch**            June 2026 (Beta)

  **Status**                   **Approved for MVP Development**
  ---------------------------- ------------------------------------------

**1. Vision & Mission**

**Vision**

Every student in Singapore aged 6--12 has access to personalised,
structured study support that eliminates academic stress, prevents
burnout, and enables consistent, sustainable learning --- including
children with Special Education Needs.

**Mission**

Build an intelligent study companion that helps busy parents create
adaptive, curriculum-aligned study schedules and track holistic child
wellbeing --- transforming exam preparation from chaotic cramming into
organised, confident success.

**Core Differentiator**

SchoolHub is the only Singapore EdTech platform combining AI-driven
adaptive scheduling, SEN behavioural frameworks, and mental health
guardrails --- turning a parent\'s biggest anxiety (\'are we on track
and is my child okay?\') into a real-time answer.

**2. Problem Statement**

Parents struggle to translate MOE syllabi into actionable, exam-ready
study plans. Students face disorganised revision, last-minute cramming,
and burnout. Parents of SEN children lack structured behavioural tools
to support learning at home. Current solutions are not curriculum-aware,
not adaptive, and do not address child wellbeing.

**Pain Points by Persona**

-   Parent: No time to research syllabi, manually track topics, or
    enforce consistent habits across multiple children. No tools for SEN
    home support.

-   Student: Overwhelmed by exam scope, unsure what to study next, no
    feedback on weak topics, no safeguard against burnout.

-   SEN Parent: Existing platforms ignore ADHD/Autism learning profiles.
    No ABA or CBT-informed scheduling tools for home use.

**3. Product Scope --- MVP**

-   Platform: Web-only (responsive desktop + mobile browser). No native
    app for MVP.

-   Content format: Text + diagrams. Video deferred to Phase 2.

-   Curriculum: Standalone MOE-aligned. Google Classroom integration
    post-MVP.

-   Subjects: All MOE subjects (K2 uses pre-built readiness tracks).

-   Target launch: June 2026 Beta.

**4. User Personas**

**Parent --- Priya, 38**

-   Working professional, 2 school-age children (K2, P4).

-   Spends \$800/month on tuition; wants better ROI.

-   Primary decision-maker and payment owner.

-   WhatsApp-native; checks phone 40+ times/day.

**Student --- Aiden, 10 (Primary 4)**

-   Motivated but easily distracted. Responds to rewards and visible
    progress.

-   Uses iPad for school. Thrives on streaks and badges.

**SEN Parent --- Sarah, 42**

-   Child diagnosed with ADHD (P3, age 9).

-   Struggles with consistent study routines. Seeks structured, calm
    home learning tools.

-   Frustrated that mainstream platforms do not accommodate her child\'s
    pace.

**5. Age & Grade Scope**

  --------------- ----------- --------------- -----------------------------
  **Grade**       **Age**     **Content       **Bite Length**
                              Basis**         

  K2              6           Pre-built P1    5 min max
                              readiness       

  P1              7           MOE syllabus    5--10 min

  P2              8           MOE syllabus    5--10 min

  P3              9           MOE syllabus    5--10 min

  P4              10          MOE syllabus    5--10 min

  P5              11          MOE syllabus    5--10 min

  P6              12          MOE syllabus    5--10 min
                              (PSLE)          
  --------------- ----------- --------------- -----------------------------

**6. Feature Set --- MVP v3.0**

15 features across four priority tiers. Build order: Critical → High →
Medium → Low.

  -------- ------------------ -------------- ------------ -------------------------------
  **\#**   **Feature**        **Priority**   **Status**   **Description**

  1        **Gamification     **CRITICAL**   NEW          Streak counter, daily XP,
           Layer**                                        subject badges. Drives daily
                                                          habit loop ages 6--12.

  2        **Chinese Language **CRITICAL**   NEW          K2 character intro + P1--P6 MOE
           Support**                                      Mandarin. Pinyin toggle for
                                                          early primary.

  3        **Tiered Pricing + **CRITICAL**   NEW          Free 7-day → Scholar \$18/mo →
           Free Trial**                                   Scholar Pro \$35/mo. No CC for
                                                          trial.

  4        **Data Input ---   **CRITICAL**   NEW          Upload spelling lists,
           Manual & File                                  assessment dates, school
           Upload**                                       calendars. Manual entry
                                                          fallback.

  5        **SEN Support      **CRITICAL**   NEW          ADHD and Autism profiles. ABA
           Framework**                                    and CBT-informed scheduling and
                                                          content pacing.

  6        **Mental Health    **CRITICAL**   NEW          Automated workload reduction
           Guardrails**                                   alerts. Burnout risk detection.
                                                          Holistic growth prompts.

  7        **3-Minute         **HIGH**       ENHANCED     Under 3 min. Pre-fill from MOE
           Onboarding**                                   syllabus. K2 path: Preparing
                                                          for P1.

  8        **Sibling Timeline **HIGH**       ENHANCED     Centralised multi-child
           Dashboard**                                    schedule view. Conflict
                                                          detection across siblings.

  9        **One-Tap Schedule **HIGH**       ENHANCED     Triggers at \<60% weekly
           Regeneration**                                 completion. Delta preview
                                                          before confirm. No re-setup.

  10       **Configurable     **HIGH**       ENHANCED     Weekly digest / daily progress
           Notifications**                                / real-time. Telegram primary,
                                                          Twilio fallback.

  11       **Shareable        **MEDIUM**     NEW          WhatsApp card 1080×1350px.
           Progress Report**                              Generated Sunday. Watermark +
                                                          app link.

  12       **Exam Countdown   **MEDIUM**     NEW          Persistent on every screen.
           Widget**                                       Green/Yellow/Red by days
                                                          remaining.

  13       **Weak Topic       **MEDIUM**     ENHANCED     AI flags gap + plain-language
           Explanations**                                 WHY + recommended bite +
                                                          one-tap action.

  14       **Dark Mode**      **LOW**        NEW          Night-mode toggle. Scholar and
                                                          Scholar Pro plans.

  15       **Offline Mode     **LOW**        NEW          Workbox service worker.
           (PWA)**                                        Assigned bites only. Scholar
                                                          Pro. Test iOS Safari.
  -------- ------------------ -------------- ------------ -------------------------------

**7. Feature Detail**

**7.1 Data Input --- Manual & File Upload (NEW · CRITICAL)**

Parents can input all school-specific data through manual entry or file
upload. No child\'s schedule should require re-keying data that already
exists as a file.

  ------------------ ------------------ ----------------------------------
  **Input Type**     **Method**         **Details**

  **Spelling Lists** Manual entry or    Parent types word list or uploads
                     file upload        .csv/.txt. System parses and
                                        creates weekly spelling bites.

  **Assessment       Calendar picker or Upload school calendar PDF or .ics
  Dates**            file upload        file. Manual date entry fallback.
                                        Common SG exam dates pre-filled.

  **School           File upload or     Upload school term calendar.
  Calendars**        manual entry       System auto-inserts school
                                        holidays as study-free days.
                                        Parent can override.

  **MOE Syllabus     PDF upload or      Claude Sonnet parses. MOE-standard
  (P1--P6)**         template select    templates pre-loaded. 90%+
                                        accuracy target.

  **K2 Readiness     Parent selection   English, Math, Chinese Foundations
  Tracks**                              tracks. No file upload required.
                                        Pre-built static content.
  ------------------ ------------------ ----------------------------------

**File Format Support**

-   Spelling lists: .csv, .txt, .xlsx, manual text entry

-   Assessment dates: .ics (iCal), .pdf (parsed by Claude), manual
    calendar picker

-   School calendars: .ics, .pdf, manual entry

-   MOE syllabus: .pdf, pre-loaded templates

**Acceptance Criteria**

-   File upload supports drag-and-drop and tap-to-browse.

-   Parsing errors shown inline with manual correction option.

-   Uploaded data editable after import --- no locked fields.

-   All file types validated before processing. Unsupported formats
    rejected with clear error.

**7.2 Dynamic Scheduling --- Sibling Timeline Dashboard (ENHANCED ·
HIGH)**

Centralised view showing all children\'s study schedules on a single
screen. Parents managing multiple siblings see conflicts and
opportunities at a glance.

**Dashboard Features**

-   Weekly calendar view: all children\'s bites displayed in
    colour-coded lanes.

-   Conflict detection: flags days where siblings have overlapping
    high-intensity study or multiple assessments.

-   Load balancing suggestion: AI recommends redistributing bites when
    one child is overloaded relative to siblings.

-   Profile switcher in top navigation --- always visible. Scholar: 2
    children. Scholar Pro: 4 children.

-   Each child has independent schedule, progress, and gamification
    state.

-   Parent receives one consolidated notification covering all children.

**Schedule Regeneration**

-   Trigger: student completes less than 60% of weekly bites.

-   Trigger: parent manually initiates.

-   Trigger: exam date or school calendar changed.

-   UX: banner → one-tap Regenerate → modal shows plain-language reason
    + delta → Confirm. No re-setup.

-   Reason text is always shown above the delta: a single sentence
    explaining *why* the schedule changed in parent-readable language
    (e.g. "Aiden completed 45% of bites this week, so we've lightened
    next week's load"). Reason is derived from the trigger type and
    relevant metric, not from Claude.

-   All regenerations logged in dashboard history with reason text
    preserved.

**7.3 Mental Health Guardrails (NEW · CRITICAL)**

Automated recommendation system monitoring child workload and wellbeing
signals. Surfaces actionable suggestions to reduce academic pressure and
promote holistic growth. Never a diagnostic tool --- recommendations are
suggestions only, always overridable by parent.

  ------------------- ------------------- -------------------------------
  **Signal**          **Trigger           **Recommended Action**
                      Threshold**         

  Overload risk       Study hours exceed  Alert parent: suggest reducing
                      2x weekly default   bites by 20%. Prompt 1 rest
                                          day.

  Burnout risk        Streak drops 3+     Pause gamification pressure.
                      consecutive days    Surface wellbeing tip. Suggest
                                          2-day break.

  Comprehension       Same topic failed   Flag weak topic. Recommend
  plateau             3+ bites in a row   prerequisite bite. Suggest
                                          parent discussion.

  Activity imbalance  7+ consecutive      Prompt holistic activity:
                      study days, no      outdoor play, creative time, or
                      break logged        family time suggestion.

  Exam anxiety signal Countdown \< 14     Reduce new topic introductions.
                      days + completion   Focus on revision bites.
                      rate drops          Recommend breathing exercise
                                          resource.
  ------------------- ------------------- -------------------------------

**Holistic Growth Prompts**

-   Weekly non-academic activity reminder: outdoor play, creative
    projects, family time.

-   SchoolHub does not schedule non-academic time --- it prompts
    parents to create space for it.

-   Wellbeing tip library: age-appropriate, sourced from child
    psychology best practices.

**Guardrail Principles**

-   Recommendations framed as suggestions, never directives.

-   Parent always has final override.

-   No clinical claims. Platform is not a mental health tool --- it is a
    scheduling tool with wellbeing awareness.

-   SEN children have adjusted thresholds (see Section 7.4).

**7.4 SEN Support Framework (NEW · CRITICAL)**

Integration of child psychology frameworks and Behavioural Therapy
techniques to assist parents of children with Special Education Needs,
specifically ADHD and Autism Spectrum Disorder. Activated when parent
enables SEN profile during child setup.

  --------------- ---------------- ---------------------------------------
  **Profile**     **Framework**    **Platform Adaptations**

  **ADHD**        ABA + CBT        Shorter bite caps (3--5 min). Frequent
                  principles       micro-breaks. Positive reinforcement on
                                   every bite. Reduced visual clutter.
                                   Focus mode (single task visible).
                                   Reminder alerts with high frequency
                                   option.

  **Autism        Structured       Consistent schedule structure (no
  Spectrum**      routines +       surprise changes). Advance notice of
                  social story     schedule changes (48hr alert). Visual
                  framing          progress indicators. Reduced animated
                                   distractions. Predictable reward
                                   cadence.

  **General SEN** Child psychology Adaptive difficulty --- bites adjusted
                  --- Vygotsky ZPD to current comprehension level.
                                   Scaffolded hints before answers.
                                   Extended response time. No leaderboard
                                   visibility. Parent notified of
                                   frustration signals.
  --------------- ---------------- ---------------------------------------

**SEN Profile Activation**

-   Parent selects SEN profile type during child onboarding (optional).

-   Options: ADHD, Autism Spectrum, Other SEN (general adaptations).

-   Profile can be added or changed at any time from child settings.

-   SEN profile does not alter content --- it alters pacing, structure,
    rewards cadence, and notifications.

**Clinical Disclaimer**

*SchoolHub SEN features are informed by ABA and CBT principles and
Vygotsky\'s Zone of Proximal Development framework. They are not a
substitute for professional assessment, therapy, or medical advice.
Parents are encouraged to use SchoolHub alongside, not instead of,
professional SEN support.*

**Acceptance Criteria**

-   SEN profile selection is optional --- platform is fully usable
    without it.

-   ADHD mode: bite length hard-capped at 5 min regardless of grade.

-   Autism mode: schedule changes require 48hr advance notice alert
    before activation.

-   No leaderboard visibility for SEN-flagged children by default.

-   Psychologist review of SEN framework required before beta launch.

**7.5 Gamification Layer (NEW · CRITICAL)**

**Components**

-   Streak: daily counter visible on home screen. 3-day grace restore
    for illness or holidays.

-   XP: earned per bite completed, per correct comprehension check, per
    streak milestone, and bonus for ahead-of-schedule completion.

-   Badges: Bronze (10 bites), Silver (30 bites), Gold (100 bites) per
    subject. K2: streaks and completion badges only.

-   Leaderboard: opt-in, anonymous, internal only. Disabled for SEN
    profiles by default.

-   Parent can disable gamification per child in settings.

**Acceptance Criteria**

-   XP awarded within 2 seconds of bite completion.

-   Badge notification shown on first unlock.

-   Streak counter visible on every page load.

**7.6 Chinese Language Support (NEW · CRITICAL)**

-   K2: basic character recognition, pinyin introduction, oral readiness
    bites.

-   P1--P6: reading, writing, composition starters, vocabulary,
    comprehension --- full MOE scope.

-   Pinyin display toggle for early primary (P1--P2).

-   Vocabulary bite format: character → pinyin → meaning → example
    sentence.

-   Higher Chinese (HCL) deferred to Phase 2.

-   All content reviewed by MOE-trained Chinese educators before launch.

**7.7 Tiered Pricing + Free Trial (NEW · CRITICAL)**

  ------------- ----------- -------------- ----------------------------------
  **Tier**      **Price**   **Children**   **Inclusions**

  **Free**      \$0 (7-day  1              1 subject, basic schedule, no
                trial)                     gamification rewards. No CC
                                           required.

  **Scholar**   \$18 /      2              All subjects, full gamification,
                month                      shareable reports, dark mode, SEN
                                           profile (1 child).

  **Scholar     \$35 /      4              All above + offline mode, priority
  Pro**         month                      support, exam-pack content, SEN
                                           profiles (all children), mental
                                           health dashboard.
  ------------- ----------- -------------- ----------------------------------

-   No credit card required for 7-day trial.

-   Annual plan: 2 months free.

-   SEN profiles available on Scholar (1 child) and Scholar Pro (all
    children).

-   Mental health dashboard available on Scholar Pro only.

**7.8 3-Minute Onboarding**

**K2 Path --- Preparing for Primary 1**

-   Enter child name + age (15 sec).

-   Select readiness tracks: English, Math, Chinese Foundations --- one
    or more (30 sec).

-   Set P1 intake target date (15 sec).

-   Optional: enable SEN profile (15 sec).

-   Preview readiness schedule --- confirm (15 sec).

**P1--P6 Path**

-   Enter child name + grade (30 sec).

-   Select subjects from MOE pre-populated list (30 sec).

-   Set exam dates --- calendar picker, common dates pre-filled (30
    sec).

-   Upload or import school calendar / assessment dates --- optional (30
    sec).

-   Set weekly study hours per subject via slider (30 sec).

-   Preview generated schedule --- confirm (30 sec).

**7.9 Exam Countdown Widget**

-   Persistent on every screen (nav bar or footer banner).

-   Format: \'PSLE · 47 days\'.

-   Colour: Green (60+ days) → Yellow (30--60 days) → Red (under 30
    days).

-   Multiple exams shown in carousel.

-   Student can hide. Parent cannot.

-   K2: shows \'P1 in X days\' readiness countdown instead.

**7.10 Shareable Progress Report**

-   Generated every Sunday night, available Monday morning.

-   Format: 1080×1350px WhatsApp-optimised image card + PDF version.

-   Contents: subjects studied, bites completed, streak, badges earned,
    exam countdown, wellbeing status (green/amber/red).

-   SchoolHub watermark + App Store/Play Store link included.

-   Share button in parent dashboard and weekly notification.

**8. Technical Architecture**

  --------------------- -------------------------------------------------
  **Layer**             **Technology**

  **Frontend**          React 18 + TypeScript + Tailwind CSS + Shadcn/ui
                        (PWA)

  **Backend**           Node.js + Express + TypeScript

  **Database**          Supabase (PostgreSQL) + Supabase Auth

  **AI Engine**         Claude Sonnet (curriculum parsing, schedule
                        generation, weak topic explanations, SEN pacing)

  **Notifications**     Telegram Bot API (primary) + Twilio SMS
                        (fallback)

  **Offline / PWA**     Service Worker + Workbox --- cache-first for
                        assigned bites

  **Report Generation** Canvas + Puppeteer (1080×1350px WhatsApp cards +
                        PDF)

  **Hosting**           Vercel (frontend) + Railway (backend) + Supabase
                        (database)
  --------------------- -------------------------------------------------

**New Technical Requirements (v3.0)**

-   File parsing pipeline: .csv, .txt, .ics, .xlsx, .pdf ingestion for
    data input feature.

-   SEN profile flag in child database schema --- drives content and UX
    variants.

-   Mental health signal engine: rule-based triggers on study hour and
    completion data.

-   PWA manifest + service worker (Workbox) for offline bite caching.

-   TTS integration (Web Speech API) --- retained for K2 as needed.

-   Image generation pipeline (canvas/Puppeteer) for shareable progress
    cards.

-   XP/badge event system with real-time WebSocket updates.

-   Multi-tenant child profile architecture with SEN flag from day one.

**9. Monetisation Strategy**

**Pricing Model**

Freemium with 7-day full-access trial (no credit card). Three
subscription tiers. SEN features gated at Scholar and Scholar Pro.

**Revenue Targets --- Year 1**

-   500 active users by Month 6.

-   8--12% trial-to-paid conversion.

-   Average revenue per user: SGD \$25/month.

-   Target: SGD \$5,000 MRR by Month 12.

**Phase 2 Revenue Streams**

-   School and tuition centre licences (B2B2C).

-   Exam packs --- premium topic-specific deep-dives.

-   SEN resource packs --- curated activity guides for ADHD/Autism home
    support.

-   Tutor marketplace referral fee (10--15%).

**10. Success Metrics**

  ------------------ ------------------------------ ----------------------
  **Category**       **Metric**                     **Target**

  Acquisition        Active users at Month 6        **500+**

  Acquisition        Trial-to-paid conversion       **8--12%**

  Engagement         Monthly retention              **60%+**

  Engagement         Daily active rate (DAU/MAU)    **40%+**

  Engagement         Bite completion rate           **70%+**

  Product            Onboarding completion time     **\< 3 minutes**

  Product            Curriculum parse accuracy      **90%+**

  Wellbeing          SEN parent satisfaction (beta  **80%+ positive**
                     survey)                        

  Revenue            MRR at Month 12                **SGD \$5,000+**

  Growth             Progress reports shared per    **20%+ of active
                     week                           users**
  ------------------ ------------------------------ ----------------------

**11. Product Roadmap**

**Phase 1 --- MVP (Now → Month 3)**

-   All 15 features from Section 6 shipped.

-   Singapore launch. All MOE subjects. K2 + P1--P6.

-   Freemium pricing live. Telegram notification bot.

-   SEN framework (ADHD + Autism) with psychologist review.

-   Mental health guardrails active.

-   Data input: file upload for spelling lists, assessment dates, school
    calendars.

-   Target: 500 users. Validate retention and SEN parent satisfaction.

**Phase 2 --- Growth (Month 4--9)**

-   Video bite format (commissioned educator content).

-   Google Classroom integration (school pilot).

-   School and tuition centre B2B licence.

-   Higher Chinese (HCL) support.

-   Mobile native app (iOS + Android).

-   Expanded SEN profiles: Dyslexia, Dyscalculia.

**Phase 3 --- Expansion (Month 10--15)**

-   Malaysia, Hong Kong, India market entry.

-   AI tutoring chatbot (student asks Claude questions).

-   Enterprise MOE integration.

-   Peer study groups (opt-in social learning).

-   SEN resource marketplace.

**12. Risk Register**

  ---------------------- ------------ ------------------------------------
  **Risk**               **Level**    **Mitigation**

  Chinese content        **HIGH**     MOE-trained educator review before
  quality                             launch. Beta with 20 families.

  SEN content accuracy   **HIGH**     Engage registered psychologist to
  (ADHD/Autism)                       review framework. Do not position as
                                      clinical tool.

  Mental health          **MEDIUM**   Recommendations framed as
  guardrail false                     suggestions, never directives.
  positives                           Parent always overrides.

  PWA offline            **MEDIUM**   Dedicated iOS Safari testing.
  limitations on iOS                  Document known limitations. Native
  Safari                              app in Phase 2.

  Low trial-to-paid      **MEDIUM**   7-day full trial. Shareable report
  conversion                          card drives organic FOMO among SG
                                      parents.

  Gamification stressing **MEDIUM**   Parent opt-out per child. Mental
  some children                       health guardrails auto-flag
                                      overloaded students.

  MOE syllabus changes   **LOW**      Curriculum version control. One-tap
  mid-year                            schedule refresh on update
                                      detection.
  ---------------------- ------------ ------------------------------------

**13. Document Metadata**

  ---------------------- ------------------------------------------------
  **Document Version**   3.0

  **Previous Version**   2.0 (April 2026 --- MVP Improvements Update)

  **Changes in v3.0**    Age scope revised to 6--12 (K2 added).
                         Preschool/Secondary removed. 4 new features:
                         Data Input, SEN Support, Mental Health
                         Guardrails, Sibling Dashboard.

  **Last Updated**       April 2026

  **Target Launch**      June 2026 (Beta)

  **Primary Market**     Singapore (K2 → P6). International
                         post-validation.

  **Status**             **Approved for MVP Development**
  ---------------------- ------------------------------------------------

**Sign-offs**

  ------------------- ------------------------- -------------------------
  **Role**            **Name**                  **Signature / Date**

  Product Owner                                 

  Engineering Lead                              

  Design Lead                                   
  ------------------- ------------------------- -------------------------

*SchoolHub PRD v3.0 · Adaptive Learning & Study Scheduling · Singapore
· April 2026*
