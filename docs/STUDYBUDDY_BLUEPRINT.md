# StudyBuddy AI: Application Blueprint & Process Flow

This document provides a comprehensive blueprint of the StudyBuddy AI application. It details the project's architecture, technology stack, feature implementation, and overall development process.

## 1. Core Concept & Requirements

The primary goal of StudyBuddy AI is to serve as an AI-powered learning assistant. The core features defined in the initial requirements were:
-   **Note Taking & Transformation**: Analyzing user-provided text (or from URLs/PDFs) to generate structured study notes.
-   **Flashcard & Quiz Generation**: Creating learning materials from text.
-   **Scheduling**: Generating personalized study schedules.
-   **AI Writing Assistant**: Improving user-written text based on high academic standards.
-   **User Library**: Saving all generated materials for later access.

## 2. Technology Stack

The application is built on a modern, robust, and scalable technology stack:

-   **Framework**: Next.js 15 with the App Router.
-   **Language**: TypeScript.
-   **UI Library**: ShadCN UI for a component-based, accessible, and themeable design system.
-   **Styling**: Tailwind CSS for utility-first styling.
-   **Generative AI**: Google's Gemini models accessed via the Genkit framework.
-   **Backend & Database**: Firebase (Authentication for users, Firestore for data storage).
-   **State Management**: A combination of React hooks (`useState`, `useEffect`) and Context (`useAuth`) for global state like user authentication.

## 3. Project Setup & Theming

The foundation of the app was established in these initial steps:

1.  **Project Initialization**: A standard Next.js project was set up.
2.  **ShadCN UI Integration**: The `components.json` file was configured to define paths and settings for UI components.
3.  **Global Styling & Theming**:
    -   The file `src/app/globals.css` was updated to reflect the app's color palette (calm blue primary, light blue background, orange accent) using HSL CSS variables, as specified in the style guide.
    -   The primary font, 'PT Sans', was imported from Google Fonts and applied to the entire application in `src/app/layout.tsx`.

## 4. Application Architecture & Layout

The app's structure is organized around the Next.js App Router.

-   **Root Layout (`src/app/layout.tsx`)**: This is the entry point for all pages. It sets up the HTML structure, applies the global font, and wraps the application in the `AuthProvider` to manage user sessions.
-   **Authenticated Layout (`src/app/(app)/layout.tsx`)**: This layout wraps all the main application pages that require a user to be logged in. It uses the `AppShell` component to provide consistent navigation.
-   **App Shell (`src/components/app-shell.tsx`)**: This component is the heart of the UI. It contains the collapsible sidebar for navigation and the main content area with a header. It's responsible for the overall look and feel of the authenticated app experience.
-   **Public Homepage (`src/app/page.tsx`)**: This is the marketing and landing page for users who are not yet logged in.

## 5. Firebase Integration & Authentication

Firebase powers the user management and data persistence layers.

1.  **Firebase Configuration**:
    -   Client-side Firebase is initialized in `src/lib/firebase.ts` using the provided Firebase project configuration.
    -   Server-side Firebase (for server actions) is initialized in `src/lib/firebase-admin.ts`, using secure environment variables.
2.  **Authentication Flow**:
    -   The `src/app/login/page.tsx` component handles the UI for signing in with Google or email/password. It uses the client-side Firebase SDK (`signInWithPopup`, `signInWithEmailAndPassword`).
    -   The `src/components/auth-provider.tsx` component is a client-side wrapper that listens for changes in the authentication state (`onAuthStateChanged`). It protects routes by redirecting unauthenticated users to the login page and logged-in users away from the login page.
    -   The `useAuth` hook provides easy access to the current user's state throughout the application.

## 6. Core Feature Implementation (AI Flows)

The AI functionality is modularized into "flows" using Genkit, located in the `src/ai/flows/` directory.

-   **Genkit Initialization**: A global `ai` instance is created in `src/ai/genkit.ts`, configured to use the Gemini model.
-   **AI Flow Structure**: Each AI feature (e.g., `generate-study-notes.ts`, `generate-text.ts`) follows a standard pattern:
    1.  It is marked with `'use server';` to be used in Server Actions.
    2.  It defines input and output schemas using `zod` for type safety and validation.
    3.  It defines an `ai.definePrompt` object, which contains the detailed instructions given to the AI model. This is where the "Harvard-level" analysis standard is enforced.
    4.  It defines an `ai.defineFlow` that wraps the prompt call.
    5.  It exports a simple async function that the UI can call.
-   **UI to AI Interaction**:
    -   Each feature page (e.g., `src/app/(app)/writer/page.tsx`) has a corresponding `actions.ts` file.
    -   The UI component calls a server action from its `actions.ts` file.
    -   The action function then calls the relevant AI flow, handles any errors, and returns the result to the UI.

## 7. Data Persistence (Firestore)

User-generated content like saved notes and planner goals are stored in Firestore.

-   **Service Layer**: Functions for interacting with Firestore are abstracted into a service layer (`src/services/`).
    -   `notes-service.ts`: Contains functions like `saveNote` and `getNotesForUser` to handle create and read operations for saved study materials.
    -   `goals-service.ts`: Manages the CRUD operations for the user's course planner goals.
-   **Server-Side Operations**: These service functions use the `firebase-admin` SDK, ensuring that all database interactions happen securely on the server, not on the client.
-   **Data Fetching**: Pages like "My Library" (`src/app/(app)/library/page.tsx`) are client components that fetch their initial data by calling these server-side service functions within a `useEffect` hook.

This blueprint outlines how a modern, full-stack application can be built by combining the power of a Next.js frontend, a robust component library like ShadCN, serverless functions via AI flows, and a managed backend with Firebase.