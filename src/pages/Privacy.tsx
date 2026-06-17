import { Navbar } from "@/components/Navbar";
import { Footer, SUPPORT_EMAIL } from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="prose prose-sm sm:prose-base max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold">1. Who we are</h2>
            <p className="text-sm text-muted-foreground">
              SettleMate ("we", "us", "our") provides an online guide that helps international students prepare for and complete their relocation to Italy. This policy explains what personal data we collect, why, and your rights under the EU General Data Protection Regulation (GDPR).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Data we collect</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li><strong>Account data:</strong> email address and authentication credentials.</li>
              <li><strong>Profile data:</strong> country of origin, intended university, planned arrival date.</li>
              <li><strong>Progress data:</strong> tasks marked complete, documents marked ready.</li>
              <li><strong>Uploaded documents:</strong> Verification documents you submit during the student verification process — including acceptance letters and identification documents (such as passports or national ID cards). These are stored temporarily in a private, encrypted bucket, accessible only to SettleMate administrators for the purpose of verifying your student status. They are permanently and irreversibly deleted immediately upon approval or rejection of your verification request. No verification documents are retained after the decision is made.</li>
              <li><strong>Community chat messages:</strong> messages you post in country/city-scoped chat rooms, visible to other members of those rooms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. How we use your data</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>To personalize your visa and bureaucracy checklists.</li>
              <li>To save your progress across sessions and devices.</li>
              <li>To enable community chat with other students in the same country or city.</li>
              <li>To respond to support requests you send us.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Legal basis</h2>
            <p className="text-sm text-muted-foreground">
              We process your data on the basis of (a) the contract to provide you the service, and (b) your consent for optional features such as uploading documents and posting in community chat.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Sharing</h2>
            <p className="text-sm text-muted-foreground">
              We do not sell your data. We use a small number of trusted processors strictly to operate the service: our cloud hosting and database provider (Supabase, EU region) and our email/auth provider. Community chat messages are visible to other users in the same country or city room.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Retention</h2>
            <p className="text-sm text-muted-foreground">
              We retain your account and progress data for as long as you keep your account. You can delete your data at any time by emailing us at {SUPPORT_EMAIL}.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Your rights (GDPR)</h2>
            <p className="text-sm text-muted-foreground">
              You have the right to access, correct, export, restrict, or delete your personal data, and to object to processing or lodge a complaint with your local data protection authority. To exercise any of these rights, contact {SUPPORT_EMAIL}.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Cookies</h2>
            <p className="text-sm text-muted-foreground">
              We use only essential cookies and browser storage required to keep you signed in and to remember your last-selected country/city. We do not use third-party analytics or advertising trackers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">9. Contact</h2>
            <p className="text-sm text-muted-foreground">
              Questions about this policy? Email {SUPPORT_EMAIL}.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
