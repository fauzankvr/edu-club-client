import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@iconify/react";
import Navbar from "@/components/studentComponents/Navbar";
import Footer from "@/components/studentComponents/Footer";
import { useLayoutEffect, useState } from "react";
import studentAPi from "@/API/StudentApi";
import { useDispatch, useSelector } from "react-redux";
import { setProfile } from "@/features/student/redux/studentSlce";
import { RootState } from "@/features/student/redux/store";
import { ProfileData } from "../types/student"; 
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const navigate = useNavigate()
  const successToast = () => toast.success("Profile Updated Successfully");
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.student.profile);
  const [email, setEmail] = useState("user@email.com");
 
  const [formData, setFormData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    phone: 0,
    linkedInId: "",
    githubId: "",
    profileImage: "",
  });
  const imageUrl = `${import.meta.env.VITE_BASE_URL}/${formData.profileImage}`;

  useLayoutEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await studentAPi.getProfile();
        const profileData = res.profile;
        setEmail(res.profile.email)
        console.log(profileData)
        dispatch(setProfile(profileData));

        setFormData({
          firstName: profileData.firstName || "",
          lastName: profileData.lastName || "",
          profileImage: profileData.profileImage || "",
          phone: profileData.phone || "",
          linkedInId: profileData.linkedInId || "",
          githubId: profileData.githubId || "",
        });
      } catch (err) {
            console.error("Profile fetch failed:", err);
           if (err.response?.status === 403) {
             toast.error("Access denied. You have been blocked.");
             navigate("/login"); 
             localStorage.removeItem("studentToken");
           } else {
             toast.error("Failed to fetch profile.");
           }
      }
    };

    if (!profile) {
      fetchProfile();
    } else {
      const { firstName, lastName, profileImage, phone, linkedInId, githubId } =
        profile;
      setFormData({
        firstName: firstName || "",
        lastName: lastName || "",
        profileImage: profileImage || "",
        phone: phone || 0,
        linkedInId: linkedInId || "",
        githubId: githubId || "",
      });
    }
  }, []);

  const handleChange = <K extends keyof ProfileData>(
    field: K,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const data = new FormData();
      data.append("firstName", formData.firstName!);
      data.append("lastName", formData.lastName!);
      data.append("phone", formData.phone!.toString());
      data.append("linkedInId", formData.linkedInId!);
      data.append("githubId", formData.githubId!);
      if (selectedImage) {
        data.append("profileImage", selectedImage); // key must match backend Multer field
      }

      const res = await studentAPi.updateProfile(data);
      successToast();
      console.log("Update success:", res);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };


  const displayName = `${formData.firstName} ${formData.lastName}`.trim();
const handleImageChange = (file: File) => {
  setSelectedImage(file);
  const reader = new FileReader();
  reader.onloadend = () => {
    setFormData((prev) => ({
      ...prev,
      profileImage: reader.result as string, // For preview only
    }));
  };
  reader.readAsDataURL(file);
};


  return (
    <>
      <Navbar />
      <ToastContainer />
      <div className="min-h-screen flex flex-col md:flex-row">
        <aside className="w-full md:w-64 bg-gray-50 border-r p-4">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-primary overflow-hidden flex items-center justify-center text-white text-xl">
              {formData.profileImage ? (
                <img
                  src={
                    formData.profileImage.startsWith("data:")
                      ? formData.profileImage // base64 preview
                      : imageUrl 
                  }
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Icon
                  icon="mdi:account"
                  width={25}
                  className="text-white mx-auto "
                />
              )}
            </div>
            <p className="mt-2 font-semibold">
              {displayName || "Student Name"}
            </p>
          </div>
          <nav className="mt-6 flex flex-col gap-2">
            {["My Profile", "My Courses", "Class Room", "Class Room"].map(
              (item, idx) => (
                <button
                  key={idx}
                  className="text-left px-4 py-2 rounded-md hover:bg-indigo-200 transition border"
                >
                  {item}
                </button>
              )
            )}
          </nav>
        </aside>

        <main className="flex-1 p-4 sm:p-6 bg-white">
          <Card className="mb-6 p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-sm">
            <div className="ml-4 w-30 h-30 rounded-full bg-primary overflow-hidden flex items-center justify-center">
              {formData.profileImage ? (
                <img
                  src={
                    formData.profileImage.startsWith("data:")
                      ? formData.profileImage // base64 preview
                      : `http://localhost:5000/${formData.profileImage}` // server path
                  }
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Icon
                  icon="mdi:account"
                  width={35}
                  className="text-white mx-auto "
                />
              )}
            </div>
            <div className="text-center sm:text-left ml-6 mt-3">
              <h2 className="text-lg font-semibold">{displayName}</h2>
              <p className="text-sm text-gray-500">{email}</p>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                id="upload-profile"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleImageChange(e.target.files[0]);
                  }
                }}
              />
              <button
                className="text-primary text-xs mt-1 underline cursor-pointer"
                onClick={() =>
                  document.getElementById("upload-profile")?.click()
                }
              >
                Edit Profile
              </button>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 shadow-md">
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Basics:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    placeholder="Enter your First name"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                  />
                  <Input
                    placeholder="Enter your Last name"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                  />
                  <Input
                    placeholder="Enter your Phone Number"
                    value={formData.phone ?? ""}
                    className="sm:col-span-2"
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Links:</h3>
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    placeholder="Enter your LinkedIn Url"
                    value={formData.linkedInId ?? ""}
                    onChange={(e) => handleChange("linkedInId", e.target.value)}
                  />
                  <Input
                    placeholder="Enter your Github Url"
                    value={formData.githubId ?? ""}
                    onChange={(e) => handleChange("githubId", e.target.value)}
                  />
                </div>
              </div>

              <div className="text-right">
                <Button onClick={handleSave} className="text-white px-6">
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
      <Footer />
    </>
  );
}
