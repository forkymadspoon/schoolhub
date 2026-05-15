import { Link } from 'react-router-dom';

function LegalLayout({ title, lastUpdated, children }: { title: string; lastUpdated: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <nav className="fixed top-0 inset-x-0 z-50 bg-bg/90 backdrop-blur-md border-b border-line px-8 flex items-center justify-between gap-6" style={{ minHeight: 60 }}>
        <Link to="/" className="flex items-center gap-2.5 min-h-0 min-w-0">
          <img src="/logo.svg" alt="SchoolHub" height={36} width={132} />
        </Link>
        <Link to="/" className="text-sm font-semibold text-muted hover:text-ink transition-colors min-h-0">← Back to home</Link>
      </nav>

      <main className="pt-[92px] pb-20 px-8">
        <div className="max-w-[720px] mx-auto">
          <p className="text-[11px] font-bold tracking-[2.5px] uppercase text-primary mb-3">SchoolHub Legal</p>
          <h1 className="text-[clamp(28px,4vw,42px)] font-extrabold tracking-tight text-ink mb-2">{title}</h1>
          <p className="text-sm text-muted mb-10">Last updated: {lastUpdated}</p>
          <div className="prose-content">
            {children}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-line py-8 px-8">
        <div className="max-w-[720px] mx-auto flex items-center justify-between flex-wrap gap-4">
          <p className="text-xs text-muted">© 2026 SchoolHub · Singapore</p>
          <div className="flex gap-5 flex-wrap">
            {[['Privacy Policy', '/privacy'], ['Terms of Service', '/terms'], ['PDPA', '/pdpa'], ['Contact', '/contact']].map(([label, href]: [string, string]) => (
              <Link key={label} to={href} className="text-xs font-semibold text-muted hover:text-ink transition-colors min-h-0 min-w-0">{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-extrabold text-ink mb-3">{title}</h2>
      <div className="text-[15px] text-muted leading-[1.75] space-y-3">{children}</div>
    </section>
  );
}

export function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="15 May 2026">
      <Section title="1. Overview">
        <p>SchoolHub Pte. Ltd. ("SchoolHub", "we", "our", or "us") is committed to protecting the privacy of our users. This Privacy Policy explains how we collect, use, disclose, and safeguard personal data when you use our platform at schoolhub.sg and related services.</p>
        <p>We comply with the Singapore Personal Data Protection Act 2012 (PDPA). Please read this policy carefully. If you disagree with its terms, please discontinue use of our platform.</p>
      </Section>

      <Section title="2. Data We Collect">
        <p><strong className="text-ink">Account data:</strong> Parent name, email address, and password (hashed). We do not store plaintext passwords.</p>
        <p><strong className="text-ink">Child profile data:</strong> Child's first name, grade level (K2–P6), and optional SEN profile type (ADHD / Autism Spectrum / Other). We do not collect full names, NRIC, school names, or photographs of children.</p>
        <p><strong className="text-ink">Study & schedule data:</strong> Bite completion records, XP events, badge unlocks, exam dates, and uploaded school calendar files (.ics, .pdf, .csv, .xlsx).</p>
        <p><strong className="text-ink">Wellbeing signals:</strong> Rule-based flags derived from completion patterns (e.g. streak drops, overload risk). No clinical assessments or third-party health data.</p>
        <p><strong className="text-ink">Usage data:</strong> Browser type, device type, and anonymised interaction logs for product improvement. We do not use third-party advertising trackers.</p>
      </Section>

      <Section title="3. How We Use Your Data">
        <p>We use collected data solely to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Provide and personalise the SchoolHub service</li>
          <li>Generate AI-driven study schedules and bite content via Claude Sonnet (Anthropic)</li>
          <li>Send notifications via Telegram Bot or SMS (Twilio) with your consent</li>
          <li>Detect and surface wellbeing signals to parents</li>
          <li>Improve product quality through anonymised analytics</li>
          <li>Respond to support requests</li>
        </ul>
        <p>We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>
      </Section>

      <Section title="4. Data Storage & Security">
        <p>All personal data is stored in Supabase (PostgreSQL) hosted in the <strong className="text-ink">Singapore region</strong> in compliance with PDPA data residency requirements. No sensitive student data leaves Singapore-region infrastructure.</p>
        <p>We apply industry-standard security measures including TLS in transit, AES-256 encryption at rest, role-based access controls, and regular security reviews.</p>
      </Section>

      <Section title="5. AI Processing">
        <p>SchoolHub uses Anthropic's Claude Sonnet API to generate study schedules and lesson content. Inputs to Claude include grade level, SEN profile type, exam dates, and curriculum topics — never child names, parent emails, or NRIC. Anthropic processes this data under their API terms. We do not use your data to train AI models.</p>
      </Section>

      <Section title="6. Data Retention">
        <p>We retain your data for as long as your account is active. You may request deletion of your account and all associated data at any time by emailing <a href="mailto:privacy@schoolhub.sg" className="text-primary hover:underline">privacy@schoolhub.sg</a>. Deletion is processed within 30 days.</p>
      </Section>

      <Section title="7. Your Rights (PDPA)">
        <p>Under the PDPA, you have the right to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Access personal data we hold about you</li>
          <li>Correct inaccurate personal data</li>
          <li>Withdraw consent to data collection (this will terminate your account)</li>
          <li>Request erasure of your data</li>
        </ul>
        <p>To exercise any of these rights, contact our Data Protection Officer at <a href="mailto:dpo@schoolhub.sg" className="text-primary hover:underline">dpo@schoolhub.sg</a>.</p>
      </Section>

      <Section title="8. Cookies">
        <p>We use strictly necessary session cookies to maintain your authenticated state. We do not use advertising cookies or third-party tracking pixels.</p>
      </Section>

      <Section title="9. Changes to this Policy">
        <p>We may update this policy from time to time. We will notify you of material changes via email or in-app notification at least 14 days before the changes take effect.</p>
      </Section>

      <Section title="10. Contact">
        <p>For privacy-related enquiries, contact our Data Protection Officer:<br />
        Email: <a href="mailto:dpo@schoolhub.sg" className="text-primary hover:underline">dpo@schoolhub.sg</a><br />
        Address: SchoolHub Pte. Ltd., Singapore</p>
      </Section>
    </LegalLayout>
  );
}
