export interface IStudentSingup {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ISignupResonse {
  result: { message: string};
  success: boolean;
}

export interface IOtpResponse{
  message: string,
  token:string
}