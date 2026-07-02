import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const SECTIONS: { heading: string; body: React.ReactNode }[] = [
  {
    heading: "1. Who we are",
    body: (
      <>
        <p className="text-sm text-muted-foreground">
          SettleMate ("SettleMate", "we", "us") is a mobile-first web app that guides non-EU international students through the process of relocating to Italy and connects them with a peer community.
        </p>
        <p className="text-sm text-muted-foreground">
          The data controller responsible for your personal data is: <strong>Nachum Meerkin</strong>, operating SettleMate as an individual. Contact: <a href="mailto:settlemate.italy@gmail.com" className="text-primary hover:underline">settlemate.italy@gmail.com</a>
        </p>
      </>
    ),
  },
  {
    heading: "2. Scope",
    body: (
      <p className="text-sm text-muted-foreground">
        This policy explains what personal data we collect, why, how long we keep it, who we share it with, and the rights you have. It applies to your use of the SettleMate app at getsettlemate.app.
      </p>
    ),
  },
  {
    heading: "3. What data we collect and why",
    body: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          <strong>3.1 Account data</strong> — Your login email and password (password stored only as a secure hash). <strong>Purpose:</strong> to create and secure your account, log you in, and send essential account emails (confirmation, password reset). <strong>Legal basis:</strong> performance of a contract (Article 6(1)(b) GDPR).
        </p>
        <p className="text-sm text-muted-foreground">
          <strong>3.2 Profile and onboarding data</strong> — Name, country of origin, destination city, and your journey stage/selections made during onboarding. <strong>Purpose:</strong> to personalise the guides and connect you to the right country/city community. <strong>Legal basis:</strong> performance of a contract, and our legitimate interest in providing a relevant experience (Article 6(1)(b) and (f)).
        </p>
        <p className="text-sm text-muted-foreground">
          <strong>3.3 Progress data</strong> — Checklist/task progress (e.g. which steps you have marked complete). We do <strong>NOT</strong> store copies of your bureaucratic documents — only simple "I have this" checkboxes. <strong>Purpose:</strong> to track and display your progress. <strong>Legal basis:</strong> performance of a contract.
        </p>
        <p className="text-sm text-muted-foreground">
          <strong>3.4 Student verification data</strong> — To unlock the gated community chat you may verify your student status. Two methods:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
          <li><strong>Tier 1 — University email:</strong> you enter a university email address; we send a verification code to confirm you control it. We store the university email and the fact that it was verified, kept separate from your login email.</li>
          <li><strong>Tier 2 — Document review:</strong> you upload an acceptance letter and a photo ID for manual review.</li>
        </ul>
        <p className="text-sm text-muted-foreground">
          <strong>How we handle verification uploads (important):</strong> uploaded files are held in a private storage area solely so we can review them, and are <strong>permanently deleted immediately after the approve/reject decision is made</strong>. We do not retain your acceptance letter or photo ID. We keep only the outcome of verification (verified: yes/no, method, and date) — not the documents themselves.
        </p>
        <p className="text-sm text-muted-foreground">
          <strong>Purpose:</strong> to confirm you are a genuine student and protect the community from fraud and scammers. <strong>Legal basis:</strong> performance of a contract, and our legitimate interest in maintaining a safe, trusted community (Article 6(1)(b) and (f)). A photo ID is a government-issued identifier and is treated as higher-risk data, which is why retention is limited to the moment of review.
        </p>
        <p className="text-sm text-muted-foreground">
          <strong>3.5 Community chat data</strong> — Messages, reactions, and moderation actions relating to your account in the community chat. <strong>Purpose:</strong> to operate the community feature and keep it safe. <strong>Legal basis:</strong> performance of a contract, and legitimate interest in moderation and safety. Messages you post are visible to other verified members of the relevant chat — do not share sensitive personal information in chat.
        </p>
        <p className="text-sm text-muted-foreground">
          <strong>3.6 Technical data</strong> — Essential operational data needed to run the service (e.g. authentication tokens/session data). We use only essential cookies/storage required to keep you logged in and the app functioning. We do not use advertising or non-essential analytics cookies.
        </p>
      </div>
    ),
  },
  {
    heading: "4. Who we share data with (processors)",
    body: (
      <p className="text-sm text-muted-foreground">
        We do not sell your personal data. We share it only with service providers ("processors") who help us run SettleMate, under appropriate data-protection terms: <strong>Lovable Cloud</strong> (our application backend and database), which hosts your data in Frankfurt, Germany (EU); and <strong>Lovable's email delivery</strong> for authentication emails (confirmation, password reset, verification codes), sent from our getsettlemate.app domain. We may also disclose data if required by law or to protect the rights, safety, or property of users or the public.
      </p>
    ),
  },
  {
    heading: "5. Where your data is stored and international transfers",
    body: (
      <p className="text-sm text-muted-foreground">
        Your data is stored in the European Union (Frankfurt, Germany). As the controller is based in Israel, your data may be accessed from Israel for the purpose of operating and supporting the service. Israel benefits from a European Commission adequacy decision recognising it as providing an adequate level of data protection.
      </p>
    ),
  },
  {
    heading: "6. How long we keep your data",
    body: (
      <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
        <li><strong>Account, profile, progress, and verification-status data:</strong> for as long as your account is active.</li>
        <li><strong>Verification documents</strong> (acceptance letter, photo ID): deleted immediately after the approve/reject decision — not retained.</li>
        <li><strong>Community messages:</strong> retained while the community operates, subject to moderation needs.</li>
        <li><strong>After account deletion:</strong> your personal data is deleted or anonymised, except where we must retain limited information to comply with a legal obligation or resolve disputes.</li>
      </ul>
    ),
  },
  {
    heading: "7. Your rights",
    body: (
      <>
        <p className="text-sm text-muted-foreground">
          Under the GDPR you have the right to: access the personal data we hold about you; rectify inaccurate or incomplete data; erase your data ("right to be forgotten"); restrict or object to certain processing; data portability (receive your data in a structured, commonly used format); and withdraw consent where processing is based on consent.
        </p>
        <p className="text-sm text-muted-foreground">
          You can delete your account at any time from within the app. To exercise any other right, contact <a href="mailto:settlemate.italy@gmail.com" className="text-primary hover:underline">settlemate.italy@gmail.com</a>. We will respond within the timeframes required by law (generally one month). You also have the right to lodge a complaint with a supervisory authority — in Italy, the <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Garante per la protezione dei dati personali</a>, or your local EU data protection authority.
        </p>
      </>
    ),
  },
  {
    heading: "8. Security",
    body: (
      <p className="text-sm text-muted-foreground">
        We use technical and organisational measures appropriate to the risk, including encrypted transport (HTTPS), hashed passwords, a private storage area for verification uploads, and immediate deletion of those uploads after review. No system is perfectly secure, but we work to protect your data and limit what we hold.
      </p>
    ),
  },
  {
    heading: "9. Children",
    body: (
      <p className="text-sm text-muted-foreground">
        SettleMate is intended for university students and is not directed at anyone under 18. We do not knowingly collect data from children. If you believe a minor has provided us data, contact us and we will remove it.
      </p>
    ),
  },
  {
    heading: "10. Changes to this policy",
    body: (
      <p className="text-sm text-muted-foreground">
        We may update this policy as the service evolves or the law changes. We will post the updated version with a new "Last updated" date and, for material changes, notify you in the app or by email.
      </p>
    ),
  },
  {
    heading: "11. Contact",
    body: (
      <p className="text-sm text-muted-foreground">
        Questions or requests about your data: <a href="mailto:settlemate.italy@gmail.com" className="text-primary hover:underline">settlemate.italy@gmail.com</a>
      </p>
    ),
  },
];

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">SettleMate — Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Effective date: 30 June 2026 · Last updated: 2 July 2026</p>

        <div className="space-y-6 text-foreground">
          {SECTIONS.map((s) => (
            <section key={s.heading} className="space-y-2">
              <h2 className="text-xl font-semibold">{s.heading}</h2>
              {s.body}
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
