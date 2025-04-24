import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/InstructorCompontents/Navbar";
import instrucorImg from "@/assets/instructor/instructor1 (1).jpg"
import rainwillson from "@/assets/instructor/rainwillson.jpeg"
import Footer from "@/components/InstructorCompontents/Footer";

const features = [
  {
    icon: "mdi:teach",
    title: "Teach on your terms",
    description:
      "Create and publish the course you want, your way, while maintaining full control over your content.",
  },
  {
    icon: "mdi:lightbulb-on-outline",
    title: "Inspire minds",
    description:
      "Share your knowledge and empower learners to explore their passions, develop new skills, and grow their careers.",
  },
  {
    icon: "mdi:gift-outline",
    title: "Get rewarded",
    description:
      "Grow your network, showcase your expertise, and earn money with every paid enrollment.",
  },
];

const InstrucorHome = () => {
    return (
      <>
        <Navbar />
        <section className="px-4 py-12 md:px-16 lg:px-24 max-w-screen-xl mx-auto">
          <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-10">
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-black mb-4">
                Join us and inspire <br /> the next generation
              </h1>
              <p className="mb-6 text-gray-600">
                Join us and inspire the next generation
              </p>
              <Button className="bg-indigo-500 hover:bg-indigo-600 text-white">
                Get Started
              </Button>
            </div>
            <div>
              <img
                src={instrucorImg}
                alt="Instructor on video call"
                className="w-full max-w-md rounded-lg shadow-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="border p-6 rounded-lg text-center align-item-center hover:shadow-md transition"
              >
                <Icon
                  icon={feature.icon}
                  className="text-5xl text-black mb-4"
                />
                <h3 className="text-lg font-semibold mb-2 text-black">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
        <section >
          {/* Top Stats */}
          <div className="bg-indigo-600 text-white py-6 px-4 grid grid-cols-2 sm:grid-cols-4 text-center gap-4">
            <div>
              <p className="text-2xl font-bold">1,800</p>
              <p className="text-sm">Students</p>
            </div>
            <div>
              <p className="text-2xl font-bold">500</p>
              <p className="text-sm">Teachers</p>
            </div>
            <div>
              <p className="text-2xl font-bold">5</p>
              <p className="text-sm">Languages</p>
            </div>
            <div>
              <p className="text-2xl font-bold">1,200</p>
              <p className="text-sm">Courses</p>
            </div>
          </div>

          {/* Testimonial */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 py-12 px-6">
            {/* Quote */}
            <div className="max-w-lg text-center md:text-left">
              <div className="text-6xl text-gray-400 leading-none mb-4">“</div>
              <p className="text-lg font-medium text-gray-800">
                Teachers can make such a profound impact on our lives and should
                be honored as heroes
              </p>
              <p className="mt-4 text-indigo-700 font-semibold">
                - Rainn Wilson
              </p>
            </div>

            {/* Image */}
            <img
              src={rainwillson} // replace with actual path if importing
              alt="Rainn Wilson"
              className="w-40 h-40 object-cover rounded shadow-md"
            />
          </div>
        </section>
        <Footer/>
      </>
    );
};

export default InstrucorHome;
