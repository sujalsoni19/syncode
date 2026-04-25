import MonacoEditor from "@monaco-editor/react";

function CodeEditor({ language, value, onChange }) {
  return (
    <MonacoEditor
      height="100%"
      language={language}
      value={value}
      theme="vs-dark"
      onChange={(nextValue) => onChange(nextValue || "")}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        automaticLayout: true,
        scrollBeyondLastLine: false,
        padding: { top: 16 },
      }}
    />
  );
}

export default CodeEditor;
