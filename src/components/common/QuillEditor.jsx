import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const QuillEditor = ({ value, onChange, placeholder, error, ...props }) => {
  const quillRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      // Initialize Quill editor
      const quill = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: placeholder || "Write something...",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }, { background: [] }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ indent: "-1" }, { indent: "+1" }],
            [{ align: [] }],
            ["link", "image", "video"],
            ["blockquote", "code-block"],
            ["clean"],
          ],
        },
        formats: [
          "header",
          "bold",
          "italic",
          "underline",
          "strike",
          "color",
          "background",
          "list",
          "bullet",
          "indent",
          "align",
          "link",
          "image",
          "video",
          "blockquote",
          "code-block",
        ],
      });

      // Set initial content
      if (value) {
        quill.root.innerHTML = value;
      }

      // Handle text change
      quill.on("text-change", () => {
        const content = quill.root.innerHTML;
        onChange(content);
      });

      quillRef.current = quill;
    }
  }, []);

  // Update content when value prop changes
  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = value || "";
    }
  }, [value]);

  return (
    <div>
      <div
        ref={editorRef}
        className={`quill-editor ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-md`}
        style={{ height: "300px", marginBottom: "16px" }}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default QuillEditor;
