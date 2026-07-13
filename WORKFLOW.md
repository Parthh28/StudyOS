# StudyOS Complete Application Workflow & User Journey

StudyOS is an academic productivity and mastery tracking system designed around three core loops:
1. **Curriculum Intake & Structuring** (Syllabus upload, AI OCR extraction, manual onboarding).
2. **Daily Execution & Pacing** (Plan My Day to-do list, AI study coach, Pomodoro focus timer, Exam countdown).
3. **Diagnostic Mastery Feedback Loop** (Topic-level & Subject-level mastery classification, analytics, weak topic remediation).

---

## Complete End-to-End System Workflow

```mermaid
graph TD
    %% Authentication & Onboarding
    Start([Student Visits StudyOS]) --> Auth{Authenticated?}
    Auth -- No --> Login["Login / OTP Verification (/login)"]
    Auth -- Yes --> CheckProfile{Has Profile?}
    Login --> CheckProfile
    CheckProfile -- No --> Onboarding["Onboarding Flow (/onboarding)"]
    Onboarding --> Step1["Step 1: Profile & University Details"]
    Step1 --> Step2["Step 2: Select / Import Enrolled Subjects"]
    Step2 --> Step3["Step 3: Define Semester Target & Exam Dates"]
    Step3 --> Dashboard

    CheckProfile -- Yes --> Dashboard["Hub Overview (/dashboard)"]

    %% Core Hub Workflows
    subgraph DailyExecution [Daily Execution & Pacing Loop]
        Dashboard --> PlanDay["Plan Today's Day Module"]
        PlanDay --> ToDo["Interactive To-Do List"]
        PlanDay --> AITodo["Ask AI to Generate Study Tasks"]
        Dashboard --> Pacing["Exam Countdown & Urgent Revision Alerts"]
        Dashboard --> Pomodoro["Pomodoro Focus Timer Overlay / Widget"]
    end

    subgraph CurriculumMastery [Curriculum & Diagnostic Mastery Loop]
        Dashboard --> SubjectList["Subjects Overview (/subjects)"]
        SubjectList --> SubjectDetail["Subject Detail Page (/subjects/[id])"]
        SubjectDetail --> SubjectMastery["Mark Subject Mastery: Weak | Normal | Mastered"]
        SubjectDetail --> TopicTabs["Syllabus | Notes | Revision Checklist"]
        TopicTabs --> TopicMastery["Mark Topic Mastery: Weak | Normal | Mastered"]
        TopicMastery --> DiagnosticEngine["Domain MasteryEngine Diagnostic Summary"]
        DiagnosticEngine --> DashboardMastery["Dashboard Diagnostic Focus Panels"]
    end

    subgraph AICoachWorkflow [AI Coach & OCR Syllabus Extraction Loop]
        Dashboard --> AICoach["AI Coach & OCR Hub (/ai-coach)"]
        AICoach --> Upload["Upload Syllabus (Image / PDF)"]
        Upload --> OCR["Gemini OCR & Layout Recognition"]
        OCR --> Roadmap["Extracted Curriculum Reviewer"]
        Roadmap --> SyncDB["Sync to User Database Subjects & Topics"]
    end

    subgraph AnalyticsLoop [Performance Analytics]
        Dashboard --> Analytics["Analytics & Trends (/analytics)"]
        DiagnosticEngine --> Analytics
    end
```

---

## Detailed Functional Workflows

### 1. User Onboarding & Subject Setup
```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Auth as Supabase Auth
    participant Onboarding as Onboarding Page
    participant DB as Postgres DB

    Student->>Auth: Enter Email & OTP
    Auth-->>Student: Session Created
    Student->>Onboarding: Enter Name, Degree & University
    Student->>Onboarding: Select Core Theory & Lab Subjects
    Student->>Onboarding: Set Semester Target Grade
    Onboarding->>DB: Seed Default Subjects, Units & Curriculum Topics
    DB-->>Student: Redirect to /dashboard
```

### 2. Daily Planning & AI Task Generation
```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Dashboard as Dashboard Hub
    participant Todo as TodoList Widget
    participant Action as generateAiTodos()
    participant Gemini as Gemini AI Model

    Student->>Dashboard: Click "Plan Today's Day"
    Dashboard->>Todo: Expand To-Do List Drawer
    Student->>Todo: Input custom prompt ("Add 3 tasks for Analog Circuits")
    Todo->>Action: POST prompt & user subjects
    Action->>Gemini: Request actionable study tasks JSON
    Gemini-->>Action: Return 3 structured study tasks
    Action->>DB: Insert tasks into todos table
    DB-->>Todo: Revalidate & render tasks
```

### 3. Topic & Subject Mastery Classification Loop
```mermaid
stateDiagram-v2
    [*] --> Normal: Initial Topic State (Confidence 5)
    Normal --> Weak: Student clicks [Weak] (Confidence 2)
    Normal --> Mastered: Student clicks [Mastered] (Confidence 8)
    Weak --> Normal: Student clicks [Normal]
    Weak --> Mastered: Completed Revision
    Mastered --> Weak: Needs Refresher

    state DiagnosticFeedback {
      Weak --> DashboardDiagnostic: Appears in "Weak Topics" Remediation Panel
      Mastered --> DashboardDiagnostic: Appears in "Mastered Topics" Panel
    }
```

---

## Key Route Map & Action Reference

| Workflow Area | Route Path | Key Components | Primary Server Actions |
| :--- | :--- | :--- | :--- |
| **Authentication** | `app/(auth)/login` | OTP form, Supabase Auth client | `supabase.auth.signInWithOtp()` |
| **Onboarding** | `app/(auth)/onboarding` | Step-by-step setup wizard | `seedInitialData()` |
| **Dashboard Hub** | `app/(dashboard)/dashboard` | `DashboardMasterySummary`, `TodoList`, `ExamCountdownWidget` | `getDashboardData()`, `generateAiTodos()` |
| **Subject Detail** | `app/(dashboard)/subjects/[id]` | `SubjectMasterySelector`, `TopicList` | `updateTopicChecklist()`, `updateTopicMasteryLevel()`, `updateSubjectMasteryLevel()` |
| **AI Coach & OCR** | `app/(dashboard)/ai-coach` | Custom dropzone, Concentric Spinner, Roadmap review | `extractSyllabusFromImage()` |
| **Analytics Hub** | `app/(dashboard)/analytics` | Charts, Study session logs | `getAnalyticsData()` |
