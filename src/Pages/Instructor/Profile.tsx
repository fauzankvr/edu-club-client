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

interface ProfileData {
  email: string;
  fullName: string;
  phone: string;
  nationality?: string;
  dateOfBirth?: string;
  eduQulification?: string;
  paypalEmail?: string;
  Biography?: string;
  profileImage?: string;
}

const successToast = () => toast.success("Profile updated successfully");

const ProfileSchema = Yup.object().shape({
  fullName: Yup.string().required("Full name is required"),
  phone: Yup.string()
    .required("Phone number is required")
    .matches(/^[0-9]{10}$/, "Phone must be 10 digits"),
  nationality: Yup.string().nullable(),
  dateOfBirth: Yup.date().nullable(),
  eduQulification: Yup.string().nullable(),
  paypalEmail: Yup.string().email("Invalid email").nullable(),
  Biography: Yup.string().nullable(),
});

const Profile = () => {
  const [image, setImage] = useState<File | null | string>(null);
  const [initialValues, setInitialValues] = useState<ProfileData>({
    email: "",
    fullName: "",
    phone: "",
    nationality: "",
    dateOfBirth: "",
    eduQulification: "",
    paypalEmail: "",
    Biography: "",
    profileImage: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await instructorApi.getProfile();
        const profileData = res.profile;
        setInitialValues({
          email: profileData.email,
          fullName: profileData.fullName || "",
          phone: profileData.phone?.toString() || "",
          nationality: profileData.nationality || "",
          dateOfBirth: profileData.dateOfBirth?.split("T")[0] || "",
          eduQulification: profileData.eduQulification || "",
          paypalEmail: profileData.paypalEmail || "",
          Biography: profileData.Biography || "",
          profileImage: profileData.profileImage || "",
        });
        if (profileData.profileImage) setImage(profileData.profileImage);
      } catch (err) {
        console.error("Profile fetch failed:", err);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (values: ProfileData) => {
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, val]) => {
        if (val) formData.append(key, val);
      });
      if (image && typeof image !== "string") {
        formData.append("profileImage", image);
      }
      await instructorApi.updateProfile(formData);
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
          {({ errors, touched, setFieldValue, dirty }) => (
            <Form>
              <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
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
                        setFieldValue("profileImage", file);
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

              <div className="space-y-4">
                {[
                  { name: "fullName", label: "Full Name" },
                  { name: "phone", label: "Phone Number" },
                  { name: "nationality", label: "Nationality" },
                  { name: "dateOfBirth", label: "Date of Birth", type: "date" },
                  {
                    name: "eduQulification",
                    label: "Educational Qualification",
                  },
                  { name: "paypalEmail", label: "PayPal Email" },
                ].map(({ name, label, type = "text" }) => (
                  <div key={name}>
                    <Label htmlFor={name} className="font-semibold">
                      {label}
                    </Label>
                    <Field
                      as={Input}
                      name={name}
                      type={type}
                      placeholder={label}
                      className="mt-1 border border-indigo-500"
                    />
                    {errors[name as keyof typeof errors] &&
                      touched[name as keyof typeof touched] && (
                        <div className="text-red-500 text-sm">
                          {errors[name as keyof typeof errors] as string}
                        </div>
                      )}
                  </div>
                ))}

                <div>
                  <Label htmlFor="Biography" className="font-semibold">
                    Biography
                  </Label>
                  <Field
                    as="textarea"
                    name="Biography"
                    placeholder="Write something about yourself"
                    className="mt-1 border border-indigo-500 w-full h-24"
                  />
                </div>
              </div>

              <div className="mt-6 text-right">
                <Button
                  type="submit"
                  className={`bg-indigo-600 text-white px-10 ${
                    !dirty ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={!dirty}
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
