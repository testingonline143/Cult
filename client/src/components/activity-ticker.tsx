import { useQuery } from "@tanstack/react-query";

interface ActivityItem {
  name: string;
  clubName: string;
  clubEmoji: string;
  createdAt: string;
}

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDay}d ago`;
}

export function ActivityTicker() {
  const { data, isLoading } = useQuery<ActivityItem[]>({
    queryKey: ["/api/activity/feed"],
    queryFn: async () => {
      const res = await fetch("/api/activity/feed");
      if (!res.ok) throw new Error("Failed to fetch activity feed");
      return res.json();
    },
  });

  if (isLoading || !data || data.length === 0) return null;

  const items = [...data, ...data];

  return (
    <div
      data-testid="section-activity-ticker"
      className="bg-primary/[0.04] border-y border-primary/10 py-2.5 overflow-hidden"
    >
      <div className="flex animate-marquee whitespace-nowrap">
        {items.map((item, i) => (
          <span
            key={i}
            data-testid="text-activity-item"
            className="text-sm text-muted-foreground mx-6 inline-flex items-center gap-1 shrink-0"
          >
            {item.clubEmoji} {item.name} joined {item.clubName} · {getRelativeTime(item.createdAt)}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}