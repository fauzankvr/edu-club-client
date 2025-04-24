import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Icon } from "@iconify/react";
import Navbar from "@/components/adminComponet/Navbar";
import Sidebar from "@/components/adminComponet/Sidebar";

const data = [
  { name: "Jan", revenue: 20000 },
  { name: "Feb", revenue: 32000 },
  { name: "Mar", revenue: 45000 },
  { name: "Apr", revenue: 30000 },
  { name: "May", revenue: 60000 },
  { name: "Jun", revenue: 42000 },
  { name: "Jul", revenue: 37000 },
  { name: "Aug", revenue: 29000 },
  { name: "Sep", revenue: 31000 },
  { name: "Oct", revenue: 23000 },
  { name: "Nov", revenue: 12000 },
  { name: "Dec", revenue: 50000 },
];

const Dashboard = () => {
  return (
    <>
    <Navbar/>
    <div className="min-h-screen flex bg-white">
      {/* Sidebar */}
      <Sidebar/>

      {/* Main Content */}
      <main className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Input
            placeholder="Search..."
            className="max-w-sm border border-indigo-300"
          />
          {/* <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500" />
            <span className="font-medium text-gray-700">Admin</span>
          </div> */}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Students", value: "1,800" },
            { label: "Total Teachers", value: "120" },
            { label: "Total Courses", value: "108" },
          ].map(({ label, value }) => (
            <Card key={label} className="border border-indigo-200">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-600">{label}</p>
                <p className="text-2xl font-bold text-black mt-2">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Download buttons */}
        <div className="flex gap-2">
          <Button variant="outline" className="border border-indigo-300">
            <Icon icon="mdi:file-download-outline" className="mr-2" /> Download
            Report (.pdf)
          </Button>
          <Button variant="outline" className="border border-indigo-300">
            <Icon icon="mdi:file-download-outline" className="mr-2" /> Download
            Report (.excel)
          </Button>
        </div>

        {/* Chart */}
        <Card className="border border-indigo-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-gray-600">Total Revenue</p>
              <Button
                variant="outline"
                className="text-indigo-600 border-indigo-300 text-sm"
              >
                Monthly
              </Button>
            </div>
            <p className="text-2xl font-bold text-black mb-4">₹720,873.00</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </main>
    </div>
    </>
  );
};

export default Dashboard;
