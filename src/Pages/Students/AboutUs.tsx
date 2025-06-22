import Footer from "@/components/studentComponents/Footer";
import Navbar from "@/components/studentComponents/Navbar";
import { BookOpen, Award, Target, Lightbulb, Heart } from "lucide-react";

const AboutUs = () => {
  const stats = [
    { number: "10,000+", label: "Active Students" },
    { number: "500+", label: "Expert Instructors" },
    { number: "1,200+", label: "Quality Courses" },
    { number: "95%", label: "Success Rate" },
  ];

  const values = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "Excellence",
      description:
        "We strive for excellence in every course and interaction, ensuring top-quality learning experiences.",
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Innovation",
      description:
        "Embracing cutting-edge technology and teaching methods to make learning engaging and effective.",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Community",
      description:
        "Building a supportive learning community where students and instructors grow together.",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Achievement",
      description:
        "Celebrating every milestone and helping learners achieve their personal and professional goals.",
    },
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face",
      description:
        "Passionate educator with 15+ years in online learning innovation.",
    },
    {
      name: "Michael Chen",
      role: "CTO",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      description:
        "Technology leader focused on creating seamless learning experiences.",
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Content",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      description:
        "Curriculum expert ensuring high-quality, engaging course content.",
    },
    {
      name: "David Kim",
      role: "Head of Student Success",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      description:
        "Dedicated to supporting every student's learning journey and success.",
    },
  ];

    return (
        <>
            <Navbar />
        <div className="min-h-screen bg-gray-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-800 text-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  About Our Platform
                </h1>
                <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto leading-relaxed">
                  Empowering learners worldwide with accessible, high-quality
                  education that transforms lives and careers.
                </p>
              </div>
            </div>
          </section>

          {/* Mission Section */}
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                    Our Mission
                  </h2>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    We believe that quality education should be accessible to
                    everyone, everywhere. Our platform breaks down barriers and
                    connects passionate learners with world-class instructors
                    and cutting-edge content.
                  </p>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Through innovative technology and personalized learning
                    experiences, we're building the future of education—one
                    student, one course, one success story at a time.
                  </p>
                </div>
                <div className="relative">
                  <div className="bg-indigo-100 rounded-2xl p-8">
                    <BookOpen className="w-16 h-16 text-indigo-600 mb-4" />
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                      Learn Without Limits
                    </h3>
                    <p className="text-gray-600">
                      From beginner tutorials to advanced masterclasses,
                      discover courses that match your pace and passion.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="bg-indigo-600 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                      {stat.number}
                    </div>
                    <div className="text-indigo-100 text-lg">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Our Values
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  The principles that guide everything we do and shape our
                  learning community.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {values.map((value, index) => (
                  <div
                    key={index}
                    className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="bg-gray-100 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Meet Our Team
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Passionate educators and innovators dedicated to transforming
                  online learning.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {team.map((member, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                    />
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-indigo-600 font-medium mb-3">
                      {member.role}
                    </p>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {member.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Start Learning?
              </h2>
              <p className="text-xl text-indigo-100 mb-8">
                Join thousands of students who are already transforming their
                careers with our courses.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
                  Browse Courses
                </button>
                <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors duration-200">
                  Contact Us
                </button>
              </div>
            </div>
          </section>
            </div>
            <Footer />
      </>
    );
};

export default AboutUs;
