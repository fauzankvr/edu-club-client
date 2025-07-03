import { Card, CardContent } from "@/components/ui/card";
import { Purchase } from "@/Interface/Purchase";
import { Icon } from "@iconify/react";

// Define props for the PurchaseHistory component
interface PurchaseHistoryProps {
  purchases: Purchase[];
}

export default function PurchaseHistory({ purchases }: PurchaseHistoryProps) {
  // Function to render status badge
  const getStatusBadge = (status: string) => {
    const statusStyles: { [key: string]: string } = {
      paid: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-blue-100 text-blue-800",
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
          statusStyles[status.toLowerCase()] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <Card className="border border-gray-200 shadow-sm bg-white">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Icon icon="mdi:cart-outline" className="w-6 h-6 text-indigo-600" />
          <h3 className="text-xl font-bold text-gray-900">
            Your Purchase History
          </h3>
        </div>
        {purchases.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-base mb-4">No purchases found.</p>
            <a
              href="/courses"
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium underline"
            >
              Explore Courses
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 text-sm font-semibold text-gray-700">
                    Course
                  </th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-700">
                    Purchase Date
                  </th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-700">
                    Price
                  </th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr
                    key={purchase.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4 flex items-center gap-3">
                      <img
                        src={purchase.courseDetails.courseImageId}
                        alt={purchase.courseDetails.title}
                        className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/48";
                        }}
                      />
                      <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {purchase.courseDetails.title}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {new Date(purchase.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      ₹{purchase.priceUSD.toFixed(2)}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(purchase.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
