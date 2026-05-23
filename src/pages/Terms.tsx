import { Navbar } from "@/components/Navbar";
import { Footer, SUPPORT_EMAIL } from "@/components/Footer";
import { Disclaimer } from "@/components/Disclaimer";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}</p>

        <Disclaimer className="mb-8" />

        <div className="space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold">1. Acceptance</h2>
            <p className="text-sm text-muted-foreground">By creating an account or using SettleMate, you agree to these Terms of Service. If you do not agree, please do not use the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Informational service only</h2>
            <p className="text-sm text-muted-foreground">SettleMate provides informational guidance about the Italian student visa and arrival process. We are not a law firm, an immigration consultancy, or a government agency, and nothing on the site constitutes legal, immigration, financial, or medical advice. Rules, fees, and processing times change — always confirm with official Italian government sources and your local Italian embassy or consulate before making decisions.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Your account</h2>
            <p className="text-sm text-muted-foreground">You are responsible for keeping your credentials secure and for all activity under your account. You must be at least 16 years old to create an account.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Acceptable use</h2>
            <p className="text-sm text-muted-foreground">You agree not to misuse the service, including by posting unlawful, harassing, or misleading content in community chat, uploading material you do not have rights to, or attempting to interfere with the service's operation or security.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Your content</h2>
            <p className="text-sm text-muted-foreground">You retain ownership of documents you upload and messages you post. By posting in community chat, you grant other room members the ability to view your messages.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Disclaimer of warranties</h2>
            <p className="text-sm text-muted-foreground">The service is provided "as is" without warranties of any kind. We do not guarantee that any information is accurate, complete, or up to date.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Limitation of liability</h2>
            <p className="text-sm text-muted-foreground">To the maximum extent permitted by law, SettleMate is not liable for any indirect or consequential damages arising from your use of the service, including visa refusals, missed deadlines, or financial loss.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Changes</h2>
            <p className="text-sm text-muted-foreground">We may update these Terms from time to time. Continued use of the service after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">9. Contact</h2>
            <p className="text-sm text-muted-foreground">Questions? Email {SUPPORT_EMAIL}.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
