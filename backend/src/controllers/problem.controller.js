import { db } from "../libs/db.js";
import {
  getJudge0LanguageId,
  pollBatchResults,
  submitBatch,
} from "../libs/judge0.lib.js";

export const createProblem = async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      tags,
      examples,
      constraints,
      testcases,
      codeSnippets,
      referrenceSolutions,
    } = req.body;

    for (const [language, solutionCode] of Object.entries(
      referrenceSolutions
    )) {
      const languageId = getJudge0LanguageId(language);

      if (!languageId) {
        return res.status(400).json({
          message: `Language ${language} is not supported`,
        });
      }

      const submissions = testcases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      const submissionResults = await submitBatch(submissions);

      const tokens = submissionResults.map((res) => res.token);

      const results = await pollBatchResults(tokens);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];

        if (result.status.id !== 3) {
          return res.status(400).json({
            message: `Testcases ${i + 1} failed for language ${language}`,
          });
        }
      }
    }
    const newProblem = await db.problem.create({
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testcases,
        codeSnippets,
        referrenceSolutions,
        userId: req.existingUser.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: "New problem created successfully",
      problem: newProblem,
    });
  } catch (error) {
    console.error(`Error occurred while creating a problem: ${error}`);
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Problem title already exists" });
    }
    return res.status(500).json({
      message: "Error occurred while creating a problem",
    });
  }
};

export const getAllProblems = async (req, res) => {
  try {
    const allProblems = await db.problem.findMany();

    if (allProblems.length === 0) {
      return res.status(404).json({
        message: "No problems found",
      });
    }
    return res.status(200).json({
      success: true,
      problems: allProblems,
    });
  } catch (error) {
    console.error(`Error occurred while getting all problems: ${error}`);
    return res.status(500).json({
      message: "Error occurred while getting all problems",
    });
  }
};

export const getProblemById = async (req, res) => {
  try {
    const id = req.params.id;

    const problem = await db.problem.findUnique({
      where: {
        id,
      },
    });
    if (!problem) {
      return res.status(404).json({
        message: "No problem found",
      });
    }
    return res.status(200).json({
      success: true,
      problem,
    });
  } catch (error) {
    console.error(`Error occurred while getting the problem: ${error}`);
    return res.status(500).json({
      message: `Error occurred while getting the problem`,
    });
  }
};

export const updateProblem = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;

    const updatedProblem = await db.problem.update({
      where: { id },
      data: updatedData,
    });
    if (!updatedProblem) {
      return res.status(404).json({
        message: "Problem not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Problem updated successfully",
      problem: updatedProblem,
    });
  } catch (error) {
    console.error(`Error occurred while updating the problem: ${error}`);
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Problem title already exists" });
    }
    return res.status(500).json({
      message: `Error occurred while updating the problem`,
    });
  }
};

export const deleteProblem = async (req, res) => {
  try {
    const id = req.params.id;

    const deletedProblem = await db.problem.delete({
      where: { id },
    });
    if (!deletedProblem) {
      return res.status(404).json({
        message: "Problem not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Problem deleted successfully",
      problem: deletedProblem,
    });
  } catch (error) {
    console.error(`Error occurred while deleting the problem: ${error}`);
    return res.status(500).json({
      message: `Error occurred while deleting the problem`,
    });
  }
};

export const getAllProblemsSolvedByUser = async (req, res) => {
  const userId = req.existingUser.id;
  try {
    const problems = await db.problemSolved.findMany({
      where: {
        userId,
      },
      select: {
        problem: { select: { id: true, title: true, difficulty: true } },
      },
    });

    if (problems.length === 0) {
      return res.status(404).json({
        message: "No problems solved by user",
      });
    }

    const formattedProblems = problems.map((p) => p.problem);

    return res.status(200).json({
      message: "Problems fetched successfully",
      problems: formattedProblems,
    });
  } catch (error) {
    console.error(`Error occurred while fetching solved problems: ${error}`);
    return res.status(500).json({
      message: `Failed to fetch solved problems`,
    });
  }
};
