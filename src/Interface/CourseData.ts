export interface CourseFormData {
  title: string;
  subtitle: string;
  language: string;
  category: string;
  actualPrice: string;
  discountPrice: string;
  points: { text: string}[];
  image: File | null;
}

export interface ICourseData {
  _id: string;
  category: string;
  courseImageId: string;
  description: string;
  discount: string; 
  instructor: string;
  language: string;
  points: string[]; 
  price: number;
  students: string[]; 
  title: string;
}
