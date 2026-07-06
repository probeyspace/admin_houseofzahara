import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import api from "../../Api/api";

const QuillEditor = ({ value, onChange, placeholder, error, ...props }) => {
  const quillRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      const imageHandler = () => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();

        input.onchange = async () => {
          const file = input.files[0];
          if (file) {
            const formData = new FormData();
            formData.append("image", file);

            try {
              const response = await api.post("/blogs/upload-image", formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              });
              const imageUrl = response.data?.data?.url;
              if (imageUrl) {
                // Prompt for alt text
                const altText = window.prompt(
                  "Enter alt text for this image (leave blank to use filename):",
                  file.name.replace(/\.[^/.]+$/, "")
                ) ?? file.name.replace(/\.[^/.]+$/, "");

                const range = quill.getSelection();
                const index = range ? range.index : quill.getLength();
                quill.insertEmbed(index, "image", imageUrl);

                // Set the alt attribute on the inserted img element
                setTimeout(() => {
                  const imgs = quill.root.querySelectorAll(`img[src="${imageUrl}"]`);
                  if (imgs.length > 0) {
                    imgs[imgs.length - 1].setAttribute("alt", altText || "");
                    // Trigger onChange so the updated HTML (with alt) is saved
                    onChange(quill.root.innerHTML);
                  }
                }, 100);
              }
            } catch (error) {
              console.error("Failed to upload inline image:", error);
            }
          }
        };
      };

      // Initialize Quill editor
      const quill = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: placeholder || "Write something...",
        modules: {
          toolbar: {
            container: [
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
            handlers: {
              image: imageHandler,
            },
          },
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
