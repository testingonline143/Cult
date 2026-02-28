export function Footer() {
  return (
    <footer className="bg-primary py-10 text-center">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="font-sans text-2xl font-black text-primary-foreground mb-2 flex items-center justify-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--clay))]" />
          CultFam
        </div>
        <div className="text-sm text-white/40 mb-4">
          Your cult is waiting. Tirupati, Andhra Pradesh.
        </div>
        <div className="flex items-center justify-center gap-6 text-xs text-white/25">
          <a href="/explore" className="hover:text-white/50 transition-colors" data-testid="link-footer-explore">Explore</a>
          <span>·</span>
          <a href="/onboarding" className="hover:text-white/50 transition-colors" data-testid="link-footer-quiz">Take Quiz</a>
          <span>·</span>
          <span data-testid="text-footer-tagline">Made with intent</span>
        </div>
      </div>
    </footer>
  );
}
