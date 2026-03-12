import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/image-upload";
import { Loader2, MessageSquare, Plus, Users2 } from "lucide-react";
import type { Club } from "@shared/schema";

function CoOrganiserSection({ club }: { club: Club }) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: coOrganisers = [], isLoading: loadingCo } = useQuery<{ userId: string; name: string; profileImageUrl: string | null }[]>({
    queryKey: ["/api/organizer/clubs", club.id, "co-organisers"],
    queryFn: async () => { const res = await fetch(`/api/organizer/clubs/${club.id}/co-organisers`, { credentials: "include" }); if (!res.ok) return []; return res.json(); },
  });

  const { data: members = [] } = useQuery<{ id: string; userId: string; name: string; status: string }[]>({
    queryKey: ["/api/organizer/clubs", club.id, "members"],
    queryFn: async () => { const res = await fetch(`/api/organizer/clubs/${club.id}/members`, { credentials: "include" }); if (!res.ok) return []; return res.json(); },
  });

  const coIds = new Set(coOrganisers.map(c => c.userId));
  const searchableMembers = members
    .filter(m => m.status==="approved" && m.userId && !coIds.has(m.userId) && m.userId!==club.creatorUserId)
    .filter(m => searchQuery.length>=2 && m.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const addMutation = useMutation({
    mutationFn: async (userId: string) => { const res = await apiRequest("POST",`/api/organizer/clubs/${club.id}/co-organisers`,{userId}); return res.json(); },
    onSuccess: () => { setSearchQuery(""); queryClient.invalidateQueries({queryKey:["/api/organizer/clubs",club.id,"co-organisers"]}); toast({title:"Co-organiser added"}); },
    onError: () => toast({title:"Failed to add co-organiser",variant:"destructive"}),
  });

  const removeMutation = useMutation({
    mutationFn: async (userId: string) => { const res = await apiRequest("DELETE",`/api/organizer/clubs/${club.id}/co-organisers/${userId}`); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({queryKey:["/api/organizer/clubs",club.id,"co-organisers"]}); toast({title:"Co-organiser removed"}); },
    onError: () => toast({title:"Failed to remove co-organiser",variant:"destructive"}),
  });

  return (
    <div className="pt-2 border-t border-[var(--warm-border)]" data-testid="section-co-organisers">
      <div className="flex items-center gap-1.5 mb-3"><Users2 className="w-3.5 h-3.5 text-[var(--terra)]"/><span className="text-xs font-bold text-[var(--terra)] uppercase tracking-wider">Co-Organisers</span></div>
      <p className="text-[11px] text-muted-foreground mb-3">Add club members as co-organisers so they can help manage the dashboard.</p>

      {loadingCo ? <div className="flex items-center justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground"/></div> : coOrganisers.length>0 ? (
        <div className="space-y-2 mb-3">{coOrganisers.map(co=>(
          <div key={co.userId} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[var(--warm-white)] border border-[var(--warm-border)]" data-testid={`co-organiser-${co.userId}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[var(--terra)]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">{co.profileImageUrl?<img src={co.profileImageUrl} alt="" className="w-full h-full object-cover rounded-full"/>:<span className="text-xs font-bold text-[var(--terra)]">{co.name.charAt(0)}</span>}</div>
              <span className="text-sm font-medium text-foreground truncate">{co.name}</span>
            </div>
            <button onClick={()=>removeMutation.mutate(co.userId)} disabled={removeMutation.isPending} className="text-xs text-red-500 hover:text-red-700 font-medium flex-shrink-0" data-testid={`button-remove-co-${co.userId}`}>Remove</button>
          </div>
        ))}</div>
      ) : <p className="text-xs text-muted-foreground mb-3 italic">No co-organisers yet</p>}

      <div className="relative">
        <input type="text" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search members to add..." className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30" data-testid="input-search-co-organiser"/>
        {searchableMembers.length>0&&<div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[var(--warm-border)] rounded-lg shadow-lg z-20 max-h-40 overflow-y-auto">{searchableMembers.map(m=><button key={m.userId} onClick={()=>addMutation.mutate(m.userId)} disabled={addMutation.isPending} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-[var(--cream)] transition-colors" data-testid={`button-add-co-${m.userId}`}><Plus className="w-3.5 h-3.5 text-[var(--terra)]"/><span className="font-medium">{m.name}</span></button>)}</div>}
        {searchQuery.length>=2&&searchableMembers.length===0&&<p className="text-[11px] text-muted-foreground mt-1">No matching members found</p>}
      </div>
    </div>
  );
}

export default function EditTab({ club }: { club: Club }) {
  const [shortDesc, setShortDesc] = useState(club.shortDesc);
  const [fullDesc, setFullDesc] = useState(club.fullDesc || "");
  const [organizerName, setOrganizerName] = useState(club.organizerName || "");
  const [whatsappNumber, setWhatsappNumber] = useState(club.whatsappNumber || "");
  const [schedule, setSchedule] = useState(club.schedule);
  const [location, setLocation] = useState(club.location);
  const [joinQuestion1, setJoinQuestion1] = useState((club as any).joinQuestion1 || "");
  const [joinQuestion2, setJoinQuestion2] = useState((club as any).joinQuestion2 || "");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(club.coverImageUrl ?? null);
  const [saved, setSaved] = useState(false);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => { const res = await apiRequest("PATCH", `/api/organizer/club/${club.id}`, data); return res.json(); },
    onSuccess: () => { setSaved(true); setTimeout(()=>setSaved(false),2000); queryClient.invalidateQueries({queryKey:["/api/clubs"]}); queryClient.invalidateQueries({queryKey:["/api/organizer/my-clubs"]}); },
  });

  return (
    <div className="space-y-4" data-testid="section-edit-club">
      <ImageUpload value={coverImageUrl} onChange={setCoverImageUrl} label="Club Cover Photo"/>
      <div className="space-y-3">
        <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Short Description</label><textarea value={shortDesc} onChange={e=>setShortDesc(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30 resize-none" data-testid="input-edit-shortdesc"/></div>
        <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Full Description</label><textarea value={fullDesc} onChange={e=>setFullDesc(e.target.value)} rows={5} placeholder="Write a detailed description of your club..." className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30 resize-none" data-testid="input-edit-fulldesc"/><p className="text-[11px] text-muted-foreground mt-1">Shown on your club's detail page.</p></div>
        <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Organizer Name</label><input type="text" value={organizerName} onChange={e=>setOrganizerName(e.target.value)} placeholder="Your name as the organizer" className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30" data-testid="input-edit-organizer-name"/></div>
        <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">WhatsApp Number</label><input type="tel" value={whatsappNumber} onChange={e=>setWhatsappNumber(e.target.value)} placeholder="e.g. +91 98765 43210" className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30" data-testid="input-edit-whatsapp"/><p className="text-[11px] text-muted-foreground mt-1">Members can reach you on WhatsApp.</p></div>
        <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Schedule</label><input type="text" value={schedule} onChange={e=>setSchedule(e.target.value)} className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30" data-testid="input-edit-schedule"/></div>
        <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Location</label><input type="text" value={location} onChange={e=>setLocation(e.target.value)} className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30" data-testid="input-edit-location"/></div>
        <div className="pt-2 border-t border-[var(--warm-border)]">
          <div className="flex items-center gap-1.5 mb-3"><MessageSquare className="w-3.5 h-3.5 text-[var(--terra)]"/><span className="text-xs font-bold text-[var(--terra)] uppercase tracking-wider">Join Questions</span></div>
          <p className="text-[11px] text-muted-foreground mb-3">Applicants will see these when requesting to join.</p>
          <div className="space-y-3">
            <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Question 1 (optional)</label><input type="text" value={joinQuestion1} onChange={e=>setJoinQuestion1(e.target.value)} placeholder="What's your experience level?" className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30" data-testid="input-edit-join-q1"/></div>
            <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Question 2 (optional)</label><input type="text" value={joinQuestion2} onChange={e=>setJoinQuestion2(e.target.value)} placeholder="How did you hear about us?" className="w-full px-4 py-3 rounded-md border-[1.5px] border-[var(--warm-border)] bg-[var(--cream)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--terra)]/30" data-testid="input-edit-join-q2"/></div>
          </div>
        </div>
      </div>
      <button onClick={()=>updateMutation.mutate({shortDesc,fullDesc,organizerName,whatsappNumber,schedule,location,joinQuestion1:joinQuestion1.trim()||null,joinQuestion2:joinQuestion2.trim()||null,coverImageUrl:coverImageUrl??null})} disabled={updateMutation.isPending} className="w-full bg-[var(--terra)] text-white rounded-md py-3 text-sm font-semibold disabled:opacity-50" data-testid="button-save-club">{updateMutation.isPending?"Saving...":saved?"Saved":"Save Changes"}</button>
      <CoOrganiserSection club={club}/>
    </div>
  );
}
