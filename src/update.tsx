// The update button: appears in the header when GitHub has a newer release,
// shows what changed, installs it, and reloads the page once the new version
// is running.
import { useEffect, useState } from "react";
import { ArrowUpCircle, ExternalLink, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

type UpdateInfo = {
  current: string;
  latest: string;
  available: boolean;
  notes: string[];
  url: string;
};

const CHECK_EVERY_MS = 30 * 60_000;
const UPDATED_KEY = "focus-updated";
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchInfo(): Promise<UpdateInfo | null> {
  try {
    const r = await fetch("/api/update");
    return r.ok ? ((await r.json()) as UpdateInfo) : null;
  } catch {
    return null;
  }
}

export function UpdateButton() {
  const [info, setInfo] = useState<UpdateInfo | null>(null),
    [open, setOpen] = useState(false),
    [updating, setUpdating] = useState(false),
    [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    const check = () => fetchInfo().then((i) => alive && i && setInfo(i));
    void check();
    const timer = setInterval(check, CHECK_EVERY_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  async function update() {
    if (!info) return;
    setUpdating(true);
    setError("");
    try {
      const r = await fetch("/api/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      if (!r.ok)
        throw Error(
          ((await r.json().catch(() => null)) as { error?: string } | null)
            ?.error ?? "The update did not finish.",
        );
      // The server restarts into the new version; reload as soon as it answers.
      for (let i = 0; i < 90; i++) {
        await wait(1000);
        const now = await fetchInfo();
        if (now && now.current === info.latest) {
          try {
            localStorage.setItem(
              UPDATED_KEY,
              JSON.stringify({ version: info.latest, url: info.url }),
            );
          } catch {}
          window.location.reload();
          return;
        }
      }
      throw Error("The new version has not come up yet. Reload in a moment.");
    } catch (e) {
      setError((e as Error).message);
      setUpdating(false);
    }
  }

  if (!info?.available) return null;
  return (
    <>
      <button className="update-pill" onClick={() => setOpen(true)}>
        <ArrowUpCircle size={16} />
        Update
        <b>v{info.latest}</b>
      </button>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!updating) setOpen(o);
        }}
      >
        <DialogContent className="update-dialog" showCloseButton={false}>
          <div className="update-head">
            <span className="update-icon" aria-hidden="true">
              <ArrowUpCircle size={22} />
            </span>
            <div>
              <DialogTitle>v{info.latest}</DialogTitle>
              <DialogDescription>You have v{info.current}</DialogDescription>
            </div>
          </div>
          {info.notes.length > 0 && (
            <ul className="update-notes">
              {info.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          )}
          <a
            className="update-link"
            href={info.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Release notes <ExternalLink size={13} />
          </a>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <div className="update-actions">
            <button
              type="button"
              className="keep"
              disabled={updating}
              onClick={() => setOpen(false)}
            >
              Later
            </button>
            <button
              type="button"
              className="primary"
              disabled={updating}
              onClick={update}
            >
              {updating ? (
                <>
                  <Loader2 size={16} className="spin" /> Updating…
                </>
              ) : (
                "Update now"
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Shown once after the page reloads into a freshly installed version. */
export function UpdatedToast() {
  const [done, setDone] = useState<{ version: string; url: string } | null>(
    null,
  );
  useEffect(() => {
    try {
      const raw = localStorage.getItem(UPDATED_KEY);
      if (!raw) return;
      localStorage.removeItem(UPDATED_KEY);
      setDone(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(null), 8000);
    return () => clearTimeout(t);
  }, [done]);
  if (!done) return null;
  return (
    <div className="updated-toast" role="status">
      <span className="updated-dot" aria-hidden="true" />
      Updated to v{done.version}
      <a href={done.url} target="_blank" rel="noopener noreferrer">
        Release notes <ExternalLink size={12} />
      </a>
      <button aria-label="Dismiss" onClick={() => setDone(null)}>
        <X size={14} />
      </button>
    </div>
  );
}
