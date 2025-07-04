import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@iconify/react";
import Navbar from "@/components/studentComponents/Navbar";
import Footer from "@/components/studentComponents/Footer";
import { useLayoutEffect, useState, useEffect } from "react";
import studentAPi from "@/API/StudentApi";
import { useDispatch, useSelector } from "react-redux";
import { setProfile } from "@/features/student/redux/studentSlce";
import { RootState } from "@/features/student/redux/store";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { Purchase } from "@/Interface/Purchase";   
import PurchaseHistory from "./PurchaseHistory";

// Define the ProfileData interface
interface ProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  linkedInId: string;
  githubId: string;
  profileImage: string;
}

// Define the API response type
interface ProfileResponse {
  profile: ProfileData & { email: string };
}

// New reusable ProfileImage component with error handling fallback
function ProfileImage({ src }: { src: string }) {
  const [imageError, setImageError] = useState(false);

  return (
    <>
      {!imageError && src ? (
        <img
          src={src}
          alt="Profile Image"
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-300">
          <Icon icon="mdi:account" width={35} className="text-white" />
        </div>
      )}
    </>
  );
}

export default function ProfilePage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [activeSection, setActiveSection] = useState<"profile" | "purchases">("profile");
  const [hasChanges, setHasChanges] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.student.profile as ProfileData | null);
  const [email, setEmail] = useState<string>("user@email.com");
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [formData, setFormData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    phone: "",
    linkedInId: "",
    githubId: "",
    profileImage: "",
  });
  const [initialFormData, setInitialFormData] = useState<ProfileData | null>(null);

  const imageUrl = formData.profileImage;

  useLayoutEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = (await studentAPi.getProfile()) as ProfileResponse;
        const profileData = res.profile;
        setEmail(profileData.email);
        dispatch(setProfile({ profile: profileData }));

        const newFormData = {
          firstName: profileData.firstName ?? "",
          lastName: profileData.lastName ?? "",
          profileImage: profileData.profileImage ?? "",
          phone: profileData.phone ?? "",
          linkedInId: profileData.linkedInId ?? "",
          githubId: profileData.githubId ?? "",
        };

        setFormData(newFormData);
        setInitialFormData(newFormData); // Store initial data for comparison
      } catch (err) {
        const error = err as AxiosError;
        console.error("Profile fetch failed:", error);
        if (error.response?.status === 403) {
          toast.error("Access denied. You have been blocked.");
          navigate("/login");
          localStorage.removeItem("studentToken");
        } else {
          toast.error("Failed to fetch profile.");
        }
      }
    };

    const fetchPurchases = async () => {
      try {
        const res = await studentAPi.getPurchaseHistory();
        setPurchases(res.data.data.purchases || []);
      } catch (err) {
        console.error("Purchase history fetch failed:", err);
        toast.error("Failed to fetch purchase history.");
      }
    };

    if (!profile) {
      fetchProfile();
    } else {
      const newFormData = {
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        profileImage: profile.profileImage ?? "",
        phone: profile.phone ?? "",
        linkedInId: profile.linkedInId ?? "",
        githubId: profile.githubId ?? "",
      };
      setFormData(newFormData);
      setInitialFormData(newFormData); // Store initial data for comparison
    }
    fetchPurchases();
  }, [profile, dispatch, navigate]);

  // Check for changes whenever formData or selectedImage changes
  useEffect(() => {
    if (initialFormData) {
      const hasFormChanges = Object.keys(formData).some(
        (key) =>
          formData[key as keyof ProfileData] !==
          initialFormData[key as keyof ProfileData]
      );
      setHasChanges(hasFormChanges || !!selectedImage);
    }
  }, [formData, selectedImage, initialFormData]);

  const handleChange = <K extends keyof ProfileData>(
    field: K,
    value: ProfileData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const data = new FormData();
      data.append("firstName", formData.firstName);
      data.append("lastName", formData.lastName);
      data.append("phone", formData.phone);
      data.append("linkedInId", formData.linkedInId);
      data.append("githubId", formData.githubId);
      if (selectedImage) {
        data.append("profileImage", selectedImage);
      }

      const profileData: ProfileData = {
        firstName: data.get("firstName") as string,
        lastName: data.get("lastName") as string,
        phone: data.get("phone") as string,
        linkedInId: data.get("linkedInId") as string,
        githubId: data.get("githubId") as string,
        profileImage: data.get("profileImage") as string,
      };

      const res = await studentAPi.updateProfile(profileData);
      toast.success("Profile Updated Successfully");
      setInitialFormData(formData); // Update initial data after successful save
      setSelectedImage(null); // Reset selected image
      dispatch(setProfile({ profile: profileData }));
      console.log("Update success:", res);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile.");
    }
  };

  const handleImageChange = (file: File) => {
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        profileImage: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const displayName =
    `${formData.firstName} ${formData.lastName}`.trim() || "Student Name";

  return (
    <>
      <Navbar />
      <ToastContainer />
      <div className="min-h-screen flex flex-col md:flex-row">
        <aside className="w-full md:w-64 bg-gray-50 border-r p-4">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-primary overflow-hidden flex items-center justify-center text-white text-xl">
              <ProfileImage
                src={
                  formData.profileImage.startsWith("data:")
                    ? formData.profileImage
                    : imageUrl
                }
              />
            </div>
            <p className="mt-2 font-semibold">{displayName}</p>
          </div>
          <nav className="mt-6 flex flex-col gap-2">
            {["My Profile", "Purchase History"].map((item, idx) => (
              <button
                key={idx}
                className={`text-left px-4 py-2 rounded-md transition border ${
                  (item === "My Profile" && activeSection === "profile") ||
                  (item === "Purchase History" && activeSection === "purchases")
                    ? "bg-indigo-200 text-indigo-800"
                    : "hover:bg-indigo-200"
                }`}
                onClick={() =>
                  setActiveSection(
                    item === "My Profile" ? "profile" : "purchases"
                  )
                }
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-4 sm:p-6 bg-white">
          {activeSection === "profile" ? (
            <>
              <Card className="mb-6 p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-sm">
                <div className="ml-4 w-30 h-30 rounded-full bg-primary overflow-hidden flex items-center justify-center">
                  <ProfileImage
                    src={
                      formData.profileImage.startsWith("data:")
                        ? formData.profileImage
                        : imageUrl
                    }
                  />
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
                        onChange={(e) =>
                          handleChange("firstName", e.target.value)
                        }
                      />
                      <Input
                        placeholder="Enter your Last name"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleChange("lastName", e.target.value)
                        }
                      />
                      <Input
                        placeholder="Enter your Phone Number"
                        value={formData.phone}
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
                        value={formData.linkedInId}
                        onChange={(e) =>
                          handleChange("linkedInId", e.target.value)
                        }
                      />
                      <Input
                        placeholder="Enter your Github Url"
                        value={formData.githubId}
                        onChange={(e) =>
                          handleChange("githubId", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="text-right">
                    <Button 
                      onClick={handleSave} 
                      className="text-white px-6"
                      disabled={!hasChanges}
                    >
                      Save
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <PurchaseHistory purchases={purchases} />
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}