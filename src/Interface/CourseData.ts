import { Instructor } from "./Iinstructro";

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
  instructor: {
    name: string;
    profileImage: string;
  };
  language: string;
  points: string[];
  price: number;
  students: string[];
  title: string;
  instructorDetails: Instructor;
  averageRating: number;
}

export interface ILecture {
  title: string;
  videoPath?: string;
  pdfPath?: string;
}

export interface ISection {
  title: string;
  lectures: ILecture[];
}

export interface ICarriculam {
  _id: string; 
  courseId: string; 
  instructor: string;
  sections: ISection[];
  createdAt: string; 
  updatedAt: string;
}

