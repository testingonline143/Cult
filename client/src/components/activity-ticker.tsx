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

  const items = [...data, ...data, ...data];

  return (
    <div
      data-testid="section-activity-ticker"
      className="bg-primary py-2.5 overflow-hidden"
    >
      <div className="flex animate-marquee whitespace-nowrap">
        {items.map((item, i) => (
          <span
            key={i}
            data-testid="text-activity-item"
            className="text-sm font-medium text-primary-foreground/70 mx-8 inline-flex items-center gap-1.5 shrink-0"
          >
            <span className="text-base">{item.clubEmoji}</span>
            <span className="text-primary-foreground font-semibold">{item.name}</span> joined {item.clubName}
            <span className="text-primary-foreground/40 text-xs">· {getRelativeTime(item.createdAt)}</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </div>
  );
}
