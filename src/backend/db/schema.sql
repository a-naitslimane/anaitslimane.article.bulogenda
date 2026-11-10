CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'recruiter',
    position TEXT DEFAULT '',
    company TEXT DEFAULT '',
    location TEXT DEFAULT '',
    email TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    link TEXT DEFAULT '',
    stage TEXT DEFAULT 'to_contact',
    notes TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS opportunities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    position TEXT DEFAULT '',
    source TEXT DEFAULT 'job_ad',
    sent_at TEXT DEFAULT '',
    kind TEXT DEFAULT 'end_client',
    contract TEXT DEFAULT '',
    location TEXT DEFAULT '',
    remote TEXT DEFAULT '',
    team TEXT DEFAULT '',
    salary TEXT DEFAULT '',
    duration TEXT DEFAULT '',
    start_date TEXT DEFAULT '',
    link TEXT DEFAULT '',
    description TEXT DEFAULT '',
    stage TEXT DEFAULT 'applied',
    reason TEXT DEFAULT '',
    notes TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS history_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scope TEXT NOT NULL,
    ref INTEGER NOT NULL,
    day TEXT NOT NULL,
    kind TEXT DEFAULT 'other',
    who TEXT DEFAULT '',
    note TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS actors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    opp_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'employee',
    contact TEXT DEFAULT '',
    email TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    link TEXT DEFAULT '',
    day TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scope TEXT DEFAULT 'opps',
    ref INTEGER NOT NULL,
    kind TEXT DEFAULT 'discovery_call',
    mode TEXT DEFAULT 'phone',
    location TEXT DEFAULT '',
    day TEXT NOT NULL,
    who TEXT DEFAULT '',
    prep TEXT DEFAULT '',
    feedback TEXT DEFAULT '',
    done INTEGER DEFAULT 0
);