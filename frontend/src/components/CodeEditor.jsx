import MonacoEditor from "@monaco-editor/react";
import { useRef, useEffect } from "react";

function CodeEditor({
  language,
  value,
  onChange,
  socket,
  roomId,
  participants,
}) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const remoteDecorations = useRef({});

  const throttle = (fn, delay = 80) => {
    let timer = null;

    return (...args) => {
      if (timer) return;

      fn(...args);

      timer = setTimeout(() => {
        timer = null;
      }, delay);
    };
  };

  // throttled socket emitter
  const emitCursorMove = useRef(
    throttle((payload) => {
      socket.emit("cursor-move", payload);
    }, 80),
  ).current;

  // Detect cursor + selection movement
  const setupCursorTracking = (editor) => {
    editor.onDidChangeCursorSelection((event) => {
      if (!socket) return;

      const position = event.selection.getPosition();
      const selection = event.selection;

      emitCursorMove({
        roomId,
        cursor: {
          lineNumber: position.lineNumber,
          column: position.column,
        },
        selection: {
          startLineNumber: selection.startLineNumber,
          startColumn: selection.startColumn,
          endLineNumber: selection.endLineNumber,
          endColumn: selection.endColumn,
        },
      });
    });
  };

  // Render remote cursors
  const renderRemoteCursor = ({ userId, color, cursor, selection }) => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;

    if (!editor || !monaco) return;

    const cursorClass = `cursor-${userId}`;
    const selectionClass = `selection-${userId}`;

    const userIndex = participants.findIndex((p) => p.userId === userId);
    const offset = userIndex * 3; // pixel offset

    if (!document.getElementById(cursorClass)) {
      const style = document.createElement("style");

      style.id = cursorClass;
      style.innerHTML = `
          .${cursorClass}::before {
          content: "";
          border-left: 2px solid ${color};
          height: 1.2em;
          position: relative;
          transform: translateX(${offset}px);
        }

        .${selectionClass} {
          background-color: ${color}66;
        }
        `;

      document.head.appendChild(style);
    }

    const decorations = [];

    // Cursor decoration
    if (cursor) {
      decorations.push({
        range: new monaco.Range(
          cursor.lineNumber,
          cursor.column,
          cursor.lineNumber,
          cursor.column,
        ),
        options: {
          beforeContentClassName: cursorClass,
        },
      });
    }

    // Selection decoration
    if (selection) {
      decorations.push({
        range: new monaco.Range(
          selection.startLineNumber,
          selection.startColumn,
          selection.endLineNumber,
          selection.endColumn,
        ),
        options: {
          className: selectionClass,
        },
      });
    }

    const oldDecorations = remoteDecorations.current[userId] || [];

    const newDecorations = editor.deltaDecorations(oldDecorations, decorations);

    remoteDecorations.current[userId] = newDecorations;
  };

  // Listen for remote cursor updates
  useEffect(() => {
    if (!socket) return;

    socket.on("cursor-update", (data) => {
      renderRemoteCursor(data);
    });

    return () => {
      socket.off("cursor-update");
    };
  }, [socket]);

  // Remove stale cursors when participants change
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const activeUsers = new Set(participants.map((p) => p.userId));

    Object.keys(remoteDecorations.current).forEach((userId) => {
      if (!activeUsers.has(userId)) {
        editor.deltaDecorations(remoteDecorations.current[userId], []);
        delete remoteDecorations.current[userId];
      }
    });
  }, [participants]);

  return (
    <MonacoEditor
      height="100%"
      language={language}
      value={value}
      theme="vs-dark"
      loading={
        <div className="flex h-full items-center justify-center text-zinc-400">
          Loading editor...
        </div>
      }
      onMount={(editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
        setupCursorTracking(editor);
      }}
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

// import MonacoEditor from "@monaco-editor/react";

// function CodeEditor({ language, value, onChange }) {
//   return (
//     <MonacoEditor
//       height="100%"
//       language={language}
//       value={value}
//       theme="vs-dark"
//       loading={
//         <div className="flex h-full items-center justify-center text-zinc-400">
//           Loading editor...
//         </div>
//       }
//       onChange={(nextValue) => onChange(nextValue || "")}
//       options={{
//         fontSize: 14,
//         minimap: { enabled: false },
//         automaticLayout: true,
//         scrollBeyondLastLine: false,
//         padding: { top: 16 },
//       }}
//     />
//   );
// }

// export default CodeEditor;
