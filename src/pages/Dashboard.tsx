import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Recycle, Award, TreePine } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface Scan {
  date: string;
  category: string;
  recyclable: boolean;
}

const Dashboard = () => {
  const { t } = useTranslation();
  const [scans, setScans] = useState<Scan[]>([]);
  const [stats, setStats] = useState({
    totalScans: 0,
    recyclableCount: 0,
    carbonSaved: 0,
    treesEquivalent: 0,
  });

  useEffect(() => {
    // Load scans from localStorage
    const savedScans = JSON.parse(localStorage.getItem("recycleScans") || "[]");
    setScans(savedScans);

    // Calculate stats
    const totalScans = savedScans.length;
    const recyclableCount = savedScans.filter((s: Scan) => s.recyclable).length;
    const carbonSaved = recyclableCount * 2.5; // kg of CO2 per item
    const treesEquivalent = Math.round(carbonSaved / 20); // 1 tree absorbs ~20kg CO2/year

    setStats({
      totalScans,
      recyclableCount,
      carbonSaved: Math.round(carbonSaved * 10) / 10,
      treesEquivalent,
    });
  }, []);

  // Process data for charts
  const getCategoryData = () => {
    const categories: { [key: string]: number } = {};
    scans.forEach((scan) => {
      const cat = scan.category;
      categories[cat] = (categories[cat] || 0) + 1;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  const getTrendData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split("T")[0];
    });

    return last7Days.map((date) => ({
      date: new Date(date).toLocaleDateString("en-MY", { month: "short", day: "numeric" }),
      scans: scans.filter((s) => s.date.startsWith(date)).length,
    }));
  };

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent break-words px-2">
          {t("impactDashboard")}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground break-words px-4">
          {t("trackYourJourney")}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="p-6 shadow-custom-lg hover:shadow-custom-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Recycle className="w-6 h-6 text-primary" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold mb-1">{stats.totalScans}</div>
          <div className="text-xs sm:text-sm text-muted-foreground break-words">{t("itemsScanned")}</div>
        </Card>

        <Card className="p-6 shadow-custom-lg hover:shadow-custom-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <Award className="w-6 h-6 text-secondary" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold mb-1">{stats.recyclableCount}</div>
          <div className="text-xs sm:text-sm text-muted-foreground break-words">{t("recyclableItems")}</div>
        </Card>

        <Card className="p-6 shadow-custom-lg hover:shadow-custom-xl transition-shadow gradient-primary text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <TreePine className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold mb-1 break-words">{stats.carbonSaved} kg</div>
          <div className="text-xs sm:text-sm text-white/90 break-words">{t("co2SavedKg")}</div>
        </Card>

        <Card className="p-6 shadow-custom-lg hover:shadow-custom-xl transition-shadow gradient-secondary text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <TreePine className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold mb-1">{stats.treesEquivalent}</div>
          <div className="text-xs sm:text-sm text-white/90 break-words">{t("treesEquivalent")}</div>
        </Card>
      </div>

      {scans.length === 0 ? (
        <Card className="p-12 text-center shadow-custom-lg">
          <Recycle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">{t("noScansYet")}</h3>
          <p className="text-muted-foreground mb-6">
            {t("noScansDesc")}
          </p>
          <a href="/recycle">
            <button className="px-6 py-3 rounded-lg gradient-primary text-white font-semibold">
              {t("startScanning")}
            </button>
          </a>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <Card className="p-6 shadow-custom-lg">
            <h2 className="text-lg sm:text-xl font-semibold mb-6 break-words">{t("itemsByCategory")}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getCategoryData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getCategoryData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Scan Trend */}
          <Card className="p-6 shadow-custom-lg">
            <h2 className="text-lg sm:text-xl font-semibold mb-6 break-words">{t("scanHistory7Days")}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getTrendData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="scans" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Impact Summary */}
          <Card className="p-6 shadow-custom-lg lg:col-span-2">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 break-words">{t("impactSummary")}</h2>
            <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <div className="text-3xl sm:text-4xl mb-2">💧</div>
                <div className="text-xl sm:text-2xl font-bold text-primary mb-1 break-words">
                  {Math.round(Number(stats.recyclableCount) * 1.5)}L
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground break-words">{t("waterSaved")}</div>
              </div>
              <div className="text-center p-4 bg-secondary/5 rounded-lg">
                <div className="text-3xl sm:text-4xl mb-2">⚡</div>
                <div className="text-xl sm:text-2xl font-bold text-secondary mb-1 break-words">
                  {Math.round(Number(stats.recyclableCount) * 0.8)} kWh
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground break-words">{t("energySaved")}</div>
              </div>
              <div className="text-center p-4 bg-accent/5 rounded-lg">
                <div className="text-3xl sm:text-4xl mb-2">🏆</div>
                <div className="text-xl sm:text-2xl font-bold text-accent mb-1 break-words">
                  Level {Math.floor(Number(stats.totalScans) / 10) + 1}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground break-words">{t("ecoWarrior")}</div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
