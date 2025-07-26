// components/steps/PersonalDetails.tsx
import React, { useState, useRef } from "react";
import { FormikProps } from "formik";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Icon } from "@iconify/react";
import { FormData } from "@/Pages/types/instructor";


interface PersonalDetailsProps {
  formik: FormikProps<FormData>;
}

export default function PersonalDetails({ formik }: PersonalDetailsProps) {
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // In PersonalDetails.tsx - handleImageUpload function
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Store the actual File object, not a URL
      formik.setFieldValue("profileImage", file); // Changed this line
      setUploading(false);
    } catch (error) {
      console.error("Upload error:", error);
      setUploading(false);
    }
  };

  const removeImage = () => {
    setImagePreview("");
    formik.setFieldValue("profileImage", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-800 mb-2">
          Tell us about yourself
        </h3>
        <p className="text-gray-600">Help students get to know you better</p>
      </div>

      {/* Profile Image Upload */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          {imagePreview || formik.values.profileImage ? (
            <div className="relative">
              <img
                src={imagePreview || formik.values.profileImage}
                alt="Profile preview"
                className="w-32 h-32 rounded-full object-cover border-4 border-indigo-200 shadow-lg"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
              >
                <Icon icon="mdi:close" className="text-sm" />
              </button>
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 border-4 border-dashed border-indigo-300 flex items-center justify-center">
              <Icon
                icon="mdi:camera-plus"
                className="text-4xl text-indigo-400"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col items-center space-y-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2"
          >
            {uploading ? (
              <>
                <Icon icon="mdi:loading" className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Icon icon="mdi:upload" />
                Upload Photo
              </>
            )}
          </Button>
          <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <Input
            type="text"
            name="fullName"
            placeholder="Enter your full name"
            value={formik.values.fullName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full"
          />
          {formik.touched.fullName && formik.errors.fullName && (
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.fullName}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth
          </label>
          <Input
            type="date"
            name="dateOfBirth"
            value={formik.values.dateOfBirth}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full"
          />
          {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.dateOfBirth}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <Input
            type="tel"
            name="phone"
            placeholder="+1234567890"
            value={formik.values.phone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full"
          />
          {formik.touched.phone && formik.errors.phone && (
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.phone}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
