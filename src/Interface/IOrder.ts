


// Interface for the orderDetails
export interface IOrder {
  _id: string;
  userId: string;
  courseId: string;
  quantity: number;
  paypalOrderId: string;
  status: "PENDING" | "PAID" | "FAILED";
  priceUSD: number;
  createdAt: string;
  updatedAt: string;
}
