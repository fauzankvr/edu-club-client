import Footer from "@/components/InstructorCompontents/Footer";
import Navbar from "@/components/InstructorCompontents/Navbar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { Formik, Form, FormikHelpers, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import instructorApi from "@/API/InstructorApi";
import { ProfileSchema, Teacher } from "../types/instructor";
import { FieldArrayInput } from "@/components/InstructorCompontents/forms/FieldArrayInput";
import { cleanTeacherValues } from "@/utils/formUtils";
import { Eye, EyeOff } from "lucide-react";

const ChangePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Current password is required"),
  newPassword: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .matches(
      /^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one lowercase letter, one number, and one special character"
    )
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your password"),
});

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
  message?: string;
}

interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  as?: string;
  placeholder?: string;
  required?: boolean;
  toggleVisibility?: () => void;
  showPassword?: boolean;
  disabled?: boolean;
  className?: string;
}

const FormField = ({
  name,
  label,
  type = "text",
  as,
  placeholder,
  required,
  toggleVisibility,
  showPassword,
  disabled,
  className,
}: FormFieldProps) => (
  <div className="relative">
    <label htmlFor={name} className="block text-sm font-medium mb-1">
      {label}
    </label>
    <Field
      id={name}
      name={name}
      type={type}
      as={as}
      placeholder={placeholder}
      className={`w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
        className || ""
      }`}
      required={required}
      disabled={disabled}
    />
    {toggleVisibility && (
      <button
        type="button"
        onClick={toggleVisibility}
        className="absolute right-3 top-[38px] transform -translate-y-1/2 text-gray-500 focus:outline-none"
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    )}
    <ErrorMessage
      name={name}
      component="div"
      className="text-red-500 text-sm mt-1"
    />
  </div>
);

const successToast = (message: string) => toast.success(message);
const errorToast = (message: string) => toast.error(message);

const Profile: React.FC = () => {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] =
    useState<boolean>(false);
  const [initialValues, setInitialValues] = useState<Teacher>({
    _id: "",
    email: "",
    fullName: "",
    isBlocked: false,
    isApproved: false,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] =
    useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  useEffect(() => {
    const fetchProfile = async (): Promise<void> => {
      try {
        const res = await instructorApi.getProfile();
        const profileData = res.profile;

        setInitialValues({
          _id: profileData._id || "",
          email: profileData.email || "",
          fullName: profileData.fullName || "",
          isBlocked: Boolean(profileData.isBlocked),
          isApproved: Boolean(profileData.isApproved),
          ...(profileData.phone && { phone: profileData.phone }),
          ...(profileData.profileImage && {
            profileImage: profileData.profileImage,
          }),
          ...(profileData.dateOfBirth && {
            dateOfBirth: profileData.dateOfBirth.split("T")[0],
          }),
          ...(profileData.Biography && { Biography: profileData.Biography }),
          ...(profileData.eduQulification && {
            eduQulification: profileData.eduQulification,
          }),
          ...(profileData.expertise && { expertise: profileData.expertise }),
          ...(profileData.experience !== undefined && {
            experience: profileData.experience,
          }),
          ...(profileData.teachingExperience !== undefined && {
            teachingExperience: profileData.teachingExperience,
          }),
          ...(profileData.languages && { languages: profileData.languages }),
          ...(profileData.certifications && {
            certifications: profileData.certifications,
          }),
          ...(profileData.currentPosition && {
            currentPosition: profileData.currentPosition,
          }),
          ...(profileData.workPlace && { workPlace: profileData.workPlace }),
          ...(profileData.linkedInProfile && {
            linkedInProfile: profileData.linkedInProfile,
          }),
          ...(profileData.website && { website: profileData.website }),
          ...(profileData.address && { address: profileData.address }),
          ...(profileData.paypalEmail && {
            paypalEmail: profileData.paypalEmail,
          }),
          ...(profileData.socialMedia && {
            socialMedia: profileData.socialMedia,
          }),
          ...(profileData.createdAt && { createdAt: profileData.createdAt }),
          ...(profileData.updatedAt && { updatedAt: profileData.updatedAt }),
        });

        if (
          profileData.profileImage &&
          typeof profileData.profileImage === "string"
        ) {
          setPreviewImage(profileData.profileImage);
        }
      } catch (error) {
        console.error("Profile fetch failed:", error);
        errorToast("Failed to load profile data");
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (
    values: Teacher,
    { setSubmitting }: FormikHelpers<Teacher>
  ): Promise<void> => {
    try {
      const cleanedValues = cleanTeacherValues(values);
      console.log("cleaned", cleanedValues);
      await instructorApi.updateProfile(cleanedValues);
      successToast("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.message ||
        apiError.message ||
        "Failed to update profile";
      errorToast(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordChange = async (
    values: PasswordFormValues,
    { resetForm, setSubmitting }: FormikHelpers<PasswordFormValues>
  ): Promise<void> => {
    try {
      console.log("Submitting password change:", values);
      await instructorApi.changePassword(
        values.currentPassword,
        values.newPassword
      );
      successToast("Password changed successfully");
      resetForm();
      setIsPasswordDialogOpen(false);
    } catch (error) {
      console.error("Failed to change password:", error);
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.error ||
        apiError.response?.data?.message ||
        apiError.message ||
        "Failed to change password. Please try again.";
      errorToast(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getCertificateName = (url: string): string => {
    try {
      const urlObject = new URL(url);
      const pathParts = urlObject.pathname
        .split("/")
        .filter((part) => part.length > 0);
      return `${urlObject.hostname} - ${
        pathParts[pathParts.length - 1] || "Certificate"
      }`;
    } catch {
      return url;
    }
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void
  ): void => {
    const file = event.target.files?.[0];
    if (file) {
      setFieldValue("profileImage", file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
    }
  };

  return (
    <>
      <Navbar />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Instructor Profile
              </h1>
              <p className="text-md text-gray-500">
                Showcase your expertise and experience.
              </p>
            </div>

            <Dialog
              open={isPasswordDialogOpen}
              onOpenChange={setIsPasswordDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Icon icon="mdi:lock-reset" className="w-4 h-4" />
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl">Change Password</DialogTitle>
                </DialogHeader>
                <Formik<PasswordFormValues>
                  initialValues={{
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  }}
                  validationSchema={ChangePasswordSchema}
                  onSubmit={handlePasswordChange}
                  validateOnChange={true}
                  validateOnBlur={true}
                >
                  {({ isSubmitting, errors, touched }) => (
                    <Form className="space-y-4">
                      <FormField
                        name="currentPassword"
                        label="Current Password"
                        type={showCurrentPassword ? "text" : "password"}
                        required
                        toggleVisibility={() =>
                          setShowCurrentPassword((prev) => !prev)
                        }
                        showPassword={showCurrentPassword}
                      />
                      <FormField
                        name="newPassword"
                        label="New Password"
                        type={showNewPassword ? "text" : "password"}
                        required
                        toggleVisibility={() =>
                          setShowNewPassword((prev) => !prev)
                        }
                        showPassword={showNewPassword}
                      />
                      <FormField
                        name="confirmPassword"
                        label="Confirm New Password"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        toggleVisibility={() =>
                          setShowConfirmPassword((prev) => !prev)
                        }
                        showPassword={showConfirmPassword}
                      />
                      {Object.keys(errors).length > 0 &&
                        Object.keys(touched).length > 0 && (
                          <div className="text-red-500 text-sm">
                            Please fix the errors above before submitting.
                          </div>
                        )}
                      <div className="flex gap-3 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsPasswordDialogOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting || Object.keys(errors).length > 0}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                        >
                          {isSubmitting ? "Updating..." : "Update Password"}
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </DialogContent>
            </Dialog>
          </div>

          <Formik<Teacher>
            enableReinitialize
            initialValues={initialValues}
            validationSchema={ProfileSchema}
            onSubmit={handleSubmit}
            validateOnChange={true}
            validateOnBlur={true}
          >
            {({
              errors,
              touched,
              setFieldValue,
              dirty,
              values,
              isSubmitting,
            }) => (
              <Form>
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-6 bg-white shadow-sm rounded-lg p-1">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="professional">Professional</TabsTrigger>
                    <TabsTrigger value="contact">Contact</TabsTrigger>
                    <TabsTrigger value="social">Social</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic">
                    <Card>
                      <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-8 mb-6">
                          <div className="relative w-32 h-32 rounded-full ring-4 ring-white shadow-lg bg-gray-100 flex items-center justify-center">
                            {previewImage || values?.profileImage ? (
                              <img
                                src={previewImage || values?.profileImage}
                                alt="Profile"
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <Icon
                                icon="mdi:account"
                                className="w-16 h-16 text-gray-400"
                              />
                            )}
                            <input
                              id="profileImage"
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleFileChange(e, setFieldValue)
                              }
                              className="hidden"
                            />
                            <Button
                              type="button"
                              size="sm"
                              className="absolute bottom-1 right-1 rounded-full w-10 h-10 p-0"
                              onClick={() => {
                                const fileInput = document.getElementById(
                                  "profileImage"
                                ) as HTMLInputElement;
                                fileInput?.click();
                              }}
                            >
                              <Icon icon="mdi:camera" className="w-5 h-5" />
                            </Button>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold">
                              {values.fullName || "Your Name"}
                            </h3>
                            <p className="text-gray-600">
                              {values.currentPosition || "Your Position"}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            name="fullName"
                            label="Full Name"
                            required
                          />
                          <FormField name="phone" label="Phone Number" />
                          <FormField
                            name="dateOfBirth"
                            label="Date of Birth"
                            type="date"
                          />
                          <FormField
                            name="email"
                            label="Email Address"
                            disabled
                            className="bg-gray-100"
                          />
                          <FormField
                            name="eduQulification"
                            label="Education Qualification"
                          />
                          <FormField
                            name="experience"
                            label="Total Experience (years)"
                            type="number"
                          />
                          <FormField
                            name="teachingExperience"
                            label="Teaching Experience (years)"
                            type="number"
                          />
                          <div className="md:col-span-2">
                            <FormField
                              name="Biography"
                              label="Biography"
                              as="textarea"
                              placeholder="Tell us about yourself..."
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="professional">
                    <Card>
                      <CardHeader>
                        <CardTitle>Professional Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 p-6">
                        <FieldArrayInput
                          name="expertise"
                          label="Areas of Expertise"
                          placeholder="e.g., React, Node.js"
                        />
                        <FieldArrayInput
                          name="languages"
                          label="Languages"
                          placeholder="e.g., English"
                        />
                        <div>
                          <Label>Certifications</Label>
                          <div className="space-y-2 pt-2">
                            {values.certifications &&
                            values.certifications.length > 0 ? (
                              values.certifications.map((cert, index) => (
                                <a
                                  key={`cert-${index}`}
                                  href={cert}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                  <Icon
                                    icon="mdi:file-certificate-outline"
                                    className="text-blue-600 w-5 h-5 flex-shrink-0"
                                  />
                                  <span className="text-sm text-blue-700 font-medium truncate">
                                    {getCertificateName(cert)}
                                  </span>
                                  <Icon
                                    icon="mdi:external-link"
                                    className="text-blue-500 w-4 h-4 ml-auto"
                                  />
                                </a>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500 italic py-2">
                                No certificates have been added.
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                          <FormField
                            name="currentPosition"
                            label="Current Position"
                            placeholder="Senior Developer"
                          />
                          <FormField
                            name="workPlace"
                            label="Workplace"
                            placeholder="Tech Company Inc."
                          />
                          <FormField
                            name="linkedInProfile"
                            label="LinkedIn Profile"
                            placeholder="https://linkedin.com/..."
                          />
                          <FormField
                            name="website"
                            label="Personal Website"
                            placeholder="https://yourwebsite.com"
                          />
                          <div className="md:col-span-2">
                            <FormField
                              name="paypalEmail"
                              label="PayPal Email (for payments)"
                              type="email"
                              placeholder="paypal@example.com"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="contact">
                    <Card>
                      <CardHeader>
                        <CardTitle>Contact & Address</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <FormField
                              name="address.street"
                              label="Street Address"
                              placeholder="123 Main St"
                            />
                          </div>
                          <FormField
                            name="address.city"
                            label="City"
                            placeholder="New York"
                          />
                          <FormField
                            name="address.state"
                            label="State/Province"
                            placeholder="NY"
                          />
                          <FormField
                            name="address.country"
                            label="Country"
                            placeholder="United States"
                          />
                          <FormField
                            name="address.zipCode"
                            label="Zip Code"
                            placeholder="10001"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="social">
                    <Card>
                      <CardHeader>
                        <CardTitle>Social Media Links</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            name="socialMedia.twitter"
                            label="Twitter"
                            placeholder="https://twitter.com/..."
                          />
                          <FormField
                            name="socialMedia.facebook"
                            label="Facebook"
                            placeholder="https://facebook.com/..."
                          />
                          <FormField
                            name="socialMedia.instagram"
                            label="Instagram"
                            placeholder="https://instagram.com/..."
                          />
                          <FormField
                            name="socialMedia.youtube"
                            label="YouTube"
                            placeholder="https://youtube.com/..."
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <div className="mt-8 text-right">
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3"
                    disabled={isSubmitting || !dirty}
                  >
                    <Icon icon="mdi:content-save" className="w-5 h-5 mr-2" />
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
