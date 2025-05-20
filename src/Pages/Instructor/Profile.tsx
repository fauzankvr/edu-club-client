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

const successToast = () => toast.success("Profile Updated Successfully");

const ProfileSchema = Yup.object().shape({
  fullName: Yup.string().required("Full name is required"),
  dateOfBirth: Yup.string().required("Date of birth is required"),
  nationality: Yup.string().required("Nationality is required"),
  eduQulification: Yup.string().required("Education is required"),
  phone: Yup.string()
    .required("Phone number is required")
    .matches(/^[0-9]{10}$/, "Phone must be 10 digits"),
});

const Profile = () => {
  const [image, setImage] = useState<File | null>(null);
  const [initialValues, setInitialValues] = useState({
    fullName: "",
    dateOfBirth: "",
    nationality: "",
    eduQulification: "",
    phone: "",
    profileImage: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await instructorApi.getProfile();
        const profileData = res.profile;

        setInitialValues({
          fullName: profileData.fullName || "",
          dateOfBirth: profileData.dateOfBirth?.split("T")[0] || "",
          nationality: profileData.nationality || "",
          eduQulification: profileData.eduQulification || "",
          phone: profileData.phone || "",
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

  // const handleImageUpload = (
  //   e: React.ChangeEvent<HTMLInputElement>,
  //   setFieldValue: any
  // ) => {
  //   if (e.target.files && e.target.files.length > 0) {
  //     const file = e.target.files[0];
  //     setImage(file);

  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setFieldValue("profileImage", reader.result);
  //     };
  //     reader.readAsData(file);
  //   }
  // };

const handleSubmit = async (values: typeof initialValues) => {
  try {
    const formData = new FormData();
    formData.append("fullName", values.fullName);
    formData.append("dateOfBirth", values.dateOfBirth);
    formData.append("nationality", values.nationality);
    formData.append("eduQulification", values.eduQulification);
    formData.append("phone", values.phone);

    // Append image file if selected
    if (image && typeof image !== "string") {
      formData.append("profileImage", image);
    }

    await instructorApi.updateProfile(formData); // should handle multipart
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
        <p className="text-sm mb-4 text-gray-600">
          Enter your correct details below
        </p>

        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={ProfileSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, setFieldValue }) => (
            <Form>
              <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                <h2 className="text-lg font-semibold">{touched.fullName}</h2>
                {/* Image preview box */}
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

                {/* File input & trigger */}
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

                  {/* Fix: Button triggers hidden file input */}
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
                <div>
                  <Label htmlFor="fullName" className="font-semibold">
                    Your Full Name
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

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="dateOfBirth" className="font-semibold">
                      Date of Birth
                    </Label>
                    <Field
                      type="date"
                      name="dateOfBirth"
                      className="mt-1 border border-indigo-500 w-full"
                      as={Input}
                    />
                    {errors.dateOfBirth && touched.dateOfBirth && (
                      <div className="text-red-500 text-sm">
                        {errors.dateOfBirth}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="nationality" className="font-semibold">
                      Nationality
                    </Label>
                    <Field
                      as={Input}
                      name="nationality"
                      placeholder="Nationality"
                      className="mt-1 border border-indigo-500"
                    />
                    {errors.nationality && touched.nationality && (
                      <div className="text-red-500 text-sm">
                        {errors.nationality}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="eduQulification" className="font-semibold">
                      Education Qualification
                    </Label>
                    <Field
                      as={Input}
                      name="eduQulification"
                      placeholder="Enter qualification"
                      className="mt-1 border border-indigo-500"
                    />
                    {errors.eduQulification && touched.eduQulification && (
                      <div className="text-red-500 text-sm">
                        {errors.eduQulification}
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
                      placeholder="Enter phone number"
                      className="mt-1 border border-indigo-500"
                    />
                    {errors.phone && touched.phone && (
                      <div className="text-red-500 text-sm">{errors.phone}</div>
                    )}
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
