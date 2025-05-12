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

    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "You are not allowed to create a problem" });
    }

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

        const newProblem = await db.problem.create({
          title,
          description,
          difficulty,
          tags,
          examples,
          constraints,
          testcases,
          codeSnippets,
          referrenceSolutions,
          userID: req.existingUser.id,
        });

        return res.status(201).json({
          message: `New problem solved successfully: ${newProblem}`,
        });
      }
    } catch (error) {
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

export const getAllProblems = async (req, res) => {};

export const getProblemById = async (req, res) => {};

export const updateProblem = async (req, res) => {};

export const deleteProblem = async (req, res) => {};

export const getAllProblemsSolvedByUser = async (req, res) => {};
