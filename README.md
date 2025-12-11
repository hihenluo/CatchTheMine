# ⚡️ CatchTheMine

A fast-paced **Farcaster Mini App Game** where players tap falling gems to earn points — but beware of the dynamite! 💣 One wrong tap and your score drops instantly.

This project is built with modern Web3 and frontend technologies including **React**, **Vite**, **Wagmi**, **Viem**, **Tailwind v4**, and **Farcaster Mini App SDK** **Celo Chain**.

---

## 🎮 Game Overview

**CatchTheMine** is a reaction-based catching game:

* 🟦 Catch **Blue Gems**
* 🟢 Catch **Emeralds**
* 🟡 Catch **Gold Coins**
* ⚪ Catch **Silver Coins**
* ❌ **Avoid Dynamite!** Hitting one reduces your score

Each valid gem gives **+1 point**, while a bomb gives **−3 points**.

At the end of the game:

* Your score can be **submitted on-chain** (signature verified)
* You can **share your score to Farcaster** directly
* Your points contribute to your **Mines leaderboard & rewards**

---

## 🧩 Features

### 🚀 Real-Time Gameplay

Items appear with randomized positions, rotations, and spawn intervals for a dynamic feel.

### 🔐 Web3 Score Authentication

Secure score submission using:

* Wallet address
* Signed message
* Timestamp & nonce
* Server-side verification

### 🎭 Farcaster Mini App Integration

Share your score instantly using:

```
@farcaster/miniapp-sdk
```

### 🌈 Doodle-Style Game Assets

Custom hand-drawn gem & bomb icons:

* Diamond
* Emerald
* Gold Coin
* Silver Coin
* Dynamite

### 🛡 Built-in Anti-Cheat Logic

Scores must be signed — preventing tampering.

---

## 🛠 Tech Stack

### 🕹 Frontend

* ⚛ **React 18**
* ⚡ **Vite 5**
* 🎨 **Tailwind CSS v4**
* 🎭 **Pigment CSS**
* 📦 **React Query (TanStack)**

### 🔗 Web3

* 🔌 **Wagmi** (wallet connection)
* 🧮 **Viem** (RPC & signing)
* 🟣 **Farcaster Mini App SDK**
* 🟣 **Neynar SDK** (optional integrations)

### 📁 Storage / DB

* **SQLite3** + **Knex** (simple leaderboard API)

  > (Backend currently being migrated to Cloudflare)

### 🧹 Code Quality

* 🧼 **Biome** for linting + formatting

---

## 📦 Project Structure

```
src/
 ├─ components/
 │   └─ Game.tsx
 ├─ assets/
 │   └─ gem & bomb textures
 ├─ hooks/
 ├─ utils/
 ├─ main.tsx
└─ index.html
```

---

## 🏗 Installation & Development

### 1️⃣ Install dependencies

```bash
yarn install
# or
npm install
```

### 2️⃣ Start development server

```bash
npm run dev
```

### 3️⃣ Build for production

```bash
npm run build
```

### 4️⃣ Preview production build

```bash
npm run preview
```

---

## 🔍 Linting with Biome

Run code quality checks:

```bash
npm run lint
```

Biome handles both **linting** and **formatting** — no ESLint or Prettier needed.

---

## 🔮 Environment Variables

Create `.env` file:

```
VITE_API_URL=https://your-backend-url.com
```

This URL must expose:

* `POST /submit-score`

---

## 🧪 Score Verification Flow

1. Player finishes the game
2. Client generates message
3. Player signs with wallet
4. Backend verifies:

   * valid signature
   * correct wallet
   * valid timestamp & nonce
   * reasonable score
5. Points saved to DB

---

## 🔗 Share to Farcaster

```ts
sdk.actions.composeCast({
  text: "I just earned X points in mines World!",
  embeds: ["https://www.mines.xyz/"]
});
```

---

## 🚀 Deployment

Best deployed on:

* **Cloudflare Pages** (frontend)
* **Cloudflare Workers / D1** (backend & DB)

---

## ❤️ Credits

* Created for the **Mines Community**
* Built using **Farcaster Mini App ecosystem**
* Features custom doodle icons

---

## ⭐️ Like this mini game?

If you're building more Farcaster Mini Apps, feel free to reach out — I can help generate UI, logic, assets, and integrations.

---
