import { useEffect, useState } from "react";
import { Trophy, Recycle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import PageHeader from "@/components/PageHeader";

interface Row {
  user_id: string;
  display_name: string;
  points: number;
}

const Leaderboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await (supabase as any).rpc("get_leaderboard_counts");
      const merged: Row[] = (data ?? [])
        .filter((c: any) => {
          const name = (c.display_name ?? "").trim();
          return name !== "" && name.toLowerCase() !== "anonymous";
        })
        .map((c: any) => ({
          user_id: c.user_id,
          display_name: c.display_name,
          points: Number(c.points) ?? 0,
        }));
      merged.sort((a, b) => b.points - a.points);
      setRows(merged);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="paper-grain">
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
        <PageHeader eyebrow="Rankings" icon={<Trophy className="w-4 h-4" />} title={t("leaderboardTitle")} subtitle={t("leaderboardSubtitle")} />

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">{t("loadingLeaderboard")}</div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">{t("noPlayersYet")}</div>
        ) : (
          <ol className="border-t-2 border-primary">
            {rows.map((r, i) => {
              const isMe = user?.id === r.user_id;
              const top = i < 3;
              return (
                <li
                  key={r.user_id}
                  className={`grid grid-cols-[3rem_1fr_auto] sm:grid-cols-[4.5rem_1fr_auto] items-center gap-3 py-4 px-2 border-b border-border ${
                    isMe ? "bg-accent/15" : ""
                  }`}
                >
                  <span
                    className={`tabular-nums ${
                      top ? "text-3xl sm:text-4xl text-primary" : "text-lg text-muted-foreground"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className={`truncate ${top ? "text-lg sm:text-xl text-primary" : "text-base"}`}>
                    {r.display_name}
                    {isMe && <span className="ml-2 text-sm text-secondary">({t("you")})</span>}
                  </p>
                  <div className="flex items-center gap-2 text-primary">
                    <Recycle className="w-4 h-4 text-secondary" />
                    <span className="text-lg tabular-nums">{r.points}</span>
                    <span className="text-sm text-muted-foreground">{t("points")}</span>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
