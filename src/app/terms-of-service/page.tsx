export default function TermsOfServicePage() {
  return (
    <main className="landing-shell min-h-screen py-28">
      <div className="landing-grid">
        <article className="glass-panel mx-auto max-w-4xl rounded-[2rem] border border-gold/10 p-8 sm:p-10">
          <p className="section-kicker">Terms of Service</p>
          <h1 className="section-title mt-5">Landing-page terms for charter planning</h1>
          <div className="mt-6 space-y-5 text-base leading-8 text-sand/76">
            <p>
              The Phase 2 landing experience is informational and supports booking
              intent only. Availability, pricing, and charter details remain subject to
              confirmation with the GAFF crew until the live booking flow ships.
            </p>
            <p>
              Media, trip details, and conservation statements are presented in good
              faith to help guests evaluate the experience before submitting a request.
            </p>
            <p>
              Future booking, deposit, and cancellation terms will be expanded when the
              transactional checkout flow launches.
            </p>
          </div>
        </article>
      </div>
    </main>
  )
}
