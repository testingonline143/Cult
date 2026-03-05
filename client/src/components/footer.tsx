export function Footer() {
  return (
    <footer className="py-10 text-center" style={{ background: "var(--ink)", borderTop: "1.5px solid var(--warm-border)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="font-display text-2xl font-black mb-2 flex items-center justify-center gap-2" style={{ color: "var(--cream)" }}>
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--terra)" }} />
          CultFam
        </div>
        <div className="text-sm mb-4" style={{ color: "var(--muted-warm)" }}>
          Your cult is waiting. Tirupati, Andhra Pradesh.
        </div>
        <div className="flex items-center justify-center gap-6 text-xs" style={{ color: "var(--muted-warm2)" }}>
          <a href="/explore" className="transition-colors" style={{ color: "var(--muted-warm2)" }} data-testid="link-footer-explore">Explore</a>
          <span>{"\u00B7"}</span>
          <a href="/onboarding" className="transition-colors" style={{ color: "var(--muted-warm2)" }} data-testid="link-footer-quiz">Take Quiz</a>
          <span>{"\u00B7"}</span>
          <span data-testid="text-footer-tagline">Made with intent</span>
        </div>
      </div>
    </footer>
  );
}
