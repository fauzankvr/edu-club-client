
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logopng from "../../../public/logos/edu-club-log-sm.png"

const Footer = () => {
  return (
    <footer className="bg-indigo-900 text-white py-10 px-6">
      <div className="container mx-auto text-center">
        {/* Logo and Title */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {/* <Icon
            icon="mdi:book-education"
            className="text-yellow-400 text-3xl"
          /> */}
                  <span><img src={logopng} width="60px" alt="" /></span>
          <h2 className="text-3xl font-bold">Edu Club</h2>
        </div>

        {/* Newsletter Subscription */}
        <p className="text-gray-300 text-lg mb-4">
          Subscribe to get our Newsletter
        </p>
        <div className="flex justify-center items-center gap-2 max-w-md mx-auto bg-white p-1 rounded-lg">
          <Input
            type="email"
            placeholder="Your Email"
            className="flex-1 border-none focus:ring-0 px-4 text-black"
          />
          <Button className="bg-cyan-400 hover:bg-cyan-500 text-white rounded-lg px-5">
            Subscribe
          </Button>
        </div>

        {/* Links */}
        <div className="flex justify-center gap-6 text-gray-300 text-sm mt-6">
          <a href="#" className="hover:text-white">
            Careers
          </a>
          <span className="text-gray-400">|</span>
          <a href="#" className="hover:text-white">
            Privacy Policy
          </a>
          <span className="text-gray-400">|</span>
          <a href="#" className="hover:text-white">
            Terms & Conditions
          </a>
        </div>

        {/* Copyright */}
        <p className="text-gray-400 text-sm mt-4">
          © 2025 Class Technologies Inc.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
