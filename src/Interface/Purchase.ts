import { ICourseData } from "./CourseData";

export interface Purchase {
  id: string;
  priceUSD: number;
  createdAt: string;
  updatedAt: string;
  courseDetails: ICourseData;
  status: string;
}
