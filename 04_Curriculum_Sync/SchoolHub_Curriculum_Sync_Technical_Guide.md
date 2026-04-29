# SchoolHub — Curriculum Sync Technical Guide

Aligned to **PRD v3.0 (April 2026)**. Scope: Singapore K2 → P6. Model: `claude-sonnet-4-6`.

Companion to `SchoolHub_Curriculum_Sync_Summary.md`. Use this file when writing the sync pipeline and the parent-facing curriculum selection flow.

## Scope

| In scope | Out of scope (v3) |
|----------|-------------------|
| MOE P1–P6 syllabi (English, Math, Science, Chinese, Mother Tongue) | Secondary (Sec 1–4) |
| K2 readiness tracks (pre-built, no sync) | O-Level / N(A)-Level / N(T)-Level |
| Parent-uploaded files (Data Input feature) | International curricula (IB, Cambridge, EdExcel) |
| Change-propagation notifications | Preschool (ages 3–5) |

K2 children use pre-built readiness tracks (English, Math, Chinese Foundations) shipped inside the app. No sync required. International and Secondary curricula are deferred to Phase 2 post-June-2026 launch.

Parent file uploads (spelling lists, school calendars, assessment dates) go through a separate **upload parsing** path documented in `../03_Skills_Framework/schoolhub-ai-curriculum-skill.md` — not this cron.

## 1. Data Sources

### 1.1 MOE P1–P6

| Subject | Target syllabus |
|---------|-----------------|
| Mathematics | 2021 Primary Mathematics Syllabus P1–P6 |
| English (STELLAR) | Primary English Language |
| Science | Primary Science Teaching & Learning Syllabus (P3–P6) |
| Chinese (Simplified) | Primary Chinese Language |
| Mother Tongue (Malay / Tamil) | Primary MTL syllabuses |

Sources:

- Index page: `https://www.moe.gov.sg/primary/curriculum/syllabus`
- PDF assets: `https://www.moe.gov.sg/-/media/files/primary/...`

Typical cadence: MOE publishes updates in July / August. Fetch weekly to catch interim errata.

### 1.2 data.gov.sg (metadata only)

```
GET https://data.gov.sg/api/action/datastore_search?resource_id=<id>&limit=100
```

Used only for school-directory metadata, not curriculum content.

## 2. Scraping Architecture

### 2.1 Tool choice

Use **GitHub Actions + Supabase Storage** for MVP. Cost: $0. Cron: weekly. No servers.

If fetch time exceeds the 6 h job cap (it won't for P1–P6 at < 30 PDFs), migrate to Cloud Functions.

### 2.2 GitHub Actions workflow

`.github/workflows/fetch-syllabuses.yml`:

```yaml
name: Fetch MOE Syllabuses (P1–P6)

on:
  schedule:
    # Monday 02:00 Singapore Time (UTC+8) → 18:00 UTC Sunday
    - cron: '0 18 * * 0'
  workflow_dispatch:

jobs:
  fetch-syllabuses:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: pip install requests supabase pdfplumber python-dotenv anthropic

      - name: Fetch MOE P1–P6 syllabuses
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
        run: python scripts/fetch_moe_syllabuses.py

      - name: Detect changes + enqueue
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
        run: python scripts/detect_changes.py

      - name: Parse with Claude Sonnet
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          CLAUDE_API_KEY: ${{ secrets.CLAUDE_API_KEY }}
          CLAUDE_MODEL: claude-sonnet-4-6
        run: python scripts/parse_with_claude.py

      - name: Alert on failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'MOE syllabus fetch failed'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 2.3 Fetch script

`scripts/fetch_moe_syllabuses.py`:

```python
import os, hashlib, requests
from datetime import datetime, timezone
from supabase import create_client, Client

supabase: Client = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_ROLE_KEY"],
)

# MOE P1–P6 seed URLs. Expand to cover all in-scope subjects.
MOE_URLS = {
    "MOE_primary_math_p1_p6":    "https://www.moe.gov.sg/-/media/files/primary/2021-primary-mathematics-syllabus-p1-to-p6.pdf",
    "MOE_primary_english":       "https://www.moe.gov.sg/-/media/files/primary/2010-english-language-primary-secondary-express.pdf",
    "MOE_primary_science_p3_p6": "https://www.moe.gov.sg/-/media/files/primary/science-primary-teaching-and-learning-syllabus.pdf",
    "MOE_primary_chinese":       "https://www.moe.gov.sg/-/media/files/primary/chinese-language-primary.pdf",
    # Add Mother Tongue (Malay, Tamil) sources here.
}

def fetch(key: str, url: str):
    resp = requests.get(url, timeout=60)
    resp.raise_for_status()
    content = resp.content
    return {
        "key": key,
        "url": url,
        "hash": hashlib.sha256(content).hexdigest(),
        "size": len(content),
        "content": content,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
    }

def last_hash(key: str) -> str | None:
    r = (
        supabase.table("curriculum_versions")
        .select("source_hash")
        .eq("source", key)
        .order("fetched_at", desc=True)
        .limit(1)
        .execute()
    )
    return r.data[0]["source_hash"] if r.data else None

def store(syllabus: dict):
    path = f"syllabuses/{syllabus['key']}.pdf"
    supabase.storage.from_("syllabuses").upload(path, syllabus["content"], {"upsert": True})
    supabase.table("curriculum_versions").insert({
        "source": syllabus["key"],
        "source_hash": syllabus["hash"],
        "file_path": path,
        "file_size": syllabus["size"],
        "fetched_at": syllabus["fetched_at"],
        "status": "fetched",
    }).execute()

def main():
    for key, url in MOE_URLS.items():
        try:
            s = fetch(key, url)
        except Exception as e:
            print(f"fetch error {key}: {e}")
            continue
        if s["hash"] != last_hash(key):
            store(s)
            print(f"stored change: {key}")
        else:
            print(f"unchanged: {key}")

if __name__ == "__main__":
    main()
```

### 2.4 Change-detection + enqueue

`scripts/detect_changes.py`:

```python
import os
from datetime import datetime, timedelta, timezone
from supabase import create_client, Client

supabase: Client = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_ROLE_KEY"],
)

def enqueue_recent():
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
    recent = (
        supabase.table("curriculum_versions")
        .select("id")
        .eq("status", "fetched")
        .gte("fetched_at", cutoff)
        .execute()
    )
    for row in recent.data:
        supabase.table("parse_queue").insert({
            "curriculum_version_id": row["id"],
            "status": "queued",
        }).execute()
        print(f"queued: {row['id']}")

if __name__ == "__main__":
    enqueue_recent()
```

## 3. Claude Sonnet Parsing

### 3.1 Parsing script

`scripts/parse_with_claude.py`:

```python
import os, json, base64
from datetime import datetime, timezone
from anthropic import Anthropic
from supabase import create_client, Client

anthropic = Anthropic()
MODEL = os.environ.get("CLAUDE_MODEL", "claude-sonnet-4-6")

supabase: Client = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_ROLE_KEY"],
)

SYSTEM = (
    "You are a MOE Singapore P1–P6 curriculum parser. Extract the syllabus "
    "structure as strict JSON matching the provided schema. No prose."
)

SCHEMA_PROMPT = """Return strict JSON:
{
  "metadata": {
    "curriculum_type": "MOE",
    "level": "P1" | "P2" | "P3" | "P4" | "P5" | "P6",
    "subject": "Mathematics" | "English" | "Science" | "Chinese" | "Malay" | "Tamil",
    "version_code": "<e.g. 2021_updated>",
    "total_study_hours": <int>
  },
  "topics": [
    {
      "id": "topic_1",
      "name": "<topic name>",
      "learning_objectives": ["..."],
      "estimated_hours": <int>,
      "weight_percentage": <int>,
      "prerequisites": ["<topic id>"],
      "key_concepts": ["..."]
    }
  ]
}
Do not include any topics not present in the syllabus. Return valid JSON only."""

def download(path: str) -> bytes:
    return supabase.storage.from_("syllabuses").download(path)

def parse(pdf_bytes: bytes) -> dict:
    b64 = base64.b64encode(pdf_bytes).decode("utf-8")
    msg = anthropic.messages.create(
        model=MODEL,
        max_tokens=4000,
        system=SYSTEM,
        messages=[{
            "role": "user",
            "content": [
                {"type": "document", "source": {
                    "type": "base64",
                    "media_type": "application/pdf",
                    "data": b64,
                }},
                {"type": "text", "text": SCHEMA_PROMPT},
            ],
        }],
    )
    raw = msg.content[0].text
    start, end = raw.find("{"), raw.rfind("}") + 1
    return json.loads(raw[start:end])

def save(version_id: str, parsed: dict):
    meta = parsed["metadata"]
    supabase.table("curriculum_versions").update({
        "curriculum_type": meta["curriculum_type"],
        "level":           meta["level"],
        "subject":         meta["subject"],
        "version_code":    meta.get("version_code"),
        "parsed_topics":   parsed["topics"],
        "metadata":        meta,
        "status":          "parsed",
        "parsed_at":       datetime.now(timezone.utc).isoformat(),
    }).eq("id", version_id).execute()

def main():
    queue = (
        supabase.table("parse_queue")
        .select("id, curriculum_version_id, retry_count")
        .eq("status", "queued")
        .limit(5)
        .execute()
    )
    for item in queue.data:
        vid = item["curriculum_version_id"]
        v = (
            supabase.table("curriculum_versions")
            .select("file_path, source")
            .eq("id", vid)
            .single()
            .execute()
        )
        try:
            pdf = download(v.data["file_path"])
            parsed = parse(pdf)
            save(vid, parsed)
            supabase.table("parse_queue").update({
                "status": "completed",
                "completed_at": datetime.now(timezone.utc).isoformat(),
            }).eq("id", item["id"]).execute()
        except Exception as e:
            retries = item["retry_count"] + 1
            status = "failed" if retries >= 3 else "queued"
            supabase.table("parse_queue").update({
                "status": status,
                "retry_count": retries,
                "error_message": str(e)[:500],
            }).eq("id", item["id"]).execute()

if __name__ == "__main__":
    main()
```

### 3.2 Validation

Before writing `parsed_topics`, validate with zod in the TypeScript backend (preferred) or jsonschema in Python. See `../03_Skills_Framework/schoolhub-ai-curriculum-skill.md` for the canonical `ParsedTopicsSchema`.

Retry policy:

- Attempt 1: full prompt.
- Attempt 2: same prompt, truncated to first 10 pages if > 40 pages.
- Attempt 3: flag for manual review; deterministic scheduler falls back to last valid version.

### 3.3 Sampling

Sample ≥ 5% of parses for manual accuracy review against the source PDF. Target ≥ 90% accuracy; record outcome in `curriculum_version.metadata.review_accuracy`.

## 4. Database Schema

Source of truth: `../02_Core_Documentation/SchoolHub_API_Reference.md` §14. Summary here.

### 4.1 `curriculum_versions`

```sql
CREATE TABLE curriculum_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source            VARCHAR NOT NULL,           -- e.g. 'MOE_primary_math_p1_p6'
  curriculum_type   VARCHAR NOT NULL,           -- 'MOE' only in v3
  level             VARCHAR,                    -- 'P1'..'P6'
  subject           VARCHAR,                    -- Mathematics | English | Science | Chinese | Malay | Tamil
  version_code      VARCHAR,
  release_date      DATE,
  file_path         VARCHAR,
  source_hash       VARCHAR NOT NULL,           -- SHA-256
  file_size         INT,
  parsed_topics     JSONB,                      -- zod-validated before write
  metadata          JSONB,
  status            VARCHAR,                    -- fetched | parsed | published | deprecated
  fetched_at        TIMESTAMPTZ,
  parsed_at         TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE (source, source_hash)
);

CREATE INDEX idx_curr_source ON curriculum_versions (source);
CREATE INDEX idx_curr_status ON curriculum_versions (status);
CREATE INDEX idx_curr_level_subject ON curriculum_versions (level, subject);
```

### 4.2 `curriculum_change_log`

```sql
CREATE TABLE curriculum_change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_version_id UUID REFERENCES curriculum_versions(id),
  old_version_id        UUID REFERENCES curriculum_versions(id),
  change_type           VARCHAR,  -- new_release | topic_added | topic_modified | topic_removed
  topics_added          INT,
  topics_modified       INT,
  topics_removed        INT,
  affected_levels       VARCHAR[],
  affected_subjects     VARCHAR[],
  parent_notifications_sent INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 4.3 `parse_queue`

```sql
CREATE TABLE parse_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_version_id UUID REFERENCES curriculum_versions(id),
  status         VARCHAR,    -- queued | in_progress | completed | failed
  retry_count    INT DEFAULT 0,
  error_message  TEXT,
  created_at     TIMESTAMPTZ DEFAULT now(),
  started_at     TIMESTAMPTZ,
  completed_at   TIMESTAMPTZ
);

CREATE INDEX idx_parse_queue_status ON parse_queue (status);
```

## 5. Parent API — Curriculum Selection

### 5.1 List available curricula

```
GET /api/curricula?level=P5&subject=mathematics
```

Response:

```json
{
  "curricula": [
    {
      "id": "uuid",
      "source": "MOE_primary_math_p1_p6",
      "curriculum_type": "MOE",
      "level": "P5",
      "subject": "Mathematics",
      "version_code": "2021_updated",
      "release_date": "2024-10-15",
      "topics_count": 12,
      "recommended_hours": 100,
      "latest": true
    }
  ]
}
```

v3 filter values: `curriculum_type` is always `MOE`. `level` ∈ {`P1`..`P6`}. K2 has no entry here — parents select readiness tracks via `/api/k2-readiness-tracks` (see API Reference §3).

### 5.2 Attach curriculum to child

```
POST /api/children/:childId/curriculum
{
  "curriculum_id": "uuid",
  "available_hours_per_week": 8,
  "exam_dates": [{ "subject": "Mathematics", "date": "2026-10-01", "type": "PSLE" }]
}
```

Schedule generation kicks off asynchronously and respects the child's `sen_profile`. The response includes a `schedule_id` the client can poll or subscribe to over WebSocket.

### 5.3 Change notification

When a new `curriculum_versions` row is parsed for a child's subject+level, the server:

1. Writes a `curriculum_change_log` row.
2. Finds all children whose schedule references the old `curriculum_version_id`.
3. Sends a notification (`curriculum_update` type — see `../05_Features/SchoolHub_Parent_Notifications_Implementation.md`).
4. Offers one-tap regeneration with delta preview in the parent dashboard. ASD-profile children get the change on a 48 h delay.

## 6. Monitoring & Alerts

### 6.1 Health checks (daily cron)

```python
def check_health():
    # 1. Most recent successful fetch within 8 days
    last = (
        supabase.table("curriculum_versions")
        .select("fetched_at")
        .order("fetched_at", desc=True)
        .limit(1)
        .execute()
    )
    if last.data:
        ts = datetime.fromisoformat(last.data[0]["fetched_at"].replace("Z", "+00:00"))
        if datetime.now(timezone.utc) - ts > timedelta(days=8):
            alert("No curriculum fetch in 8 days")

    # 2. No parse jobs stalled > 2 h
    stalled = (
        supabase.table("parse_queue")
        .select("id")
        .eq("status", "in_progress")
        .lt("started_at",
            (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat())
        .execute()
    )
    if stalled.data:
        alert(f"{len(stalled.data)} parse jobs stalled > 2 h")

    # 3. 7-day rolling parse success ≥ 90%
    # (implementation uses a view; see API Reference §19)
```

### 6.2 Slack alerts

```python
import slack_sdk
slack = slack_sdk.WebClient(token=os.environ["SLACK_BOT_TOKEN"])

def notify_curriculum_update(row: dict):
    slack.chat_postMessage(
        channel="#curriculum-updates",
        text=(
            f"*Curriculum updated* — {row['source']}\n"
            f"Level: {row['level']}  Subject: {row['subject']}\n"
            f"Topics modified: {row['topics_modified']}\n"
            f"Will notify {row['affected_parents_count']} parents"
        ),
    )
```

## 7. Implementation Timeline

| Week | Task |
|------|------|
| 1 | GitHub Actions workflow + Supabase schema migrations (curriculum_versions, parse_queue, curriculum_change_log) |
| 2 | `fetch_moe_syllabuses.py` for 5 seed P1–P6 syllabi + SHA-256 hashing |
| 3 | `detect_changes.py` + `parse_with_claude.py` with zod validation + retries |
| 4 | Parent API endpoints (list + attach + regen) + dropdown UI |
| 5 | Backfill remaining MOE P1–P6 subjects; 5% manual accuracy sample |
| 6 | Change-notification notifier + deploy to staging |
| 7 | Production launch; beta cohort families pick from dropdown |

## 8. Success Criteria

- Weekly cron 100% successful over rolling 8 weeks.
- Parse accuracy ≥ 90% on a ≥ 5% manual sample.
- Parse-to-availability < 24 h after MOE publication.
- Parent dropdown loads in ≤ 500 ms (warm cache).
- All MOE P1–P6 subjects in scope covered at launch (~24 curriculum_version rows).
- Change-propagation notification delivered within 30 min of new parse.

## 9. Related Files

- `./SchoolHub_Curriculum_Sync_Summary.md` — executive summary.
- `../02_Core_Documentation/SchoolHub_API_Reference.md` — canonical schema + endpoints.
- `../02_Core_Documentation/SchoolHub_PRD_v3.md` — authoritative product spec.
- `../03_Skills_Framework/schoolhub-ai-curriculum-skill.md` — Claude prompt engineering, zod schemas, upload parsing (distinct from this cron).
- `../05_Features/SchoolHub_Parent_Notifications_Implementation.md` — change-propagation delivery channels.
