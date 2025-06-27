import { useEffect, useState } from "react";
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
import instructorAPI from "@/API/InstructorApi";
import Loading from "@/components/studentComponents/loading";

interface OrderDetail {
  courseName: string;
  courseImage: string;
  studentName: string;
  price: number;
  date: string;
}

interface DashboardData {
  totalRevenue: number;
  totalEnrollments: number;
  monthlyRevenue: { name: string; uv: number }[];
  payoutSummary: { totalPayout: number; pendingPayout: number };
  reviewRating: number;
  orderDetails: OrderDetail[];
}

const DashboardOverview = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<
    "weekly" | "monthly" | "yearly" | "custom"
  >("monthly");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params: {
          filterType: string;
          startDate?: string;
          endDate?: string;
        } = { filterType };
        if (filterType === "custom" && startDate && endDate) {
          params.startDate = startDate;
          params.endDate = endDate;
        }
        const response = await instructorAPI.getDashboard(params);
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [filterType, startDate, endDate]);


  return (
    <>
      <Navbar />
      {loading || !data ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loading />
        </div>
      ) : (
        <>
          {/* Main Dashboard Layout */}
          <div className="min-h-screen p-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-black">
            <Sidebar />

            {/* Main Content */}
            <div className="md:col-span-3">
              <h1 className="text-center text-xl font-semibold mb-4">
                Overview
              </h1>

              {/* Filter Controls */}
              <div className="mb-4 flex flex-col sm:flex-row gap-4">
                <select
                  className="p-2 border rounded"
                  value={filterType}
                  onChange={(e) =>
                    setFilterType(
                      e.target.value as
                        | "weekly"
                        | "monthly"
                        | "yearly"
                        | "custom"
                    )
                  }
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="custom">Custom Range</option>
                </select>
                {filterType === "custom" && (
                  <div className="flex gap-2">
                    <input
                      type="date"
                      className="p-2 border rounded"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    <input
                      type="date"
                      className="p-2 border rounded"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Stats */}
              <Card className="mb-4">
                <CardContent className="grid grid-cols-1 sm:grid-cols-4 gap-4 py-6 text-center">
                  <div>
                    <p className="text-sm font-medium">Total Revenue</p>
                    <p className="text-lg font-bold text-indigo-600">
                      ${data.totalRevenue.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total Enrollment</p>
                    <p className="text-lg font-bold text-indigo-600">
                      {data.totalEnrollments}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Review Rating</p>
                    <p className="text-lg font-bold text-indigo-600">
                      {data.reviewRating.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Pending Payout</p>
                    <p className="text-lg font-bold text-indigo-600">
                      ${data.payoutSummary.pendingPayout.toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Bar Chart */}
              <Card className="mb-4">
                <CardContent className="h-64 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="uv" fill="#4f46e5" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Order Details */}
              <Card>
                <CardContent>
                  <h2 className="text-lg font-semibold mb-4">Order Details</h2>
                  {data.orderDetails.length === 0 ? (
                    <p>No orders found.</p>
                  ) : (
                    <div className="space-y-4">
                      {data.orderDetails.map((order, index) => (
                        <div
                          key={index}
                          className="flex items-center p-4 border rounded-lg shadow-sm"
                        >
                          <img
                            src={order.courseImage}
                            alt={order.courseName}
                            className="w-16 h-16 object-cover rounded mr-4"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{order.courseName}</p>
                            <p className="text-sm text-gray-600">
                              Student: {order.studentName}
                            </p>
                            <p className="text-sm text-gray-600">
                              Price: ${order.price.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600">
                              Date: {new Date(order.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          <Footer />
        </>
      )}
    </>
  );
  
};

export default DashboardOverview;
