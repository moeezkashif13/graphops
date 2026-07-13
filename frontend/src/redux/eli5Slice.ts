import { createSlice } from "@reduxjs/toolkit";

interface Eli5State {
  isRecruiterMode: boolean;
}

const initialState: Eli5State = {
  // Default to false or check localStorage to persist recruiter preference
  isRecruiterMode: localStorage.getItem("recruiter_mode_active") === "true",
};

export const eli5Slice = createSlice({
  name: "eli5",
  initialState,
  reducers: {
    toggleRecruiterMode: (state) => {
      state.isRecruiterMode = !state.isRecruiterMode;
      localStorage.setItem(
        "recruiter_mode_active",
        String(state.isRecruiterMode),
      );
    },
  },
});

export const { toggleRecruiterMode } = eli5Slice.actions;
export default eli5Slice.reducer;
