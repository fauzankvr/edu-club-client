// import React, { useState } from "react";
import { FormikProps } from "formik";
import { Input } from "@/components/ui/input";
import { Icon } from "@iconify/react";
import { FormData } from "@/Pages/types/instructor";

interface AccountInformationProps {
  formik: FormikProps<FormData>;
}

export default function AccountInformation({
  formik,
}: AccountInformationProps) {
  // const [showPassword, setShowPassword] = useState(false);
  // const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // const [passwordStrength, setPasswordStrength] = useState(0);

  // const calculatePasswordStrength = (password: string): number => {
  //   let strength = 0;
  //   if (password.length >= 8) strength += 1;
  //   if (/[A-Z]/.test(password)) strength += 1;
  //   if (/[a-z]/.test(password)) strength += 1;
  //   if (/[0-9]/.test(password)) strength += 1;
  //   if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  //   return strength;
  // };

  // const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const password = e.target.value;
  //   formik.handleChange(e);
  //   setPasswordStrength(calculatePasswordStrength(password));
  // };

  // const getPasswordStrengthColor = (strength: number): string => {
  //   if (strength <= 2) return "bg-red-500";
  //   if (strength <= 3) return "bg-yellow-500";
  //   if (strength <= 4) return "bg-blue-500";
  //   return "bg-green-500";
  // };

  // const getPasswordStrengthText = (strength: number): string => {
  //   if (strength <= 2) return "Weak";
  //   if (strength <= 3) return "Fair";
  //   if (strength <= 4) return "Good";
  //   return "Strong";
  // };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4">
          <Icon icon="mdi:account-key" className="text-white text-2xl" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-2">
          Create Your Account
        </h3>
        <p className="text-gray-600">
          Set up your login credentials to get started
        </p>
      </div>

      <div className="space-y-6">
        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <div className="relative">
            <Input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full pl-10 ${
                formik.touched.email && formik.errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-indigo-500"
              }`}
            />
            <Icon
              icon="mdi:email-outline"
              className="absolute left-3 top-3 text-gray-400 text-lg"
            />
          </div>
          {formik.touched.email && formik.errors.email && (
            <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
              <Icon icon="mdi:alert-circle" className="text-sm" />
              {formik.errors.email}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            We'll use this email for account verification and important updates
          </p>
        </div>

        {/* Password Field */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password *
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create a strong password"
              value={formik.values.password}
              onChange={handlePasswordChange}
              onBlur={formik.handleBlur}
              className={`w-full pl-10 pr-10 ${
                formik.touched.password && formik.errors.password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-indigo-500"
              }`}
            />
            <Icon
              icon="mdi:lock-outline"
              className="absolute left-3 top-3 text-gray-400 text-lg"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <Icon
                icon={showPassword ? "mdi:eye-off" : "mdi:eye"}
                className="text-lg"
              />
            </button>
          </div>

          {/* Password Strength Indicator */}
        {/* {formik.values.password && (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(
                      passwordStrength
                    )}`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  />
                </div>
                <span
                  className={`text-xs font-medium ${
                    passwordStrength <= 2
                      ? "text-red-500"
                      : passwordStrength <= 3
                      ? "text-yellow-500"
                      : passwordStrength <= 4
                      ? "text-blue-500"
                      : "text-green-500"
                  }`}
                >
                  {getPasswordStrengthText(passwordStrength)}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                <p>Password should contain:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li
                    className={
                      formik.values.password.length >= 8 ? "text-green-600" : ""
                    }
                  >
                    At least 8 characters
                  </li>
                  <li
                    className={
                      /[A-Z]/.test(formik.values.password)
                        ? "text-green-600"
                        : ""
                    }
                  >
                    One uppercase letter
                  </li>
                  <li
                    className={
                      /[a-z]/.test(formik.values.password)
                        ? "text-green-600"
                        : ""
                    }
                  >
                    One lowercase letter
                  </li>
                  <li
                    className={
                      /[0-9]/.test(formik.values.password)
                        ? "text-green-600"
                        : ""
                    }
                  >
                    One number
                  </li>
                  <li
                    className={
                      /[^A-Za-z0-9]/.test(formik.values.password)
                        ? "text-green-600"
                        : ""
                    }
                  >
                    One special character
                  </li>
                </ul>
              </div>
            </div>
          )} */}

        {/* {formik.touched.password && formik.errors.password && (
            <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
              <Icon icon="mdi:alert-circle" className="text-sm" />
              {formik.errors.password}
            </div>
          )}
        </div>  */}

        {/* Confirm Password Field */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password *
          </label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full pl-10 pr-10 ${
                formik.touched.confirmPassword && formik.errors.confirmPassword
                  ? "border-red-500 focus:ring-red-500"
                  : formik.values.confirmPassword &&
                    formik.values.password === formik.values.confirmPassword
                  ? "border-green-500 focus:ring-green-500"
                  : "border-gray-300 focus:ring-indigo-500"
              }`}
            />
            <Icon
              icon="mdi:lock-check-outline"
              className="absolute left-3 top-3 text-gray-400 text-lg"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <Icon
                icon={showConfirmPassword ? "mdi:eye-off" : "mdi:eye"}
                className="text-lg"
              />
            </button>
          </div> */}

        {/* Password Match Indicator */}
        {/* {formik.values.confirmPassword && (
            <div className="flex items-center gap-2 mt-1">
              {formik.values.password === formik.values.confirmPassword ? (
                <>
                  <Icon
                    icon="mdi:check-circle"
                    className="text-green-500 text-sm"
                  />
                  <span className="text-green-600 text-sm">
                    Passwords match
                  </span>
                </>
              ) : (
                <>
                  <Icon
                    icon="mdi:alert-circle"
                    className="text-red-500 text-sm"
                  />
                  <span className="text-red-500 text-sm">
                    Passwords don't match
                  </span>
                </>
              )}
            </div>
          )}

          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
              <Icon icon="mdi:alert-circle" className="text-sm" />
              {formik.errors.confirmPassword}
            </div>
          )}
        </div> */}
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Icon
            icon="mdi:shield-check"
            className="text-blue-600 text-3xl"
          />
          <div>
            <h4 className="text-blue-800 font-medium text-sm">
              Security Notice
            </h4>
            <p className="text-blue-700 text-sm mt-1">
              Your account is currently under review. Once approved by the
              admin, you will receive login credentials via email. You’ll be
              asked to set your password upon first login for security purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
