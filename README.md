# 🚀 Craftivio AI – Deployment Guide

## Folder Structure

```
craftivio/
├── index.html          ← Landing page
├── vercel.json         ← Vercel config
├── css/
│   └── style.css       ← All styles
├── js/
│   └── main.js         ← App logic + AI calls
└── pages/
    ├── login.html      ← Login page
    ├── signup.html     ← Signup page
    ├── dashboard.html  ← Main dashboard
    ├── tool.html       ← All 3 tools (hook/caption/hashtag)
    └── pricing.html    ← Upgrade page
```

---

## ⚡ Deploy to Vercel (5 minutes)

### Option A – Drag & Drop (Easiest)
1. Go to https://vercel.com and sign in
2. Click **"Add New Project"**
3. Click **"Upload"** and drag the entire `craftivio/` folder
4. Click **Deploy** — done! 🎉

### Option B – GitHub (Recommended for updates)
1. Create a new GitHub repo
2. Push the `craftivio/` folder contents as the root
3. Go to https://vercel.com → **Import Project** → select your repo
4. Click **Deploy**

---

## 🔑 Adding Your OpenAI API Key (Optional)

By default, the app uses **smart mock responses** — great for demo/testing.

To use the real OpenAI API:

1. Open `js/main.js`
2. Find this line near the top of `generateContent()`:
   ```js
   const OPENAI_KEY = window.CRAFTIVIO_OPENAI_KEY || '';
   ```
3. Replace with your key:
   ```js
   const OPENAI_KEY = 'sk-your-actual-key-here';
   ```

> ⚠️ **Security Note**: For production, never expose API keys client-side.
> Instead, create a serverless function (Vercel API route) to proxy the call.

### Serverless API Route (Production Pattern)
Create `api/generate.js` in your project root:
```js
export default async function handler(req, res) {
  const { tool, topic, tone, platform } = req.body;
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({ /* your prompt */ })
  });
  const data = await response.json();
  res.json(data);
}
```
Then set `OPENAI_API_KEY` in Vercel's **Environment Variables** settings.

---

## 🔐 Supabase Auth (Production Upgrade)

The app currently uses `localStorage` for auth (perfect for demos).  
To upgrade to real Supabase auth:

1. Create a project at https://supabase.com
2. Get your `SUPABASE_URL` and `SUPABASE_ANON_KEY`
3. Add the Supabase JS SDK to each HTML file:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   ```
4. Replace the `getUsers`/`saveUsers`/`setCurrentUser` functions in `main.js`
   with Supabase's `signUp`, `signIn`, and `getUser` calls.

---

## 💳 Stripe Payments (Production Upgrade)

The "Upgrade to Pro" button simulates a payment for demo purposes.  
To add real payments:

1. Create a Stripe account at https://stripe.com
2. Create a product + price in the Stripe dashboard
3. Install Stripe: `npm install stripe`
4. Create a Vercel serverless function `api/create-checkout.js`
5. Update the `upgradeToPro()` function to redirect to Stripe Checkout

---

## 🎨 Customization

| What | Where |
|------|-------|
| Brand name | All HTML files, search "Craftivio" |
| Colors | `css/style.css` → `:root` variables |
| Pricing | `pages/pricing.html` + `index.html` |
| Daily limit (free) | `js/main.js` → `canGenerate()` (change `5`) |
| Mock AI responses | `js/main.js` → `mockResponses` object |
| Fonts | HTML `<link>` tags → Google Fonts |

---

## ✅ Feature Checklist

- [x] Landing page with hero, features, pricing, footer
- [x] Signup / Login (localStorage auth)
- [x] Dashboard with tool cards and usage stats
- [x] Hook Generator
- [x] Caption Generator  
- [x] Hashtag Generator
- [x] 3 AI variants per generation
- [x] Copy to clipboard (individual + all)
- [x] Tone selector (5 options)
- [x] Platform selector (5 options)
- [x] Daily usage tracking (Free: 5/day)
- [x] Pro upgrade simulation
- [x] Mobile responsive
- [x] Dark modern UI

---

Made by Craftivio · © 2025
