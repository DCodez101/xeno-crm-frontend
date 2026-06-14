# XenoCRM — Frontend

AI-native Mini CRM for D2C fashion brands. Built for the Xeno FDE Internship Assignment 2026.

## Live URLs
- **Frontend:** https://xeno-crm-frontend-six.vercel.app
- **CRM Backend:** https://xeno-crm-backend-ud1l.onrender.com
- **Channel Service:** https://xeno-channel-service-fque.onrender.com

---

## Overview

XenoCRM helps a D2C fashion brand decide who to talk to, what to say, and reach them through messaging channels like WhatsApp, SMS, Email and RCS.

The frontend is a Classic UI with AI assist — AI helps the marketer at key decision points (segment suggestion and message drafting) rather than replacing them entirely.

---

## Pages

| Page | Description |
|------|-------------|
| Dashboard | Live stats — total customers, orders, avg spend, city distribution chart, recent campaigns |
| Customers | Searchable, paginated table of 200 seeded shoppers with spend and order history |
| Segments | Rule-based audience builder with AI suggest (plain English → structured rules) |
| Campaigns | List of all campaigns with live delivery stats and delivery rate bars |
| New Campaign | 3-step wizard — pick segment, draft message (with AI), send |
| Campaign Detail | Live breakdown — sent, delivered, opened, clicked, failed with chart |

---

## Tech Stack

- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Routing:** React Router v6
- **HTTP:** Axios
- **Deploy:** Vercel

---

## Repository Structure

```
crm-frontend/
├── src/
│   ├── App.jsx                  ← Router setup
│   ├── api.js                   ← All backend API calls
│   ├── index.css                ← Tailwind + global design tokens
│   ├── components/
│   │   ├── Sidebar.jsx          ← Navigation
│   │   └── StatCard.jsx         ← Dashboard stat card
│   └── pages/
│       ├── Dashboard.jsx
│       ├── Customers.jsx
│       ├── Segments.jsx
│       ├── Campaigns.jsx
│       ├── NewCampaign.jsx
│       └── CampaignDetail.jsx
├── tailwind.config.js
├── vercel.json
└── vite.config.js
```

---

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=https://xeno-crm-backend-ud1l.onrender.com
```

---

## Run Locally

```bash
git clone https://github.com/DCodez101/xeno-crm-frontend
cd crm-frontend
cp .env.example .env
# set VITE_API_URL=http://localhost:5000 for local backend
npm install
npm run dev     # runs on http://localhost:5173
```

Make sure the backend and channel service are also running locally. See the backend repo for instructions.

---

## Design

- Warm off-white canvas (#F7F4EF) — editorial, not generic SaaS blue
- Terracotta accent (#E8622A) — single accent color used sparingly
- Syne + Inter typography — geometric headings, clean body text
- Hairline borders, no heavy shadows
- Loading skeletons on data tables
- Disabled pagination buttons visually distinct
- Pulsing dot indicator on in-progress campaign status

---

## Related Repository

- **Backend + Channel Service:** https://github.com/DCodez101/xeno-crm-backend
