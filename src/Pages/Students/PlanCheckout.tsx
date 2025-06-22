import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import studentAPI from "@/API/StudentApi";
import { useNavigate, useParams } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import adminApi from "@/API/adminApi";

interface Feature {
  description: string;
  icon: string;
  isAvailable: boolean;
}

interface Plan {
  _id: string;
  name: string;
  price: number;
  billingPeriod: string;
  features: Feature[];
  isFeatured: boolean;
  isBlocked: boolean;
}


interface CreateOrderResponse {
  orderId: string;
  status: string;
}


const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
const CURRENCY = import.meta.env.VITE_PAYPAL_CURRENCY || "USD"; 

const initialOptions = {
  clientId: clientId || "",
  "enable-funding": "venmo",
  "disable-funding": "",
  "buyer-country": "IN",
  currency: CURRENCY,
  components: "buttons",
  "data-sdk-integration-source": "developer-studio",
};

function PlanCheckout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); // For free plan and PayPal

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError("Invalid plan ID");
        setLoading(false);
        return;
      }

      try {
        const [planRes, profileRes] = await Promise.all([
          adminApi.findPlan(id),
          studentAPI.getProfile(),
        ]);
        setPlan(planRes.data.data);
        setUserId(profileRes.profile._id);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load plan or user details. Please try again.");
        setLoading(false);
        toast.error("Failed to load details.");
      }
    };

    fetchData();
  }, [id]);

  if (!clientId) {
    console.error("PayPal Client ID is missing");
    toast.error("PayPal configuration error. Please contact support.");
    return <div>Payment configuration error. Please try again later.</div>;
  }

  if (loading || !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50">
        <div className="text-indigo-600 text-xl">Loading details...</div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50">
        <div className="text-red-500 text-xl">{error || "Plan not found"}</div>
      </div>
    );
  }

  if (plan.price === 0) {
    const handleFreePlan = async () => {
      setIsProcessing(true);
      try {
        // await studentAPI.checkout({
        //   userId,
        //   planId: plan._id,
        //   paymentMethod: "free",
        //   amount: 0,
        //   currency: CURRENCY,
        // });
        toast.success("Free plan activated!");
        navigate("/plans");
      } catch (err) {
        console.error("Free plan activation failed:", err);
        toast.error("Failed to activate free plan.");
      } finally {
        setIsProcessing(false);
      }
    };

    return (
      <>
        <Toaster />
        <div className="p-4 max-w-md mx-auto bg-white rounded-2xl shadow-xl mt-8">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4 text-center">
            Checkout: {plan.name}
          </h2>
          <p className="text-lg text-gray-700 mb-6 text-center">
            Amount: {CURRENCY} 0 (Free)
          </p>
          <button
            onClick={handleFreePlan}
            disabled={isProcessing}
            className={`w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors ${
              isProcessing ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isProcessing ? "Processing..." : "Activate Free Plan"}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Toaster />
      <div className="p-4 max-w-md mx-auto bg-white rounded-2xl shadow-xl mt-8">
        <h2 className="text-2xl font-bold text-indigo-700 mb-4 text-center">
          Checkout: {plan.name}
        </h2>
        <p className="text-lg text-gray-700 mb-6 text-center">
          Amount: {CURRENCY} {plan.price.toLocaleString()}
        </p>
        <PayPalScriptProvider options={initialOptions}>
          <PayPalButtons
            style={{
              shape: "rect",
              layout: "vertical",
              color: "gold",
              label: "paypal",
            }}
            disabled={isProcessing}
            createOrder={async () => {
              setIsProcessing(true);
              try {
                const response = await studentAPI.createPlanOrder({
                  planId: plan._id,
                  userId,
                });
                const orderData = response.data.data as CreateOrderResponse;

                if (orderData?.status?.includes("Already Exists")) {
                  toast.success("Resuming your pending payment...");
                } else {
                  toast.success("Order created successfully.");
                }

                if (!orderData.orderId) {
                  throw new Error("No PayPal order ID received");
                }

                return orderData.orderId;
              } catch (err) {
                const error = err as AxiosError;
                const message =
                  (error.response?.data as { error: string })?.error ||
                  "Could not initiate PayPal Checkout.";
                toast.error(
                  typeof message === "string"
                    ? message
                    : "Could not initiate PayPal Checkout."
                );

                if (message.includes("You already purchased this plan")) {
                  setTimeout(() => navigate("/dashboard"), 1500);
                }

                throw new Error(message);
              } finally {
                setIsProcessing(false);
              }
            }}
            onApprove={async (data) => {
              setIsProcessing(true);
              try {
                const response = await studentAPI.capturePlanOrder(
                  data.orderID
                );
                const orderData = response.data ;
                if (response.data?.success) {
                  toast.success(`Transaction Completed: ${orderData.orderId}`);
                  navigate(`/plans`);
                } else {
                  toast.error("Transaction failed.");
                }
              } catch (error) {
                console.error("Capture error:", error);
                toast.error("Transaction failed. Please try again.");
              } finally {
                setIsProcessing(false);
              }
            }}
            onError={(err) => {
              console.error("PayPal Buttons error:", err);
              toast.error("An error occurred with PayPal. Please try again.");
              setIsProcessing(false);
            }}
          />
        </PayPalScriptProvider>
      </div>
    </>
  );
}

export default PlanCheckout;
