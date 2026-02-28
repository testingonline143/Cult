import { motion } from "framer-motion";

const STEPS = [
  { num: "01", icon: "\u{1F50D}", title: "Discover", description: "Browse clubs or use our matcher. Find what fits your vibe and schedule." },
  { num: "02", icon: "\u{2705}", title: "Vibe Check", description: "See the Club Health Score — know if they're actually meeting before you commit." },
  { num: "03", icon: "\u{1F91D}", title: "Join", description: "20 seconds. That's it. Grab a Founding Member spot if you're early." },
  { num: "04", icon: "\u{26A1}", title: "Show Up", description: "Meet your people. Build something real. Your crew is waiting." },
];

export function ProcessSection() {
  return (
    <section id="process" className="bg-primary py-16 sm:py-20">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[2px] uppercase text-[hsl(var(--clay))] mb-3">
            <span className="w-5 h-px bg-[hsl(var(--clay))]" />
            How It Works
          </div>
          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-black text-primary-foreground tracking-tight leading-[1.1] max-w-[500px]">
            Stranger to <span className="text-[hsl(var(--clay))]">crew member</span> in minutes
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0.5">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="p-7 bg-white/[0.03] border border-white/[0.07] rounded-sm"
              data-testid={`card-step-${step.num}`}
            >
              <div className="font-sans text-5xl font-black text-white/[0.08] leading-none mb-4">{step.num}</div>
              <div className="text-[28px] mb-3">{step.icon}</div>
              <h3 className="text-base font-bold text-primary-foreground mb-2">{step.title}</h3>
              <p className="text-[13px] text-white/50 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
