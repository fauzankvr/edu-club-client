import Footer from "@/components/InstructorCompontents/Footer";
import Navbar from "@/components/InstructorCompontents/Navbar";
import { Card, CardContent } from "@/components/ui/card";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Sidebar from "./Sidbar";

const data = [
  {
    name: "Jan",
    uv: 4000,
  },
  {
    name: "Feb",
    uv: 2400,
  },
  {
    name: "Mar",
    uv: 3400,
  },
];

const DashboardOverview = () => {
    return (
        <>
        <Navbar/>
        <div className="min-h-screen p-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-black">
        <Sidebar/>

          {/* Main Content */}
          <div className="md:col-span-3">
            <h1 className="text-center text-xl font-semibold mb-4">Overview</h1>

            {/* Stats */}
            <Card className="mb-4">
              <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 text-center">
                <div>
                  <p className="text-sm font-medium">Total revenue</p>
                  <p className="text-lg font-bold text-indigo-600">₹18,500</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total Enrollment</p>
                  <p className="text-lg font-bold text-indigo-600">120</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Review Rating</p>
                  <p className="text-lg font-bold text-indigo-600">4.6</p>
                </div>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card>
              <CardContent className="h-64 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="uv" fill="#4f46e5" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
            </div>
        <Footer/>
      </>
    );
};

export default DashboardOverview;
