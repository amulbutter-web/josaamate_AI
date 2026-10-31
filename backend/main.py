from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Literal
from datetime import datetime
import json
import csv
import io
import sqlite3
import hashlib
import os

# ============================================================
# JOSAA MATE AI – FastAPI Backend
# ============================================================

app = FastAPI(
    title="JOSAA MATE AI API",
    description="Intelligent Choice Studio for JoSAA Counselling",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join(os.path.dirname(__file__), "josaa_mate.db")

# ============================================================
# DATABASE SETUP
# ============================================================

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT,
        role TEXT DEFAULT 'student',
        created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS student_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT,
        email TEXT,
        jeemain_crl INTEGER,
        jeemain_category_rank INTEGER,
        jee_advanced_rank INTEGER,
        jee_advanced_category_rank INTEGER,
        jee_advanced_qualified INTEGER DEFAULT 0,
        category TEXT DEFAULT 'OPEN',
        is_pwd INTEGER DEFAULT 0,
        gender TEXT DEFAULT 'Male',
        home_state TEXT,
        nationality TEXT DEFAULT 'Indian',
        class12_percentage REAL,
        class12_year INTEGER,
        preferred_institutes TEXT DEFAULT '[]',
        preferred_branches TEXT DEFAULT '[]',
        institute_priority TEXT DEFAULT 'balanced',
        updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS institutes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        short_name TEXT,
        type TEXT,
        state TEXT,
        city TEXT,
        website TEXT,
        nirf_rank INTEGER,
        is_demo INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS programmes (
        id TEXT PRIMARY KEY,
        institute_id TEXT,
        institute_name TEXT,
        institute_type TEXT,
        program_name TEXT,
        duration TEXT,
        degree TEXT,
        state TEXT,
        city TEXT,
        is_demo INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS cutoff_records (
        id TEXT PRIMARY KEY,
        year INTEGER,
        round INTEGER,
        institute_id TEXT,
        institute_name TEXT,
        institute_type TEXT,
        program_name TEXT,
        quota TEXT,
        seat_pool TEXT,
        gender_pool TEXT,
        opening_rank INTEGER,
        closing_rank INTEGER,
        rank_type TEXT,
        state TEXT,
        is_demo INTEGER DEFAULT 1,
        source_url TEXT,
        imported_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS preference_lists (
        id TEXT PRIMARY KEY,
        user_session TEXT,
        name TEXT DEFAULT 'My Preference List',
        strategy TEXT DEFAULT 'balanced',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS preference_items (
        id TEXT PRIMARY KEY,
        list_id TEXT,
        item_order INTEGER,
        institute_id TEXT,
        institute_name TEXT,
        institute_type TEXT,
        program_name TEXT,
        quota TEXT,
        seat_pool TEXT,
        gender_pool TEXT,
        eligibility_status TEXT DEFAULT 'requires_verification',
        closing_rank_2024 INTEGER,
        notes TEXT
    );

    CREATE TABLE IF NOT EXISTS audit_reports (
        id TEXT PRIMARY KEY,
        user_session TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        total_preferences INTEGER DEFAULT 0,
        validated_preferences INTEGER DEFAULT 0,
        eligibility_warnings INTEGER DEFAULT 0,
        duplicate_choices INTEGER DEFAULT 0,
        missing_eligible_choices INTEGER DEFAULT 0,
        ordering_warnings INTEGER DEFAULT 0,
        missing_profile_info INTEGER DEFAULT 0,
        audit_completion REAL DEFAULT 0,
        warnings_json TEXT DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS data_sources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        url TEXT,
        last_updated TEXT,
        status TEXT DEFAULT 'demo',
        record_count INTEGER DEFAULT 0
    );

    INSERT OR IGNORE INTO data_sources (name, url, last_updated, status, record_count)
    VALUES 
        ('JoSAA Official', 'https://josaa.nic.in/', NULL, 'demo', 0),
        ('Opening/Closing Ranks Archive', 'https://josaa.nic.in/or-cr/', NULL, 'demo', 0),
        ('JEE Main (NTA)', 'https://jeemain.nta.nic.in/', NULL, 'demo', 0),
        ('JEE Advanced', 'https://jeeadv.ac.in/', NULL, 'demo', 0),
        ('NIRF Rankings', 'https://www.nirfindia.org/', NULL, 'demo', 0);
    """)

    conn.commit()
    conn.close()

init_db()

# ============================================================
# PYDANTIC MODELS
# ============================================================

class StudentProfileIn(BaseModel):
    name: str
    email: str
    jeemain_crl: Optional[int] = None
    jeemain_category_rank: Optional[int] = None
    jee_advanced_rank: Optional[int] = None
    jee_advanced_category_rank: Optional[int] = None
    jee_advanced_qualified: bool = False
    category: str = "OPEN"
    is_pwd: bool = False
    gender: str = "Male"
    home_state: str = ""
    nationality: str = "Indian"
    class12_percentage: Optional[float] = None
    class12_year: Optional[int] = None
    preferred_institutes: List[str] = []
    preferred_branches: List[str] = []
    institute_priority: str = "balanced"

class PreferenceItemIn(BaseModel):
    id: str
    item_order: int
    institute_id: str
    institute_name: str
    institute_type: str
    program_name: str
    quota: str = "OS"
    seat_pool: str = "OPEN"
    gender_pool: str = "Gender-Neutral"
    eligibility_status: str = "requires_verification"
    closing_rank_2024: Optional[int] = None
    notes: Optional[str] = None

class PreferenceListIn(BaseModel):
    name: str = "My Preference List"
    strategy: str = "balanced"
    items: List[PreferenceItemIn] = []

class CutoffFilter(BaseModel):
    institute_type: Optional[str] = None
    institute_id: Optional[str] = None
    program_name: Optional[str] = None
    quota: Optional[str] = None
    seat_pool: Optional[str] = None
    gender_pool: Optional[str] = None
    year: Optional[int] = None
    round: Optional[int] = None
    limit: int = 100

# ============================================================
# HEALTH
# ============================================================

@app.get("/api/health")
def health():
    return {"status": "ok", "app": "JOSAA MATE AI", "version": "1.0.0", "timestamp": datetime.now().isoformat()}

# ============================================================
# STUDENT PROFILE
# ============================================================

@app.get("/api/student/profile")
def get_profile(session: str = "demo", db=Depends(get_db)):
    row = db.execute("SELECT * FROM student_profiles WHERE user_session = ? OR email = ? LIMIT 1",
                     (session, session)).fetchone()
    if not row:
        return {"profile": None}
    return {"profile": dict(row)}

@app.post("/api/student/profile")
def save_profile(profile: StudentProfileIn, db=Depends(get_db)):
    try:
        db.execute("""
            INSERT OR REPLACE INTO student_profiles 
            (user_id, name, email, jeemain_crl, jeemain_category_rank, jee_advanced_rank,
             jee_advanced_category_rank, jee_advanced_qualified, category, is_pwd, gender,
             home_state, nationality, class12_percentage, class12_year, preferred_institutes,
             preferred_branches, institute_priority, updated_at)
            VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        """, (
            profile.name, profile.email, profile.jeemain_crl, profile.jeemain_category_rank,
            profile.jee_advanced_rank, profile.jee_advanced_category_rank,
            1 if profile.jee_advanced_qualified else 0, profile.category,
            1 if profile.is_pwd else 0, profile.gender, profile.home_state, profile.nationality,
            profile.class12_percentage, profile.class12_year,
            json.dumps(profile.preferred_institutes), json.dumps(profile.preferred_branches),
            profile.institute_priority
        ))
        db.commit()
        return {"success": True, "message": "Profile saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# INSTITUTES
# ============================================================

@app.get("/api/institutes")
def get_institutes(type: Optional[str] = None, db=Depends(get_db)):
    query = "SELECT * FROM institutes"
    params = []
    if type and type != "ALL":
        query += " WHERE type = ?"
        params.append(type)
    rows = db.execute(query, params).fetchall()
    # Return demo data if DB empty
    if not rows:
        from demo_seed import DEMO_INSTITUTES
        return {"institutes": DEMO_INSTITUTES, "is_demo": True}
    return {"institutes": [dict(r) for r in rows], "is_demo": True}

# ============================================================
# PROGRAMMES
# ============================================================

@app.get("/api/programmes")
def get_programmes(
    institute_type: Optional[str] = None,
    institute_id: Optional[str] = None,
    search: Optional[str] = None,
    state: Optional[str] = None,
    db=Depends(get_db)
):
    query = "SELECT * FROM programmes WHERE 1=1"
    params = []
    if institute_type and institute_type != "ALL":
        query += " AND institute_type = ?"
        params.append(institute_type)
    if institute_id:
        query += " AND institute_id = ?"
        params.append(institute_id)
    if search:
        query += " AND (program_name LIKE ? OR institute_name LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])
    if state:
        query += " AND state = ?"
        params.append(state)
    rows = db.execute(query, params).fetchall()
    if not rows:
        from demo_seed import DEMO_PROGRAMMES
        return {"programmes": DEMO_PROGRAMMES, "is_demo": True, "total": len(DEMO_PROGRAMMES)}
    return {"programmes": [dict(r) for r in rows], "is_demo": True, "total": len(rows)}

# ============================================================
# CUTOFFS
# ============================================================

@app.get("/api/cutoffs")
def get_cutoffs(
    institute_type: Optional[str] = None,
    institute_id: Optional[str] = None,
    program_name: Optional[str] = None,
    quota: Optional[str] = None,
    seat_pool: Optional[str] = None,
    year: Optional[int] = None,
    round: Optional[int] = None,
    limit: int = 200,
    db=Depends(get_db)
):
    query = "SELECT * FROM cutoff_records WHERE 1=1"
    params = []
    if institute_type and institute_type != "ALL":
        query += " AND institute_type = ?"
        params.append(institute_type)
    if institute_id:
        query += " AND institute_id = ?"
        params.append(institute_id)
    if program_name:
        query += " AND program_name LIKE ?"
        params.append(f"%{program_name}%")
    if quota and quota != "ALL":
        query += " AND quota = ?"
        params.append(quota)
    if seat_pool and seat_pool != "ALL":
        query += " AND seat_pool = ?"
        params.append(seat_pool)
    if year:
        query += " AND year = ?"
        params.append(year)
    if round:
        query += " AND round = ?"
        params.append(round)
    query += f" ORDER BY year DESC, institute_name ASC LIMIT {limit}"
    rows = db.execute(query, params).fetchall()
    if not rows:
        from demo_seed import DEMO_CUTOFFS
        return {"cutoffs": DEMO_CUTOFFS, "is_demo": True, "total": len(DEMO_CUTOFFS)}
    return {"cutoffs": [dict(r) for r in rows], "is_demo": True, "total": len(rows)}

@app.get("/api/cutoffs/trends")
def get_cutoff_trends(
    institute_id: str,
    program_name: str,
    seat_pool: str = "OPEN",
    quota: str = "OS",
    db=Depends(get_db)
):
    rows = db.execute("""
        SELECT year, round, opening_rank, closing_rank 
        FROM cutoff_records 
        WHERE institute_id = ? AND program_name = ? AND seat_pool = ? AND quota = ?
        ORDER BY year ASC, round DESC
    """, (institute_id, program_name, seat_pool, quota)).fetchall()
    if not rows:
        from demo_seed import DEMO_CUTOFFS
        filtered = [c for c in DEMO_CUTOFFS 
                   if c['instituteId'] == institute_id and c['programName'] == program_name]
        return {"trends": filtered, "is_demo": True}
    # Get last round per year
    by_year = {}
    for r in rows:
        y = r['year']
        if y not in by_year:
            by_year[y] = dict(r)
    return {"trends": list(by_year.values()), "is_demo": True}

# ============================================================
# ELIGIBILITY CHECK
# ============================================================

@app.post("/api/eligibility/check")
def check_eligibility(payload: dict):
    """
    Deterministic rule-based eligibility engine.
    Rules based on JoSAA official business rules.
    Source: josaa.nic.in/document-category/business-rules/
    """
    profile = payload.get("profile", {})
    programme = payload.get("programme", {})

    checks = []
    status = "eligible"

    institute_type = programme.get("institute_type", "")
    jee_adv_qualified = profile.get("jee_advanced_qualified", False)
    jee_adv_rank = profile.get("jee_advanced_rank")
    jee_main_crl = profile.get("jeemain_crl")
    category = profile.get("category", "OPEN")
    class12_pct = profile.get("class12_percentage")
    class12_year = profile.get("class12_year")

    # Rule 1: IITs require JEE Advanced qualification
    if institute_type == "IIT":
        if not jee_adv_qualified:
            checks.append({"rule": "JEE Advanced Qualification", "passed": False,
                "explanation": "IIT admission requires JEE Advanced qualification. You have not indicated JEE Advanced qualification."})
            status = "not_eligible"
        else:
            checks.append({"rule": "JEE Advanced Qualification", "passed": True,
                "explanation": "JEE Advanced qualified. Eligible to apply for IIT programmes."})
        if not jee_adv_rank:
            checks.append({"rule": "JEE Advanced Rank", "passed": False,
                "explanation": "JEE Advanced rank is required for IIT seat allocation."})
            if status != "not_eligible":
                status = "insufficient_info"
        else:
            checks.append({"rule": "JEE Advanced Rank", "passed": True,
                "explanation": f"JEE Advanced rank {jee_adv_rank} provided."})

    # Rule 2: NITs, IIITs, GFTIs require JEE Main
    elif institute_type in ("NIT", "IIIT", "GFTI"):
        if not jee_main_crl:
            checks.append({"rule": "JEE Main CRL", "passed": False,
                "explanation": "NITs, IIITs and GFTIs require a valid JEE Main CRL rank."})
            status = "insufficient_info"
        else:
            checks.append({"rule": "JEE Main CRL", "passed": True,
                "explanation": f"JEE Main CRL {jee_main_crl} provided."})

    # Rule 3: Class 12 eligibility (75% or top 20 percentile for GEN/OBC; 65% for SC/ST/PwD)
    threshold = 65.0 if category in ("SC", "ST", "SC-PwD", "ST-PwD") else 75.0
    if class12_pct is None:
        checks.append({"rule": "Class 12 Eligibility", "passed": False,
            "explanation": "Class 12 percentage not provided. Verify eligibility at josaa.nic.in."})
        if status == "eligible":
            status = "requires_verification"
    elif class12_pct < threshold:
        checks.append({"rule": "Class 12 Eligibility", "passed": False,
            "explanation": f"Class 12 percentage {class12_pct}% may be below the required {threshold}% for your category. Verify at josaa.nic.in. Top 20 percentile exemption may apply."})
        if status == "eligible":
            status = "requires_verification"
    else:
        checks.append({"rule": "Class 12 Eligibility", "passed": True,
            "explanation": f"Class 12 percentage {class12_pct}% meets the {threshold}% threshold for {category} category."})

    # Rule 4: Class 12 year (must be 2025 or 2026 for JoSAA 2026)
    if class12_year:
        if class12_year not in (2025, 2026):
            checks.append({"rule": "Class 12 Year", "passed": False,
                "explanation": f"JoSAA 2026 typically requires Class 12 passed in 2025 or 2026. Year {class12_year} may not be eligible. Verify official rules."})
            if status == "eligible":
                status = "requires_verification"
        else:
            checks.append({"rule": "Class 12 Year", "passed": True,
                "explanation": f"Class 12 year {class12_year} is within the eligible window."})

    return {
        "status": status,
        "label": {"eligible": "Eligible", "not_eligible": "Not Eligible",
                  "requires_verification": "Requires Verification", "insufficient_info": "Insufficient Information"}.get(status, status),
        "explanation": _get_eligibility_explanation(status, institute_type),
        "source": "josaa.nic.in/document-category/business-rules/",
        "checks": checks
    }

def _get_eligibility_explanation(status: str, institute_type: str) -> str:
    if status == "eligible":
        return f"Based on your profile, you appear eligible for {institute_type} programmes. Verify all conditions at josaa.nic.in."
    elif status == "not_eligible":
        return f"Based on your profile, you do not appear eligible for {institute_type} programmes. Check official JoSAA business rules."
    elif status == "requires_verification":
        return "Some eligibility conditions require verification. Please check josaa.nic.in/document-category/business-rules/ carefully."
    else:
        return "Insufficient profile information to determine eligibility. Please complete your profile."

# ============================================================
# PREFERENCES
# ============================================================

@app.get("/api/preferences")
def get_preferences(session: str = "demo", db=Depends(get_db)):
    list_row = db.execute("SELECT * FROM preference_lists WHERE user_session = ? LIMIT 1", (session,)).fetchone()
    if not list_row:
        return {"list": None, "items": []}
    items = db.execute("SELECT * FROM preference_items WHERE list_id = ? ORDER BY item_order",
                       (list_row['id'],)).fetchall()
    return {"list": dict(list_row), "items": [dict(i) for i in items]}

@app.post("/api/preferences")
def save_preferences(plist: PreferenceListIn, session: str = "demo", db=Depends(get_db)):
    import uuid
    list_id = str(uuid.uuid4())
    # Delete existing
    old = db.execute("SELECT id FROM preference_lists WHERE user_session = ?", (session,)).fetchone()
    if old:
        list_id = old['id']
        db.execute("DELETE FROM preference_items WHERE list_id = ?", (list_id,))
    else:
        db.execute("INSERT INTO preference_lists (id, user_session, name, strategy) VALUES (?,?,?,?)",
                   (list_id, session, plist.name, plist.strategy))
    db.execute("UPDATE preference_lists SET name=?, strategy=?, updated_at=datetime('now') WHERE id=?",
               (plist.name, plist.strategy, list_id))
    for item in plist.items:
        db.execute("""INSERT OR REPLACE INTO preference_items 
            (id, list_id, item_order, institute_id, institute_name, institute_type, program_name,
             quota, seat_pool, gender_pool, eligibility_status, closing_rank_2024, notes)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (item.id, list_id, item.item_order, item.institute_id, item.institute_name,
             item.institute_type, item.program_name, item.quota, item.seat_pool,
             item.gender_pool, item.eligibility_status, item.closing_rank_2024, item.notes))
    db.commit()
    return {"success": True, "list_id": list_id}

# ============================================================
# AUDIT
# ============================================================

@app.post("/api/audit/run")
def run_audit(payload: dict):
    """
    Deterministic counselling mistake detector.
    Never modifies the user's list. Returns warnings only.
    """
    items = payload.get("items", [])
    profile = payload.get("profile", {})
    warnings = []
    wid = 0

    # Check 1: Empty list
    if not items:
        warnings.append({"id": f"w{wid}", "type": "missing_choice", "severity": "warning",
            "title": "Preference list is empty",
            "description": "You have not added any programme choices to your preference list.",
            "reason": "An empty preference list means you cannot be allotted a seat.",
            "suggestion": "Add eligible programmes from the Explore Colleges section.",
            "confidence": "high"})
        wid += 1

    # Check 2: Duplicates
    seen = {}
    for item in items:
        key = f"{item.get('instituteId','')}-{item.get('programName','')}-{item.get('seatPool','')}"
        if key in seen:
            warnings.append({"id": f"w{wid}", "type": "duplicate", "severity": "error",
                "title": f"Duplicate choice detected",
                "description": f"{item.get('instituteName','')} – {item.get('programName','')} ({item.get('seatPool','')}) appears more than once.",
                "reason": "Duplicate entries waste preference slots and may cause confusion.",
                "suggestion": "Remove the duplicate entry.",
                "confidence": "high"})
            wid += 1
        seen[key] = True

    # Check 3: IIT eligibility
    jee_adv = profile.get("jeeAdvancedQualified", False)
    iit_items = [i for i in items if i.get("instituteType") == "IIT"]
    if iit_items and not jee_adv:
        warnings.append({"id": f"w{wid}", "type": "eligibility_error", "severity": "error",
            "title": "IIT choices without JEE Advanced qualification",
            "description": f"You have {len(iit_items)} IIT choice(s) but have not indicated JEE Advanced qualification.",
            "reason": "IIT admission through JoSAA requires JEE Advanced qualification.",
            "suggestion": "Update your profile to confirm JEE Advanced status, or remove IIT choices if not qualified.",
            "confidence": "high"})
        wid += 1

    # Check 4: Missing backup (all IITs, no NITs/IIITs)
    types = set(i.get("instituteType", "") for i in items)
    if items and types == {"IIT"}:
        warnings.append({"id": f"w{wid}", "type": "missing_backup", "severity": "warning",
            "title": "No backup choices from NITs/IIITs",
            "description": "All your choices are IITs. IIT cutoffs are highly competitive.",
            "reason": "Having no NIT/IIIT/GFTI choices could leave you without any allotment.",
            "suggestion": "Consider adding NIT or IIIT programmes as backup options.",
            "confidence": "medium"})
        wid += 1

    # Check 5: Missing profile info
    missing_fields = []
    if not profile.get("homeState"): missing_fields.append("Home State")
    if not profile.get("category"): missing_fields.append("Category")
    if not profile.get("jeemainCRL") and not profile.get("jeeAdvancedRank"): missing_fields.append("JEE Rank")
    if missing_fields:
        warnings.append({"id": f"w{wid}", "type": "eligibility_error", "severity": "warning",
            "title": "Incomplete profile information",
            "description": f"Missing: {', '.join(missing_fields)}",
            "reason": "Incomplete profile prevents accurate eligibility checks.",
            "suggestion": "Complete your profile in Student Profile & Eligibility section.",
            "confidence": "high"})
        wid += 1

    total = len(items)
    eligibility_warnings = len([w for w in warnings if w["type"] == "eligibility_error"])
    duplicates = len([w for w in warnings if w["type"] == "duplicate"])
    missing = len([w for w in warnings if w["type"] == "missing_choice"])
    ordering = len([w for w in warnings if w["type"] == "ordering_issue"])
    backup = len([w for w in warnings if w["type"] == "missing_backup"])
    profile_missing = len([w for w in warnings if w["type"] == "eligibility_error" and "profile" in w["description"].lower()])

    errors = len([w for w in warnings if w["severity"] == "error"])
    score = max(0, 100 - errors * 20 - len([w for w in warnings if w["severity"] == "warning"]) * 8)

    return {
        "warnings": warnings,
        "totalPreferences": total,
        "validatedPreferences": total - duplicates,
        "eligibilityWarnings": eligibility_warnings,
        "duplicateChoices": duplicates,
        "missingEligibleChoices": missing,
        "orderingWarnings": ordering,
        "missingProfileInfo": profile_missing,
        "auditScore": score,
        "auditCompletion": 100.0
    }

# ============================================================
# REPORTS
# ============================================================

@app.get("/api/reports/csv")
def download_csv(session: str = "demo", db=Depends(get_db)):
    list_row = db.execute("SELECT * FROM preference_lists WHERE user_session = ? LIMIT 1", (session,)).fetchone()
    items = []
    if list_row:
        rows = db.execute("SELECT * FROM preference_items WHERE list_id = ? ORDER BY item_order",
                          (list_row['id'],)).fetchall()
        items = [dict(r) for r in rows]

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Order", "Institute", "Programme", "Type", "Seat Pool", "Quota", "Gender Pool", "Closing Rank 2024", "Notes"])
    writer.writerow(["[DEMO DATA - All ranks are illustrative]"])
    for i, item in enumerate(items, 1):
        writer.writerow([
            i, item.get('institute_name', ''), item.get('program_name', ''),
            item.get('institute_type', ''), item.get('seat_pool', ''),
            item.get('quota', ''), item.get('gender_pool', ''),
            item.get('closing_rank_2024', 'N/A'), item.get('notes', '')
        ])
    writer.writerow([])
    writer.writerow(["DISCLAIMER: This is a personal decision-support document generated by JOSAA MATE AI."])
    writer.writerow(["Not affiliated with JoSAA, JAB or any government body. Verify all data at josaa.nic.in"])

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=josaa_mate_preferences.csv"}
    )

# ============================================================
# ADMIN
# ============================================================

@app.get("/api/admin/data-sources")
def get_data_sources(db=Depends(get_db)):
    rows = db.execute("SELECT * FROM data_sources").fetchall()
    return {"sources": [dict(r) for r in rows]}

@app.get("/api/admin/data-quality")
def get_data_quality(db=Depends(get_db)):
    return {
        "institutes": db.execute("SELECT COUNT(*) as c FROM institutes").fetchone()['c'],
        "programmes": db.execute("SELECT COUNT(*) as c FROM programmes").fetchone()['c'],
        "cutoffs": db.execute("SELECT COUNT(*) as c FROM cutoff_records").fetchone()['c'],
        "is_demo": True,
        "demo_counts": {"institutes": 16, "programmes": 23, "cutoffs": 24},
        "notice": "Currently running on demo data. Import official data via CSV/Excel upload."
    }

@app.post("/api/admin/import")
def import_data(payload: dict):
    """Placeholder for data import endpoint. Requires admin authentication."""
    return {
        "message": "Data import endpoint ready. Connect frontend file upload to this endpoint.",
        "supported_types": ["institutes", "programmes", "cutoffs", "schedule", "eligibility_rules"],
        "note": "Implement CSV parsing with pandas in production."
    }

# ============================================================
# AI COUNSELLING ASSISTANT (Powered by Groq)
# ============================================================

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatPayload(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    profile: Optional[dict] = {}

def get_rule_fallback(message: str) -> str:
    m = message.lower()
    if "closing rank" in m or "cutoff" in m:
        return "Closing rank is the lowest rank (highest numerical value) to which a seat in a particular programme was allocated in a given round. It reflects historical competitiveness, but does not guarantee future admission."
    elif "home state" in m or "quota" in m:
        return "In JoSAA, NITs offer 50% Home State (HS) quota for candidates from the state where the NIT is located, and 50% Other State (OS) quota. IITs have an All India (AI) quota with no state reservations."
    elif "float" in m or "freeze" in m or "slide" in m:
        return "• **Freeze**: Accept seat permanently and withdraw from further rounds.\n• **Float**: Keep current seat while staying eligible for higher preferences in later rounds.\n• **Slide**: Keep the same institute but accept higher-preference branch within it."
    elif "rank" in m or "college" in m:
        return "Your admission possibilities depend on your rank, category, seat pool, and branch preference. Open the Intelligent Choice Studio's **Explore Colleges** and **Rank & Cutoff Explorer** to filter eligible programmes."
    return "JoSAA counselling is the centralized process for IITs, NITs, IIITs, and GFTIs. Always refer to official business rules at https://josaa.nic.in for binding information."

@app.post("/api/ai/chat")
def ai_chat(payload: ChatPayload):
    user_msg = payload.message.strip()
    if not user_msg:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    profile_context = ""
    p = payload.profile or {}
    if p.get("name") or p.get("jeemainCRL") or p.get("category"):
        profile_context = (
            f"\nStudent Profile: Name: {p.get('name', 'Student')}, "
            f"JEE Main CRL: {p.get('jeemainCRL', 'Not set')}, "
            f"JEE Advanced Rank: {p.get('jeeAdvancedRank', 'Not set')}, "
            f"JEE Adv Qualified: {p.get('jeeAdvancedQualified', False)}, "
            f"Category: {p.get('category', 'OPEN')}, "
            f"Home State: {p.get('homeState', 'Not specified')}."
        )

    system_prompt = (
        "You are JoSAA Mate AI, a world-class, empathetic, highly knowledgeable AI counsellor for Indian engineering admissions "
        "(IITs, NITs, IIITs, GFTIs).\n"
        "Guidelines:\n"
        "1. Give clear, concise, structured answers with bullet points or numbered lists.\n"
        "2. Differentiate clearly between IIT rules (require JEE Advanced) and NIT/IIIT/GFTI rules (require JEE Main).\n"
        "3. Explain Float, Freeze, Slide, Quotas (HS/OS/AI), and Seat Pools accurately.\n"
        "4. Never guarantee admission; treat historical closing ranks as indicative guidelines.\n"
        "5. Always advise students to verify final details at josaa.nic.in.\n"
        f"{profile_context}"
    )

    messages = [{"role": "system", "content": system_prompt}]
    if payload.history:
        for h in payload.history[-6:]:
            if h.role in ("user", "assistant"):
                messages.append({"role": h.role, "content": h.content})
    messages.append({"role": "user", "content": user_msg})

    import urllib.request
    req = urllib.request.Request(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        data=json.dumps({
            "model": "qwen/qwen3.8-27b",
            "messages": messages,
            "max_tokens": 500,
            "temperature": 0.6
        }).encode("utf-8")
    )

    try:
        with urllib.request.urlopen(req, timeout=12) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            ai_reply = res_data["choices"][0]["message"]["content"]
            return {"reply": ai_reply, "source": "groq", "model": "qwen/qwen3.8-27b"}
    except Exception as e:
        fallback = get_rule_fallback(user_msg)
        return {"reply": fallback, "source": "rule_engine", "error": str(e)}

# ============================================================
# SERVE FRONTEND (SPA)
# ============================================================

FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

if os.path.exists(FRONTEND_DIST):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.api_route("/{full_path:path}", methods=["GET", "HEAD"])
    async def serve_spa(full_path: str):
        # Allow API routes to be handled by FastAPI
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API route not found")
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        index_file = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return JSONResponse({"status": "ok", "app": "JOSAA MATE AI"})

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
