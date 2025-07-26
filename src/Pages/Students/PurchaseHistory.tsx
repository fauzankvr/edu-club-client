import { Card, CardContent } from "@/components/ui/card";
import { Purchase } from "@/Interface/Purchase";
import { Icon } from "@iconify/react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import studentAPI from "@/API/StudentApi";
import { toast, Toaster } from "react-hot-toast";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

interface PurchaseHistoryProps {
  purchases: Purchase[];
}

const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
const initialOptions = {
  clientId: clientId || "",
  "enable-funding": "venmo",
  "disable-funding": "",
  "buyer-country": "US",
  currency: "USD",
  components: "buttons",
  "data-sdk-integration-source": "developer-studio",
};

export default function PurchaseHistory({ purchases }: PurchaseHistoryProps) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(
    null
  );

const getStatusBadge = (status: string) => {
  const normalizedStatus = status.toLowerCase();

  const statusStyles: { [key: string]: string } = {
    paid: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-blue-100 text-blue-800",
  };

  const displayTextMap: { [key: string]: string } = {
    paid: "Paid",
    failed: "Failed",
    pending: "Failed", // Display as "Failed" even if status is "pending"
    refunded: "Refunded",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
        statusStyles[
          normalizedStatus === "pending" ? "failed" : normalizedStatus
        ] || "bg-gray-100 text-gray-800"
      }`}
    >
      {displayTextMap[normalizedStatus] || "Unknown"}
    </span>
  );
};


  const handleRetryPayment = (paypalOrderId: string) => {
    setSelectedPurchaseId(paypalOrderId);
    setIsModalOpen(true);
  };

  const captureOrder = async (orderID: string) => {
    try {
      const response = await studentAPI.captureOrder(orderID);
      const orderData = response.data.data;

      if (orderData?.orderID1) {
        toast.success(`Transaction Completed: ${orderData.orderID1}`);
        setIsModalOpen(false);
        if (selectedPurchaseId) {
          navigate(`/courses/checkout/success/${orderData.orderID1}`);
          await studentAPI.removeFromWishlist(selectedPurchaseId);
        }
      } else {
        toast.error("Transaction failed.");
      }
    } catch (error) {
      console.error("Capture error:", error);
      toast.error("Transaction failed. Please try again.");
    }
  };

  if (!clientId) {
    console.error("PayPal Client ID is missing");
    toast.error("PayPal configuration error. Please contact support.");
    return <div>Payment configuration error. Please try again later.</div>;
  }

  return (
    <>
      <Toaster />
      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Icon icon="mdi:cart-outline" className="w-6 h-6 text-indigo-600" />
            <h3 className="text-xl font-bold text-gray-900">
              Your Purchase History
            </h3>
          </div>
          {purchases.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-base mb-4">
                No purchases found.
              </p>
              <a
                href="/courses"
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium underline"
              >
                Explore Courses
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 text-sm font-semibold text-gray-700">
                      Course
                    </th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-700">
                      Purchase Date
                    </th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-700">
                      Price
                    </th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase) => (
                    <tr
                      key={purchase.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4 flex items-center gap-3">
                        <img
                          src={purchase.courseDetails.courseImageId}
                          alt={purchase.courseDetails.title}
                          className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://via.placeholder.com/48";
                          }}
                        />
                        <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {purchase.courseDetails.title}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {new Date(purchase.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        ₹{purchase.priceUSD.toFixed(2)}
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(purchase.status)}
                      </td>
                      <td className="py-4 px-4">
                        {purchase.status.toLowerCase() === "pending" && (
                          <button
                            onClick={() =>
                              handleRetryPayment(purchase.paypalOrderId)
                            }
                            className="text-indigo-600 cursor-pointer hover:text-indigo-800 text-sm font-medium underline focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            aria-label={`Retry payment for ${purchase.courseDetails.title}`}
                          >
                            Retry
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Retry Payment</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <PayPalScriptProvider options={initialOptions}>
              <PayPalButtons
                style={{
                  shape: "rect",
                  layout: "vertical",
                  color: "gold",
                  label: "paypal",
                }}
                createOrder={() => Promise.resolve(selectedPurchaseId || "")}
                onApprove={() => captureOrder(selectedPurchaseId || "")}
                onError={(err) => {
                  console.error("PayPal Buttons error:", err);
                  toast.error(
                    "An error occurred with PayPal. Please try again."
                  );
                }}
              />
            </PayPalScriptProvider>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
