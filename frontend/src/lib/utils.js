export const getJudge0LanguageId = (language) => {
  const languageMap = {
    PYTHON: 71,
    JAVA: 62,
    JAVASCRIPT: 63,
  };
  return languageMap[language.toUpperCase()];
};

export const getJudge0LanguageName = (languageId) => {
  const languageMap = {
    71: "Python",
    62: "Java",
    63: "JavaScript",
  };
  return languageMap[languageId] || "Unknown";
};
