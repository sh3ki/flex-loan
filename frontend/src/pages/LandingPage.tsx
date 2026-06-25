import { Link } from 'react-router-dom';
import { usePublicSettingsQuery } from '../queries';
import loanImage from '../assets/loan.png';

const fallbackSettings = {
  businessName: 'MFLEX',
  tagline: 'Flexible and Fast Loans for You',
  heroTitle: 'Quick Personal Loan Access',
  heroSubtitle: 'Direct personal lending with clear daily terms.',
  ctaText: 'Loan Now',
  loanMinimum: 1000,
  loanMaximum: 10000,
  dailyInterestRate: 1,
  contactEmail: 'mflexadmin@gmail.com',
  contactPhone: '+63 814 460 809',
  contactAddress: 'Main Business District, Metro City',
};

export function LandingPage() {
  const { data } = usePublicSettingsQuery();
  const settings = data || fallbackSettings;

  return (
    <div className="min-h-screen bg-[#1665b8] text-white">
      <header className="sticky top-0 z-50 border-b border-white/20 bg-[#1665b8]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
          <a href="#home" className="text-lg font-black uppercase tracking-[0.14em] text-[#f0db3d]">
            {settings.businessName}
          </a>
          <nav className="hidden items-center gap-6 text-sm font-semibold uppercase tracking-[0.08em] text-white md:flex">
            <a href="#home" className="transition hover:text-[#f0db3d]">Home</a>
            <a href="#about" className="transition hover:text-[#f0db3d]">About</a>
            <a href="#offers" className="transition hover:text-[#f0db3d]">Loan Offers</a>
            <a href="#process" className="transition hover:text-[#f0db3d]">Process</a>
            <a href="#contact" className="transition hover:text-[#f0db3d]">Contact</a>
          </nav>
          <Link
            to="/login"
            className="rounded-xl border-2 border-white/70 bg-[#1665b8] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#0f569f]"
          >
            Portal Login
          </Link>
        </div>
      </header>

      <main className="relative overflow-hidden">
        {/* Top right decorative elements */}
        <div className="pointer-events-none absolute -right-8 top-4 h-56 w-56 rounded-full border-4 border-[#f0db3d]/60 opacity-100 md:h-72 md:w-72" />
        <div className="pointer-events-none absolute -right-16 top-24 h-96 w-96 rounded-full border border-[#f0db3d]/40 opacity-80 md:h-[28rem] md:w-[28rem]" />
        <div className="pointer-events-none absolute right-8 top-8 h-28 w-28 bg-[radial-gradient(circle,#f0db3d_2px,transparent_2px)] bg-size-[14px_14px] opacity-100 md:right-20 md:top-12 md:h-40 md:w-40" />
        
        {/* Bottom left abstract shapes */}
        <div className="pointer-events-none absolute -left-20 bottom-32 h-48 w-48 rounded-full border-2 border-white/30 opacity-70" />
        <div className="pointer-events-none absolute left-10 bottom-0 h-40 w-40 bg-[radial-gradient(circle,rgba(240,219,61,0.25)_1px,transparent_1px)] bg-size-[20px_20px] opacity-85" />

        <section id="home" className="mx-auto max-w-6xl px-4 pb-10 pt-8 md:px-8 md:pb-16 md:pt-10">
          <div className="mb-8 flex items-center justify-between">
          </div>

          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-4xl font-black uppercase leading-[1.04] tracking-tight text-white md:text-6xl">
                {settings.tagline}
              </p>
              <p className="mt-5 max-w-md text-sm text-white/90 md:text-base">{settings.heroSubtitle}</p>
            </div>

            <div className="relative mx-auto h-64 w-64 md:h-80 md:w-80">
              <div className="absolute inset-0 rounded-full border-4 border-[#1665b8] bg-white" />
              <div className="absolute inset-4 rounded-full bg-linear-to-br from-slate-100 via-slate-200 to-slate-300" />
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full">
                <img 
                  src={loanImage} 
                  alt="MFLEX Logo" 
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[2.2rem] bg-[#eceff3] px-5 py-6 text-[#1665b8] shadow-xl shadow-black/10 md:px-8 md:py-8">
            <p className="text-4xl font-black uppercase leading-none tracking-tight md:text-6xl">Quick Personal Loan Access</p>
            <div className="mt-6 inline-flex rounded-4xl bg-[#f0db3d] px-6 py-3 shadow-lg shadow-black/10 md:px-8 md:py-4">
              <p className="text-4xl font-black uppercase tracking-wide text-[#101828] md:text-6xl">@{settings.businessName}</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-xl border-2 border-[#1665b8]/30 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#1665b8]">
                Minimum {formatCurrency(settings.loanMinimum)}
              </span>
              <span className="rounded-xl border-2 border-[#1665b8]/30 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#1665b8]">
                Maximum {formatCurrency(settings.loanMaximum)}
              </span>
              <span className="rounded-xl border-2 border-[#1665b8]/30 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#1665b8]">
                {settings.dailyInterestRate}% Interest Per Day
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2 text-[#1665b8]">
              <ContactChip icon="✉" text={settings.contactEmail} />
              <ContactChip icon="☎" text={settings.contactPhone} />
            </div>

            <Link
              to="/login"
              className="rounded-2xl border-4 border-white/80 bg-[#1665b8] px-6 py-3 text-lg font-black uppercase tracking-[0.08em] text-white transition hover:bg-[#0f569f]"
            >
              Loan Now
            </Link>
          </div>
        </section>

        <section id="about" className="relative bg-[#f0db3d] px-4 py-10 text-[#0f172a] md:px-8">
          {/* Abstract background shapes for about section */}
          <div className="pointer-events-none absolute left-0 top-0 h-32 w-32 bg-[radial-gradient(circle,rgba(22,101,184,0.2)_1px,transparent_1px)] bg-size-[16px_16px] opacity-80" />
          <div className="pointer-events-none absolute right-10 top-20 h-20 w-20 rounded-full border border-[#1665b8]/40 opacity-70" />
          <div className="pointer-events-none absolute bottom-10 right-0 h-40 w-40 rounded-full border-2 border-[#1665b8]/35 opacity-60" />
          
          <div className="relative mx-auto max-w-6xl rounded-4xl bg-white/70 p-6 shadow-lg shadow-black/10 md:p-8">
            <h2 className="text-3xl font-black uppercase tracking-tight text-[#1665b8] md:text-4xl">
              Professional Personal Lending
            </h2>
            <p className="mt-3 max-w-3xl text-sm text-slate-700 md:text-base">
              {settings.businessName} is a direct individual lender focused on transparent terms, accurate records,
              and consistent service. No hidden process, no confusing packages, just clear personal lending.
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-800">Address: {settings.contactAddress}</p>
          </div>
        </section>

        <section id="offers" className="relative px-4 py-10 md:px-8 md:py-14">
          {/* Abstract background shapes for offers section */}
          <div className="pointer-events-none absolute right-0 top-20 h-56 w-56 bg-[radial-gradient(circle,rgba(240,219,61,0.15)_1px,transparent_1px)] bg-size-[18px_18px] opacity-85" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-48 w-48 rounded-full border border-white/35 opacity-65" />
          
          <div className="relative mx-auto max-w-6xl rounded-4xl border border-white/25 bg-white/10 p-6 shadow-lg shadow-black/10 md:p-8">
            <h2 className="text-3xl font-black uppercase tracking-tight text-[#f0db3d] md:text-4xl">Loan Offers</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <OfferCard title="Loan Range" value={`${formatCurrency(settings.loanMinimum)} to ${formatCurrency(settings.loanMaximum)}`} />
              <OfferCard title="Daily Interest" value={`${settings.dailyInterestRate}% per day`} />
              <OfferCard title="Service Style" value="Direct and transparent" />
            </div>
          </div>
        </section>

        <section id="process" className="relative bg-[#f0db3d] px-4 py-10 text-[#0f172a] md:px-8 md:py-14">
          {/* Abstract background shapes for process section */}
          <div className="pointer-events-none absolute left-10 top-10 h-36 w-36 rounded-full border-2 border-[#1665b8]/35 opacity-70" />
          <div className="pointer-events-none absolute right-20 bottom-20 h-44 w-44 bg-[radial-gradient(circle,rgba(22,101,184,0.15)_1px,transparent_1px)] bg-size-[20px_20px] opacity-75" />
          
          <div className="relative mx-auto max-w-6xl rounded-4xl bg-white p-6 shadow-lg shadow-black/10 md:p-8">
            <h2 className="text-3xl font-black uppercase tracking-tight text-[#1665b8] md:text-4xl">Simple Loan Process</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <StepCard step="1" label="Inquiry" text="Send your details and preferred amount." />
              <StepCard step="2" label="Assessment" text="Quick direct evaluation with clear terms." />
              <StepCard step="3" label="Release" text="Loan is released once terms are accepted." />
              <StepCard step="4" label="Repayment" text="Track and settle through agreed schedule." />
            </div>
          </div>
        </section>

        <section id="contact" className="relative px-4 py-10 md:px-8 md:py-14">
          {/* Abstract background shapes for contact section */}
          <div className="pointer-events-none absolute -right-20 top-0 h-52 w-52 rounded-full border border-white/35 opacity-60" />
          <div className="pointer-events-none absolute left-0 bottom-10 h-40 w-40 bg-[radial-gradient(circle,#f0db3d_1px,transparent_1px)] bg-size-[16px_16px] opacity-35" />
          
          <div className="relative mx-auto max-w-6xl rounded-4xl border border-white/25 bg-white/10 p-6 shadow-lg shadow-black/10 md:p-8">
            <h2 className="text-3xl font-black uppercase tracking-tight text-[#f0db3d] md:text-4xl">Contact Information</h2>
            <p className="mt-2 text-sm text-white/90">For loan inquiries, reach out directly through the details below.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <ContactPanel title="Email" value={settings.contactEmail} />
              <ContactPanel title="Phone" value={settings.contactPhone} />
              <ContactPanel title="Address" value={settings.contactAddress} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function OfferCard({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-2xl border border-white/35 bg-[#1665b8]/80 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/80">{title}</p>
      <p className="mt-2 text-lg font-black uppercase text-white">{value}</p>
    </article>
  );
}

function StepCard({ step, label, text }: { step: string; label: string; text: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1665b8] text-sm font-black text-white">{step}</div>
      <p className="mt-3 text-lg font-black uppercase text-[#1665b8]">{label}</p>
      <p className="mt-1 text-sm text-slate-700">{text}</p>
    </article>
  );
}

function ContactPanel({
  title,
  value,
  className,
}: {
  title: string;
  value: string;
  className?: string;
}) {
  return (
    <article className={`rounded-2xl border border-white/35 bg-[#1665b8]/80 p-4 ${className || ''}`}>
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/80">{title}</p>
      <p className="mt-2 text-base font-bold text-white">{value}</p>
    </article>
  );
}

function ContactChip({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex min-w-64 items-center gap-2 rounded-full bg-[#eceff3] px-4 py-1.5 text-sm font-semibold shadow-md shadow-black/10">
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#1665b8] text-xs text-white">{icon}</span>
      <span className="truncate">{text}</span>
    </div>
  );
}

function formatCurrency(value: number) {
  return `₱${value.toLocaleString()}`;
}

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
