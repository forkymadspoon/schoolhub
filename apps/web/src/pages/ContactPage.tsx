import { useState } from 'react';
import { Link } from 'react-router-dom';

const TOPICS = [
  'General enquiry',
  'Technical support',
  'Billing & subscription',
  'Privacy / data request',
  'School or partnership enquiry',
  'Press & media',
  'Other',
];

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-bg">
      <nav className="fixed top-0 inset-x-0 z-50 bg-bg/90 backdrop-blur-md border-b border-line px-8 flex items-center justify-between gap-6" style={{ minHeight: 60 }}>
        <Link to="/" className="flex items-center gap-2.5 min-h-0 min-w-0">
          <img src="/logo.svg" alt="SchoolHub" height={36} width={132} />
        </Link>
        <Link to="/" className="text-sm font-semibold text-muted hover:text-ink transition-colors min-h-0">← Back to home</Link>
      </nav>

      <main className="pt-[92px] pb-20 px-8">
        <div className="max-w-[680px] mx-auto">
          <p className="text-[11px] font-bold tracking-[2.5px] uppercase text-primary mb-3">Get in touch</p>
          <h1 className="text-[clamp(28px,4vw,42px)] font-extrabold tracking-tight text-ink mb-3">Contact us</h1>
          <p className="text-[17px] text-muted font-medium leading-[1.65] mb-10">
            We typically respond within one business day. For urgent technical issues, include your account email.
          </p>

          {/* Contact channels */}
          <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4 mb-12">
            {[
              { icon: '✉️', label: 'Email', value: 'hello@schoolhub.sg', href: 'mailto:hello@schoolhub.sg' },
              { icon: '🔒', label: 'Privacy / DPO', value: 'dpo@schoolhub.sg', href: 'mailto:dpo@schoolhub.sg' },
              { icon: '🧾', label: 'Billing', value: 'billing@schoolhub.sg', href: 'mailto:billing@schoolhub.sg' },
            ].map(c => (
              <a key={c.label} href={c.href} className="card card-interactive flex flex-col gap-1.5 no-underline group">
                <span className="text-2xl">{c.icon}</span>
                <span className="text-xs font-bold tracking-wide uppercase text-muted mt-1">{c.label}</span>
                <span className="text-sm font-semibold text-primary group-hover:underline">{c.value}</span>
              </a>
            ))}
          </div>

          {/* Contact form */}
          {submitted ? (
            <div className="card bg-game-green-tint border-game-green/30 text-center py-12 animate-fade-up">
              <div className="text-4xl mb-4">✅</div>
              <h2 className="text-xl font-extrabold text-ink mb-2">Message sent!</h2>
              <p className="text-muted text-sm">We'll get back to you at <strong>{form.email}</strong> within one business day.</p>
              <button
                type="button"
                onClick={() => { setSubmitted(false); setForm({ name: '', email: '', topic: '', message: '' }); }}
                className="btn-secondary mt-6 text-sm !py-2"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="card flex flex-col gap-5">
              <h2 className="text-lg font-extrabold text-ink">Send us a message</h2>

              <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-xs font-bold text-ink uppercase tracking-wide">Name</label>
                  <input
                    id="name" name="name" type="text" required
                    placeholder="Your name"
                    value={form.name} onChange={handleChange}
                    className="w-full border border-line rounded-xl px-4 py-3 text-sm text-ink bg-white focus:outline-none focus:border-primary transition-colors"
                    style={{ minHeight: 0 }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-xs font-bold text-ink uppercase tracking-wide">Email</label>
                  <input
                    id="email" name="email" type="email" required
                    placeholder="you@example.com"
                    value={form.email} onChange={handleChange}
                    className="w-full border border-line rounded-xl px-4 py-3 text-sm text-ink bg-white focus:outline-none focus:border-primary transition-colors"
                    style={{ minHeight: 0 }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="topic" className="text-xs font-bold text-ink uppercase tracking-wide">Topic</label>
                <select
                  id="topic" name="topic" required
                  value={form.topic} onChange={handleChange}
                  className="w-full border border-line rounded-xl px-4 py-3 text-sm text-ink bg-white focus:outline-none focus:border-primary transition-colors appearance-none"
                  style={{ minHeight: 0 }}
                >
                  <option value="" disabled>Select a topic…</option>
                  {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="message" className="text-xs font-bold text-ink uppercase tracking-wide">Message</label>
                <textarea
                  id="message" name="message" required rows={5}
                  placeholder="Tell us how we can help…"
                  value={form.message} onChange={handleChange}
                  className="w-full border border-line rounded-xl px-4 py-3 text-sm text-ink bg-white focus:outline-none focus:border-primary transition-colors resize-none"
                  style={{ minHeight: 0 }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary self-start"
              >
                {loading ? 'Sending…' : 'Send message →'}
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-line py-8 px-8">
        <div className="max-w-[680px] mx-auto flex items-center justify-between flex-wrap gap-4">
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
