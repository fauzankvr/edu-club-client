
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@iconify/react";

const testimonials = [
  {
    name: "Kathy Sullivan",
    position: "CEO at Ordian IT",
    message:
      "Lorem ipsum dolor sit amet, elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Orci nulla pellentesque dignissim enim. Amet consectetur adipiscing",
  },
  {
    name: "Elsie Stroud",
    position: "CEO at Edwards",
    message:
      "Lorem ipsum dolor sit amet, elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Orci nulla pellentesque dignissim enim. Amet consectetur adipiscing",
  },
  {
    name: "Kathy Sullivan",
    position: "CEO at Ordian IT",
    message:
      "Lorem ipsum dolor sit amet, elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Orci nulla pellentesque dignissim enim. Amet consectetur adipiscing",
  },
];

const Testimonials = () => {
  return (
    <div className="py-16 px-6 bg-gray-50">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border rounded-lg p-6 relative">
              {/* Quote Icon Positioned Outside the Card */}
              <Icon
                icon="mdi:format-quote-open"
                className="text-gray-300 text-8xl absolute -top-15 left-2"
              />

              <CardContent>
                <p className="text-gray-700 text-sm">{testimonial.message}</p>
                <h3 className="mt-4 font-bold text-lg">{testimonial.name}</h3>
                <p className="text-blue-600 text-sm">{testimonial.position}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
