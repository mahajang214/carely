import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { MapPin, IndianRupee } from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A"];

export default function AnalyticsCharts({ monthlyRevenue, mostActiveCities }) {
  return (
    <>
      {/* Monthly Revenue */}
      <div className="bg-white shadow rounded p-6">
        <div className="flex items-center gap-2 mb-4 text-lg font-semibold">
          <IndianRupee /> Monthly Revenue
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={monthlyRevenue.map((item) => ({
              month: `Month ${item._id.month}`,
              revenue: item.totalRevenue,
            }))}
          >
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#0088FE" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Most Active Cities */}
      <div className="bg-white shadow rounded p-6">
        <div className="flex items-center gap-2 mb-4 text-lg font-semibold">
          <MapPin /> Most Active Cities
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={mostActiveCities.map((city) => ({
                name: city._id,
                value: city.userCount,
              }))}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            >
              {mostActiveCities.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
