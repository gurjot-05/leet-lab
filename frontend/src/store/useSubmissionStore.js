import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useSubmissionStore = create((set) => ({
  isSubmissionsLoading: false,
  allSubmissions: [],
  singleSubmission: null,
  submissionCount: null,

  getAllSubmissions: async () => {
    try {
      set({ isSubmissionsLoading: true });

      const res = await axiosInstance.get("/submission/get-all-submissions");

      set({ allSubmissions: res.data.submissions });

      toast.success(res.data.message);
    } catch (error) {
      console.log("Error getting all submissions", error);

      toast.error(
        error.response?.data?.message || "Error getting all submissions"
      );
    } finally {
      set({ isSubmissionsLoading: false });
    }
  },

  getSubmissionForProblem: async (problemId) => {
    try {
      set({ isSubmissionsLoading: true });

      const res = await axiosInstance.get(
        `/submission/get-submission/${problemId}`
      );

      set({ singleSubmission: res.data.submissions });
    } catch (error) {
      console.log("Error getting submissions for problem", error);

      toast.error(
        error.response?.data?.message || "Error getting submissions for problem"
      );
    } finally {
      set({ isSubmissionsLoading: false });
    }
  },

  getSubmissionCountForProblem: async (problemId) => {
    try {
      set({ isSubmissionsLoading: true });

      const res = await axiosInstance.get(
        `/submission/get-submissions-count/${problemId}`
      );

      set({ submissionCount: res.data.count });
    } catch (error) {
      console.log("Error getting submission count for problem", error);
      toast.error(
        error.response?.data?.message ||
          "Error getting submission count for problem"
      );
    } finally {
      set({ isSubmissionsLoading: false });
    }
  },
}));
