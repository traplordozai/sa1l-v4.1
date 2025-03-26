"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ImageIcon,
  List,
  ListOrdered,
  Undo,
  Redo,
} from "lucide-react"
import "./styles.css"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  maxHeight?: string
  className?: string
  readOnly?: boolean
}

/**
 * Rich text editor component based on TipTap
 */
export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  minHeight = "200px",
  maxHeight = "600px",
  className = "",
  readOnly = false,
}: RichTextEditorProps) {
  const [isFocused, setIsFocused] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-westernPurple underline",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
    ],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    onFocus: () => {
      setIsFocused(true)
    },
    onBlur: () => {
      setIsFocused(false)
    },
  })

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value)
    }
  }, [editor, value])

  // Set link handler
  const setLink = useCallback(() => {
    if (!editor) return

    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("URL", previousUrl)

    // cancelled
    if (url === null) return

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }

    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }, [editor])

  // Add image handler
  const addImage = useCallback(() => {
    if (!editor) return

    if (imageInputRef.current) {
      imageInputRef.current.click()
    }
  }, [editor])

  // Handle image upload
  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!editor || !event.target.files?.length) return

      const file = event.target.files[0]
      const reader = new FileReader()

      reader.onload = (e) => {
        if (typeof e.target?.result === "string") {
          editor.chain().focus().setImage({ src: e.target.result }).run()
        }
      }

      reader.readAsDataURL(file)

      // Reset input
      event.target.value = ""
    },
    [editor],
  )

  if (!editor) {
    return null
  }

  return (
    <div
      className={`rich-text-editor rounded-md border ${
        isFocused ? "border-westernPurple ring-1 ring-westernPurple" : "border-gray-300"
      } ${className}`}
      style={{
        minHeight,
        maxHeight: readOnly ? "none" : maxHeight,
      }}
    >
      {!readOnly && (
        <div className="border-b border-gray-200 bg-gray-50 p-2">
          <div className="flex flex-wrap items-center gap-1">
            {/* Text formatting */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1 rounded ${editor.isActive("bold") ? "bg-gray-200" : "hover:bg-gray-100"}`}
              title="Bold"
            >
              <Bold className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1 rounded ${editor.isActive("italic") ? "bg-gray-200" : "hover:bg-gray-100"}`}
              title="Italic"
            >
              <Italic className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-1 rounded ${editor.isActive("underline") ? "bg-gray-200" : "hover:bg-gray-100"}`}
              title="Underline"
            >
              <UnderlineIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-1 rounded ${editor.isActive("strike") ? "bg-gray-200" : "hover:bg-gray-100"}`}
              title="Strikethrough"
            >
              <Strikethrough className="h-5 w-5" />
            </button>

            <div className="mx-1 h-6 w-px bg-gray-300" />

            {/* Alignment */}
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={`p-1 rounded ${editor.isActive({ textAlign: "left" }) ? "bg-gray-200" : "hover:bg-gray-100"}`}
              title="Align left"
            >
              <AlignLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              className={`p-1 rounded ${editor.isActive({ textAlign: "center" }) ? "bg-gray-200" : "hover:bg-gray-100"}`}
              title="Align center"
            >
              <AlignCenter className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={`p-1 rounded ${editor.isActive({ textAlign: "right" }) ? "bg-gray-200" : "hover:bg-gray-100"}`}
              title="Align right"
            >
              <AlignRight className="h-5 w-5" />
            </button>

            <div className="mx-1 h-6 w-px bg-gray-300" />

            {/* Lists */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-1 rounded ${editor.isActive("bulletList") ? "bg-gray-200" : "hover:bg-gray-100"}`}
              title="Bullet list"
            >
              <List className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-1 rounded ${editor.isActive("orderedList") ? "bg-gray-200" : "hover:bg-gray-100"}`}
              title="Numbered list"
            >
              <ListOrdered className="h-5 w-5" />
            </button>

            <div className="mx-1 h-6 w-px bg-gray-300" />

            {/* Links and images */}
            <button
              type="button"
              onClick={setLink}
              className={`p-1 rounded ${editor.isActive("link") ? "bg-gray-200" : "hover:bg-gray-100"}`}
              title="Add link"
            >
              <LinkIcon className="h-5 w-5" />
            </button>
            <button type="button" onClick={addImage} className="p-1 rounded hover:bg-gray-100" title="Add image">
              <ImageIcon className="h-5 w-5" />
            </button>
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

            <div className="mx-1 h-6 w-px bg-gray-300" />

            {/* Undo/redo */}
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className={`p-1 rounded ${!editor.can().undo() ? "text-gray-300 cursor-not-allowed" : "hover:bg-gray-100"}`}
              title="Undo"
            >
              <Undo className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className={`p-1 rounded ${!editor.can().redo() ? "text-gray-300 cursor-not-allowed" : "hover:bg-gray-100"}`}
              title="Redo"
            >
              <Redo className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div
        className={`p-3 overflow-y-auto prose max-w-none ${readOnly ? "prose-sm" : ""}`}
        style={{
          minHeight: readOnly ? "auto" : minHeight,
          maxHeight: readOnly ? "none" : maxHeight,
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

/**
 * Component for displaying rich text content without editing capabilities
 */
export function RichTextContent({ content, className = "" }: { content: string; className?: string }) {
  return <div className={`prose max-w-none ${className}`} dangerouslySetInnerHTML={{ __html: content }} />
}

