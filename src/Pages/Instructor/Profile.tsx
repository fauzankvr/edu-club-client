import Footer from "@/components/InstructorCompontents/Footer";
import Navbar from "@/components/InstructorCompontents/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import instructorApi from "@/API/InstructorApi";
import { ProfileData } from "../types/student";

// Toast on successful profile update
const successToast = () => toast.success("Profile updated successfully");

// Validation schema
const ProfileSchema = Yup.object().shape({
  fullName: Yup.string().required("Full name is required"),
  phone: Yup.string()
    .required("Phone number is required")
    .matches(/^[0-9]{10}$/, "Phone must be 10 digits"),
  linkedInId: Yup.string().nullable(),
  githubId: Yup.string().nullable(),
});



const Profile = () => {
  const [image, setImage] = useState<File | null | string>(null);
  const [initialValues, setInitialValues] = useState<ProfileData>({
    fullName: "",
    phone: "",
    linkedInId: "",
    githubId: "",
    profileImage: "",
  });
  

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await instructorApi.getProfile();
        const profileData = res.profile;

        setInitialValues({
          fullName: profileData.fullName || "",
          phone: profileData.phone?.toString() || "",
          linkedInId: profileData.linkedInId || "",
          githubId: profileData.githubId || "",
          profileImage: profileData.profileImage || "",
        });
        
        if (profileData.profileImage) {
          setImage(profileData.profileImage);
        }
      } catch (err) {
        console.error("Profile fetch failed:", err);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (values: ProfileData) => {
    try {
      const formData = new FormData();
      formData.append("fullName", values.fullName || "");
      formData.append("phone", values.phone || "");
      formData.append("linkedInId", values.linkedInId || "");
      formData.append("githubId", values.githubId || "");

      if (image && typeof image !== "string") {
        formData.append("profileImage", image);
      }

      await instructorApi.updateProfile(formData as ProfileData);
      successToast();
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  return (
    <>
      <Navbar />
      <ToastContainer />
      <div className="max-w-4xl mx-auto border-2 border-indigo-500 p-6 rounded-xl mt-6 mb-6">
        <p className="text-sm mb-4 text-gray-600">Update your profile below</p>

        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={ProfileSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, setFieldValue }) => (
            <Form>
              <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                {/* Image Preview */}
                <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                  {image ? (
                    <img
                      src={
                        typeof image === "string"
                          ? image
                          : URL.createObjectURL(image)
                      }
                      alt="Profile"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Icon icon="mdi:account" className="w-16 h-16 text-white" />
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setImage(file);

                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFieldValue("profileImage", reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    className="text-indigo-600 underline text-sm cursor-pointer"
                    onClick={() =>
                      document.getElementById("profileImage")?.click()
                    }
                  >
                    Edit Photo
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="fullName" className="font-semibold">
                      Full Name
                    </Label>
                    <Field
                      as={Input}
                      name="fullName"
                      placeholder="Enter full name"
                      className="mt-1 border border-indigo-500"
                    />
                    {errors.fullName && touched.fullName && (
                      <div className="text-red-500 text-sm">
                        {errors.fullName}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <Label htmlFor="phone" className="font-semibold">
                      Phone Number
                    </Label>
                    <Field
                      as={Input}
                      name="phone"
                      placeholder="Enter 10-digit phone number"
                      className="mt-1 border border-indigo-500"
                    />
                    {errors.phone && touched.phone && (
                      <div className="text-red-500 text-sm">{errors.phone}</div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="linkedInId" className="font-semibold">
                      LinkedIn ID
                    </Label>
                    <Field
                      as={Input}
                      name="linkedInId"
                      placeholder="LinkedIn profile URL"
                      className="mt-1 border border-indigo-500"
                    />
                  </div>

                  <div className="flex-1">
                    <Label htmlFor="githubId" className="font-semibold">
                      GitHub ID
                    </Label>
                    <Field
                      as={Input}
                      name="githubId"
                      placeholder="GitHub profile URL"
                      className="mt-1 border border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 text-right">
                <Button
                  type="submit"
                  className="bg-indigo-600 text-white px-10"
                >
                  Save
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
