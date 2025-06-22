import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "@/components/adminComponet/Sidebar";
import Navbar from "@/components/adminComponet/Navbar";
import adminApi from "@/API/adminApi";


// Payout request interface
interface PayoutRequest {
  _id: string;
  instructor: {
    _id: string;
    fullName: string;
  };
  amount: number;
  paypalEmail: string;
  requestStatus: "PENDING" | "APPROVED" | "REJECTED" | "FAILED";
  createdAt: string;
  payoutId?: string;
}

const AdminPayouts: React.FC = () => {
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState<string[]>([]); // Track processing requests

  // Fetch payout requests on mount
  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const response = await adminApi.getPayoutRequests();
        setPayouts(response.data.data || []);
        setLoading(false);
      } catch (err: any) {
        setError(
          "Failed to load payout requests: " +
            (err.response?.data?.error || err.message)
        );
        setLoading(false);
      }
    };
    fetchPayouts();
  }, []);

  // Handle approve/reject action
  const handleAction = async (
    requestId: string,
    action: "APPROVE" | "REJECT"
  ) => {
    setProcessing((prev) => [...prev, requestId]);
    try {
      const response = await adminApi.approvePayout(requestId, action);
      toast.success(response.data.message, {
        position: "top-right",
        autoClose: 3000,
      });

      // Update payout status in state
      setPayouts((prev) =>
        prev.map((payout) =>
          payout._id === requestId
            ? {
                ...payout,
                requestStatus: action === "APPROVE" ? "APPROVED" : "REJECTED",
                payoutId: response.data.payoutId,
              }
            : payout
        )
      );
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message;
      toast.error(`Failed to ${action.toLowerCase()} payout: ${errorMessage}`, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setProcessing((prev) => prev.filter((id) => id !== requestId));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-10 text-gray-600">
            <svg
              className="animate-spin h-8 w-8 mx-auto text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <p className="mt-2">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-10 text-red-500 font-medium">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 container mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Manage Payout Requests
          </h1>

          {/* Payout Requests Table */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Instructor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PayPal Email
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payouts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No payout requests found.
                      </td>
                    </tr>
                  ) : (
                    payouts.map((payout) => (
                      <tr key={payout._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payout.instructor.fullName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payout.paypalEmail}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          ${payout.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(payout.createdAt), "MMM dd, yyyy")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              payout.requestStatus === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : payout.requestStatus === "APPROVED"
                                ? "bg-green-100 text-green-800"
                                : payout.requestStatus === "REJECTED"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {payout.requestStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          {payout.requestStatus === "PENDING" ? (
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() =>
                                  handleAction(payout._id, "APPROVE")
                                }
                                disabled={processing.includes(payout._id)}
                                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                                  processing.includes(payout._id)
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }`}
                                aria-label={`Approve payout for ${payout.instructor.fullName}`}
                              >
                                {processing.includes(payout._id) ? (
                                  <svg
                                    className="animate-spin h-4 w-4 mr-2"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    />
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8v8H4z"
                                    />
                                  </svg>
                                ) : null}
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleAction(payout._id, "REJECT")
                                }
                                disabled={processing.includes(payout._id)}
                                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                                  processing.includes(payout._id)
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }`}
                                aria-label={`Reject payout for ${payout.instructor.fullName}`}
                              >
                                {processing.includes(payout._id) ? (
                                  <svg
                                    className="animate-spin h-4 w-4 mr-2"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    />
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8v8H4z"
                                    />
                                  </svg>
                                ) : null}
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400">
                              No actions available
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
      <ToastContainer />
    </>
  );
};

export default AdminPayouts;
