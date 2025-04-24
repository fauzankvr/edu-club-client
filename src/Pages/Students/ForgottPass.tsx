import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Card } from "@/Components/ui/card";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const handleGoBack = () => {
      navigate(-1); 
    };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="max-w-md w-full p-6 bg-white shadow-lg rounded-2xl text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Forgot your password?
        </h2>
        <p className="text-gray-600 mb-4">
          Provide your account email to receive a reset link.
        </p>
        <div className="text-left mb-4">
          <label className="text-sm font-medium text-gray-700">
            Enter Your Email Address:
          </label>
          <Input type="email" placeholder="Email Address" className="mt-2" />
        </div>
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
          Send
        </Button>
        <Button
          variant="outline"
          className="w-sm"
          onClick={() => handleGoBack()}
        >
          Go Back
        </Button>
      </Card>
    </div>
  );
}
