// types/instructor.ts
import * as Yup from "yup";

export interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  dateOfBirth: string;
  phone: string;
  profileImage: string;
  Biography: string;
  eduQulification: string;
  expertise: string[];
  experience: number;
  teachingExperience: number;
  languages: string[];
  certifications: string[]; // Text certifications
  certificateFiles: File[]; // Certificate files - ADD THIS
  currentPosition: string;
  workPlace: string;
  linkedInProfile: string;
  website: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  paypalEmail: string;
  socialMedia: {
    twitter: string;
    facebook: string;
    instagram: string;
    youtube: string;
  };
}

export const initialValues: FormData = {
  email: "",
  password: "",
  confirmPassword: "",
  fullName: "",
  dateOfBirth: "",
  phone: "",
  profileImage: "",
  Biography: "",
  eduQulification: "",
  expertise: [],
  experience: 0,
  teachingExperience: 0,
  languages: [],
  certifications: [], // Text certifications
  certificateFiles: [], // Certificate files - ADD THIS
  currentPosition: "",
  workPlace: "",
  linkedInProfile: "",
  website: "",
  address: {
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  },
  paypalEmail: "",
  socialMedia: {
    twitter: "",
    facebook: "",
    instagram: "",
    youtube: "",
  },
};


export const STEPS = [
  "Contact Information",
  "Personal Details",
  "Educational Details",
  "Professional Details",
  "Contact & Location",
  "Social Media",
];

export const validationSchemas = [
  // Step 0: Contact Information (No password validation)
  Yup.object({
    email: Yup.string()
      .trim()
      .email("Invalid email format")
      .required("Email is required"),
  }),

  // Step 1: Personal Details
  Yup.object({
    fullName: Yup.string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .matches(/^[a-zA-Z\s]+$/, "Full name can only contain letters and spaces")
      .required("Full name is required"),
    dateOfBirth: Yup.date()
      .required("Date of birth is required")
      .max(
        new Date(new Date().setFullYear(new Date().getFullYear() - 18)),
        "You must be at least 18 years old"
      ),
    phone: Yup.string()
      .trim()
      .matches(/^\+?[\d\s\-()]+$/, "Invalid phone number format")
      .min(10, "Phone number must be at least 10 digits")
      .required("Phone number is required"),
  }),

  // Step 2: Educational Details
  Yup.object({
    eduQulification: Yup.string()
      .trim()
      .min(2, "Educational qualification is required")
      .required("Educational qualification is required"),
    expertise: Yup.array()
      .of(Yup.string().trim())
      .min(1, "At least one area of expertise is required")
      .required("Expertise is required"),
    experience: Yup.number()
      .min(0, "Experience cannot be negative")
      .max(50, "Experience cannot exceed 50 years")
      .required("Total experience is required"),
    teachingExperience: Yup.number()
      .min(0, "Teaching experience cannot be negative")
      .max(50, "Teaching experience cannot exceed 50 years")
      .test(
        "teaching-vs-total",
        "Teaching experience cannot exceed total experience",
        function (value) {
          const { experience } = this.parent;
          return !value || !experience || value <= experience;
        }
      )
      .required("Teaching experience is required"),
    languages: Yup.array()
      .of(Yup.string().trim())
      .min(1, "At least one language is required")
      .required("Languages are required"),
  }),

  // Step 3: Professional Details
  Yup.object({
    currentPosition: Yup.string()
      .trim()
      .min(2, "Current position must be at least 2 characters")
      .required("Current position is required"),
    workPlace: Yup.string()
      .trim()
      .min(2, "Workplace must be at least 2 characters")
      .required("Workplace is required"),
    Biography: Yup.string()
      .trim()
      .min(50, "Biography must be at least 50 characters")
      .max(1000, "Biography cannot exceed 1000 characters")
      .required("Biography is required"),
  }),

  // Step 4: Contact & Location
  Yup.object({
    address: Yup.object({
      street: Yup.string()
        .trim()
        .min(5, "Street address must be at least 5 characters")
        .required("Street address is required"),
      city: Yup.string()
        .trim()
        .min(2, "City must be at least 2 characters")
        .matches(/^[a-zA-Z\s]+$/, "City can only contain letters and spaces")
        .required("City is required"),
      state: Yup.string()
        .trim()
        .min(2, "State must be at least 2 characters")
        .required("State is required"),
      country: Yup.string()
        .trim()
        .min(2, "Country must be at least 2 characters")
        .required("Country is required"),
      zipCode: Yup.string()
        .trim()
        .matches(/^[0-9]{5,10}$/, "Invalid zip code format")
        .required("Zip code is required"),
    }).required("Address is required"),
    paypalEmail: Yup.string()
      .trim()
      .email("Invalid PayPal email format")
      .required("PayPal email is required"),
  }),

  // Step 5: Social Media (Optional)
  Yup.object({
    socialMedia: Yup.object({
      twitter: Yup.string().url("Invalid Twitter URL").nullable(),
      facebook: Yup.string().url("Invalid Facebook URL").nullable(),
      instagram: Yup.string().url("Invalid Instagram URL").nullable(),
      youtube: Yup.string().url("Invalid YouTube URL").nullable(),
    }).nullable(),
  }),
];



export interface Teacher {
  _id: string;
  email: string;
  fullName: string;
  phone?: string;
  profileImage?: string;
  isBlocked: boolean;
  isApproved: boolean;
  dateOfBirth?: string;
  Biography?: string;
  eduQulification?: string;
  expertise?: string[];
  experience?: number;
  teachingExperience?: number;
  languages?: string[];
  certifications?: string[];
  currentPosition?: string;
  workPlace?: string;
  linkedInProfile?: string;
  website?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  paypalEmail?: string;
  socialMedia?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}
