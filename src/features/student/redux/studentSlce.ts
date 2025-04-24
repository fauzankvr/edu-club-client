import { ProfileData } from "@/Pages/types/student";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface StudentState {
  email: string;
  password: string;
  profile?: ProfileData;
  accessToken?: string;
}


const initialState: StudentState = {
    email: "",
    password: "",
    profile: undefined,
    accessToken:""
};

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    setStudent: (
      state: StudentState,
      action: PayloadAction<{ email: string; password: string }>
    ) => {
      const { email, password } = action.payload;
      state.email = email;
      state.password = password;
    },
    setProfile: (
      state: StudentState,
      action: PayloadAction<{ profile: ProfileData }>
    ) => {
      const { profile } = action.payload;
      state.profile = profile;
    },
    clearStudent: (state: StudentState) => {
      state.email = "";
      state.password = "";
    },
    setAccessToken: (
      state: StudentState,
      action: PayloadAction<{ AccessToken: string }>
    ) => {
      state.accessToken = action.payload.AccessToken;
    },
  },
});

export const { setStudent, clearStudent, setProfile ,setAccessToken} = studentSlice.actions;
export default studentSlice.reducer;
