import { pollBatchResults, submitBatch } from "../libs/judge0.lib.js";

export const executeCode = async (req, res) => {
  try {
    const { source_code, language_id, stdin, expected_outputs, problem_id } =
      req.body;

    const userId = req.existingUser.id;

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

    console.log(results);

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const actualOutput = result.stdout?.trim();
      const expectedOutput = expected_outputs[i].trim();

      if (result.status.id !== 3 || actualOutput !== expectedOutput) {
        return res.status(400).json({
          message: `Testcase ${
            i + 1
          } failed. Expected "${expectedOutput}", but got "${actualOutput}".`
        });
      }
    }

    return res.status(200).json({
      message: "Problem solved successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error occurred: ${error}`,
    });
  }
};
