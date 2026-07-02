import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Disclaimer } from "@/components/Disclaimer";

const SECTIONS: { heading: string; body: React.ReactNode }[] = [
  {
    heading: "1. Agreement to these Terms",
    body: (
      <p className="text-sm text-muted-foreground">
        These Terms of Service ("Terms") are a binding agreement between you and <strong>Nachum Meerkin</strong>, operating SettleMate as an individual ("SettleMate", "we", "us"), governing your use of the SettleMate app at getsettlemate.app (the "Service"). By creating an account or using the Service, you agree to these Terms and to our Privacy Policy. If you do not agree, do not use the Service.
      </p>
    ),
  },
  {
    heading: "2. Who can use SettleMate",
    body: (
      <p className="text-sm text-muted-foreground">
        You may use SettleMate only if you can form a binding contract with us and you are at least 18 years old. The Service is intended for non-EU international students relocating to Italy, but is open to anyone who meets these Terms. You are responsible for the accuracy of the information you provide, including during onboarding and student verification.
      </p>
    ),
  },
  {
    heading: "3. What SettleMate is",
    body: (
      <p className="text-sm text-muted-foreground">
        SettleMate provides: sequenced informational guides to Italian bureaucratic processes (e.g. visa, codice fiscale, permesso di soggiorno, housing, banking, SIM, transport); a peer community for verified students; and tools such as checklists to track your own progress.
      </p>
    ),
  },
  {
    heading: "4. Important: SettleMate is not professional advice",
    body: (
      <p className="text-sm text-muted-foreground">
        The guides, content, and community discussions on SettleMate are <strong>general information only</strong>. They are <strong>not legal, immigration, tax, financial, or other professional advice</strong>, and must not be relied upon as such. Bureaucratic rules, fees, processing times, and requirements change frequently and vary by individual circumstances, consulate, and office. You are responsible for verifying any requirement with the relevant official authority or a qualified professional before acting. Official primary sources include esteri.it (visas), interno.gov.it (permesso), and agenziaentrate.gov.it (codice fiscale). SettleMate does not guarantee that any content is complete, current, or error-free, and does not guarantee any particular outcome (such as the grant of a visa or permit). Community content reflects the personal views of other users, not SettleMate, and we do not verify its accuracy.
      </p>
    ),
  },
  {
    heading: "5. Your account",
    body: (
      <p className="text-sm text-muted-foreground">
        Keep your login credentials secure; you are responsible for activity under your account. Your login email is separate from any university email you use for student verification. Notify us promptly at <a href="mailto:settlemate.italy@gmail.com" className="text-primary hover:underline">settlemate.italy@gmail.com</a> of any unauthorised use.
      </p>
    ),
  },
  {
    heading: "6. Student verification",
    body: (
      <p className="text-sm text-muted-foreground">
        Access to the community chat requires verified student status. You agree that any document or email you submit for verification is genuine and yours. Submitting forged or misleading documents is prohibited and may result in removal. Verification documents are handled and deleted as described in the Privacy Policy.
      </p>
    ),
  },
  {
    heading: "7. Community rules and conduct",
    body: (
      <>
        <p className="text-sm text-muted-foreground">
          The community is a place for students to help each other. When using the chat or any user-facing feature, you agree not to:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
          <li>harass, threaten, abuse, or impersonate others;</li>
          <li>post unlawful, hateful, discriminatory, or sexually explicit content;</li>
          <li>post spam, scams, fraudulent housing/rental offers, or commercial solicitations;</li>
          <li>share others' personal data without consent; or</li>
          <li>attempt to gain unauthorised access, disrupt, or misuse the Service.</li>
        </ul>
        <p className="text-sm text-muted-foreground">
          The community is actively moderated. We may remove content, and suspend, ban, or terminate accounts that violate these Terms or harm the community. To report a problem or another user, contact <a href="mailto:settlemate.italy@gmail.com" className="text-primary hover:underline">settlemate.italy@gmail.com</a>.
        </p>
      </>
    ),
  },
  {
    heading: "8. Your content",
    body: (
      <p className="text-sm text-muted-foreground">
        You retain ownership of the content you post. By posting, you grant SettleMate a non-exclusive, worldwide, royalty-free licence to host, display, and distribute that content within the Service for the purpose of operating it. You are responsible for the content you post and confirm you have the right to share it.
      </p>
    ),
  },
  {
    heading: "9. Intellectual property",
    body: (
      <p className="text-sm text-muted-foreground">
        The Service itself — including its design, guides, text, and software (excluding user content and third-party materials) — is owned by SettleMate and protected by law. You may use it only as permitted by these Terms.
      </p>
    ),
  },
  {
    heading: "10. Service availability and changes",
    body: (
      <p className="text-sm text-muted-foreground">
        We may modify, suspend, or discontinue any part of the Service at any time, and may update the guides as information changes. We aim to keep the Service available but do not guarantee uninterrupted or error-free operation.
      </p>
    ),
  },
  {
    heading: "11. Disclaimers and limitation of liability",
    body: (
      <p className="text-sm text-muted-foreground">
        The Service is provided <strong>"as is"</strong> and <strong>"as available,"</strong> without warranties of any kind, to the fullest extent permitted by law. To the fullest extent permitted by law, SettleMate is not liable for any indirect, incidental, or consequential loss, or for any decision you make or action you take based on the Service's content or community discussions. Nothing in these Terms excludes or limits any rights you have under mandatory consumer-protection law.
      </p>
    ),
  },
  {
    heading: "12. Termination",
    body: (
      <p className="text-sm text-muted-foreground">
        You may stop using the Service and delete your account at any time from within the app. We may suspend or terminate your access if you breach these Terms or to protect the Service or its users. Sections that by their nature should survive termination (e.g. disclaimers, limitation of liability, intellectual property) will survive.
      </p>
    ),
  },
  {
    heading: "13. Governing law",
    body: (
      <p className="text-sm text-muted-foreground">
        These Terms are governed by the laws of Italy, without regard to conflict-of-law rules, and subject to any mandatory consumer-protection rights you have under the law of your country of residence.
      </p>
    ),
  },
  {
    heading: "14. Changes to these Terms",
    body: (
      <p className="text-sm text-muted-foreground">
        We may update these Terms as the Service evolves or the law changes. We will post the updated version with a new "Last updated" date and, for material changes, notify you in the app or by email. Continued use after changes means you accept them.
      </p>
    ),
  },
  {
    heading: "15. Contact",
    body: (
      <p className="text-sm text-muted-foreground">
        Questions about these Terms: <a href="mailto:settlemate.italy@gmail.com" className="text-primary hover:underline">settlemate.italy@gmail.com</a>
      </p>
    ),
  },
];

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">SettleMate — Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Effective date: 30 June 2026 · Last updated: 2 July 2026</p>

        <Disclaimer className="mb-8" />

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

export default Terms;
