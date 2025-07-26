// components/steps/ContactLocation.tsx
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";
import { Icon } from "@iconify/react";
import { InstructorFormData } from "@/Pages/types/instructor";
import { countries } from "@/utils/constants";
import { FormikProps } from "formik";

interface ContactLocationProps {
  formik: FormikProps<InstructorFormData>;
}

export default function ContactLocation({ formik }: ContactLocationProps) {
  const validateEmail = (email: string): boolean => {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateZipCode = (zipCode: string): boolean => {
    if (!zipCode) return true;
    const zipRegex = /^\d{5,10}$/;
    return zipRegex.test(zipCode);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full mb-4">
          <Icon icon="mdi:map-marker" className="text-white text-2xl" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-2">
          Contact & Location
        </h3>
        <p className="text-gray-600">
          Help us set up your profile and payment information
        </p>
      </div>

      {/* Address Section */}
      <div>
        <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
          <Icon icon="mdi:home" className="text-green-600" />
          Address Information
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address *
            </label>
            <div className="relative">
              <Input
                type="text"
                name="address.street"
                placeholder="123 Main Street, Apt 4B"
                value={formik.values.address.street}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full pl-10 ${
                  formik.touched.address?.street &&
                  formik.errors.address?.street
                    ? "border-red-500 focus:border-red-500"
                    : ""
                }`}
              />
              <Icon
                icon="mdi:road"
                className="absolute left-3 top-3 text-gray-400 text-lg"
              />
            </div>
            {formik.touched.address?.street &&
              formik.errors.address?.street && (
                <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
                  <Icon icon="mdi:alert-circle" className="text-sm" />
                  {formik.errors.address.street}
                </div>
              )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <div className="relative">
              <Input
                type="text"
                name="address.city"
                placeholder="Enter your city"
                value={formik.values.address.city}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full pl-10 ${
                  formik.touched.address?.city && formik.errors.address?.city
                    ? "border-red-500 focus:border-red-500"
                    : ""
                }`}
              />
              <Icon
                icon="mdi:city"
                className="absolute left-3 top-3 text-gray-400 text-lg"
              />
            </div>
            {formik.touched.address?.city && formik.errors.address?.city && (
              <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
                <Icon icon="mdi:alert-circle" className="text-sm" />
                {formik.errors.address.city}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State/Province *
            </label>
            <div className="relative">
              <Input
                type="text"
                name="address.state"
                placeholder="Enter your state/province"
                value={formik.values.address.state}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full pl-10 ${
                  formik.touched.address?.state && formik.errors.address?.state
                    ? "border-red-500 focus:border-red-500"
                    : ""
                }`}
              />
              <Icon
                icon="mdi:map"
                className="absolute left-3 top-3 text-gray-400 text-lg"
              />
            </div>
            {formik.touched.address?.state && formik.errors.address?.state && (
              <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
                <Icon icon="mdi:alert-circle" className="text-sm" />
                {formik.errors.address.state}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country *
            </label>
            <Select
              value={formik.values.address.country}
              onValueChange={(value) =>
                formik.setFieldValue("address.country", value)
              }
            >
              <SelectTrigger
                className={`${
                  formik.touched.address?.country &&
                  formik.errors.address?.country
                    ? "border-red-500 focus:border-red-500"
                    : ""
                }`}
              >
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    <div className="flex items-center gap-2">
                      <Icon icon="mdi:flag" className="text-gray-500" />
                      {country}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.address?.country &&
              formik.errors.address?.country && (
                <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
                  <Icon icon="mdi:alert-circle" className="text-sm" />
                  {formik.errors.address.country}
                </div>
              )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zip/Postal Code *
            </label>
            <div className="relative">
              <Input
                type="text"
                name="address.zipCode"
                placeholder="12345"
                value={formik.values.address.zipCode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full pl-10 ${
                  formik.touched.address?.zipCode &&
                  formik.errors.address?.zipCode
                    ? "border-red-500 focus:border-red-500"
                    : formik.values.address.zipCode &&
                      validateZipCode(formik.values.address.zipCode)
                    ? "border-green-500 focus:ring-green-500"
                    : "border-gray-300 focus:ring-indigo-500"
                }`}
              />
              <Icon
                icon="mdi:mailbox"
                className="absolute left-3 top-3 text-gray-400 text-lg"
              />
              {formik.values.address.zipCode &&
                validateZipCode(formik.values.address.zipCode) &&
                (!formik.touched.address?.zipCode ||
                  !formik.errors.address?.zipCode) && (
                  <Icon
                    icon="mdi:check-circle"
                    className="absolute right-3 top-3 text-green-500 text-lg"
                  />
                )}
            </div>
            {formik.touched.address?.zipCode &&
              formik.errors.address?.zipCode && (
                <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
                  <Icon icon="mdi:alert-circle" className="text-sm" />
                  {formik.errors.address.zipCode}
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div>
        <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
          <Icon icon="mdi:credit-card" className="text-green-600" />
          Payment Information
        </h4>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PayPal Email Address *
          </label>
          <div className="relative">
            <Input
              type="email"
              name="paypalEmail"
              placeholder="your-paypal@email.com"
              value={formik.values.paypalEmail}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full pl-10 ${
                formik.touched.paypalEmail && formik.errors.paypalEmail
                  ? "border-red-500 focus:border-red-500"
                  : formik.values.paypalEmail &&
                    validateEmail(formik.values.paypalEmail)
                  ? "border-green-500 focus:ring-green-500"
                  : "border-gray-300 focus:ring-indigo-500"
              }`}
            />
            <Icon
              icon="mdi:paypal"
              className="absolute left-3 top-3 text-blue-600 text-lg"
            />
            {formik.values.paypalEmail &&
              validateEmail(formik.values.paypalEmail) &&
              (!formik.touched.paypalEmail || !formik.errors.paypalEmail) && (
                <Icon
                  icon="mdi:check-circle"
                  className="absolute right-3 top-3 text-green-500 text-lg"
                />
              )}
          </div>
          {formik.touched.paypalEmail && formik.errors.paypalEmail && (
            <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
              <Icon icon="mdi:alert-circle" className="text-sm" />
              {formik.errors.paypalEmail}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            We'll use this email to send your course earnings via PayPal
          </p>
        </div>
      </div>


      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Icon
              icon="mdi:shield-check"
              className="text-blue-600 text-xl mt-0.5"
            />
            <div>
              <h5 className="text-blue-800 font-medium text-sm">
                Privacy Protected
              </h5>
              <p className="text-blue-700 text-xs mt-1">
                Your personal information is encrypted and never shared with
                third parties
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Icon icon="mdi:cash" className="text-green-600 text-xl mt-0.5" />
            <div>
              <h5 className="text-green-800 font-medium text-sm">
                Secure Payments
              </h5>
              <p className="text-green-700 text-xs mt-1">
                All payments are processed securely through PayPal's trusted
                platform
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
