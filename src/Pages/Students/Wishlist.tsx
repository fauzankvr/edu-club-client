import { useEffect, useState } from "react";
import Footer from "@/components/studentComponents/Footer";
import Navbar from "@/components/studentComponents/Navbar";
import { Icon } from "@iconify/react";
import studentAPI from "@/API/StudentApi";
import { ICourseData } from "@/Interface/CourseData";
import { useNavigate } from "react-router-dom";

const baseUrl = import.meta.env.VITE_BASE_URL;

interface WishlistItem {
  _id: string;
  student: string;
  course: ICourseData;
  createdAt: string;
  updatedAt: string;
}

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    try {
      const response = await studentAPI.getWishlist();
      setWishlistItems(response.data.wishlist);
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleCardClick = (courseId: string) => {
    console.log("Clicked course:", courseId);
    // Optional: Navigate to course detail page
  };

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-10 text-center">
          Your Wishlist
        </h1>

        {loading ? (
          <div className="text-center py-10 text-gray-500">
            Loading wishlist...
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Your wishlist is empty.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
            {wishlistItems.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-xl overflow-hidden border hover:shadow-lg transition-all flex flex-col h-[420px] cursor-pointer"
                onClick={() => handleCardClick(item.course._id)}
              >
                <div className="w-full h-40 overflow-hidden">
                  <img
                    src={`${baseUrl}/${item.course.courseImageId}`}
                    alt={item.course.title}
                    className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-4 flex flex-col gap-2 flex-grow">
                  <span className="text-xs bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full w-fit font-medium">
                    {item.course.category}
                  </span>

                  <h2 className="text-base font-semibold text-gray-800 line-clamp-1">
                    {item.course.title}
                  </h2>

                  <p className="text-sm text-gray-500 line-clamp-2">
                    {item.course.description}
                  </p>

                  <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-gray-400 line-through">
                      ₹{item.course.price}
                    </span>
                    <span className="text-indigo-600 font-bold text-base">
                      ₹
                      {Math.round(
                        item.course.price -
                          (item.course.price *
                            parseFloat(item.course.discount)) /
                            100
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-yellow-500 text-sm mt-1">
                    <Icon icon="mdi:star" /> 4.5k
                  </div>

                  <div className="mt-auto pt-3">
                    <button
                      className="bg-indigo-600 hover:bg-indigo-700 text-white w-full py-2 rounded-lg transition text-sm font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/courses/checkout/${item.course._id}`);
                      }}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default Wishlist;
