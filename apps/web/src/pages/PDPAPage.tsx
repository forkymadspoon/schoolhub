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
          <div className="prose-content">{children}</div>
        </div>
      </main>

      <footer className="bg-white border-t border-line py-8 px-8">
        <div className="max-w-[720px] mx-auto flex items-center justify-between flex-wrap gap-4">
          <p className="text-xs text-muted">© 2026 SchoolHub · Singapore</p>
          <div className="flex gap-5 flex-wrap">
            {([['Privacy Policy', '/privacy'], ['Terms of Service', '/terms'], ['PDPA', '/pdpa'], ['Contact', '/contact']] as const).map(([label, href]) => (
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

export function PDPAPage() {
  return (
    <LegalLayout title="PDPA Data Protection Notice" lastUpdated="15 May 2026">

      <div className="card bg-primary-soft border-primary/20 mb-10">
        <p className="text-sm text-ink font-medium leading-[1.65]">This notice is issued in accordance with the <strong>Singapore Personal Data Protection Act 2012 (PDPA)</strong> and describes how SchoolHub Pte. Ltd. collects, uses, discloses, and protects personal data.</p>
      </div>

      <Section title="1. Organisation Responsible for Personal Data">
        <p><strong className="text-ink">SchoolHub Pte. Ltd.</strong><br />
        Singapore<br />
        Data Protection Officer: <a href="mailto:dpo@schoolhub.sg" className="text-primary hover:underline">dpo@schoolhub.sg</a></p>
      </Section>

      <Section title="2. Personal Data We Collect">
        <p>We collect the following categories of personal data:</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse mt-2">
            <thead>
              <tr className="bg-primary-soft text-ink">
                <th className="text-left p-3 font-bold rounded-tl-lg">Category</th>
                <th className="text-left p-3 font-bold">Data Points</th>
                <th className="text-left p-3 font-bold rounded-tr-lg">Whose Data</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Account', 'Name, email address', 'Parent / guardian'],
                ['Child profile', 'First name, grade level (K2–P6), optional SEN profile type', 'Child (provided by parent)'],
                ['Study data', 'Lesson completion, XP, badges, exam dates, uploaded school files', 'Child (provided by parent)'],
                ['Wellbeing signals', 'Rule-based flags (e.g. streak drop, overload risk) — not clinical data', 'Child (derived by system)'],
                ['Usage data', 'Anonymised browser/device type, interaction logs', 'Parent / guardian'],
              ].map(([cat, data, whose], i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-surface' : 'bg-white'}>
                  <td className="p-3 font-semibold text-ink border-t border-line">{cat}</td>
                  <td className="p-3 border-t border-line">{data}</td>
                  <td className="p-3 border-t border-line">{whose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3">We do <strong className="text-ink">not</strong> collect full legal names, NRIC/FIN, school names, photographs, or medical records.</p>
      </Section>

      <Section title="3. Purposes of Collection">
        <p>Personal data is collected and used for the following purposes:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Creating and managing your SchoolHub account</li>
          <li>Generating personalised study schedules and lesson content (AI processing)</li>
          <li>Sending study reminders and progress notifications (Telegram / SMS)</li>
          <li>Displaying wellbeing signals and alerts to parents</li>
          <li>Processing subscription payments</li>
          <li>Providing customer support</li>
          <li>Improving service quality through anonymised analytics</li>
          <li>Complying with legal obligations</li>
        </ul>
      </Section>

      <Section title="4. Basis for Collection">
        <p>We collect and process personal data based on:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-ink">Consent:</strong> Provided when you create an account and accept these terms</li>
          <li><strong className="text-ink">Contract performance:</strong> Data necessary to deliver the subscribed service</li>
          <li><strong className="text-ink">Legal obligation:</strong> Where required by Singapore law</li>
        </ul>
      </Section>

      <Section title="5. Disclosure of Personal Data">
        <p>We disclose personal data only to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-ink">Supabase (Singapore region):</strong> Database and authentication infrastructure</li>
          <li><strong className="text-ink">Anthropic (Claude API):</strong> AI processing of anonymised curriculum and schedule inputs. No names, emails, or NRIC are sent to Anthropic.</li>
          <li><strong className="text-ink">Twilio:</strong> SMS notifications (if opted in)</li>
          <li><strong className="text-ink">Telegram:</strong> Bot notifications (if opted in)</li>
        </ul>
        <p>We do not sell, rent, or disclose personal data to third parties for marketing or advertising purposes.</p>
      </Section>

      <Section title="6. Data Residency">
        <p>All personal data is stored in <strong className="text-ink">Supabase's Singapore region</strong>. No personal data is transferred outside Singapore except for AI processing by Anthropic (which receives only anonymised, non-identifiable inputs) and SMS delivery by Twilio where technically required for routing.</p>
      </Section>

      <Section title="7. Retention Period">
        <p>Personal data is retained for as long as your account remains active, plus up to 90 days after account closure for backup and audit purposes. Upon full deletion request, data is purged within 30 days.</p>
      </Section>

      <Section title="8. Access, Correction & Erasure">
        <p>You have the right to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-ink">Access</strong> the personal data we hold about you</li>
          <li><strong className="text-ink">Correct</strong> inaccurate or incomplete personal data</li>
          <li><strong className="text-ink">Withdraw consent</strong> (note: this will prevent us from providing the service)</li>
          <li><strong className="text-ink">Request erasure</strong> of your personal data</li>
        </ul>
        <p>Submit requests to: <a href="mailto:dpo@schoolhub.sg" className="text-primary hover:underline">dpo@schoolhub.sg</a>. We will respond within 10 business days.</p>
      </Section>

      <Section title="9. Security Measures">
        <p>SchoolHub implements the following measures to protect personal data:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>TLS 1.3 encryption in transit</li>
          <li>AES-256 encryption at rest (Supabase)</li>
          <li>Role-based access control — staff access to personal data is logged and restricted</li>
          <li>Passwords are hashed using bcrypt; plaintext passwords are never stored</li>
          <li>Regular security reviews and penetration testing before beta launch</li>
        </ul>
      </Section>

      <Section title="10. Data Protection Officer">
        <p>For any PDPA-related enquiries or complaints:<br />
        <strong className="text-ink">Data Protection Officer, SchoolHub Pte. Ltd.</strong><br />
        Email: <a href="mailto:dpo@schoolhub.sg" className="text-primary hover:underline">dpo@schoolhub.sg</a></p>
        <p>If you are unsatisfied with our response, you may contact the Personal Data Protection Commission (PDPC) at <a href="https://www.pdpc.gov.sg" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.pdpc.gov.sg</a>.</p>
      </Section>
    </LegalLayout>
  );
}
