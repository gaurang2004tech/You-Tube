# YouTube Clone (Full-Stack Next.js & Express)

A feature-rich, full-stack YouTube clone built with Next.js (frontend) and Node.js + Express (backend). This project includes core video-sharing mechanics, real-time video calling, premium user subscriptions, and advanced media handling via Cloudinary.

## 🚀 Key Features

*   **Video Hosting & Streaming:** Upload videos securely via Cloudinary API with MongoDB persistent storage.
*   **Media Playback:** Custom HTML5 video player with watch-time enforcement based on user subscription plans (Free/Bronze/Silver/Gold).
*   **Interactive UI:** Likes, dislikes, comment threading, subscriptions, watch later, and history tracking.
*   **Real-time Video Calling:** Integrated WebRTC and Socket.io feature allowing users to call each other, share screens, and record meetings directly inside the browser.
*   **Premium Upgrades:** Razorpay integration to seamlessly upgrade account tiers and bypass watch-time limits.
*   **Authentication:** Firebase Auth combined with JWT for secure sessions and OTP verification.
*   **Responsive Design:** Styled with Tailwind CSS offering a sleek dark/light mode experience optimized for mobile, tablet, and desktop.

---

## 🛠️ Tech Stack

### Frontend (`/yourtube`)
*   **Framework:** Next.js (React)
*   **Styling:** Tailwind CSS, Radix UI (shadcn/ui), Lucide Icons
*   **State Management & Requests:** React Hooks, Axios
*   **Real-Time:** Socket.io-client, WebRTC

### Backend (`/server`)
*   **Runtime:** Node.js + Express
*   **Database:** MongoDB + Mongoose
*   **Storage:** Cloudinary (multer-storage-cloudinary)
*   **Payments:** Razorpay API
*   **Real-time:** Socket.io
*   **Emailing:** Resend API

---

## ⚙️ Getting Started

### Prerequisites
*   Node.js (v18+)
*   MongoDB Cluster URL
*   Firebase Project (for frontend auth)
*   Cloudinary Account (for video storage)
*   Razorpay Account (for payments)

### Environment Variables

You need to create a `.env` file in **both** the `/server` directory and the `/yourtube` directory.

#### `/server/.env`
```env
PORT=5000
DB_URL="your_mongodb_connection_string"
JWT_SECRET="your_jwt_secret"
RAZORPAY_KEY_ID="your_razorpay_key"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
CLOUDINARY_CLOUD_NAME="your_cloudinary_name"
CLOUDINARY_API_KEY="your_cloudinary_api"
CLOUDINARY_API_SECRET="your_cloudinary_secret"
# ... email/resend credentials if applicable
```

#### `/yourtube/.env.local`
```env
NEXT_PUBLIC_BACKEND_URL="http://localhost:5000"
NEXT_PUBLIC_FIREBASE_API_KEY="your_api_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_auth_domain"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
# ... remaining firebase keys ...
NEXT_PUBLIC_RAZORPAY_KEY_ID="your_razorpay_key"
```

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd you_tube2.0
   ```

2. **Setup the Backend:**
   ```bash
   cd server
   npm install
   npm run dev
   ```

3. **Setup the Frontend:**
   ```bash
   cd yourtube
   npm install
   npm run dev
   ```

4. **Access the application:** Open `http://localhost:3000` in your browser.
