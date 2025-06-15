import { db } from "../libs/db.js";

export const getAllSubmissions = async (req, res) => {
  try {
    const userId = req.existingUser.id;

    const submissions = await db.submission.findMany({
      where: {
        userId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Submissions fetched successfully",
      submissions,
    });
  } catch (error) {
    console.error(`Failed to fetch submissions: ${error}`);
    return res.status(500).json({
      message: `Failed to fetch submissions`,
    });
  }
};

export const getSubmissionsForProblem = async (req, res) => {
  try {
    const problemId = req.params.problemId;

    const userId = req.existingUser.id;

    const submissions = await db.submission.findMany({
      where: {
        userId: userId,
        problemId: problemId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Submissions fetched successfully",
      submissions,
    });
  } catch (error) {
    console.error(`Failed to fetch submissions: ${error}`);
    return res.status(500).json({
      message: `Failed to fetch submissions`,
    });
  }
};

export const getSubmissionsCount = async (req, res) => {
  try {
    const problemId = req.params.problemId;

    const count = await db.submission.count({
      where: {
        problemId: problemId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Number of submissions fetched successfully",
      count,
    });
  } catch (error) {
    console.error(`Failed to fetch submission count: ${error}`);
    return res.status(500).json({
      message: `Failed to fetch submission count`,
    });
  }
};
