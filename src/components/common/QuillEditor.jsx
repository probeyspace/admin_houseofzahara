import { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import api from "../../Api/api";

// ─── Custom Embed Blot for Tables ──────────────────────────────────────────
// Quill natively struggles with pasting complex tables (it swallows text, breaks rows, etc.)
// So we intercept <TABLE> tags on paste and insert them as un-editable "Embed" blocks.
// This perfectly preserves the exact HTML for the frontend to render beautifully.
const BlockEmbed = Quill.import("blots/block/embed");

class RawHtmlBlot extends BlockEmbed {
  static create(value) {
    const node = super.create();
    node.innerHTML = value;
    node.setAttribute("contenteditable", "false");
    node.style.margin = "16px 0";
    node.style.border = "1px dashed #ccc";
    node.style.padding = "8px";
    node.style.background = "#fafafa";
    node.style.overflowX = "auto";
    node.title = "Pasted Table (Edit in Google Docs and re-paste if changes are needed)";
    return node;
  }

  static value(node) {
    return node.innerHTML;
  }
}
RawHtmlBlot.blotName = "raw-html";
RawHtmlBlot.tagName = "div";
RawHtmlBlot.className = "quill-raw-html";

Quill.register(RawHtmlBlot, true);
// ───────────────────────────────────────────────────────────────────────────

/* ─── Toolbar configs ─────────────────────────────────────────────────────── */
const FULL_TOOLBAR = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ align: [] }],
  ["link", "image", "video"],
  ["blockquote", "code-block"],
  ["clean"],
];

const SIMPLE_TOOLBAR = [
  [{ header: [2, 3, false] }],
  ["bold", "italic", "underline"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link"],
  ["clean"],
];

/* ─── Main QuillEditor ────────────────────────────────────────────────────── */
const QuillEditor = ({
  value,
  onChange,
  placeholder,
  error,
  height = "300px",
  toolbar = "full",
  dir = "ltr",
  ...props
}) => {
  const quillRef = useRef(null);
  const editorRef = useRef(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

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
                headers: { "Content-Type": "multipart/form-data" },
              });
              const imageUrl = response.data?.data?.url;
              if (imageUrl) {
                const altText =
                  window.prompt(
                    "Enter alt text for this image (leave blank to use filename):",
                    file.name.replace(/\.[^/.]+$/, "")
                  ) ?? file.name.replace(/\.[^/.]+$/, "");

                const range = quill.getSelection();
                const index = range ? range.index : quill.getLength();
                quill.insertEmbed(index, "image", imageUrl);

                setTimeout(() => {
                  const imgs = quill.root.querySelectorAll(`img[src="${imageUrl}"]`);
                  if (imgs.length > 0) {
                    imgs[imgs.length - 1].setAttribute("alt", altText || "");
                    onChangeRef.current(quill.root.innerHTML);
                  }
                }, 100);
              }
            } catch (error) {
              console.error("Failed to upload inline image:", error);
            }
          }
        };
      };

      const quill = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: placeholder || "Write something...",
        modules: {
          table: false, // We disable the buggy native table module
          toolbar: {
            container: toolbar === "simple" ? SIMPLE_TOOLBAR : FULL_TOOLBAR,
            handlers:
              toolbar === "simple"
                ? {}
                : {
                    image: imageHandler,
                  },
          },
        },
      });

      // ── Clipboard Matcher for TABLE ──
      // When pasting an entire document, Quill processes it node by node.
      // We tell Quill: "When you see a TABLE, wrap its HTML in our custom RawHtmlBlot."
      quill.clipboard.addMatcher("TABLE", (node, delta) => {
        const Delta = Quill.import("delta");
        
        let html = node.outerHTML;
        
        // Strip out Google Docs / Word junk classes and styles so we get a pure table
        html = html
          .replace(/<o:p>.*?<\/o:p>/gis, "")
          .replace(/\s*mso-[^;"]+;?/gi, "")
          .replace(/class="[^"]*"/gi, "")
          .replace(/style="[^"]*"/gi, "")
          .replace(/<\/?colgroup[^>]*>/gi, "")
          .replace(/<col[^>]*>/gi, "")
          .replace(/<!--.*?-->/gs, "");

        // Return a Delta that inserts this HTML as our custom embed block
        return new Delta().insert({ "raw-html": html });
      });

      quill.root.setAttribute("dir", dir);

      if (value) {
        quill.clipboard.dangerouslyPasteHTML(value);
      }

      quill.on("text-change", () => {
        const content =
          quill.getText().trim() === "" &&
          quill.root.querySelector("img, iframe, video, .quill-raw-html") === null
            ? ""
            : quill.root.innerHTML;
        onChangeRef.current(content);
      });

      quillRef.current = quill;
    }
  }, []);

  // Update content when value prop changes
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;
    if ((value || "") === quill.root.innerHTML) return;
    const editorIsEmpty =
      quill.getText().trim() === "" &&
      quill.root.querySelector("img, iframe, video, .quill-raw-html") === null;
    if (!value && editorIsEmpty) return;
    
    const selection = quill.getSelection();
    quill.clipboard.dangerouslyPasteHTML(value || "");
    if (selection) {
      setTimeout(() => quill.setSelection(selection), 0);
    }
  }, [value]);

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={editorRef}
        className={`quill-editor ${error ? "border-red-500" : "border-gray-300"} rounded-md`}
        style={{ height, marginBottom: "16px" }}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default QuillEditor;
