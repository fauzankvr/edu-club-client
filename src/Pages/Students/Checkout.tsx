import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import studentAPI from "@/API/StudentApi";
import { useNavigate, useParams } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { AxiosError } from "axios";

// Load PayPal client ID from environment variables
const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

// PayPal configuration options
const initialOptions = {
  clientId: clientId || "",
  "enable-funding": "venmo",
  "disable-funding": "",
  "buyer-country": "US",
  currency: "USD",
  components: "buttons",
  "data-sdk-integration-source": "developer-studio",
};

function Checkout() {
  const { id } = useParams(); // Course ID from URL
  const navigate = useNavigate();

  // Validate PayPal client ID
  if (!clientId) {
    console.error("PayPal Client ID is missing");
    toast.error("PayPal configuration error. Please contact support.");
    return <div>Payment configuration error. Please try again later.</div>;
  }

  return (
    <>
      <Toaster />
      <div className="p-4 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Checkout</h2>
        <PayPalScriptProvider options={initialOptions}>
          <PayPalButtons
            style={{
              shape: "rect",
              layout: "vertical",
              color: "gold",
              label: "paypal",
            }}
            createOrder={async () => {
              try {
                const response = await studentAPI.createOrder([
                  {
                    id: id,
                    quantity: 1,
                  },
                ]);
                const orderData = response.data.data;

                // Handle pending or new order
                if (orderData?.status?.includes("Already Exists")) {
                  toast.success("Resuming your pending payment...");
                } else {
                  toast.success("Order created successfully.");
                }

                // Validate orderId
                if (!orderData.orderId) {
                  throw new Error("No PayPal order ID received");
                }

                return orderData.orderId;
              } catch (err) {
                console.log(err)
                const error = err as AxiosError<{error:string}>;
                const message =
                  (error.response?.data?.error) ||
                  "Could not initiate PayPal Checkout.";
                toast.error(
                  typeof message === "string"
                    ? message
                    : "Could not initiate PayPal Checkout."
                );

                // Redirect if course already purchased
                if (message === "You already purchased this course") {
                  setTimeout(() => {
                    navigate("/mylearning");
                  }, 1500);
                }

                throw new Error(message); // Stop PayPal flow on error
              }
            }}
            onApprove={async (data) => {
              console.log("onApprove triggered with data:", data);
              try {
                const response = await studentAPI.captureOrder(data.orderID);
                console.log("Capture response:", response.data);
                const orderData = response.data.data;

                if (orderData?.orderID1) {
                  toast.success(`Transaction Completed: ${orderData.orderID1}`);
                  console.log("Transaction completed:", orderData);
                  if (!id) return;
                  navigate(`/courses/checkout/success/${orderData.orderID1}`);
                  await studentAPI.removeFromWishlist(id);
                } else {
                  toast.error("Transaction failed.");
                }
              } catch (error) {
                console.error("Capture error:", error);
                // toast.error("Transaction failed. Please try again.");
              }
            }}
            onError={(err) => {
              console.error("PayPal Buttons error:", err);
              // toast.error("An error occurred with PayPal. Please try again.");
            }}
          />
        </PayPalScriptProvider>
      </div>
    </>
  );
}

export default Checkout;
