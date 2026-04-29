# SchoolHub — Parent Notifications Implementation

Aligned to **PRD v3.0 (April 2026)**. Scope: Singapore K2 → P6. Launch: June 2026 Beta.

Primary channel: **Telegram Bot API** (free). Fallback: **Twilio SMS** (Singapore A2P). WhatsApp and email are explicitly out of scope for v3.

## 1. Objectives

Deliver three notification modes, all SEN- and wellbeing-aware:

| Mode | Content | Cadence |
|------|---------|---------|
| Weekly Digest | Sunday night summary + shareable progress card link | Weekly, Sunday 18:00 SGT |
| Daily Progress | Streak, XP, bites completed, wellbeing flag if any | Daily (parent opt-in) |
| Real-Time Alerts | Bite-completion pings, schedule-change prompts, wellbeing guardrail suggestions, curriculum updates | Event-driven |

All notification copy is suggestion-first. Never clinical. Parent always overrides.

## 2. Channel Choice

| Channel | Role | Cost | Constraints |
|---------|------|------|-------------|
| Telegram Bot API | **Primary** | $0 | Parent must pair bot once |
| Twilio SMS (Singapore A2P) | **Fallback** | ~SGD $0.04 / msg | Critical alerts only; A2P sender ID registration required |
| In-app (WebSocket + PWA push) | Always on | $0 | No parent pairing needed |

WhatsApp removed for v3 — complexity of Meta BSP approval and 24 h session window does not justify the incremental reach at MVP scale.

Email removed for v3 — low engagement vs. Telegram + SMS, and not in the PRD.

## 3. Notification Types (PRD v3 §6 + §7)

### 3.1 Bite completion (real-time)

Trigger: `xp_events` INSERT with `event_type='bite_completed'`.

SEN rule: suppress if child is on `sen_profile='autism_spectrum'` AND current time inside quiet hours.

```
✅ Aisyah finished "Fractions — Equivalent Fractions"
⏱️ 6 minutes · +15 XP · streak 4 days

[View progress]
```

### 3.2 Behind-schedule nudge (event-driven)

Trigger: weekly completion < 60% of scheduled bites for a child.

```
⚠️ Rohan has finished 3 of 8 bites this week in Science.

Options:
• Regenerate schedule (one tap)
• Let parent decide
• Talk to child first

[Regenerate] [Dismiss]

Tapping [Regenerate] opens the modal with reason: "Rohan completed 38%
of bites this week, so we've lightened next week's load."
```

Regeneration flow respects ASD 48 h advance notice.

### 3.3 Weekly digest (Sunday 18:00 SGT)

```
📊 Sunday Digest — Aisyah (P4)

✅ 7/8 bites completed
⏱️ 3.2 h this week
🔥 Streak: 11 days
🏅 New badge: Silver — Mathematics

Needs support: Word problems (plateau flag)
Ahead: Measurement

PSLE in 183 days 🟢

[Open full card]
```

Links to the 1080×1350 progress card (see `SchoolHub_API_Reference.md` §11).

### 3.4 Wellbeing guardrail suggestion (event-driven)

Triggers come from the rule-based engine (PRD v3 §7.3). Signal-specific copy.

```
💚 Just a heads-up

Aisyah has studied 7 days in a row without a break logged.
Suggestion: consider a rest day tomorrow.

[Mark rest day] [No — keep going] [Dismiss]
```

Strictly suggestion-first. Never diagnostic. Wellbeing alerts only fire for Scholar Pro subscribers (feature gated).

### 3.5 Curriculum update (event-driven)

Trigger: new `curriculum_versions` row parsed for a child's grade + subject.

```
📚 MOE updated the P4 Science syllabus.

Your child Rohan's schedule references the older version. Regenerate to pick up the changes.

[Regenerate] [Later] [Compare topics]
```

For ASD-profile children, regeneration activates on a 48 h delay with advance notice.

### 3.6 Exam countdown (event-driven)

At < 14 days to exam, daily morning note if completion rate drops:

```
📅 Mathematics exam in 12 days.

Bite completion dipped below target this week. Want to regenerate with a lighter daily load?

[Regenerate] [Keep plan] [Dismiss]
```

## 4. Architecture

```
┌────────────────────────────────────┐
│  SchoolHub API (Node.js)         │
│  - Event emitter on xp_events,     │
│    schedules, curriculum_versions, │
│    wellbeing_signals               │
└──────────────────┬─────────────────┘
                   ↓
┌────────────────────────────────────┐
│  Notification dispatcher           │
│  - Reads notification_preferences  │
│  - Applies SEN + quiet-hours rules │
│  - Picks channel (Telegram first)  │
└──────┬───────────────────┬─────────┘
       ↓                   ↓
┌──────────────┐    ┌──────────────┐
│ Telegram Bot │    │ Twilio SMS   │
│ (primary)    │    │ (fallback)   │
└──────────────┘    └──────────────┘
```

## 5. Database Schema

Source of truth: `../02_Core_Documentation/SchoolHub_API_Reference.md` §14. Summary below.

```sql
ALTER TABLE users ADD COLUMN telegram_id   BIGINT UNIQUE;
ALTER TABLE users ADD COLUMN sms_number    VARCHAR;          -- E.164 format
ALTER TABLE users ADD COLUMN sms_verified  BOOLEAN DEFAULT false;

CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
  primary_channel   VARCHAR DEFAULT 'telegram',      -- telegram | sms
  timezone          VARCHAR DEFAULT 'Asia/Singapore',

  -- mode toggles
  weekly_digest       BOOLEAN DEFAULT true,
  daily_progress      BOOLEAN DEFAULT false,
  real_time_alerts    BOOLEAN DEFAULT true,

  -- alert toggles (within real_time_alerts)
  alert_bite_completed    BOOLEAN DEFAULT true,
  alert_behind_schedule   BOOLEAN DEFAULT true,
  alert_wellbeing         BOOLEAN DEFAULT true,
  alert_curriculum_update BOOLEAN DEFAULT true,
  alert_exam_countdown    BOOLEAN DEFAULT true,

  -- quiet hours
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end   TIME DEFAULT '08:00',

  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id  UUID REFERENCES users(id),
  child_id   UUID REFERENCES children(id),
  type       VARCHAR,   -- bite_completed | behind_schedule | weekly_digest | wellbeing | curriculum_update | exam_countdown
  channel    VARCHAR,   -- telegram | sms | in_app
  status     VARCHAR,   -- sent | failed | bounced | suppressed
  message    TEXT,
  error      TEXT,
  sent_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notif_log_parent ON notification_log (parent_id, sent_at DESC);
CREATE INDEX idx_notif_log_status ON notification_log (status);
```

## 6. Telegram — Setup

### 6.1 BotFather

1. Telegram → `@BotFather` → `/newbot`.
2. Name: `SchoolHub Notifications`. Username: `schoolhub_notify_bot`.
3. Copy token → `TELEGRAM_BOT_TOKEN` in Railway env vars.

### 6.2 Bot handler (Python, Railway long-polling)

```python
import os, logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes
from supabase import create_client, Client

TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
supabase: Client = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_ROLE_KEY"],
)

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Pair a parent's Telegram chat to their SchoolHub account."""
    args = context.args
    if not args:
        await update.message.reply_text(
            "Hi. Open your SchoolHub app → Settings → Notifications "
            "→ Connect Telegram to get a pairing link."
        )
        return

    pair_code = args[0]
    row = (
        supabase.table("telegram_pair_codes")
        .select("parent_id, expires_at")
        .eq("code", pair_code)
        .single()
        .execute()
    )
    if not row.data:
        await update.message.reply_text("Pairing link expired. Generate a new one in the app.")
        return

    parent_id = row.data["parent_id"]
    supabase.table("users").update({
        "telegram_id": update.effective_chat.id,
    }).eq("id", parent_id).execute()

    supabase.table("telegram_pair_codes").delete().eq("code", pair_code).execute()

    await update.message.reply_text(
        "Paired. You will get SchoolHub notifications here. "
        "Use /stop to pause, /help for commands."
    )

async def stop(update: Update, context: ContextTypes.DEFAULT_TYPE):
    supabase.table("notification_preferences").update({
        "real_time_alerts": False,
        "daily_progress": False,
        "weekly_digest": False,
    }).eq("parent_id_by_chat", update.effective_chat.id).execute()
    await update.message.reply_text("Paused. Re-enable from Settings in the app.")

async def help_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "/start <code> – pair account\n/stop – pause notifications\n/help – this help"
    )

app = Application.builder().token(TOKEN).build()
app.add_handler(CommandHandler("start", start))
app.add_handler(CommandHandler("stop", stop))
app.add_handler(CommandHandler("help", help_cmd))

if __name__ == "__main__":
    app.run_polling()
```

### 6.3 Pairing flow in-app

Parent opens Settings → Notifications → "Connect Telegram":

1. Backend generates a one-time `pair_code` (random 20-char, 10 min TTL).
2. Writes to `telegram_pair_codes (code, parent_id, expires_at)`.
3. Returns deep link: `https://t.me/schoolhub_notify_bot?start=<pair_code>`.
4. Parent taps link → Telegram opens → `/start <pair_code>` fires → bot pairs and stores `chat_id` on `users.telegram_id`.

## 7. Twilio SMS — Fallback

Used when `primary_channel = 'sms'`, when Telegram delivery fails, or for critical alerts (exam countdown, curriculum update) if parent has not paired Telegram.

```ts
import twilio from "twilio";

const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

export async function sendSms(to: string, body: string) {
  return client.messages.create({
    from: process.env.TWILIO_SG_SENDER_ID!, // registered Singapore A2P sender ID
    to,
    body,
  });
}
```

SMS constraints:

- Singapore A2P sender ID registration mandatory (IMDA). Budget ~2-3 weeks lead time pre-launch.
- Target ≤ 2 SMS per parent per week (cost control).
- Never send wellbeing alerts via SMS — tone and length unsuitable.

## 8. Dispatcher

Central service that every event publishes to.

```ts
// apps/api/src/services/notify.ts
import { supabase } from "../supabase";
import { sendTelegram } from "./telegram";
import { sendSms } from "./twilio";
import { DateTime } from "luxon";

type NotifType =
  | "bite_completed"
  | "behind_schedule"
  | "weekly_digest"
  | "wellbeing"
  | "curriculum_update"
  | "exam_countdown";

export async function notifyParent(
  parentId: string,
  childId: string,
  type: NotifType,
  body: string,
  opts: { force?: boolean } = {}
) {
  const { data: user } = await supabase
    .from("users")
    .select("telegram_id, sms_number")
    .eq("id", parentId)
    .single();

  const { data: prefs } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("parent_id", parentId)
    .single();

  if (!isTypeEnabled(prefs, type)) return logSuppressed(parentId, childId, type, "disabled");
  if (!opts.force && inQuietHours(prefs)) return logSuppressed(parentId, childId, type, "quiet_hours");
  if (!opts.force && (await childIsAsdInNoticeWindow(childId, type)))
    return logSuppressed(parentId, childId, type, "asd_delay");

  // Prefer Telegram if paired and preferred
  if (prefs.primary_channel === "telegram" && user.telegram_id) {
    try {
      await sendTelegram(user.telegram_id, body);
      return logSent(parentId, childId, type, "telegram", body);
    } catch (e) {
      // fallthrough to SMS
    }
  }

  if (user.sms_number && type !== "wellbeing") {
    try {
      await sendSms(user.sms_number, stripMarkup(body));
      return logSent(parentId, childId, type, "sms", body);
    } catch (e) {
      return logFailed(parentId, childId, type, "sms", String(e));
    }
  }

  return logFailed(parentId, childId, type, "none", "no channel available");
}
```

`childIsAsdInNoticeWindow` enforces the 48 h advance-notice rule for ASD-profile children on schedule-change and curriculum-update events.

## 9. SEN Rules

| Rule | Profile | Behaviour |
|------|---------|-----------|
| No surprise schedule changes | Autism Spectrum | Hold schedule-change and curriculum-update notifications for 48 h, send advance notice first |
| High-frequency reminders | ADHD | Daily Progress mode defaults to on |
| Frustration alert | Other SEN | Parent notified when bite abandoned twice in a row |
| Motion-free copy | Autism Spectrum | Plain text; no emoji-heavy framing |

All SEN rules are implemented inside the dispatcher, not inside each trigger.

## 10. Quiet Hours

Default: 22:00 – 08:00 SGT. Applies to all types **except** wellbeing (suppressed anyway) and critical curriculum-update during exam window (< 14 days). Parents can adjust in-app.

## 11. Parent UX (Settings)

React component outline:

```tsx
<NotificationSettings>
  <ChannelStatus
    telegramConnected={!!user.telegram_id}
    smsVerified={user.sms_verified}
  />

  <ConnectTelegramButton onClick={generatePairLink} />
  <VerifySmsFlow phone={user.sms_number} />

  <ModeToggles prefs={prefs} />
  <AlertToggles prefs={prefs} />
  <QuietHoursPicker prefs={prefs} />
</NotificationSettings>
```

Pairing copy: "Get instant notifications on Telegram (free). SMS fallback for critical alerts."

## 12. Metrics

| Metric | Target | Source |
|--------|--------|--------|
| Telegram delivery rate | ≥ 98% | `notification_log.status` |
| SMS delivery rate | ≥ 95% | Twilio status webhook |
| Weekly digest open-through rate | ≥ 40% | Digest deep-link click |
| Parent opt-out rate | < 5% | `notification_preferences` deltas |
| Wellbeing ack rate | ≥ 60% | Ack button vs sent |
| Suppression rate | < 15% | Log `status='suppressed'` |

## 13. Implementation Timeline (aligned with Sprint 4 in the Skills Framework)

| Day | Task | Owner |
|-----|------|-------|
| 1 | BotFather setup, env wiring, pair-code table migration | Backend |
| 1 | Telegram bot handler deployed to Railway | Backend |
| 2 | Dispatcher service (`notify.ts`) + 6 event hooks | Backend |
| 2 | Notification settings UI + QR / deep link | Frontend |
| 3 | Twilio account + Singapore sender ID registration submitted | Backend |
| 3 | Weekly digest cron (Sunday 18:00 SGT) | Backend |
| 4 | End-to-end test across all 6 notification types + SEN rules | QA |
| 5 | Launch to beta cohort of 20 families | All |

Allow 2-3 weeks lead time for Singapore A2P sender ID approval. Ship Telegram-only if SMS approval lags.

## 14. Fallback Plan

If Telegram Bot API is unreachable for > 5 minutes, dispatcher flips to SMS for `real_time_alerts` only. Weekly digest waits for Telegram recovery (SMS format unsuitable). In-app banner surfaces the service incident to affected parents.

## 15. Related Files

- `../02_Core_Documentation/SchoolHub_API_Reference.md` §10 — notification endpoints and schema.
- `../02_Core_Documentation/SchoolHub_PRD_v3.md` §7 — feature detail.
- `../03_Skills_Framework/schoolhub-fullstack-dev-skill.md` — dispatcher implementation + PWA push.
- `../04_Curriculum_Sync/SchoolHub_Curriculum_Sync_Technical_Guide.md` §5.3 — change-propagation source.

## 16. Status

Primary (Telegram) — ready to implement Day 1.
Fallback (Twilio SMS) — pending Singapore A2P sender ID registration.
WhatsApp / email — out of scope for v3.
