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
  _id: string;
  title: string;
  videoPath?: string;
  pdfPath?: string;
}

export interface ISection {
  _id: string;
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

export interface CourseQueryParams {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  [key: string]: string | number | undefined; 
}


export interface IProgress {
  _id: string;
  studentId: string;
  courseId: string;
  sections: {
    sectionId: string;
    lectures: { lectureId: string; progress: string; _id: string }[];
    completed: boolean;
    _id: string;
  }[];
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
