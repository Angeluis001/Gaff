export default function PrivacyPolicyPage() {
  return (
    <main className="landing-shell min-h-screen py-28">
      <div className="landing-grid">
        <article className="glass-panel mx-auto max-w-4xl rounded-[2rem] border border-gold/10 p-8 sm:p-10">
          <p className="section-kicker">Privacy Policy</p>
          <h1 className="section-title mt-5">Privacy for GAFF landing visitors</h1>
          <div className="mt-6 space-y-5 text-base leading-8 text-sand/76">
            <p>
              We collect the minimum information needed to respond to booking
              inquiries, understand landing-page performance, and improve the
              charter planning experience.
            </p>
            <p>
              Analytics and chat tooling are configured with public identifiers only.
              Any future booking, lead capture, or payment workflow will add more
              specific privacy disclosures as those features go live.
            </p>
            <p>
              Contact GAFF directly if you need help with data access, correction, or
              deletion requests related to the public landing experience.
            </p>
          </div>
        </article>
      </div>
    </main>
  )
}
