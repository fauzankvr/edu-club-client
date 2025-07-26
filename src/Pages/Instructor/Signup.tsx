// InstructorSignup.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useFormik } from "formik";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import Footer from "@/components/InstructorCompontents/Footer";
import Navbar from "@/components/InstructorCompontents/Navbar";
import ProgressBar from "@/components/InstructorCompontents/ProgressBar";
import StepContent from "@/components/InstructorCompontents/StepContent";
import GoogleLoginSection from "@/components/InstructorCompontents/GoogleLoginSection";

import { setStudent } from "@/features/student/redux/studentSlce";
import InstructorApi from "@/API/InstructorApi";
import {
  FormData,
  STEPS,
  validationSchemas,
  initialValues,
} from "../types/instructor";

export default function InstructorSignup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const successToast = () => toast.success("Signup successful!");
  const failureToast = () => toast.error("Signup failed. Try again.");

  useEffect(() => {
    const token = localStorage.getItem("InstructorToken");
    if (token) {
      navigate("/instructor/home", { replace: true });
    }
  }, [navigate]);

  const formik = useFormik<FormData>({
    initialValues: initialValues,
    validationSchema: validationSchemas[currentStep],
    enableReinitialize: true, // Allows schema updates when currentStep changes
    onSubmit: async (values) => {
  if (currentStep < STEPS.length - 1) {
    const isValid = await validateCurrentStep();
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  } else {
    try {
      // Pass the entire values object to the API
      const res = await InstructorApi.signup(values);
      
      if (res.data && res.data.success) {
        dispatch(
          setStudent({ email: values.email, password: values.password })
        );
        successToast();
        navigate("/instructor/otpVerify", {
          state: {
            fullName: values.fullName,
            email: values.email,
            password: values.password,
          },
        });
      } else {
        failureToast();
      }
    } catch (err) {
          let message = "Signup failed. Please try again.";
          if (typeof err === "object" && err !== null) {
            const errorObj = err as { response?: { data?: { error?: string; message?: string } }; message?: string };
            message =
              errorObj?.response?.data?.error ||
              errorObj?.response?.data?.message ||
              errorObj?.message ||
              message;
          }
          toast.error(message);
        }
      }
    },
  });

  // Function to validate current step
  const validateCurrentStep = async (): Promise<boolean> => {
    try {
      await validationSchemas[currentStep].validate(formik.values, {
        abortEarly: false,
      });
      formik.setErrors({});
      return true;
    } catch (err: unknown) {
      const validationErrors: { [key: string]: string } = {};
      if (typeof err === "object" && err !== null && "inner" in err && Array.isArray((err as { inner?: unknown }).inner)) {
        (err as { inner: Array<{ path: string; message: string }> }).inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
      }
      formik.setErrors(validationErrors);
      return false;
    }
  };

  // Clear errors and touched fields when step changes
  useEffect(() => {
    formik.setErrors({});
    formik.setTouched({});
  }, [currentStep]);

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // const handleNext = async () => {
  //   const isValid = await validateCurrentStep();
  //   if (isValid && currentStep < STEPS.length - 1) {
  //     setCurrentStep(currentStep + 1);
  //   }
  // };

  const googleClientId = import.meta.env.VITE_REACT_APP_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={googleClientId || ""}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <ToastContainer />

        <div className="flex items-center justify-center min-h-screen py-8 px-4">
          <Card className="w-full max-w-4xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden">
            <div className="p-8 lg:p-12">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4">
                  <Icon
                    icon="mdi:account-plus"
                    className="text-white text-2xl"
                  />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Join as an Instructor
                </h1>
                <p className="text-gray-600">
                  Share your expertise and inspire learners worldwide
                </p>
              </div>

              {/* Progress Bar */}
              <ProgressBar
                currentStep={currentStep}
                totalSteps={STEPS.length}
              />

              {/* Form */}
              <form onSubmit={formik.handleSubmit} className="mt-8">
                <StepContent currentStep={currentStep} formik={formik} />

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2 px-6 py-2.5"
                  >
                    <Icon icon="mdi:arrow-left" />
                    Previous
                  </Button>

                  <div className="text-sm text-gray-500">
                    Step {currentStep + 1} of {STEPS.length}
                  </div>

                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2.5 flex items-center gap-2"
                  >
                    {currentStep === STEPS.length - 1 ? (
                      <>
                        Complete Signup
                        <Icon icon="mdi:check" />
                      </>
                    ) : (
                      <>
                        Next
                        <Icon icon="mdi:arrow-right" />
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {/* Google Login - Only show on first step */}
              {currentStep === 0 && (
                <GoogleLoginSection
                  dispatch={dispatch}
                  navigate={navigate}
                  googleClientId={googleClientId}
                />
              )}
            </div>
          </Card>
        </div>

        <Footer />
      </div>
    </GoogleOAuthProvider>
  );
}
