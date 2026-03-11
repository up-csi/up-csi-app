# Admin Roles — System Overview Diagrams

> Companion to `1-admin-roles-implementation-plan.md`.
> Diagrams use Mermaid syntax — rendered natively on GitHub. To use in Excalidraw, paste the code blocks into the "Mermaid to Excalidraw" feature (wand icon).

---

## 1. How Sign-In Works

Everyone signs in the same way. The system figures out your role after you log in.

```mermaid
flowchart LR
    A["User clicks Sign In"] --> B["Google login\n(@up.edu.ph only)"]
    B --> C{"Email in\nwhitelist?"}
    C -->|No| D["Rejected"]
    C -->|Yes| E["Logged in"]
    E --> F["System looks up\nrole from database"]
    F --> G["Applicant"]
    F --> H["Admin"]

    style D fill:#fce8e6,stroke:#d93025
    style G fill:#e8f4fd,stroke:#1a73e8
    style H fill:#fce8e6,stroke:#d93025
```

---

## 2. What Each Role Can See and Do

```mermaid
flowchart TB
    subgraph NOT_LOGGED_IN["Not Logged In"]
        N1["Login page only"]
    end

    subgraph APPLICANT_ACCESS["Applicant"]
        direction TB
        A1["Take the constitution quiz"]
        A2["View & save their own answers"]
        A3["Collect signatures on sigsheet"]
        A4["Upload files to Google Drive"]
    end

    subgraph ADMIN_ACCESS["Admin"]
        direction TB
        B1["View all applicant profiles"]
        B2["View all quiz submissions & scores"]
        B3["View any applicant's detailed answers"]
        B4["View sigsheet progress of all applicants"]
    end

    style NOT_LOGGED_IN fill:#f5f5f5,stroke:#999
    style APPLICANT_ACCESS fill:#e8f4fd,stroke:#1a73e8
    style ADMIN_ACCESS fill:#fce8e6,stroke:#d93025
```

Key difference: **applicants only see their own data**, **admins can see everyone's data**.

---

## 3. How a Request Flows Through the System

Every page visit or API call goes through the same pipeline.

```mermaid
flowchart TD
    A["User visits a page\nor calls an API"] --> B["Server checks:\nAre you logged in?"]

    B -->|Not logged in| C["Can only see\npublic pages"]
    B -->|Logged in| D["Server looks up\nyour role"]

    D --> E{"What's your role?"}

    E -->|Applicant| F["Can access\napplicant features"]
    E -->|Admin| G["Can access\nadmin features"]

    F --> H["Data is filtered:\nyou only see YOUR stuff"]
    G --> I["Data is unfiltered:\nyou see ALL applicants' stuff"]

    style C fill:#f5f5f5,stroke:#999
    style F fill:#e8f4fd,stroke:#1a73e8
    style G fill:#fce8e6,stroke:#d93025
    style H fill:#e8f4fd,stroke:#1a73e8
    style I fill:#fce8e6,stroke:#d93025
```

---

## 4. System Architecture Overview

```mermaid
flowchart TB
    subgraph USERS["Users"]
        APPLICANT["Applicant\n(@up.edu.ph)"]
        ADMIN["Admin\n(@up.edu.ph)"]
    end

    subgraph APP["UP CSI App"]
        LOGIN["Login\n(Google OAuth)"]
        ROLE_CHECK["Role Check\n(on every request)"]

        subgraph APPLICANT_PAGES["Applicant Features"]
            QUIZ["Constitution Quiz"]
            SIG["Sigsheet"]
            UPLOAD["File Upload"]
        end

        subgraph ADMIN_PAGES["Admin Features"]
            VIEW_PROFILES["View Applicant Profiles"]
            VIEW_QUIZ["View Quiz Results & Scores"]
            VIEW_SIG["View Sigsheet Progress"]
        end
    end

    subgraph SERVICES["External Services"]
        GOOGLE["Google OAuth"]
        GDRIVE["Google Drive\n(file storage)"]
        SUPABASE["Supabase\n(database + auth)"]
    end

    APPLICANT --> LOGIN
    ADMIN --> LOGIN
    LOGIN --> GOOGLE
    GOOGLE --> ROLE_CHECK

    ROLE_CHECK -->|"role = applicant"| APPLICANT_PAGES
    ROLE_CHECK -->|"role = admin"| ADMIN_PAGES

    QUIZ --> SUPABASE
    SIG --> SUPABASE
    UPLOAD --> GDRIVE
    VIEW_PROFILES --> SUPABASE
    VIEW_QUIZ --> SUPABASE
    VIEW_SIG --> SUPABASE

    style APPLICANT fill:#e8f4fd,stroke:#1a73e8
    style ADMIN fill:#fce8e6,stroke:#d93025
    style APPLICANT_PAGES fill:#e8f4fd,stroke:#1a73e8
    style ADMIN_PAGES fill:#fce8e6,stroke:#d93025
```

---

## 5. What Happens When Access is Denied

```mermaid
flowchart TD
    A["Someone tries to\naccess an admin page"] --> B{"Logged in?"}

    B -->|No| C["401: Please log in"]
    B -->|Yes| D{"Role = admin?"}

    D -->|No, applicant| E["403: You don't have\npermission for this"]
    D -->|Yes| F["200: Here's the data"]

    style C fill:#fce8e6,stroke:#d93025
    style E fill:#fef7e0,stroke:#f9ab00
    style F fill:#e6f4ea,stroke:#137333
```

---

## 6. Two Layers of Protection

The system protects data at two levels — even if one layer has a bug, the other catches it.

```mermaid
flowchart TD
    A["User makes a request"] --> B

    subgraph B["Layer 1: App Server"]
        B1["Checks if you're logged in"]
        B2["Checks if you have the right role"]
        B1 --> B2
    end

    B --> C

    subgraph C["Layer 2: Database"]
        C1["Row Level Security (RLS)"]
        C2["Applicants can only\nread/write their own rows"]
        C3["Admins can read all rows"]
        C1 --> C2
        C1 --> C3
    end

    C --> D["Data returned"]

    style B fill:#e8f4fd,stroke:#1a73e8
    style C fill:#fef7e0,stroke:#f9ab00
    style D fill:#e6f4ea,stroke:#137333
```

---

## 7. Data Ownership Summary

| Data                   | Applicant can...   | Admin can...        |
| ---------------------- | ------------------ | ------------------- |
| Own profile            | View, update       | -                   |
| All profiles           | -                  | View all            |
| Own quiz answers       | View, save, submit | -                   |
| All quiz answers       | -                  | View all + scores   |
| Own sigsheet entries   | View, create       | -                   |
| All sigsheet entries   | -                  | View all + progress |
| Own GDrive folder      | Create, upload to  | -                   |
| Quiz questions/options | View (read-only)   | View (read-only)    |
| Members list           | View (read-only)   | View (read-only)    |
