import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { useProblemStore } from "../store/useProblemStore.js";
import UpdateProblemForm from "../components/UpdateProblemForm";

const UpdateProblem = () => {
  const { id } = useParams(); // :id from the route
  const navigate = useNavigate();

  const { getProblemById, problem, isProblemLoading } = useProblemStore();

  /* fetch the problem once */
  useEffect(() => {
    getProblemById(id);
  }, [id, getProblemById]);

  /* show spinner while loading */
  if (isProblemLoading || !problem || problem.id !== id) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  /* ready → show the form */
  return (
    <UpdateProblemForm
      problemId={id}
      initialData={problem}
    />
  );
};

export default UpdateProblem;
