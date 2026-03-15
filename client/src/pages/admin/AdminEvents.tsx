import * as React from "react";
import { Link } from "wouter";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { adminDeleteEvent, adminListEvents } from "@/api/admin";
import type { ClubEvent, EventCategory } from "@/data/events";
import { getEventHref } from "@/data/events";

function fmtDate(d: string) {
  try {
    const dt = new Date(`${d}T00:00:00`);
    return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "2-digit" }).format(dt);
  } catch {
    return d;
  }
}

export default function AdminEvents() {
  const [category, setCategory] = React.useState<EventCategory | "all">("all");
  const [query, setQuery] = React.useState("");
  const [events, setEvents] = React.useState<ClubEvent[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await adminListEvents(category === "all" ? undefined : category);
      setEvents(list);
    } catch (e: any) {
      setError(e?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [category]);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter(e =>
      [e.title, e.slug, e.location || "", e.shortDescription].some(x =>
        String(x).toLowerCase().includes(q)
      )
    );
  }, [events, query]);

  const onDelete = async (id: string) => {
    await adminDeleteEvent(id);
    await load();
  };

  return (
    <div>
      <PageHeader
        title="Manage Events"
        subtitle="Create, edit, and delete event pages. Upload cover and media inside each event."
      />

      <div className="container mx-auto px-4 pb-16">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="w-full sm:w-56">
              <Select value={category} onValueChange={v => setCategory(v as any)}>
                <SelectTrigger className="bg-black/40 border-gray-700 text-gray-200">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="event">Events</SelectItem>
                  <SelectItem value="training">Trainings</SelectItem>
                  <SelectItem value="organized">Organized</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by title, slug, location…"
              className="bg-black/40 border-gray-700 text-gray-200"
            />
            <Button
              type="button"
              variant="outline"
              className="border-gray-700 text-gray-200 hover:bg-black/40"
              onClick={load}
              disabled={loading}
            >
              Refresh
            </Button>
          </div>

          <Link
            href="/admin/events/new"
            className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-5 py-3 font-heading uppercase"
          >
            + New Event
          </Link>
        </div>

        {error ? (
          <div className="mt-6 border border-red-500/40 bg-red-500/10 text-red-200 p-4">
            {error}
          </div>
        ) : null}

        <div className="mt-8 border-2 border-gray-700 bg-black/30 overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="border-b border-gray-800">
              <tr className="text-gray-400 font-heading uppercase text-sm">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-gray-300">Loading…</td>
                </tr>
              ) : filtered.length ? (
                filtered.map(e => (
                  <tr key={e.id} className="border-b border-gray-800 last:border-0">
                    <td className="px-4 py-3 text-gray-200 whitespace-nowrap">
                      <span className="text-red-500 font-heading uppercase">{fmtDate(e.date)}</span>
                      {e.time ? <span className="text-gray-400"> • {e.time}</span> : null}
                    </td>
                    <td className="px-4 py-3 text-white">
                      <div className="font-heading uppercase">{e.title}</div>
                      {e.location ? <div className="text-gray-400 text-sm">{e.location}</div> : null}
                    </td>
                    <td className="px-4 py-3 text-gray-200 uppercase">{e.category}</td>
                    <td className="px-4 py-3 text-gray-400">{e.slug}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/events/${encodeURIComponent(e.id)}`}
                          className="inline-flex items-center justify-center border border-gray-700 bg-black/30 hover:bg-black/50 px-3 py-2 font-heading uppercase text-gray-200"
                        >
                          Edit
                        </Link>
                        <a
                          href={getEventHref(e)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center border border-gray-700 bg-black/30 hover:bg-black/50 px-3 py-2 font-heading uppercase text-gray-200"
                        >
                          Open
                        </a>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex items-center justify-center border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 px-3 py-2 font-heading uppercase text-red-200"
                            >
                              Delete
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="border border-gray-800 bg-black text-gray-200">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-heading uppercase text-red-500">Delete event?</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-400">
                                This will permanently remove “{e.title}” and all its media references.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-gray-700 text-gray-200 hover:bg-black/40">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => onDelete(e.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-gray-300">
                    No events yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
