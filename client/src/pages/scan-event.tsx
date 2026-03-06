import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, Camera, CheckCircle2, XCircle, AlertTriangle, Users } from "lucide-react";
import type { Event } from "@shared/schema";

interface AttendanceData {
  totalRsvps: number;
  checkedIn: number;
  notYetArrived: number;
  attendees: { name: string | null; checkedIn: boolean; checkedInAt: string | null }[];
}

type ScanResult =
  | { type: "success"; name: string | null; checkedInAt: string | null }
  | { type: "already"; name: string | null }
  | { type: "error"; message: string };

export default function ScanEvent() {
  const { eventId } = useParams<{ eventId: string }>();
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const scannerRef = useRef<any>(null);
  const scannerDivRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef(false);

  const { data: event, isLoading: eventLoading } = useQuery<Event>({
    queryKey: ["/api/events", eventId, "detail"],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}`);
      if (!res.ok) throw new Error("Event not found");
      return res.json();
    },
    enabled: !!eventId,
  });

  const { data: attendance, refetch: refetchAttendance } = useQuery<AttendanceData>({
    queryKey: ["/api/events", eventId, "attendance"],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/attendance`, { credentials: "include" });
      if (!res.ok) return { totalRsvps: 0, checkedIn: 0, notYetArrived: 0, attendees: [] };
      return res.json();
    },
    enabled: !!eventId && isAuthenticated,
    refetchInterval: 10000,
  });

  const startScanner = async () => {
    if (scannerRef.current || !scannerDivRef.current) return;
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-scanner");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText: string) => {
          if (processingRef.current) return;
          processingRef.current = true;

          let parsed: any;
          try {
            parsed = JSON.parse(decodedText);
          } catch {
            setScanResult({ type: "error", message: "Not a valid CultFam ticket \u2014 please scan the attendee's event QR code" });
            setTimeout(() => {
              setScanResult(null);
              processingRef.current = false;
            }, 3000);
            return;
          }

          try {
            if (!parsed.token) {
              setScanResult({ type: "error", message: "Not a valid CultFam ticket \u2014 please scan the attendee's event QR code" });
              setTimeout(() => {
                setScanResult(null);
                processingRef.current = false;
              }, 3000);
              return;
            }

            const res = await fetch("/api/checkin", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ token: parsed.token, eventId }),
            });

            const data = await res.json();

            if (!res.ok) {
              setScanResult({ type: "error", message: data.message || "Check-in failed" });
            } else if (data.alreadyCheckedIn) {
              setScanResult({ type: "already", name: data.name });
            } else {
              setScanResult({ type: "success", name: data.name, checkedInAt: data.checkedInAt });
              refetchAttendance();
            }
          } catch {
            setScanResult({ type: "error", message: "Check-in failed \u2014 please try scanning again" });
          }

          setTimeout(() => {
            setScanResult(null);
            processingRef.current = false;
          }, 2500);
        },
        () => {}
      );

      setScanning(true);
    } catch (err: any) {
      console.error("Scanner error:", err);
      setScanResult({ type: "error", message: err?.message || "Camera access denied" });
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.stop();
          scannerRef.current.clear();
        } catch {}
        scannerRef.current = null;
      }
    };
  }, []);

  if (authLoading || eventLoading) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Camera className="w-12 h-12 text-muted-foreground mx-auto" />
          <h1 className="font-display text-xl font-bold text-foreground">Scanner Access Required</h1>
          <p className="text-sm text-muted-foreground">Sign in as the event organizer to scan tickets</p>
          <button
            onClick={() => { window.location.href = "/api/login"; }}
            className="w-full bg-[var(--terra)] text-white rounded-2xl py-3 text-sm font-semibold"
            data-testid="button-scanner-sign-in"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-2 mb-4">
          <button
            onClick={() => { stopScanner(); navigate("/organizer"); }}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-scanner-back"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="font-display text-lg font-bold text-[var(--terra)]" data-testid="text-scanner-title">
            Scan Attendees
          </h1>
          <div className="w-12" />
        </div>

        {event && (
          <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-2xl p-3 mb-4 text-center" style={{ borderRadius: 18 }}>
            <div className="text-sm font-semibold text-foreground" data-testid="text-scanner-event-name">{event.title}</div>
          </div>
        )}

        <div className="relative rounded-2xl overflow-hidden mb-4 bg-[var(--ink)]/50 min-h-[300px]">
          <div id="qr-scanner" ref={scannerDivRef} className="w-full" data-testid="div-qr-scanner" />

          {!scanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <Camera className="w-16 h-16 text-muted-foreground" />
              <button
                onClick={startScanner}
                className="bg-[var(--terra)] text-white rounded-2xl px-8 py-4 text-sm font-semibold"
                data-testid="button-start-scanner"
              >
                Start Camera Scanner
              </button>
            </div>
          )}

          {scanResult && (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--ink)]/70 z-10">
              {scanResult.type === "success" && (
                <div className="bg-[var(--warm-white)] border-[1.5px] border-[rgba(196,98,45,0.3)] rounded-2xl p-6 text-center mx-4" style={{ borderRadius: 18 }} data-testid="card-scan-success">
                  <CheckCircle2 className="w-14 h-14 text-[var(--terra)] mx-auto mb-3" />
                  <div className="font-display text-lg font-bold text-foreground mb-1">
                    {scanResult.name || "Attendee"} checked in
                  </div>
                  <div className="text-xs text-muted-foreground">Welcome!</div>
                </div>
              )}
              {scanResult.type === "already" && (
                <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-2xl p-6 text-center mx-4" style={{ borderRadius: 18 }} data-testid="card-scan-already">
                  <AlertTriangle className="w-14 h-14 text-chart-4 mx-auto mb-3" />
                  <div className="font-display text-lg font-bold text-foreground mb-1">
                    Already Checked In
                  </div>
                  <div className="text-xs text-muted-foreground">{scanResult.name || "Attendee"} was already scanned</div>
                </div>
              )}
              {scanResult.type === "error" && (
                <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-2xl p-6 text-center mx-4" style={{ borderRadius: 18 }} data-testid="card-scan-error">
                  <XCircle className="w-14 h-14 text-destructive mx-auto mb-3" />
                  <div className="font-display text-lg font-bold text-foreground mb-1">
                    Scan Failed
                  </div>
                  <div className="text-xs text-muted-foreground">{scanResult.message}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {scanning && (
          <button
            onClick={stopScanner}
            className="w-full bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-2xl py-3 text-sm font-semibold text-muted-foreground mb-4"
            style={{ borderRadius: 18 }}
            data-testid="button-stop-scanner"
          >
            Stop Scanner
          </button>
        )}

        {attendance && (
          <>
            <div className="bg-[var(--warm-white)] border-[1.5px] border-[rgba(196,98,45,0.3)] rounded-2xl p-4 mb-4 text-center" style={{ borderRadius: 18 }} data-testid="card-live-count">
              <div className="text-3xl font-bold text-[var(--terra)] font-mono mb-1" data-testid="text-checked-in-count">
                {attendance.checkedIn}
              </div>
              <div className="text-xs text-muted-foreground">checked in so far</div>
            </div>

            <div className="flex gap-2 mb-4">
              <div className="flex-1 bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-2xl p-3 text-center" style={{ borderRadius: 18 }}>
                <div className="text-lg font-bold text-foreground font-mono" data-testid="text-total-rsvps">{attendance.totalRsvps}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">RSVPs</div>
              </div>
              <div className="flex-1 bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-2xl p-3 text-center" style={{ borderRadius: 18 }}>
                <div className="text-lg font-bold text-[var(--terra)] font-mono" data-testid="text-arrived">{attendance.checkedIn}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Arrived</div>
              </div>
              <div className="flex-1 bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-2xl p-3 text-center" style={{ borderRadius: 18 }}>
                <div className="text-lg font-bold text-chart-4 font-mono" data-testid="text-not-arrived">{attendance.notYetArrived}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Not Yet</div>
              </div>
            </div>

            <div className="bg-[var(--warm-white)] border-[1.5px] border-[var(--warm-border)] rounded-2xl p-4" style={{ borderRadius: 18 }} data-testid="card-attendee-list">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Attendees</span>
              </div>
              {attendance.attendees.length === 0 ? (
                <div className="text-center py-4 text-xs text-muted-foreground">No RSVPs yet</div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {attendance.attendees.map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 px-3 rounded-xl bg-[var(--cream)]/50"
                      data-testid={`attendee-row-${i}`}
                    >
                      <span className="text-sm text-foreground">{a.name || "Unknown"}</span>
                      {a.checkedIn ? (
                        <span className="flex items-center gap-1 text-xs text-[var(--terra)] font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          In
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Pending</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
