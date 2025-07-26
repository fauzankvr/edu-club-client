// components/steps/EducationalDetails.tsx
import React, { useState, useRef, useEffect } from "react";
import { FormikProps } from "formik";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";
import { Icon } from "@iconify/react";
import { InstructorFormData } from "@/Pages/types/instructor";
import { languages } from "@/utils/constants";

interface EducationalDetailsProps {
  formik: FormikProps<InstructorFormData>;
}

interface CertificationFile {
  name: string;
  url: string;
  file: File;
}

export default function EducationalDetails({
  formik,
}: EducationalDetailsProps) {
  const [expertiseInput, setExpertiseInput] = useState("");
  const [certificationInput, setCertificationInput] = useState("");
  const [certificationFiles, setCertificationFiles] = useState<
    CertificationFile[]
  >([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Restore certificate files from Formik when component mounts or values change
  useEffect(() => {
    if (
      formik.values.certificateFiles &&
      formik.values.certificateFiles.length > 0
    ) {
      const restoredFiles = formik.values.certificateFiles.map(
        (file: File) => ({
          name: file.name,
          url: URL.createObjectURL(file),
          file: file,
        })
      );
      setCertificationFiles(restoredFiles);
    } else {
      setCertificationFiles([]);
    }
  }, [formik.values.certificateFiles]);

  const addToArray = (fieldName: keyof InstructorFormData, value: string) => {
    const currentArray = formik.values[fieldName] as string[];
    if (value.trim() && !currentArray.includes(value.trim())) {
      formik.setFieldValue(fieldName, [...currentArray, value.trim()]);
      if (formik.errors[fieldName]) {
        formik.setFieldError(fieldName as string, "");
      }
    }
  };

  const removeFromArray = (
    fieldName: keyof InstructorFormData,
    index: number
  ) => {
    const currentArray = formik.values[fieldName] as string[];
    const newArray = currentArray.filter((_, i) => i !== index);
    formik.setFieldValue(fieldName, newArray);
  };

  const handleCertificationUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    setUploading(true);
    const newFiles: CertificationFile[] = [];
    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert(
          `File ${file.name} is not supported. Please upload PDF, JPG, or PNG files.`
        );
        continue;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }

      newFiles.push({
        name: file.name,
        url: URL.createObjectURL(file),
        file: file,
      });
      validFiles.push(file);
    }

    // Update Formik with the actual files (this will trigger useEffect)
    const currentFormikFiles = formik.values.certificateFiles || [];
    formik.setFieldValue("certificateFiles", [
      ...currentFormikFiles,
      ...validFiles,
    ]);

    setUploading(false);

    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeCertificationFile = (index: number) => {
    // Update Formik state (this will trigger useEffect to update local state)
    const currentFormikFiles = formik.values.certificateFiles || [];
    const updatedFormikFiles = currentFormikFiles.filter((_, i) => i !== index);
    formik.setFieldValue("certificateFiles", updatedFormikFiles);
  };

  const addCertification = () => {
    if (certificationInput.trim()) {
      addToArray("certifications", certificationInput);
      setCertificationInput("");
    }
  };

  const addExpertise = () => {
    if (expertiseInput.trim()) {
      addToArray("expertise", expertiseInput);
      setExpertiseInput("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-800 mb-2">
          Your Educational Background
        </h3>
        <p className="text-gray-600">
          Showcase your qualifications and expertise
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Educational Qualification *
          </label>
          <Input
            type="text"
            name="eduQulification"
            placeholder="e.g., Master's in Computer Science"
            value={formik.values.eduQulification}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full ${
              formik.touched.eduQulification && formik.errors.eduQulification
                ? "border-red-500 focus:border-red-500"
                : ""
            }`}
          />
          {formik.touched.eduQulification && formik.errors.eduQulification && (
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.eduQulification}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years of Experience *
          </label>
          <Input
            type="number"
            name="experience"
            placeholder="0"
            value={formik.values.experience}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            min="0"
            className={`w-full ${
              formik.touched.experience && formik.errors.experience
                ? "border-red-500 focus:border-red-500"
                : ""
            }`}
          />
          {formik.touched.experience && formik.errors.experience && (
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.experience}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teaching Experience (Years) *
          </label>
          <Input
            type="number"
            name="teachingExperience"
            placeholder="0"
            value={formik.values.teachingExperience}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            min="0"
            className={`w-full ${
              formik.touched.teachingExperience &&
              formik.errors.teachingExperience
                ? "border-red-500 focus:border-red-500"
                : ""
            }`}
          />
          {formik.touched.teachingExperience &&
            formik.errors.teachingExperience && (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.teachingExperience}
              </div>
            )}
        </div>
      </div>

      {/* Expertise Areas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Areas of Expertise *
        </label>
        <div className="flex gap-2 mb-3">
          <Input
            type="text"
            placeholder="e.g., JavaScript, React, Node.js"
            value={expertiseInput}
            onChange={(e) => setExpertiseInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addExpertise();
              }
            }}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={addExpertise}
            variant="outline"
            className="px-4"
            disabled={!expertiseInput.trim()}
          >
            <Icon icon="mdi:plus" />
          </Button>
        </div>

        {/* Expertise Tags */}
        <div className="flex flex-wrap gap-2 mb-2">
          {formik.values.expertise.map((item, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-blue-200"
            >
              {item}
              <Icon
                icon="mdi:close"
                className="cursor-pointer hover:text-blue-600"
                onClick={() => removeFromArray("expertise", index)}
              />
            </span>
          ))}
        </div>

        {/* Expertise Error */}
        {formik.touched.expertise && formik.errors.expertise && (
          <div className="text-red-500 text-sm mt-1">
            {typeof formik.errors.expertise === "string"
              ? formik.errors.expertise
              : "At least one area of expertise is required"}
          </div>
        )}

        {formik.values.expertise.length === 0 && (
          <div className="text-gray-500 text-sm">
            Add at least one area of expertise
          </div>
        )}
      </div>

      {/* Languages */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Languages *
        </label>
        <Select
          onValueChange={(value) => {
            addToArray("languages", value);
          }}
        >
          <SelectTrigger
            className={`${
              formik.touched.languages && formik.errors.languages
                ? "border-red-500 focus:border-red-500"
                : ""
            }`}
          >
            <SelectValue placeholder="Select languages you speak" />
          </SelectTrigger>
          <SelectContent>
            {languages
              .filter((lang) => !formik.values.languages.includes(lang))
              .map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {/* Language Tags */}
        <div className="flex flex-wrap gap-2 mt-3 mb-2">
          {formik.values.languages.map((item, index) => (
            <span
              key={index}
              className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-green-200"
            >
              {item}
              <Icon
                icon="mdi:close"
                className="cursor-pointer hover:text-green-600"
                onClick={() => removeFromArray("languages", index)}
              />
            </span>
          ))}
        </div>

        {/* Languages Error */}
        {formik.touched.languages && formik.errors.languages && (
          <div className="text-red-500 text-sm mt-1">
            {typeof formik.errors.languages === "string"
              ? formik.errors.languages
              : "At least one language is required"}
          </div>
        )}

        {formik.values.languages.length === 0 && (
          <div className="text-gray-500 text-sm">
            Select at least one language you can teach in
          </div>
        )}
      </div>

      {/* Certifications */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Certifications <span className="text-gray-500">(Optional)</span>
        </label>

        {/* Text input for certification names */}
        <div className="flex gap-2 mb-3">
          <Input
            type="text"
            placeholder="e.g., AWS Certified Solutions Architect"
            value={certificationInput}
            onChange={(e) => setCertificationInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCertification();
              }
            }}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={addCertification}
            variant="outline"
            className="px-4"
            disabled={!certificationInput.trim()}
          >
            <Icon icon="mdi:plus" />
          </Button>
        </div>

        {/* File upload for certificates */}
        <div className="mb-4">
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
                <Icon icon="mdi:file-upload" />
                Upload Certificate Files
              </>
            )}
          </Button>
          <p className="text-xs text-gray-500 mt-1">
            PDF, JPG, PNG up to 10MB each
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            onChange={handleCertificationUpload}
            className="hidden"
          />
        </div>

        {/* Certification text list */}
        {formik.values.certifications.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Added Certifications:
            </h4>
            <div className="flex flex-wrap gap-2">
              {formik.values.certifications.map((item, index) => (
                <span
                  key={index}
                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-purple-200"
                >
                  {item}
                  <Icon
                    icon="mdi:close"
                    className="cursor-pointer hover:text-purple-600"
                    onClick={() => removeFromArray("certifications", index)}
                  />
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Uploaded certificate files */}
        {certificationFiles.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Uploaded Certificate Files:
            </h4>
            <div className="space-y-2">
              {certificationFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      icon={
                        file.name.toLowerCase().endsWith(".pdf")
                          ? "mdi:file-pdf"
                          : "mdi:file-image"
                      }
                      className="text-2xl text-gray-600"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(file.url, "_blank")}
                    >
                      <Icon icon="mdi:eye" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => removeCertificationFile(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Icon icon="mdi:delete" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
