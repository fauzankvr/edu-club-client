import { useEffect, useState } from "react";
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
import adminApi from "@/API/adminApi";
import Loading from "@/components/studentComponents/loading";

interface OrderDetail {
  courseName: string;
  studentName: string;
  price: number;
  date: string;
  courseImage: string;
}

interface DashboardData {
  totalRevenue: number;
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  revenueByPeriod: { name: string; revenue: number }[];
  orderDetails: OrderDetail[];
}


export type FilterType = "weekly" | "monthly" | "yearly" | "custom";

export interface DashboardParams {
  filterType: FilterType;
  startDate?: string;
  endDate?: string;
}

export interface ReportParams extends DashboardParams {
  format: "pdf" | "excel";
}
const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
const [filterType, setFilterType] =
  useState<DashboardParams["filterType"]>("monthly");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      const params: DashboardParams = { filterType };
      if (filterType === "custom" && startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      const response = await adminApi.getDashboard(params);
      setData(response.data);
      setLoading(false);
    };

    fetchData();
  }, [filterType, startDate, endDate]);
  

  const handleDownload = async (format: "pdf" | "excel") => {
    try {
      const params: ReportParams = { format, filterType };
      if (filterType === "custom" && startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
  
      const response = await adminApi.getReport(params)
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `admin_report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(`Error downloading ${format} report:`, error);
    }
  };

  return (
    <>
      <Navbar />

      <div className="flex min-h-screen bg-white">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6">
          {loading || !data ? (
            <Loading />
          ) : (
            <>
              {/* Header */}
              {/* <div className="flex items-center justify-between">
                <Input
                  placeholder="Search..."
                  className="max-w-sm border border-indigo-300"
                />
              </div> */}

              {/* Filter Controls */}
              <div className="flex flex-col gap-4 sm:flex-row">
                <select
                  className="rounded border p-2"
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
                  {["weekly", "monthly", "yearly", "custom"].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt[0].toUpperCase() + opt.slice(1)}
                    </option>
                  ))}
                </select>

                {filterType === "custom" && (
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      className="rounded border p-2"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    <Input
                      type="date"
                      className="rounded border p-2"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  { label: "Total Students", value: data.totalStudents },
                  { label: "Total Teachers", value: data.totalTeachers },
                  { label: "Total Courses", value: data.totalCourses },
                ].map(({ label, value }) => (
                  <Card key={label} className="border border-indigo-200">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-gray-600">{label}</p>
                      <p className="mt-2 text-2xl font-bold text-black">
                        {value.toString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Download buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border border-indigo-300"
                  onClick={() => handleDownload("pdf")}
                >
                  <Icon icon="mdi:file-download-outline" className="mr-2" />
                  Download Report (.pdf)
                </Button>

                <Button
                  variant="outline"
                  className="border border-indigo-300"
                  onClick={() => handleDownload("excel")}
                >
                  <Icon icon="mdi:file-download-outline" className="mr-2" />
                  Download Report (.excel)
                </Button>
              </div>

              {/* Chart */}
              <Card className="border border-indigo-200">
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-gray-600">Total Revenue</p>
                    <Button
                      variant="outline"
                      className="border-indigo-300 text-sm text-indigo-600"
                    >
                      {filterType[0].toUpperCase() + filterType.slice(1)}
                    </Button>
                  </div>

                  <p className="text-2xl font-bold text-black">
                    ${data.totalRevenue.toFixed(2)}
                  </p>

                  {/* ✅ New: Total Share (20% of Total Revenue) */}
                  <p className="mb-4 text-base font-medium text-gray-700">
                    Total Share (15%):{" "}
                    <span className="font-semibold text-black">
                      $
                      {(data.totalRevenue - data.totalRevenue * 0.85).toFixed(
                        2
                      )}
                    </span>
                  </p>

                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data.revenueByPeriod}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="revenue"
                        fill="#4f46e5"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
                </Card>
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
            </>
          )}
        </main>
      </div>
    </>
  );  
};

export default Dashboard;
