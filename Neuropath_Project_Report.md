# Neuropath Clinical Management System: Comprehensive Technical Report

## 1. Executive Summary
Neuropath is a specialized, state-of-the-art neurological rehabilitation and clinical management platform designed to bridge the gap between therapists and patients. The platform facilitates detailed tracking of patient recovery, medication adherence, daily check-ins, and personalized exercise regimens. By providing dual interfaces—a clinical Admin Dashboard for healthcare professionals and a specialized User/Patient Dashboard—Neuropath ensures real-time monitoring and active patient engagement. 

This comprehensive report outlines the entire system architecture, detailing every core file, folder structure, database model, and future technological implementations such as the upcoming WhatsApp notification and chatbot integration.

*(Image Placeholder 1: Central Authentication)*

---

## 2. Technology Stack & Core Infrastructure

The Neuropath project is built using modern, cutting-edge web technologies to ensure scalability, performance, and security.

### 2.1 Framework & Runtime
- **Next.js (16.1.6)**: Utilizing the modern Next.js App Router for server-side rendering, robust routing, and optimal SEO.
- **React (19.2.3)**: The latest React version leveraging concurrent features, server components, and modern hooks.
- **TypeScript**: Ensuring type safety across the entire codebase, reducing runtime errors and improving developer experience.

### 2.2 Database & ORM
- **PostgreSQL**: A powerful, open-source object-relational database system ensuring strict data integrity.
- **Prisma (6.19.2)**: An advanced Type-Safe ORM used for database migrations, schema definitions, and seamless querying.

### 2.3 Authentication & Security
- **Better-Auth**: A comprehensive authentication library used for seamless central authentication, integrating tightly with Prisma (`@better-auth/prisma-adapter`). It manages sessions, users, role-based access control (Admin vs. Patient), and token verification.

### 2.4 State Management & UI
- **Zustand (5.0.11)**: A small, fast, and scalable bearbones state-management solution used across client components.
- **Tailwind CSS v4**: Utility-first CSS framework used for rapid UI development and maintaining a dynamic design system.
- **Lucide React**: For highly customizable vector icons.
- **Chart.js & React-Chartjs-2**: Utilized for rendering dynamic recovery and progress charts in the administrative dashboards.

---

## 3. Directory Structure & File Architecture Analysis

The project follows a modular, feature-based directory structure. Below is a comprehensive breakdown and visual representation of the root and `src` directories.

### Project Folder Tree
```text
neuropath/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── public/
├── scripts/
├── src/
│   ├── actions/
│   │   ├── appointment.ts
│   │   ├── dashboard.ts
│   │   ├── exercise.ts
│   │   ├── patient-daily.ts
│   │   ├── patient.ts
│   │   └── progress.ts
│   ├── app/
│   │   ├── (auth)/
│   │   ├── admin/
│   │   │   ├── activity/
│   │   │   ├── add-patient/
│   │   │   ├── appointments/
│   │   │   ├── exercises/
│   │   │   ├── patients/
│   │   │   └── progress/
│   │   ├── api/
│   │   └── user/
│   │       ├── chat/
│   │       ├── exercises/
│   │       ├── goals/
│   │       └── schedule/
│   ├── components/
│   │   ├── admin/
│   │   ├── patient/
│   │   ├── ui/
│   │   ├── AppSwitcher.tsx
│   │   └── Sidebar.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   └── proxy.ts
│   └── store/
├── .env
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

### 3.1 Root Level Files
- `package.json` & `package-lock.json`: Defines the project dependencies, scripts (`dev`, `build`, `postinstall: prisma generate`), and application metadata.
- `prisma/`: Contains `schema.prisma` defining all database models, and the `migrations/` folder tracking database evolution.
- `tailwind.config` / `postcss.config.mjs` / `eslint.config.mjs`: Core configuration files for styling and linting.
- `tsconfig.json`: TypeScript compiler instructions.
- `next.config.ts`: Next.js specific configuration, including external image domain whitelisting (e.g., Cloudinary).

### 3.2 The `src/` Directory Breakdown

#### `src/app/` (The Next.js App Router)
Handles all application routing, encompassing API routes, static pages, and dynamic segments.
- **`layout.tsx` & `globals.css`**: The root layout wrapping the entire application, alongside the global CSS file defining base styles, Tailwind imports, and custom utility classes.
- **`(auth)/`**: Route group containing the centralized authentication pages (Login, Register).
- **`admin/`**: The protected clinical workspace.
  - `page.tsx`: The primary Admin Dashboard landing page.
  - `patients/`: Patient management, listing, and individual patient profiles.
  - `add-patient/`: Dedicated routing for patient onboarding.
  - `appointments/`: Appointment scheduling and calendar interface.
  - `exercises/`: Management of the exercise library and assignment tools.
  - `progress/`: Analytical views mapping patient recovery metrics.
  - `activity/`: System-wide activity logging and audit trails.
- **`user/`**: The specialized patient portal.
  - `page.tsx`: The patient's home dashboard overview.
  - `chat/`: In-app messaging interface between patient and therapist.
  - `goals/`: Tracking short and long-term rehabilitation goals.
  - `schedule/`: Patient-facing calendar for appointments and daily tasks.
  - `exercises/`: Interface where patients view and perform their assigned routines.
- **`api/`**: 
  - API routes handling external webhooks, edge-functions, and the Better-Auth API endpoints.

#### `src/components/` (UI & Layout Components)
- **`admin/`**: Components specifically restricted to the admin view (e.g., `dashboard/` stats cards, `list-patient/` tables, `add-patient/` forms).
- **`patient/`**: Core patient interface components.
  - `PatientHome.tsx`: The main patient summary view.
  - `PatientExercises.tsx`: Renders assigned exercises, durations, and instructional media.
  - `PatientGoals.tsx` & `PatientSchedule.tsx`: UI for viewing milestones and daily calendars.
  - `PatientAI.tsx` & `ApkPanel.tsx`: Interfaces for advanced patient tooling.
- **`ui/`**: Reusable primitive components enforcing the design system.
  - `Button.tsx`, `Modal.tsx`, `Toast.tsx`: Standardized interactive elements.
  - `ChartCard.tsx`: Reusable wrapper for Chart.js visualizations.
- **`Sidebar.tsx` & `AppSwitcher.tsx`**: Core navigation components, rendering dynamic links based on user roles and fetching real-time badge counts (e.g., active patients).

#### `src/actions/` (Server Actions)
Contains all secure, server-side logic invoked directly from React components.
- `patient.ts`: Logic for creating, updating, and fetching patient records.
- `appointment.ts`: Scheduling logic.
- `exercise.ts`: CRUD operations for the exercise library.
- `progress.ts` & `dashboard.ts`: Aggregating data for dashboard charts and metrics.
- `patient-daily.ts`: Handling daily check-ins (water intake, pain levels, mood).

#### `src/lib/` (Utilities & Integrations)
- `auth.ts`: Instantiates and configures Better-Auth, binding it to Prisma.
- `prisma.ts`: Singleton instance of the Prisma Client to prevent connection exhaustion.
- `proxy.ts`: Edge proxies or external service handlers.

#### `src/store/` (State Management)
Contains Zustand slices managing transient UI state, such as active modals, multi-step form progress, and localized caching.

---

## 4. Database Schema & Data Models

The PostgreSQL database is carefully structured using Prisma to handle complex clinical relationships.

### 4.1 Authentication & User Management
- **`User`, `Session`, `Account`**: Core Better-Auth models. The `User` model includes customized fields like `role` ("patient" vs. "admin"), `banned` status, and an explicit relation to a `Patient` profile.

### 4.2 Patient & Clinical Profiles
- **`Patient`**: The central entity linking to `User`. It stores demographic data, `injuryLevel`, `ais` (ASIA Impairment Scale), assigned `therapist`, and active `status` (`ACTIVE`, `DISCHARGED`, `CRITICAL`).
- **`EmergencyContact`**: 1-to-many relationship with `Patient` for emergency communication.

### 4.3 Rehabilitation & Monitoring
- **`Assessment`**: Logs periodic recovery metrics, tracking `recoveryPct`, `upperLimb`, `trunk`, `fineMotor`, and `sensory` capabilities across different `weeks`.
- **`ExerciseLibrary`**: A central repository of exercises categorised by `difficulty`, `target`, and `emoji` representations.
- **`AssignedExercise`**: A join table mapping specific exercises to a patient, including `durationMins` and `frequencyPerWeek`.

### 4.4 Daily Tracking & Logs
- **`DailyCheckIn`**: Allows patients to log daily metrics like `water` consumption, `pain` levels, and `mood`.
- **`Medication`**: Tracks medication schedules (`dosage`, `time`) and whether they were `taken`.
- **`ActivityLog` & `Notification`**: System records of user actions and pending alerts.
- **`Appointment`**: Manages scheduling with statuses like `SCHEDULED`, `COMPLETED`, `CANCELLED`, or `NO_SHOW`.

*(Image Placeholder 2: Admin Dashboard)*

---

## 5. Detailed Module Breakdown & Current Setup

### 5.1 Central Authentication
The authentication flow acts as the gatekeeper. Built on Better-Auth, it utilizes a secure, session-based architecture with Next.js Cookies. The system intercepts unauthenticated requests and routes them to the Central Authentication page. Upon login, the system evaluates the user's `role`. Administrators (therapists/doctors) are redirected to `/admin`, while patients are securely routed to `/user`.

### 5.2 Admin Dashboard (Clinical Interface)
The Admin Dashboard is the nerve center for therapists.
- **Global Overview**: The root page (`/admin`) aggregates data via Server Actions (`src/actions/dashboard.ts`), displaying total active patients, upcoming appointments, and overall system health.
- **Sidebar Navigation**: `src/components/Sidebar.tsx` renders dynamic navigation menus, fetching live statistics (like patient count) to display as notification badges.
- **Clinical Monitoring**: Under `/admin/progress`, therapists view `Assessment` data represented through `react-chartjs-2` line and bar charts, visualising week-over-week improvements in motor and sensory functions.
- **Exercise Management**: Therapists utilize the Exercise Library module to curate regimens and assign them directly to patient profiles via the `AssignedExercise` model.

*(Image Placeholder 3: User/Patient Dashboard)*

### 5.3 User / Patient Dashboard
Designed for accessibility and encouragement, the patient portal focuses on active recovery.
- **Patient Home**: `PatientHome.tsx` displays the day's itinerary, including pending medications, water intake goals, and scheduled exercises.
- **Daily Check-Ins**: Integrated directly into the patient workflow, allowing them to self-report mood and pain levels which are instantly synced to the Admin Dashboard.
- **Rehabilitation Workflows**: The `PatientExercises.tsx` component fetches assigned exercises. The UI provides clear, step-by-step instructions, ensuring patients understand form and duration.
- **Goal Tracking**: `PatientGoals.tsx` visualizes milestones, leveraging gamification principles to keep patients motivated throughout their challenging recovery journey.

---

## 6. Future Implementations & Roadmap

The current setup provides a robust foundational architecture. The next phase of development focuses heavily on proactive communication, specifically leveraging the WhatsApp ecosystem.

### 6.1 WhatsApp Chatbot Integration
Currently in the planning phase, Neuropath will integrate a WhatsApp Chatbot to serve as a 24/7 virtual assistant for patients.
- **Functionality**: Patients will be able to query the bot for their daily exercise routines, check medication timings, or log their daily pain scores via simple text messages.
- **Architecture**: The chatbot will interact with Neuropath's core database through secure, authenticated API webhooks located within `src/app/api/`. Natural Language Processing (NLP) layers will parse patient intent and map them to existing Server Actions (e.g., creating a `DailyCheckIn` entry).
- **Security**: Phone numbers logged in the `Patient` model will serve as the primary identifier, ensuring interactions are strictly matched to the verified clinical record.

### 6.2 WhatsApp Notification System
To combat non-compliance and missed appointments—a major hurdle in neurological rehab—a centralized notification engine will be deployed.
- **Automated Alerts**: Cron jobs and background workers will monitor the `Appointment` and `AssignedExercise` tables. 
- **Triggers**: 
  - **Appointments**: 24-hour and 2-hour automated reminders sent directly to WhatsApp.
  - **Medication Nudges**: Real-time pings asking the patient to confirm if a critical dose was taken.
  - **Inactivity Alerts**: If a patient misses logging activities for 48 hours, the system will trigger a gentle check-in message, while simultaneously flagging the patient on the therapist's Admin Dashboard.
- **Implementation Path**: Will utilize providers like Twilio or specialized WhatsApp Business APIs, creating a dedicated `Notification` service class within `src/lib/` to handle templated message dispatch.

---

## Conclusion
The Neuropath project represents a meticulously architected solution tailored for clinical environments. Its reliance on Next.js Server Components, a strictly typed Prisma ORM, and comprehensive role-based authentication ensures both high performance and HIPAA-compliant data security. As the project evolves with the upcoming WhatsApp capabilities, it will transition from a passive management tool into an active, conversational healthcare companion.
