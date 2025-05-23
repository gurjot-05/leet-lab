import axios from "axios";

export const getJudge0LanguageId = (language) => {
  const languageMap = {
    PYTHON: 71,
    JAVA: 62,
    JAVASCRIPT: 63,
  };
  return languageMap[language.toUpperCase()];
};

export const submitBatch = async (submissions) => {
  const { data } = await axios.post(
    `${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`,
    {
      submissions,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.JUDGE0_AUTH_TOKEN}`,
      },
    }
  );
  return data;
};

const sleep = (seconds) => {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

export const pollBatchResults = async (tokens) => {
  while (true) {
    const { data } = await axios.get(
      `${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`,
      {
        params: {
          tokens: tokens.join(","),
          base64_encoded: false,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.JUDGE0_AUTH_TOKEN}`,
        },
      }
    );

    const results = data.submissions;

    const isAllDone = results.every(
      (result) => result.status.id !== 1 && result.status.id !== 2
    );

    if (isAllDone) return results;
    await sleep(1);
  }
};
