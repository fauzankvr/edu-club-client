import { FormikProps } from "formik";
import { Input } from "@/components/ui/input";
import { Textarea } from "../textarea";
import { Icon } from "@iconify/react";
import { InstructorFormData } from "@/Pages/types/instructor"; 

interface ProfessionalDetailsProps {
  formik: FormikProps<InstructorFormData>;
}

export default function ProfessionalDetails({
  formik,
}: ProfessionalDetailsProps) {
  const validateUrl = (url: string): boolean => {
    if (!url) return true;
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mb-4">
          <Icon icon="mdi:briefcase" className="text-white text-2xl" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-2">
          Professional Experience
        </h3>
        <p className="text-gray-600">
          Share your work experience and professional achievements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Position */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Position*
          </label>
          <div className="relative">
            <Input
              type="text"
              name="currentPosition"
              placeholder="e.g., Senior Software Engineer"
              value={formik.values.currentPosition}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full pl-10"
            />
            <Icon
              icon="mdi:account-tie"
              className="absolute left-3 top-3 text-gray-400 text-lg"
            />
          </div>
          {formik.touched.currentPosition && formik.errors.currentPosition && (
            <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
              <Icon icon="mdi:alert-circle" className="text-sm" />
              {formik.errors.currentPosition}
            </div>
          )}
        </div>

        {/* Workplace */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Workplace*
          </label>
          <div className="relative">
            <Input
              type="text"
              name="workPlace"
              placeholder="e.g., Google, Microsoft, Freelance"
              value={formik.values.workPlace}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full pl-10"
            />
            <Icon
              icon="mdi:office-building"
              className="absolute left-3 top-3 text-gray-400 text-lg"
            />
          </div>
          {formik.touched.workPlace && formik.errors.workPlace && (
            <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
              <Icon icon="mdi:alert-circle" className="text-sm" />
              {formik.errors.workPlace}
            </div>
          )}
        </div>
      </div>

      {/* LinkedIn Profile */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          LinkedIn Profile
        </label>
        <div className="relative">
          <Input
            type="url"
            name="linkedInProfile"
            placeholder="https://linkedin.com/in/yourprofile"
            value={formik.values.linkedInProfile}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full pl-10 ${
              formik.values.linkedInProfile &&
              !validateUrl(formik.values.linkedInProfile)
                ? "border-red-500 focus:ring-red-500"
                : formik.values.linkedInProfile &&
                  validateUrl(formik.values.linkedInProfile)
                ? "border-green-500 focus:ring-green-500"
                : "border-gray-300 focus:ring-indigo-500"
            }`}
          />
          <Icon
            icon="mdi:linkedin"
            className="absolute left-3 top-3 text-blue-600 text-lg"
          />
          {formik.values.linkedInProfile &&
            validateUrl(formik.values.linkedInProfile) && (
              <Icon
                icon="mdi:check-circle"
                className="absolute right-3 top-3 text-green-500 text-lg"
              />
            )}
        </div>
        {formik.touched.linkedInProfile && formik.errors.linkedInProfile && (
          <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
            <Icon icon="mdi:alert-circle" className="text-sm" />
            {formik.errors.linkedInProfile}
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Your LinkedIn profile helps students learn about your professional
          background
        </p>
      </div>

      {/* Personal Website */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Personal Website
        </label>
        <div className="relative">
          <Input
            type="url"
            name="website"
            placeholder="https://yourwebsite.com"
            value={formik.values.website}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full pl-10 ${
              formik.values.website && !validateUrl(formik.values.website)
                ? "border-red-500 focus:ring-red-500"
                : formik.values.website && validateUrl(formik.values.website)
                ? "border-green-500 focus:ring-green-500"
                : "border-gray-300 focus:ring-indigo-500"
            }`}
          />
          <Icon
            icon="mdi:web"
            className="absolute left-3 top-3 text-gray-400 text-lg"
          />
          {formik.values.website && validateUrl(formik.values.website) && (
            <Icon
              icon="mdi:check-circle"
              className="absolute right-3 top-3 text-green-500 text-lg"
            />
          )}
        </div>
        {formik.touched.website && formik.errors.website && (
          <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
            <Icon icon="mdi:alert-circle" className="text-sm" />
            {formik.errors.website}
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Portfolio, blog, or personal website (optional)
        </p>
      </div>

      {/* Professional Summary */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Professional Summary*
        </label>
        <Textarea
          name="Biography"
          placeholder="Briefly describe your professional background, achievements, and what makes you a great instructor..."
          value={formik.values.Biography}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          rows={4}
          maxLength={500}
          className="w-full resize-none"
        />
        {formik.touched.Biography && formik.errors.Biography && (
          <div className="text-red-500 text-sm mt-1">
            {formik.errors.Biography}
          </div>
        )}
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500">
            Highlight your key achievements and what students can expect to
            learn from you
          </p>
        
        </div>
      </div>

      {/* Professional Highlights */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
        <h4 className="text-purple-800 font-medium text-lg mb-4 flex items-center gap-2">
          <Icon icon="mdi:star" className="text-purple-600" />
          Professional Highlights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Icon icon="mdi:account-group" className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-800">Network</p>
              <p className="text-xs text-purple-600">
                Build professional connections
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Icon icon="mdi:trophy" className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-800">Credibility</p>
              <p className="text-xs text-purple-600">Showcase your expertise</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Icon icon="mdi:trending-up" className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-800">Growth</p>
              <p className="text-xs text-purple-600">Attract more students</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Icon icon="mdi:handshake" className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-800">Trust</p>
              <p className="text-xs text-purple-600">
                Build student confidence
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
