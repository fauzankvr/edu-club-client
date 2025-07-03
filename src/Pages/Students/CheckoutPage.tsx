import Footer from "@/components/studentComponents/Footer";
import Navbar from "@/components/studentComponents/Navbar";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import Checkout from "./Checkout";
import { useParams } from "react-router-dom";
import { ICourseData } from "@/Interface/CourseData";
import studentAPI from "@/API/StudentApi";

const CheckoutPage = () => {
  const [showModal, setShowModal] = useState(false); 
  const [showCheckoutContent, setShowCheckoutContent] = useState(false);

  const [course, setCourse] = useState<ICourseData>();
  const { id } = useParams();
  
    useEffect(() => {
      const fetchCourse = async () => {
        try {
          if (!id) return;
          const res = await studentAPI.findOneCourse(id);
          console.log(res.data.course)
          setCourse(res.data.course);
        } catch (error) {
          console.log(error);
        }
      };
  
      fetchCourse();
    }, [id]);
  

  // Handle clicking PayPal section
  const handlePayPalClick = () => {
    setShowModal(true);
    setShowCheckoutContent(true); 
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setShowCheckoutContent(false);
  };

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto p-4 md:p-10 space-y-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 space-x-1">
          <span className="text-indigo-600 cursor-pointer hover:underline">
            Web Development
          </span>{" "}
          &gt;
          <span className="text-indigo-600 cursor-pointer hover:underline">
            {" "}
            Web Design
          </span>{" "}
          &gt;
          <span> Checkout</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Payment Section */}
          <div className="md:col-span-2 bg-white rounded-xl shadow p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Checkout</h2>

            {/* Payment Methods Section */}
            <div className="space-y-4">
              {/* PayPal Section */}
              <div
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer"
                onClick={handlePayPalClick} // Show modal when clicked
              >
                <Icon icon="logos:paypal" className="w-10 h-10" />
                <span className="text-sm text-gray-700">Pay with PayPal</span>
              </div>

              {/* Razorpay Section */}
              {/* <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-300">
                <Icon icon="simple-icons:razorpay" className="w-10 h-10" />
                <span className="text-sm text-gray-700">Pay with Razorpay</span>
              </div> */}
            </div>

            {/* Payment Form */}
            {/* <form className="space-y-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name on Card
                </label>
                <input
                  type="text"
                  placeholder="Enter name on card"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="Enter card number"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700">
                    Expiration Date (MM/YY)
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700">
                    CVC
                  </label>
                  <input
                    type="text"
                    placeholder="Enter CVC"
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Save Info */}
              {/* <label className="flex items-center mt-2 text-sm text-gray-600">
                <input type="checkbox" className="mr-2" />
                Save my information for faster checkout
              </label> */}

              {/* Confirm Button */}
              {/* <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded-lg text-lg hover:bg-indigo-700 transition"
              >
                Confirm
              </button>
            </form>  */}
          </div>

          {/* Right: Summary Section */}
          <div className="bg-indigo-50 rounded-xl shadow p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Summary</h3>

            {/* Course */}
            <div className="flex items-center gap-4">
              <img
                src={course?.courseImageId}
                alt="Course"
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="text-sm">
                <p className="text-gray-700 font-medium">
                  {course?.title}
                </p>
                <p className="text-gray-600 mt-1">₹{ course?.price}</p>
              </div>
            </div>

            <hr className="my-2 border-gray-300" />

            {/* Pricing */}
            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{ course?.price}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span>{ course?.discount}%</span>
              </div>
              {/* <div className="flex justify-between">
                <span>Tax</span>
                <span>5%</span>
              </div> */}
              <hr className="border-gray-300 my-2" />
              <div className="flex justify-between font-semibold text-gray-900">
                <span>Total</span>
                <span>₹{course?.price }</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Modal for Checkout */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full relative my-8 max-h-[90vh] overflow-y-auto">
            {/* Close Icon */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <Icon icon="mdi:close" className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Checkout
            </h2>
            {showCheckoutContent && <Checkout />}
          </div>
        </div>
      )}
    </>
  );
};

export default CheckoutPage;
