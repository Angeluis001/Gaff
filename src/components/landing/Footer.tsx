import { Mail, MapPin, Phone } from "lucide-react"

import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/constants"
import { footerSocialLinks } from "@/lib/landing-data"

export function Footer() {
  return (
    <footer id="footer" className="landing-section scroll-mt-24 pt-0">
      <div className="landing-grid">
        <div className="glass-panel grid gap-6 overflow-hidden rounded-[2rem] border border-gold/10 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-[1.75rem] border border-gold/10">
            <iframe
              title="GAFF marina location"
              src="https://www.google.com/maps?q=Cabo+San+Lucas+Marina&output=embed"
              className="h-[22rem] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="space-y-6">
            <div>
              <p className="section-kicker">Launch Contact</p>
              <h2 className="mt-4 font-heading text-4xl text-white">
                Cabo San Lucas Marina
              </h2>
            </div>

            <div className="space-y-3 text-sm text-sand/74">
              <a href={`tel:${CONTACT_PHONE}`} className="flex items-center gap-3 hover:text-white">
                <Phone className="size-4 text-gold" />
                {CONTACT_PHONE}
              </a>
              <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-3 hover:text-white">
                <Mail className="size-4 text-gold" />
                {CONTACT_EMAIL}
              </a>
              <div className="flex items-center gap-3">
                <MapPin className="size-4 text-gold" />
                Dockside departures from Cabo San Lucas Marina
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {footerSocialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-gold/12 bg-white/4 px-4 py-2 text-sm text-sand/72 hover:bg-white/8 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-sand/68">
              <a href="/privacy-policy" className="hover:text-white">
                Privacy Policy
              </a>
              <a href="/terms-of-service" className="hover:text-white">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
