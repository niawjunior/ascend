# Ascend: Premium Climbing Workout Builder

Ascend is a highly polished, client-side web application designed to help rock climbers train effectively. It provides structured workout routines (Hangboarding, Campusing, Endurance) with built-in rests, clear instructions, and a beautiful, chalk-friendly interface tailored for gym environments.

## Features

- **Professional Pre-Built Routines**: Comes with 5 pre-configured workouts including Max Hangs, Repeaters, 4x4 Bouldering, ARC Training, and Core Conditioning.
- **Chalk-Friendly Active Timer**: Features a massive, high-contrast countdown clock with glowing `framer-motion` SVG progress rings. Designed to be tapped easily and read from across the room.
- **Audio & Visual Cues**: Color-coded states (Green for Work, Red for Rest, Yellow for Prep) paired with browser audio beeps counting down the final 3 seconds of intervals.
- **Custom Workout Builder**: Users can generate custom interval structures and upload custom thumbnail images natively in the browser. 
- **Cloud Synchronization**: Leverages **Vercel Blob** to securely upload images and save custom `WorkoutDefinitions`.
- **Passwordless Member System**: A lightweight authentication flow where climbers claim a unique username mapped to a UUID, ensuring workouts and history are safely isolated on Vercel Blob without requiring complex passwords.
- **Progress Tracking & Heatmap**: Intercepts completed timers to log workouts (with custom RPE and notes). Generates a gorgeous **52-week Activity Heatmap** and comprehensive statistics dashboard reflecting training consistency.

## Tech Stack

- **Framework**: [Next.js 14+ (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Storage/Database**: [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) (`@vercel/blob/client`) for JSON persistence and image hosting.

## Getting Started

1. **Clone the repository** and install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. **Configure Environment Variables**:
   You must set up a Vercel Blob store to handle custom workouts, user profiles, and images.
   Create a `.env.local` file in the root directory:
   ```env
   BLOB_READ_WRITE_TOKEN="your_vercel_blob_token_here"
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. Sign in with any username to initialize your local profile.

## Project Architecture

- `/app`: Next.js App Router pages and API routes (`/api/auth`, `/api/history`, `/api/upload`).
- `/components`: Reusable UI components including the `ActiveTimer`, `StatsDashboard`, and `ActivityHeatmap`.
- `/lib`: Core TypeScript interfaces (`Workout`, `WorkoutLog`) and the hardcoded default `WORKOUT_LIBRARY`.
- `/hooks`: Custom React hooks, most notably `useWorkoutTimer.ts` which handles the complex interval mathematics underlying the active timer.
