import { motion } from "framer-motion";
import { Search, CheckCircle, Handshake, Leaf } from "lucide-react";

const STEPS = [
  {
    num: "01",
    icon: Search,
    title: "Discover",
    description: "Browse clubs by category or use our matching tool to find what fits your lifestyle and schedule.",
  },
  {
    num: "02",
    icon: CheckCircle,
    title: "Check Health",
    description: "See the Club Health Score — know if a club is actively meeting before you invest your time.",
  },
  {
    num: "03",
    icon: Handshake,
    title: "Join",
    description: "Submit your interest in 20 seconds. Grab a Founding Member spot if you're early enough.",
  },
  {
    num: "04",
    icon: Leaf,
    title: "Belong",
    description: "Show up, meet your people, build something lasting. Your club is your home in Tirupati.",
  },
];

export function ProcessSection() {
  return (
    <section id="process" className="py-20 sm:py-28 bg-card/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-sm font-medium text-primary mb-3">Process</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            From stranger to <span className="italic font-serif">tribe member</span> in minutes
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative"
                data-testid={`card-step-${step.num}`}
              >
                <div className="text-5xl font-bold text-primary/10 mb-4">{step.num}</div>
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
