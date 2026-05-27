# YouTube Clone Frontend

This is the Next.js frontend application for the YouTube Clone project. It handles all client-side rendering, user authentication (via Firebase), real-time video calls (WebRTC), and video playback.

## Tech Stack
*   **Next.js** (Pages Router)
*   **React**
*   **Tailwind CSS**
*   **Socket.io-client**
*   **Shadcn/UI components**
*   **Axios**

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file and structure it as required by your Firebase and Razorpay accounts:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
   NEXT_PUBLIC_FIREBASE_API_KEY=xxx
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
   NEXT_PUBLIC_FIREBASE_APP_ID=xxx
   NEXT_PUBLIC_RAZORPAY_KEY_ID=xxx
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   npm run build && npm run start
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Structure
*   **`src/pages`**: Contains all routing files (`index.tsx`, `watch/[id]`, `channel/[id]`, etc.)
*   **`src/components`**: Core UI logic, Video Player with gesture controls, WebRTC overlay.
*   **`src/lib`**: Axios instances and global context wrappers (`AuthContext`, `CommunicationContext`).
