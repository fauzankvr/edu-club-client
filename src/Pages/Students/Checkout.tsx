import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import studentAPI from "@/API/StudentApi";
import { useNavigate, useParams } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { AxiosError } from "axios";

const clientid = import.meta.env.VITE_PAYPAL_CLIENT_ID;

function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();

  const initialOptions = {
    clientId: clientid,
    "enable-funding": "venmo",
    "disable-funding": "",
    "buyer-country": "US",
    currency: "USD",
    components: "buttons",
    "data-sdk-integration-source": "developer-studio",
  };

  return (
    <>
      <Toaster />
      <div>
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
                const orderData = response.data;
                return orderData.orderId;
              } catch (err) {
                const error = err as AxiosError;
                 const message =
                   error.response?.data ??
                   "Could not initiate PayPal Checkout.";

                 toast.error(
                   typeof message === "string"
                     ? message
                     : "Could not initiate PayPal Checkout."
                );
                if (message === "you alredy purchased") {
                  setTimeout(() => {
                    navigate("/mylearing");
                  }, 1500); 
                }
              }
            }}
            onApprove={async (data) => {
              try {
                const response = await studentAPI.captureOrder(data.orderID);
                const orderData = response.data;

                if (orderData?.orderID1) {
                  toast.success(`Transaction Completed: ${orderData.orderID1}`);
                  navigate(`/courses/checkout/success/${orderData.orderID1}`);
                } else {
                  toast.error("Transaction failed.");
                }
              } catch (error) {
                console.error(error);
                toast.error("Transaction failed. Please try again.");
              }
            }}
          />
        </PayPalScriptProvider>
      </div>
    </>
  );
}

export default Checkout;
