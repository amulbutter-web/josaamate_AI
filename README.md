# JOSAA MATE AI

> **Your Rank. Your Choices. Your Future.**

An intelligent counselling decision-support platform for JoSAA, centred on the **Intelligent Choice Studio**.

---

## ⚠️ Important Disclaimers

- **Not affiliated** with JoSAA, JAB, IITs, NITs, IIITs or any government body.
- **Does not guarantee admission** or submit preferences to the official JoSAA portal.
- All cutoff data currently shown is **illustrative demo data only**.
- Import official data from [josaa.nic.in/or-cr/](https://josaa.nic.in/or-cr/) for accurate analysis.

---

## 🚀 Quick Start

### Frontend (React + Vite + TypeScript)

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
Open: http://localhost:5173

### Backend (FastAPI + Python)

```bash
cd backend
pip install -r requirements.txt
python main.py
```
API: http://localhost:8000
Docs: http://localhost:8000/docs

---

## 🏗️ Architecture

```
josaa-mate-ai/
├── frontend/          # React + Vite + TypeScript
│   └── src/
│       ├── pages/     # All studio pages
│       ├── components/# Sidebar, Header, UI components
│       ├── store/     # AppContext (global state)
│       ├── types/     # TypeScript type definitions
│       └── data/      # Demo data (labelled)
└── backend/           # FastAPI + SQLite
    ├── main.py        # All API endpoints
    └── demo_seed.py   # Demo data seed
```

---

## ✨ Features

| Module | Description |
|--------|-------------|
| **Personalised Dashboard** | Counselling status, deadlines, progress tracking, next steps |
| **Student Profile** | JEE scores, category, home state, preferences |
| **Explore Colleges** | Search IITs/NITs/IIITs/GFTIs with filters |
| **Rank & Cutoff Explorer** | Historical opening/closing ranks with interactive charts |
| **College Comparison** | Side-by-side comparison of up to 4 programmes |
| **Preference List Builder** | Drag-and-drop with PDF/CSV export |
| **Mistake Detector** | Eligibility errors, duplicates, ordering issues |
| **Timeline Replay** | Illustrative counselling round progression |
| **Final Report** | PDF/CSV download with full preference list |
| **Admin Panel** | Data import for institutes, programmes, cutoffs |

---

## 📊 Data Sources

- **Official JoSAA**: https://josaa.nic.in/
- **Opening/Closing Ranks**: https://josaa.nic.in/or-cr/
- **Business Rules**: https://josaa.nic.in/document-category/business-rules/
- **JEE Main**: https://jeemain.nta.nic.in/
- **JEE Advanced**: https://jeeadv.ac.in/

---

## 🛠️ Tech Stack

**Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Recharts, dnd-kit, Lucide React, jsPDF

**Backend**: Python, FastAPI, Pydantic, SQLite (dev) / PostgreSQL (prod)

---

## 📝 License

Built for educational and hackathon demonstration purposes. All official JoSAA data belongs to the respective authorities.
