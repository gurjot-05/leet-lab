import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";

export const useAuthStore = create((set) => ({
  authUser: null,
  isSignUp: false,
  isLoggingIn: false,
  isCheckingUser: false,

  checkUser: async () => {
    set({ isCheckingUser: true });
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data.user });
    } catch (err) {
      console.log("Error checking auth: ", err);
      set({ authUser: null });
    } finally {
      set({ isCheckingUser: false });
    }
  },

  signup: async (data) => {
    set({ isSignUp: true });
    try {
      const res = await axiosInstance.post("/auth/register", data);
      set({ authUser: res.data.user });
      toast.success(res.data.message);
    } catch (err) {
      console.log("Error signing up: ", err);
      const message = err.response?.data?.message || "Error signing up";
      toast.error(message);
    } finally {
      set({ isSignUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data.user });
      toast.success(res.data.message);
    } catch (err) {
      console.log("Error logging in: ", err);
      const message = err.response?.data?.message || "Error logging in";
      toast.error(message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      const res = await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success(res.data.message);
    } catch (err) {
      console.log("Error logging out: ", err);
      const message = err.response?.data?.message || "Error logging out";
      toast.error(message);
    }
  },
}));
