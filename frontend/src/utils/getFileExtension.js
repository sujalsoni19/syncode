export const getFileExtension = (language) => {
  const map = {
    javascript: "js",
    typescript: "ts",
    python: "py",
    cpp: "cpp",
    c: "c",
    java: "java",
    go: "go",
  };

  return map[language] || "txt";
};