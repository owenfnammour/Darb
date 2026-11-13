// Each column in the footer: a title and its links (empty links for now)
const sections = [
  { title: 'Contact us', links: ['Send us a message', 'Help and questions'] },
  { title: 'Social media', links: ['Instagram', 'LinkedIn', 'Twitter'] },
  { title: 'Policies', links: ['Privacy policy', 'Terms and conditions'] },
]

export default function Footer() {
  return (
    <footer className="mt-20 bg-brand-900 text-paper">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo and tagline */}
          <div>
            <a href="#" className="font-display text-xl font-bold tracking-tight text-paper">Darb</a>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-accent-300">Seats going your way</p>
          </div>

          {sections.map((section) => (
            <div key={section.title}>
              <p className="text-xs font-semibold uppercase tracking-wide text-paper">{section.title}</p>
              <ul className="mt-3 flex flex-col gap-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="border-b border-transparent text-sm text-paper/70 hover:border-accent-400">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-8 border-t border-paper/25 pt-6 text-xs text-paper/70">&copy; 2026 Darb. All rights reserved.</p>
      </div>
    </footer>
  )
}
