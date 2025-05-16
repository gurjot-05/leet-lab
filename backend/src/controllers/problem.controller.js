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

    try {
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
      console.log(error);
      return res.status(500).json({
        message: `Error while creating problem: ${error}`,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: `Error occurred: ${error}`,
    });
  }
};

export const getAllProblems = async (req, res) => {
  try {
    const allProblems = await db.problem.findMany();
    if (!allProblems) {
      return res.status(404).json({
        message: "No problems found",
      });
    }
    return res.status(200).json({
      success: true,
      problems: allProblems,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error occurred: ${error}`,
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
    return res.status(500).json({
      message: `Error occurred: ${error}`,
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
    return res.status(200).json({
      success: true,
      message: "Problem updated successfully",
      problem: updatedProblem,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error occurred: ${error}`,
    });
  }
};

export const deleteProblem = async (req, res) => {};

export const getAllProblemsSolvedByUser = async (req, res) => {};
