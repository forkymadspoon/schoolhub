export interface CardData {
  childName: string;
  gradeLevel: string;
  weekStart: string;
  bitesCompleted: number;
  bitesTotal: number;
  streakDays: number;
  subjectBreakdown: Array<{ subject: string; completedPct: number }>;
  wellbeingStatus: 'green' | 'amber' | 'red';
  nextExamLabel: string | null;
  nextExamDays: number | null;
}

const WELLBEING_COLOR: Record<'green' | 'amber' | 'red', string> = {
  green: '#7DC242',
  amber: '#F5C842',
  red: '#F58A42',
};

export function buildCardHTML(data: CardData): string {
  const pct = data.bitesTotal > 0 ? Math.round((data.bitesCompleted / data.bitesTotal) * 100) : 0;
  const wbColor = WELLBEING_COLOR[data.wellbeingStatus];
  const examLine = data.nextExamLabel && data.nextExamDays !== null
    ? `${data.nextExamLabel} in ${data.nextExamDays} days`
    : '';

  const subjectBars = data.subjectBreakdown.slice(0, 3).map(s => `
    <div style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:22px;color:#6B7280">${s.subject}</span>
        <span style="font-size:22px;color:#6B7280">${Math.round(s.completedPct)}%</span>
      </div>
      <div style="height:8px;background:#F3F4F6;border-radius:4px;overflow:hidden">
        <div style="height:100%;width:${Math.round(s.completedPct)}%;background:#2563EB;border-radius:4px"></div>
      </div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px;
      height: 1350px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #EAF3FA;
      padding: 64px;
      display: flex;
      flex-direction: column;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:48px">
    <div style="font-size:32px;font-weight:700;color:#111827">SchoolHub</div>
    <div style="font-size:22px;color:#6B7280">${data.weekStart}</div>
  </div>

  <!-- Child info -->
  <div style="margin-bottom:48px">
    <h1 style="font-size:56px;font-weight:700;color:#111827;line-height:1.1">${data.childName}</h1>
    <p style="font-size:26px;color:#6B7280;margin-top:8px">${data.gradeLevel}</p>
  </div>

  <!-- Bites completed -->
  <div style="background:#fff;border-radius:24px;padding:40px;margin-bottom:32px">
    <p style="font-size:22px;color:#6B7280;margin-bottom:12px">Bites completed this week</p>
    <div style="display:flex;align-items:baseline;gap:12px;margin-bottom:20px">
      <span style="font-size:80px;font-weight:700;color:#111827;line-height:1">${data.bitesCompleted}</span>
      <span style="font-size:40px;color:#6B7280">/ ${data.bitesTotal}</span>
    </div>
    <div style="height:12px;background:#F3F4F6;border-radius:6px;overflow:hidden">
      <div style="height:100%;width:${pct}%;background:#2563EB;border-radius:6px"></div>
    </div>
  </div>

  <!-- Streak + wellbeing row -->
  <div style="display:flex;gap:24px;margin-bottom:32px">
    <div style="flex:1;background:#fff;border-radius:24px;padding:32px;display:flex;align-items:center;gap:16px">
      <span style="font-size:48px">🔥</span>
      <div>
        <p style="font-size:42px;font-weight:700;color:#111827;line-height:1">${data.streakDays}</p>
        <p style="font-size:20px;color:#6B7280">day streak</p>
      </div>
    </div>
    <div style="flex:1;background:#fff;border-radius:24px;padding:32px;display:flex;align-items:center;gap:16px">
      <div style="width:36px;height:36px;border-radius:50%;background:${wbColor};flex-shrink:0"></div>
      <div>
        <p style="font-size:24px;font-weight:600;color:#111827">Wellbeing</p>
        <p style="font-size:20px;color:#6B7280">${data.wellbeingStatus === 'green' ? 'All good' : data.wellbeingStatus === 'amber' ? 'Check in' : 'Attention needed'}</p>
      </div>
    </div>
  </div>

  <!-- Subject breakdown -->
  ${data.subjectBreakdown.length > 0 ? `
  <div style="background:#fff;border-radius:24px;padding:40px;margin-bottom:32px;flex:1">
    <p style="font-size:26px;font-weight:600;color:#111827;margin-bottom:24px">Subjects</p>
    ${subjectBars}
  </div>` : '<div style="flex:1"></div>'}

  <!-- Exam countdown -->
  ${examLine ? `
  <div style="background:#2563EB;border-radius:24px;padding:32px;margin-bottom:32px;text-align:center">
    <p style="font-size:28px;font-weight:600;color:#fff">${examLine}</p>
  </div>` : ''}

  <!-- Footer -->
  <div style="text-align:center;padding-top:16px">
    <p style="font-size:20px;color:#6B7280">Made with SchoolHub · schoolhub.app</p>
  </div>
</body>
</html>`;
}
