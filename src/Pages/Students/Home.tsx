import InfoBox from "@/components/studentComponents/InfoBox";
import Navbar from "../../components/studentComponents/Navbar";
import carrosalImage from '../../assets/students/carrosl_front.jpg'
import PopularSubjects from "@/components/studentComponents/PopularSub";
import TopCourses from "@/components/studentComponents/TopCourses";
import LookingFor from "@/components/studentComponents/lookingFor";
import Testimonials from "@/components/studentComponents/Testimonial";
import Footer from "@/components/studentComponents/Footer";

const Home = () => {
    return (
      <>
        <Navbar />
        <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-6">
          <div className="container lg:px-8 mx-auto flex flex-col lg:flex-row items-center text-center lg:text-left">
            {/* Left: Heading */}
            <div className="w-full lg:w-1/2 ">
              <h1 className="text-5xl font-bold text-gray-900 mb-4 lg:px-2">
                Grow Your <span className="text-indigo-600">Skills</span> to
                Advance Your Career Path
              </h1>
            </div>

            {/* Right: Description and Search Bar */}
            <div className="w-full lg:w-1/2 mt-6 lg:mt-0">
              <p className="text-gray-700 max-w-2xl mx-auto lg:mx-0">
                Unlock new skills and expand your knowledge. Learn from industry
                experts at your own pace. Gain practical experience with
                real-world projects. Take the next step toward a successful
                career.
              </p>
              <div className="mt-5 flex items-center gap-2 border rounded-lg overflow-hidden shadow-sm w-full max-w-md mx-auto lg:mx-0">
                <input
                  type="text"
                  placeholder="Find Your Course..."
                  className="p-3 w-full outline-none"
                />
                <button className="bg-indigo-600 text-white px-6 py-3">
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Section: Image and Info Boxes */}
          <div className="relative mt-12 w-full flex justify-center">
            <img
              src={carrosalImage}
              alt="Learning"
              className="w-full max-w-6xl rounded-sm shadow-md"
            />
            <InfoBox
              topText="25"
              bottomText="Online Courses"
              right="2"
              topValue="22"
            />
            <InfoBox
              topText="100"
              bottomText="Expireance Mentor"
              right="6"
              topValue="2" 
            />
          </div>
        </div>
        <PopularSubjects />
        <TopCourses />
        <LookingFor />
        <Testimonials />
        <Footer/>
     </>
      
    );
}

export default Home