import { db } from "../libs/db.js";
import {
  getJudge0LanguageName,
  pollBatchResults,
  submitBatch,
} from "../libs/judge0.lib.js";

export const executeCode = async (req, res) => {
  try {
    const { source_code, language_id, stdin, expected_outputs, problem_id } =
      req.body;

    const userId = req.existingUser.id;

    const problem = await db.problem.findUnique({
      where: {
        id: problem_id,
      },
    });

    if (!problem) {
      return res.status(404).json({
        message: "No problem found",
      });
    }

    if (
      !Array.isArray(stdin) ||
      stdin.length === 0 ||
      !Array.isArray(expected_outputs) ||
      stdin.length !== expected_outputs.length
    ) {
      return res.status(400).json({
        message: "Invalid or missing testcases",
      });
    }

    const submissions = stdin.map((input) => ({
      source_code,
      language_id,
      stdin: input,
      base64_encoded: false,
      wait: false,
    }));

    const submitResponse = await submitBatch(submissions);

    const tokens = submitResponse.map((result) => result.token);

    const results = await pollBatchResults(tokens);

    let allTestCasesPassed = true;
    let totalTimeTaken = 0;
    let totalMemoryConsumed = 0;
    let submissionStatus = "Accepted";
    let stderrOutput = null;
    let compileOutput = null;

    const testCaseResultsToCreate = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const actualOutput = result.stdout?.trim();
      const expectedOutput = expected_outputs[i].trim();

      const testCasePassed =
        result.status.id === 3 && actualOutput === expectedOutput;

      testCaseResultsToCreate.push({
        testCase: i + 1,
        passed: testCasePassed,
        stdout: result.stdout ?? null,
        expected: expectedOutput,
        stderr: result.stderr ?? null,
        compileOutput: result.compile_output ?? null,
        status: result.status.description,
        memory: result.memory ? String(result.memory) : null,
        time: result.time ? String(result.time) : null,
      });

      if (!testCasePassed) {
        allTestCasesPassed = false;
        if (result.status.id === 6) {
          submissionStatus = "Compilation Error";
          compileOutput = result.compile_output;
        } else if (result.status.id === 4) {
          submissionStatus = "Time Limit Exceeded";
        } else if (result.status.id === 5) {
          submissionStatus = "Memory Limit Exceeded";
        } else if (result.status.id === 11) {
          submissionStatus = "Runtime Error";
          stderrOutput = result.stderr;
        } else if (result.status.id !== 3 && result.status.id !== 13) {
          submissionStatus = "Wrong Answer";
        } else if (result.status.id === 13) {
          submissionStatus = "Internal Error";
          stderrOutput = result.stderr;
        }
      }

      totalTimeTaken += +result.time || 0;
      totalMemoryConsumed += result.memory || 0;
    }

    const newSubmission = await db.submission.create({
      data: {
        userId: req.existingUser.id,
        problemId: problem_id,
        sourceCode: source_code,
        language: getJudge0LanguageName(language_id),
        stdin: JSON.stringify(stdin),
        stdout: allTestCasesPassed
          ? JSON.stringify(results.map((r) => r.stdout))
          : null,
        compileOutput: compileOutput,
        status: submissionStatus,
        memory: String(totalMemoryConsumed),
        time: String(totalTimeTaken),
        testCases: {
          createMany: {
            data: testCaseResultsToCreate,
          },
        },
      },
    });

    if (!allTestCasesPassed) {
      const failedTestCase = testCaseResultsToCreate.find((tc) => !tc.passed);

      if (failedTestCase) {
        if (failedTestCase.status === "Compilation Error") {
          errorMessage = `Compilation Error: ${
            failedTestCase.compileOutput || "No detailed output."
          }`;
        } else if (failedTestCase.status === "Time Limit Exceeded") {
          errorMessage = `Testcase ${failedTestCase.testCase} failed: Time Limit Exceeded.`;
        } else if (failedTestCase.status === "Memory Limit Exceeded") {
          errorMessage = `Testcase ${failedTestCase.testCase} failed: Memory Limit Exceeded.`;
        } else if (failedTestCase.status === "Runtime Error") {
          errorMessage = `Testcase ${
            failedTestCase.testCase
          } failed: Runtime Error. ${failedTestCase.stderr || ""}`;
        } else {
          errorMessage = `Testcase ${failedTestCase.testCase} failed. Expected "${failedTestCase.expected}", but got "${failedTestCase.stdout}". Status: ${failedTestCase.status}`;
        }
      }
      return res.status(400).json({
        message: errorMessage,
        status: submissionStatus,
      });
    }

    await db.problemSolved.upsert({
      where: {
        userId_problemId: {
          userId: userId,
          problemId: problem_id,
        },
      },
      update: {},
      create: {
        userId: userId,
        problemId: problem_id,
      },
    });

    return res.status(200).json({
      message: "Problem solved successfully!",
      time: parseFloat(totalTimeTaken.toFixed(1)),
      memory: parseFloat((totalMemoryConsumed / 1024).toFixed(1)),
      submissionId: newSubmission.id,
      status: submissionStatus,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error occurred: ${error}`,
    });
  }
};
