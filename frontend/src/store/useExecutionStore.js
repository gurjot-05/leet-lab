import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useExecutionStore = create((set) => ({
  isExecuting: false,
  submission: null,
  time: null,
  memory: null,

  executeCode: async (
    source_code,
    language_id,
    stdin,
    expected_outputs,
    problem_id
  ) => {
    try {
      set({ isExecuting: true, submission: null, time: null, memory: null });
      console.log(
        "Submission:",
        JSON.stringify({
          source_code,
          language_id,
          stdin,
          expected_outputs,
          problem_id,
        })
      );
      const res = await axiosInstance.post("/execute-code", {
        source_code,
        language_id,
        stdin,
        expected_outputs,
        problem_id,
      });

      set({
        submission: res.data.submission,
        time: res.data.time,
        memory: res.data.memory,
        status: res.data.status,
      });

      toast.success(res.data.message);
      return true;
    } catch (error) {
      console.log("Error executing code", error);
      set({
        submission: error.response?.data?.submission,
        time: error.response?.data?.time,
        memory: error.response?.data?.memory,
        status: error.response?.data?.status,
      });
      toast.error(error.response?.data?.message || "Error executing code");
      return false;
    } finally {
      set({ isExecuting: false });
    }
  },
}));
