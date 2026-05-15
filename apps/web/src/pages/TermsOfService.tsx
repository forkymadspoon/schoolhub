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
            {[['Privacy Policy', '/privacy'], ['Terms of Service', '/terms'], ['PDPA', '/pdpa'], ['Contact', '/contact']].map(([label, href]) => (
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

export function TermsOfService() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="15 May 2026">
      <Section title="1. Acceptance of Terms">
        <p>By creating a SchoolHub account or using our platform, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use SchoolHub.</p>
        <p>These Terms constitute a legally binding agreement between you and SchoolHub Pte. Ltd., a company incorporated in Singapore.</p>
      </Section>

      <Section title="2. The Service">
        <p>SchoolHub provides an AI-driven adaptive study scheduling platform for Singapore students aged 6–12 (K2 to Primary 6). The platform enables parents to create personalised study plans aligned with the Singapore MOE curriculum, track progress, and monitor student wellbeing.</p>
        <p>SchoolHub is a productivity and educational planning tool. It is <strong className="text-ink">not a tutoring service, diagnostic tool, or clinical service</strong>. Wellbeing signals are rule-based suggestions only and do not constitute medical or psychological advice.</p>
      </Section>

      <Section title="3. Accounts & Eligibility">
        <p>You must be at least 18 years old to create a SchoolHub account. Accounts are created by parents or legal guardians on behalf of their children. Children do not create their own accounts.</p>
        <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Notify us immediately at <a href="mailto:support@schoolhub.sg" className="text-primary hover:underline">support@schoolhub.sg</a> if you suspect unauthorised access.</p>
      </Section>

      <Section title="4. Subscription Plans & Billing">
        <p>SchoolHub offers three plans:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-ink">Free Trial:</strong> 7 days, no credit card required, 1 child, 1 subject.</li>
          <li><strong className="text-ink">Scholar:</strong> S$18/month or S$180/year. Up to 2 children, all subjects, gamification, SEN profile for 1 child.</li>
          <li><strong className="text-ink">Scholar Pro:</strong> S$35/month or S$350/year. Up to 4 children, mental health dashboard, SEN for all children, offline PWA, priority support.</li>
        </ul>
        <p>Subscriptions renew automatically. You may cancel at any time; access continues until the end of the billing period. We do not offer pro-rated refunds for partial months unless required by Singapore law.</p>
      </Section>

      <Section title="5. Acceptable Use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Use SchoolHub for any unlawful purpose or in violation of Singapore law</li>
          <li>Attempt to reverse engineer, scrape, or extract data from the platform</li>
          <li>Share your account credentials with others outside your immediate family</li>
          <li>Upload files containing malicious code or content that violates third-party rights</li>
          <li>Misrepresent your child's grade level or SEN status to manipulate AI outputs</li>
        </ul>
      </Section>

      <Section title="6. Intellectual Property">
        <p>SchoolHub and its content (software, UI, generated schedules, lesson bites, brand assets) are owned by SchoolHub Pte. Ltd. and protected under Singapore copyright law. Your personal data and uploaded files remain your property.</p>
        <p>You grant SchoolHub a limited, non-exclusive licence to process your uploaded files solely to provide the service. This licence terminates when you delete your account.</p>
      </Section>

      <Section title="7. AI-Generated Content">
        <p>Study schedules, lesson bites, and feedback text are generated by AI (Anthropic Claude Sonnet). While we strive for accuracy and curriculum alignment, AI outputs may occasionally contain errors. Parents should review schedules and content before relying on them. SchoolHub is not liable for decisions made based on AI-generated content.</p>
      </Section>

      <Section title="8. Limitation of Liability">
        <p>To the maximum extent permitted by Singapore law, SchoolHub's total liability to you for any claim arising from these Terms or your use of the platform shall not exceed the fees you paid to SchoolHub in the 12 months preceding the claim.</p>
        <p>SchoolHub is not liable for indirect, incidental, or consequential damages, including loss of data, loss of revenue, or exam outcomes.</p>
      </Section>

      <Section title="9. Termination">
        <p>We may suspend or terminate your account if you breach these Terms, fail to pay subscription fees, or use the platform in a manner harmful to other users. You may delete your account at any time via Settings. Upon termination, your data is deleted within 30 days.</p>
      </Section>

      <Section title="10. Governing Law">
        <p>These Terms are governed by the laws of Singapore. Any dispute shall be submitted to the exclusive jurisdiction of the Singapore courts.</p>
      </Section>

      <Section title="11. Changes to Terms">
        <p>We may update these Terms. Material changes will be communicated via email at least 14 days in advance. Continued use of SchoolHub after the effective date constitutes acceptance of the updated Terms.</p>
      </Section>

      <Section title="12. Contact">
        <p>For questions about these Terms: <a href="mailto:legal@schoolhub.sg" className="text-primary hover:underline">legal@schoolhub.sg</a></p>
      </Section>
    </LegalLayout>
  );
}
