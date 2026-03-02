export function Footer() {
  return (
    <footer className="glass-card border-x-0 border-b-0 py-10 text-center">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="font-display text-2xl font-black text-foreground mb-2 flex items-center justify-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-neon neon-glow" />
          CultFam
        </div>
        <div className="text-sm text-muted-foreground mb-4">
          Your cult is waiting. Tirupati, Andhra Pradesh.
        </div>
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground/60">
          <a href="/explore" className="hover:text-neon transition-colors" data-testid="link-footer-explore">Explore</a>
          <span>·</span>
          <a href="/onboarding" className="hover:text-neon transition-colors" data-testid="link-footer-quiz">Take Quiz</a>
          <span>·</span>
          <span data-testid="text-footer-tagline">Made with intent</span>
        </div>
      </div>
    </footer>
  );
}
