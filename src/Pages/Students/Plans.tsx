import { useEffect, useState } from "react";
import Navbar from "@/components/studentComponents/Navbar";
import Footer from "@/components/studentComponents/Footer";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import studentAPI from "@/API/StudentApi";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";

export interface IFeature {
  description: string;
  icon: string;
  isAvailable?: boolean;
  _id?: string;
}

export interface IPlan {
  _id: string;
  name: string;
  price: number;
  billingPeriod: "forever" | "year" | "month";
  features: IFeature[];
  isFeatured: boolean;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IActivePlan {
  _id: string;
  userId: string;
  planId: IPlan; 
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  amount: number;
  currency: string;
  paymentMethod: "paypal" | "free";
  transactionId?: string;
  startDate: string;
  endDate?: string;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

const Plans = () => {
  const [plans, setPlans] = useState<IPlan[]>([]);
  const [activePlan, setActivePlan] = useState<IActivePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const [plansRes, planRes] = await Promise.all([
          studentAPI.getPlans(),
          studentAPI.getPlan(),
        ]);
        console.log("Plans response:", plansRes.data.data);
        console.log("Active plan response:", planRes.data.data);
        setPlans(plansRes.data.data);
        if (planRes.data.success && planRes.data.data) {
          setActivePlan(planRes.data.data);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000); // Stop confetti after 5s
        }
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch plans:", err);
        setError("Failed to load plans. Please try again later.");
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const getBillingPeriodText = (period: string) => {
    switch (period) {
      case "forever":
        return "/ FOREVER";
      case "year":
        return "/ YEAR";
      case "month":
        return "/ MONTH";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-indigo-600 text-xl"
        >
          Loading plans...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 text-xl"
        >
          {error}
        </motion.div>
      </div>
    );
  }

  if (activePlan) {
    return (
      <>
        <Navbar />
        {showConfetti && <Confetti />}
        <section className="py-16 bg-gradient-to-b from-green-50 to-white min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto px-4"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-green-700 mb-8 text-center tracking-tight">
              Thank You for Being a Member!
            </h2>
            <p className="text-lg text-gray-600 mb-12 text-center">
              We're grateful for your support. Enjoy the premium benefits of
              your{" "}
              <span className="font-bold text-green-600">
                {activePlan.planId?.name}
              </span>{" "}
              plan!
            </p>
            <Card className="relative bg-white rounded-2xl shadow-2xl border border-green-100 overflow-hidden">
              <CardHeader className="pb-4 bg-gradient-to-r from-green-100 to-green-200">
                <div className="flex items-center gap-3">
                  <Icon icon="mdi:heart" className="text-2xl text-green-600" />
                  <h3 className="text-2xl font-bold text-green-700">
                    {activePlan.planId.name}
                  </h3>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-extrabold text-green-900">
                    ₹{activePlan.amount.toLocaleString()}
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    {getBillingPeriodText(activePlan.planId.billingPeriod)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  {activePlan.planId.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <Icon
                        icon={
                          feature.isAvailable
                            ? "mdi:check-circle"
                            : "mdi:close-circle"
                        }
                        className={`text-lg ${
                          feature.isAvailable
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      />
                      <span
                        className={`text-gray-700 ${
                          !feature.isAvailable
                            ? "text-gray-400 line-through"
                            : ""
                        }`}
                      >
                        {feature.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => navigate("/dashboard")} // Adjust route as needed
                  className="w-full py-6 text-lg font-semibold rounded-xl bg-gradient-to-r from-green-500 to-green-700 text-white hover:from-green-600 hover:to-green-800"
                >
                  Explore Your Benefits
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <section className="py-16 bg-gradient-to-b from-indigo-50 to-white min-h-screen flex items-center justify-center">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-extrabold text-indigo-700 mb-12 text-center tracking-tight"
          >
            Choose Your Perfect Plan
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatePresence>
              {plans.map((plan) => (
                <motion.div
                  key={plan._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className={`group relative bg-white rounded-2xl shadow-xl  border border-indigo-100 overflow-hidden transition-transform duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                      plan.isFeatured ? "scale-105 border-indigo-300" : ""
                    }`}
                  >
                    {plan.isFeatured && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white text-xs font-bold px-4 py-1 rounded-bl-lg shadow">
                        BEST VALUE
                      </div>
                    )}
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <Icon
                          icon={
                            plan.isFeatured
                              ? "mdi:star-circle"
                              : "mdi:star-circle-outline"
                          }
                          className={`text-2xl ${
                            plan.isFeatured
                              ? "text-yellow-400"
                              : "text-indigo-400"
                          }`}
                        />
                        <h3 className="text-2xl font-bold text-indigo-700">
                          {plan.name}
                        </h3>
                      </div>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-extrabold text-indigo-900">
                          ₹{plan.price.toLocaleString()}
                        </span>
                        <span className="text-sm font-medium text-indigo-500">
                          {getBillingPeriodText(plan.billingPeriod)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="relative overflow-hidden transition-all duration-500 ease-in-out max-h-[180px] min-h-[180px] group-hover:max-h-[1000px]">
                      <ul className="space-y-4">
                        {plan.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className={`flex items-center gap-3 ${
                              idx > 4
                                ? "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                : ""
                            }`}
                          >
                            <Icon
                              icon={
                                feature.isAvailable
                                  ? "mdi:check-circle"
                                  : "mdi:close-circle"
                              }
                              className={`text-lg ${
                                feature.isAvailable
                                  ? plan.isFeatured
                                    ? "text-yellow-400"
                                    : "text-indigo-600"
                                  : "text-gray-400"
                              }`}
                            />
                            <span
                              className={`text-gray-700 ${
                                !feature.isAvailable
                                  ? "text-gray-400 line-through"
                                  : ""
                              }`}
                            >
                              {feature.description}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {plan.features.length > 5 && (
                        <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-white group-hover:hidden" />
                      )}
                    </CardContent>

                    <CardFooter>
                      <Button
                        onClick={() => navigate(`/plans/checkout/${plan._id}`)}
                        className={`w-full py-6 text-lg font-semibold rounded-xl transition-colors ${
                          plan.isFeatured
                            ? "bg-gradient-to-r from-indigo-500 to-indigo-700 text-white hover:from-indigo-600 hover:to-indigo-800"
                            : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                        }`}
                      >
                        {plan.price === 0 ? "Try for Free" : "Buy Now"}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Plans;