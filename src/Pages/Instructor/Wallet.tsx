import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import instructorAPI from "@/API/InstructorApi";
import Navbar from "@/components/InstructorCompontents/Navbar";
import Sidebar from "./Sidbar";

interface Transaction {
  _id: string;
  payoutStatus:string;
  course: {
    _id: string;
    title: string;
    courseImageId: string;
    status: string;
  };
  student: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  instructorShare: number;
  createdAt: string;
}

const Wallet: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalPending, setTotalPending] = useState(0);
  const [paypalEmail, setPaypalEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch pending transactions
        const txResponse = await instructorAPI.getWallet();
        const txData = txResponse.data.data as Transaction[];
        console.log(txData);
        setTransactions(txData);
        setTotalPending(
          txData.filter((val)=>val.payoutStatus=="PENDING").reduce((sum, txn) => sum + txn.instructorShare, 0)
        );

        // Fetch PayPal email
        const emailResponse = await instructorAPI.getPaypalEmail();
        setPaypalEmail(emailResponse.data.profile.paypalEmail || "");

        setLoading(false);
      } catch (err) {
        setError("Failed to load wallet data: " + (err as any).message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEmailUpdate = async () => {
    if (!paypalEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypalEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    try {
      await instructorAPI.updatePaypalEmail(paypalEmail);
      setEmailError("");
      toast.success("PayPal email updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      const errorMessage =
        "Failed to update PayPal email: " + (err as any).response?.data?.error;
      setEmailError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleRedeem = async () => {
    if (!paypalEmail) {
      toast.warn("Please set a PayPal email first", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    try {
      await instructorAPI.requestPayout(paypalEmail);
      toast.success("Payout request submitted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      setTotalPending(0);
      setTransactions([]);
    } catch (err) {
      const errorMessage =
        "Error submitting payout request: " +
        (err as any).response?.data?.error;
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-10">Loading...</div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-10 text-red-500">{error}</div>
        </div>
      </div>
    );

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6">Wallet</h1>

          {/* Metrics */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold">Pending Earnings</h2>
            <p className="text-2xl text-blue-600">₹{totalPending.toFixed(2)}</p>
          </div>

          {/* PayPal Email Form */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Set PayPal Email</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="email"
                value={paypalEmail}
                onChange={(e) => {
                  setPaypalEmail(e.target.value);
                  setEmailError("");
                }}
                placeholder="Enter PayPal Email"
                className="border rounded-lg px-4 py-2 flex-1"
              />
              <button
                onClick={handleEmailUpdate}
                className="bg-green-600 text-white px-6 py-2 rounded-lg"
              >
                Save Email
              </button>
            </div>
            {emailError && <p className="text-red-500 mt-2">{emailError}</p>}
          </div>

          {/* Redeem Button */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Request Payout</h2>
            <button
              onClick={handleRedeem}
              disabled={totalPending <= 0 || !paypalEmail}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:bg-gray-400"
            >
              Redeem ₹{totalPending.toFixed(2)}
            </button>
          </div>

          {/* Pending Transactions Table */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Wallet History</h2>
            {transactions.length === 0 ? (
              <p className="text-gray-500">No wallet historys .</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-100">
                      {/* <th className="px-4 py-2 text-left">Course Image</th> */}
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Course</th>
                      <th className="px-4 py-2 text-left">Student</th>
                      <th className="px-4 py-2 text-right">Your Share</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn) => (
                      <tr key={txn._id} className="border-t">
                        {/* <td className="px-4 py-2">
                          <img
                            src={txn.course.courseImageId}
                            alt={txn.course.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                        </td> */}
                        <td className="px-4 py-2">
                          {format(new Date(txn.createdAt), "MMM dd, yyyy")}
                        </td>
                        <td className="px-4 py-2">{txn.course.title}</td>
                        <td className="px-4 py-2">
                          {`${txn.student.firstName} ${txn.student.lastName}`}
                        </td>
                        <td className="px-4 py-2 text-right">
                          ₹{txn.instructorShare.toFixed(2)}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              txn.payoutStatus === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : txn.payoutStatus === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : txn.payoutStatus === "REJECTED"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {txn.payoutStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
      <ToastContainer />
    </>
  );
};

export default Wallet;
