import { motion } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";

const FEATURES = [
  { label: "Tirupati / Tier 2 cities", meetup: false, misfits: false, sangh: "Only us" },
  { label: "Free for organizers", meetup: false, misfits: "Partial", sangh: "Always" },
  { label: "Commission rate", meetup: "High", misfits: "30-40%", sangh: "8% only" },
  { label: "Club Health Score", meetup: false, misfits: false, sangh: true },
  { label: "Founding Member badges", meetup: false, misfits: false, sangh: true },
  { label: "Organizer reputation", meetup: false, misfits: false, sangh: true },
  { label: "WhatsApp-native join", meetup: false, misfits: false, sangh: true },
  { label: "Permanent club homes", meetup: "Events only", misfits: "Events only", sangh: "Always live" },
];

function CellValue({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="w-4 h-4 text-primary mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />;
  return <span className="text-xs sm:text-sm">{value}</span>;
}

export function CompareSection() {
  return (
    <section id="compare" className="py-20 sm:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-medium text-primary mb-3">Why Sangh</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Built for <span className="italic font-serif">Tirupati</span>.{" "}
            <br className="hidden sm:block" />
            Not imported from Gurgaon.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-md border border-border overflow-x-auto"
          data-testid="table-comparison"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-3 sm:p-4 font-semibold">Feature</th>
                <th className="text-center p-3 sm:p-4 font-medium text-muted-foreground">Meetup</th>
                <th className="text-center p-3 sm:p-4 font-medium text-muted-foreground">Misfits</th>
                <th className="text-center p-3 sm:p-4 font-semibold text-primary">
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Sangh
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((row, i) => (
                <tr
                  key={row.label}
                  className={`border-b border-border/50 last:border-b-0 ${i % 2 === 0 ? "" : "bg-muted/10"}`}
                >
                  <td className="p-3 sm:p-4 text-foreground font-medium">{row.label}</td>
                  <td className="p-3 sm:p-4 text-center text-muted-foreground">
                    <CellValue value={row.meetup} />
                  </td>
                  <td className="p-3 sm:p-4 text-center text-muted-foreground">
                    <CellValue value={row.misfits} />
                  </td>
                  <td className="p-3 sm:p-4 text-center font-medium text-primary">
                    <CellValue value={row.sangh} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}
