import { motion } from "framer-motion";

const STEPS = [
  { num: "01", icon: "\u{1F50D}", title: "Discover", description: "Browse clubs or use our matcher. Find what fits your vibe and schedule." },
  { num: "02", icon: "\u{2705}", title: "Vibe Check", description: "See the Club Health Score \u2014 know if they're actually meeting before you commit." },
  { num: "03", icon: "\u{1F91D}", title: "Join", description: "20 seconds. That's it. Grab a Founding Member spot if you're early." },
  { num: "04", icon: "\u{26A1}", title: "Show Up", description: "Meet your people. Build something real. Your cult is waiting." },
];

export function ProcessSection() {
  return (
    <section id="process" className="py-16 sm:py-20" style={{ background: "var(--cream)" }}>
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[2px] uppercase mb-3" style={{ color: "var(--terra)" }}>
            <span className="w-5 h-px" style={{ background: "var(--terra)" }} />
            How It Works
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1] max-w-[500px]" style={{ color: "var(--ink)" }}>
            Stranger to <em style={{ color: "var(--terra)", fontStyle: "italic" }}>cult member</em> in minutes
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="p-7 rounded-2xl transition-all hover-elevate"
              style={{ background: "var(--warm-white)", border: "1.5px solid var(--warm-border)", borderRadius: "18px" }}
              data-testid={`card-step-${step.num}`}
            >
              <div className="font-mono text-5xl leading-none mb-4" style={{ color: "rgba(26,20,16,0.08)", letterSpacing: "1px" }}>{step.num}</div>
              <div className="text-[28px] mb-3">{step.icon}</div>
              <h3 className="text-base font-bold mb-2" style={{ color: "var(--ink)" }}>{step.title}</h3>
              <p className="text-[13px] leading-relaxed" style={{ color: "var(--muted-warm)" }}>{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
