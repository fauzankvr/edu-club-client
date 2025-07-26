import Footer from "@/components/InstructorCompontents/Footer";
import Navbar from "@/components/InstructorCompontents/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import instructorApi from "@/API/InstructorApi";
import { Teacher } from "../types/instructor";

// Validation Schemas
const ProfileSchema = Yup.object().shape({
  fullName: Yup.string().required("Full name is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
    .required("Phone number is required"),
  experience: Yup.number().min(0, "Experience cannot be negative").nullable(),
  teachingExperience: Yup.number()
    .min(0, "Teaching experience cannot be negative")
    .nullable(),
  paypalEmail: Yup.string().email("Invalid email").nullable(),
  website: Yup.string().url("Invalid URL").nullable(),
  linkedInProfile: Yup.string().url("Invalid LinkedIn URL").nullable(),
  expertise: Yup.array().of(Yup.string()),
  languages: Yup.array().of(Yup.string()),
});

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

// Toast Notifications
const successToast = (message: string) => toast.success(message);
const errorToast = (message: string) => toast.error(message);

const Profile = () => {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [initialValues, setInitialValues] = useState<Teacher>({
    _id: "",
    email: "",
    fullName: "",
    phone: "",
    dateOfBirth: "",
    Biography: "",
    profileImage: "",
    eduQulification: "",
    expertise: [],
    experience: 0,
    teachingExperience: 0,
    languages: [],
    certifications: [],
    currentPosition: "",
    workPlace: "",
    linkedInProfile: "",
    website: "",
    isBlocked: false,
    isApproved: false,
    address: { street: "", city: "", state: "", country: "", zipCode: "" },
    paypalEmail: "",
    socialMedia: { twitter: "", facebook: "", instagram: "", youtube: "" },
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch initial profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await instructorApi.getProfile();
        const profileData = res.profile;
        setInitialValues({
          _id: profileData._id || "",
          email: profileData.email || "",
          fullName: profileData.fullName || "",
          phone: profileData.phone?.toString() || "",
          dateOfBirth: profileData.dateOfBirth?.split("T")[0] || "",
          Biography: profileData.Biography || "",
          profileImage: profileData.profileImage || "",
          eduQulification: profileData.eduQulification || "",
          expertise: profileData.expertise || [],
          experience: profileData.experience || 0,
          teachingExperience: profileData.teachingExperience || 0,
          languages: profileData.languages || [],
          certifications: profileData.certifications || [],
          currentPosition: profileData.currentPosition || "",
          workPlace: profileData.workPlace || "",
          linkedInProfile: profileData.linkedInProfile || "",
          website: profileData.website || "",
          isBlocked: profileData.isBlocked || false,
          isApproved: profileData.isApproved || false,
          address: profileData.address || {
            street: "",
            city: "",
            state: "",
            country: "",
            zipCode: "",
          },
          paypalEmail: profileData.paypalEmail || "",
          socialMedia: profileData.socialMedia || {
            twitter: "",
            facebook: "",
            instagram: "",
            youtube: "",
          },
        });
        if (profileData.profileImage) {
          setPreviewImage(profileData.profileImage);
        }
      } catch (err) {
        console.error("Profile fetch failed:", err);
        errorToast("Failed to load profile data");
      }
    };
    fetchProfile();
  }, []);

  // Form Submission Handler
  const handleSubmit = async (values: Teacher, { setSubmitting }: any) => {
    try {
       await instructorApi.updateProfile(values);
      successToast("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
      const errorMessage =
        (error as any)?.response?.data?.message || "Failed to update profile";
      errorToast(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Password Change Handler
  const handlePasswordChange = async (
    values: any,
    { resetForm, setSubmitting }: any
  ) => {
    try {
      await instructorApi.changePassword(
        values.currentPassword,
        values.newPassword
      );
      successToast("Password changed successfully");
      resetForm();
      setIsPasswordDialogOpen(false);
    } catch (error) {
      console.error("Failed to change password:", error);
      const errorMessage =
        (error as any)?.response?.data?.message || "Failed to change password";
      errorToast(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to display certificate name from URL
  const getCertificateName = (url: string) => {
    try {
      const { hostname, pathname } = new URL(url);
      const pathParts = pathname.split("/").filter((p) => p);
      return `${hostname} - ${
        pathParts[pathParts.length - 1] || "Certificate"
      }`;
    } catch {
      return url; // Fallback for invalid URLs
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
                <Formik
                  initialValues={{
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  }}
                  validationSchema={ChangePasswordSchema}
                  onSubmit={handlePasswordChange}
                >
                  {({ errors, touched, isSubmitting }) => (
                    <Form className="space-y-4">
                      <div>
                        <Label htmlFor="currentPassword">
                          Current Password
                        </Label>
                        <div className="relative">
                          <Field
                            as={Input}
                            name="currentPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                          >
                            <Icon
                              icon={
                                showCurrentPassword ? "mdi:eye-off" : "mdi:eye"
                              }
                              className="h-5 w-5 text-gray-500"
                            />
                          </Button>
                        </div>
                        {errors.currentPassword && touched.currentPassword && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.currentPassword}
                          </div>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                          <Field
                            as={Input}
                            name="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            <Icon
                              icon={showNewPassword ? "mdi:eye-off" : "mdi:eye"}
                              className="h-5 w-5 text-gray-500"
                            />
                          </Button>
                        </div>
                        {errors.newPassword && touched.newPassword && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.newPassword}
                          </div>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">
                          Confirm New Password
                        </Label>
                        <div className="relative">
                          <Field
                            as={Input}
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            <Icon
                              icon={
                                showConfirmPassword ? "mdi:eye-off" : "mdi:eye"
                              }
                              className="h-5 w-5 text-gray-500"
                            />
                          </Button>
                        </div>
                        {errors.confirmPassword && touched.confirmPassword && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.confirmPassword}
                          </div>
                        )}
                      </div>
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
                          disabled={isSubmitting}
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

          <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={ProfileSchema}
            onSubmit={handleSubmit}
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
                  <TabsList className="grid w-full grid-cols-4 md:grid-cols-5 mb-6 bg-white shadow-sm rounded-lg p-1">
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
                          <div className="relative">
                            <img
                              src={
                                previewImage ||
                                "https://via.placeholder.com/150"
                              }
                              alt="Profile"
                              className="w-32 h-32 rounded-full object-cover ring-4 ring-white shadow-lg"
                            />
                            <input
                              id="profileImage"
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setFieldValue("profileImage", file);
                                  setPreviewImage(URL.createObjectURL(file));
                                }
                              }}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              size="sm"
                              className="absolute bottom-1 right-1 rounded-full w-10 h-10 p-0"
                              onClick={() =>
                                document.getElementById("profileImage")?.click()
                              }
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
                          <div>
                            <Label htmlFor="fullName">Full Name *</Label>
                            <Field as={Input} name="fullName" />
                            {errors.fullName && touched.fullName && (
                              <div className="text-red-500 text-sm mt-1">
                                {errors.fullName}
                              </div>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Field as={Input} name="phone" />
                            {errors.phone && touched.phone && (
                              <div className="text-red-500 text-sm mt-1">
                                {errors.phone}
                              </div>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="dateOfBirth">Date of Birth</Label>
                            <Field as={Input} name="dateOfBirth" type="date" />
                          </div>
                          <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Field
                              as={Input}
                              name="email"
                              disabled
                              className="bg-gray-100"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="Biography">Biography</Label>
                            <Field
                              as="textarea"
                              name="Biography"
                              className="w-full h-28 p-2 border rounded-md"
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
                        <div>
                          <Label>Areas of Expertise</Label>
                          <FieldArray name="expertise">
                            {({ push, remove }) => (
                              <div className="space-y-2">
                                {values?.expertise?.map((_, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2"
                                  >
                                    <Field
                                      name={`expertise.${index}`}
                                      as={Input}
                                      placeholder="e.g., React, Node.js"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => remove(index)}
                                    >
                                      <Icon
                                        icon="mdi:close"
                                        className="w-4 h-4"
                                      />
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => push("")}
                                >
                                  <Icon
                                    icon="mdi:plus"
                                    className="w-4 h-4 mr-1"
                                  />{" "}
                                  Add Expertise
                                </Button>
                              </div>
                            )}
                          </FieldArray>
                        </div>
                        <div>
                          <Label>Languages</Label>
                          <FieldArray name="languages">
                            {({ push, remove }) => (
                              <div className="space-y-2">
                                {values?.languages?.map((_, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2"
                                  >
                                    <Field
                                      name={`languages.${index}`}
                                      as={Input}
                                      placeholder="e.g., English"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => remove(index)}
                                    >
                                      <Icon
                                        icon="mdi:close"
                                        className="w-4 h-4"
                                      />
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => push("")}
                                >
                                  <Icon
                                    icon="mdi:plus"
                                    className="w-4 h-4 mr-1"
                                  />{" "}
                                  Add Language
                                </Button>
                              </div>
                            )}
                          </FieldArray>
                        </div>
                        <div>
                          <Label>Certifications</Label>
                          <div className="space-y-2 pt-2">
                            {(values.certifications ?? []).length > 0 ? (
                              (values.certifications ?? []).map(
                                (cert, index) => (
                                  <a
                                    key={index}
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
                                )
                              )
                            ) : (
                              <p className="text-sm text-gray-500 italic py-2">
                                No certificates have been added.
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                          <div>
                            <Label>Current Position</Label>
                            <Field
                              as={Input}
                              name="currentPosition"
                              placeholder="Senior Developer"
                            />
                          </div>
                          <div>
                            <Label>Workplace</Label>
                            <Field
                              as={Input}
                              name="workPlace"
                              placeholder="Tech Company Inc."
                            />
                          </div>
                          <div>
                            <Label>LinkedIn Profile</Label>
                            <Field as={Input} name="linkedInProfile" />
                            {errors.linkedInProfile &&
                              touched.linkedInProfile && (
                                <div className="text-red-500 text-sm mt-1">
                                  {errors.linkedInProfile}
                                </div>
                              )}
                          </div>
                          <div>
                            <Label>Personal Website</Label>
                            <Field as={Input} name="website" />
                            {errors.website && touched.website && (
                              <div className="text-red-500 text-sm mt-1">
                                {errors.website}
                              </div>
                            )}
                          </div>
                          <div className="md:col-span-2">
                            <Label>PayPal Email (for payments)</Label>
                            <Field as={Input} name="paypalEmail" type="email" />
                            {errors.paypalEmail && touched.paypalEmail && (
                              <div className="text-red-500 text-sm mt-1">
                                {errors.paypalEmail}
                              </div>
                            )}
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
                            <Label>Street Address</Label>
                            <Field as={Input} name="address.street" />
                          </div>
                          <div>
                            <Label>City</Label>
                            <Field as={Input} name="address.city" />
                          </div>
                          <div>
                            <Label>State/Province</Label>
                            <Field as={Input} name="address.state" />
                          </div>
                          <div>
                            <Label>Country</Label>
                            <Field as={Input} name="address.country" />
                          </div>
                          <div>
                            <Label>Zip Code</Label>
                            <Field as={Input} name="address.zipCode" />
                          </div>
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
                          <div>
                            <Label>Twitter</Label>
                            <Field
                              as={Input}
                              name="socialMedia.twitter"
                              placeholder="https://twitter.com/..."
                            />
                          </div>
                          <div>
                            <Label>Facebook</Label>
                            <Field
                              as={Input}
                              name="socialMedia.facebook"
                              placeholder="https://facebook.com/..."
                            />
                          </div>
                          <div>
                            <Label>Instagram</Label>
                            <Field
                              as={Input}
                              name="socialMedia.instagram"
                              placeholder="https://instagram.com/..."
                            />
                          </div>
                          <div>
                            <Label>YouTube</Label>
                            <Field
                              as={Input}
                              name="socialMedia.youtube"
                              placeholder="https://youtube.com/..."
                            />
                          </div>
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
