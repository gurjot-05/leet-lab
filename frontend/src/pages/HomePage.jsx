import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useProblemStore } from "../store/useProblemStore";
import ProblemsTable from "../components/ProblemTable";

const HomePage = () => {
  const { getAllProblems, problems, isProblemsLoading } = useProblemStore();

  useEffect(() => {
    getAllProblems();
  }, [getAllProblems]);

  if (isProblemsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <section className="min-h-screen flex flex-col items-center pt-32 px-4">
      {/* decorative blob – starts lower so it doesn’t overlap nav */}
      <div className="absolute top-28 left-0 w-1/3 h-1/3 bg-primary/40 blur-3xl rounded-xl pointer-events-none" />

      <h1 className="text-4xl md:text-5xl font-extrabold text-center z-10">
        Welcome&nbsp;to&nbsp;
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-fuchsia-400">
          LeetLab
        </span>
      </h1>

      <p className="mt-4 text-center text-lg font-semibold text-gray-500 dark:text-gray-400 z-10 max-w-2xl">
        A platform inspired by LeetCode that helps you prepare for coding
        interviews and sharpen your skills by solving real interview-style
        problems.
      </p>

      {problems.length > 0 ? (
        <ProblemsTable problems={problems} />
      ) : (
        <p className="mt-10 text-center text-lg font-semibold text-gray-500 dark:text-gray-400 z-10 border border-primary px-4 py-2 rounded-md border-dashed">
          No problems found
        </p>
      )}
    </section>
  );
};

export default HomePage;
