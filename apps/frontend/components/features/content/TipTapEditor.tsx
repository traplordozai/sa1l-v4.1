"use client"

// File: apps/frontend/components/features/content/TipTapEditor.tsx
import Placeholder from "@tiptap/extension-placeholder"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { useCallback } from "react"

interface TipTapEditorProps {
  initialContent: string
  onChange: (html: string) => void
}

export default function TipTapEditor({ initialContent, onChange }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write your content here...",
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  const setHeading = useCallback(
    (level: number) => {
      editor?.chain().focus().toggleHeading({ level }).run()
    },
    [editor],
  )

  const toggleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run()
  }, [editor])

  const toggleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run()
  }, [editor])

  const toggleBulletList = useCallback(() => {
    editor?.chain().focus().toggleBulletList().run()
  }, [editor])

  const toggleOrderedList = useCallback(() => {
    editor?.chain().focus().toggleOrderedList().run()
  }, [editor])

  const toggleBlockquote = useCallback(() => {
    editor?.chain().focus().toggleBlockquote().run()
  }, [editor])

  const insertHorizontalRule = useCallback(() => {
    editor?.chain().focus().setHorizontalRule().run()
  }, [editor])

  const isActive = useCallback(
    (type: string, options?: any) => {
      if (!editor) return false

      switch (type) {
        case "heading":
          return editor.isActive("heading", options)
        default:
          return editor.isActive(type)
      }
    },
    [editor],
  )

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setHeading(1)}
          className={`px-2 py-1 rounded text-sm ${
            isActive("heading", { level: 1 }) ? "bg-gray-200" : "hover:bg-gray-100"
          }`}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => setHeading(2)}
          className={`px-2 py-1 rounded text-sm ${
            isActive("heading", { level: 2 }) ? "bg-gray-200" : "hover:bg-gray-100"
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => setHeading(3)}
          className={`px-2 py-1 rounded text-sm ${
            isActive("heading", { level: 3 }) ? "bg-gray-200" : "hover:bg-gray-100"
          }`}
        >
          H3
        </button>
        <span className="mx-1 text-gray-300">|</span>
        <button
          type="button"
          onClick={toggleBold}
          className={`px-2 py-1 rounded text-sm ${isActive("bold") ? "bg-gray-200" : "hover:bg-gray-100"}`}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={toggleItalic}
          className={`px-2 py-1 rounded text-sm ${isActive("italic") ? "bg-gray-200" : "hover:bg-gray-100"}`}
        >
          <em>I</em>
        </button>
        <span className="mx-1 text-gray-300">|</span>
        <button
          type="button"
          onClick={toggleBulletList}
          className={`px-2 py-1 rounded text-sm ${isActive("bulletList") ? "bg-gray-200" : "hover:bg-gray-100"}`}
        >
          • List
        </button>
        <button
          type="button"
          onClick={toggleOrderedList}
          className={`px-2 py-1 rounded text-sm ${isActive("orderedList") ? "bg-gray-200" : "hover:bg-gray-100"}`}
        >
          1. List
        </button>
        <button
          type="button"
          onClick={toggleBlockquote}
          className={`px-2 py-1 rounded text-sm ${isActive("blockquote") ? "bg-gray-200" : "hover:bg-gray-100"}`}
        >
          Quote
        </button>
        <button type="button" onClick={insertHorizontalRule} className="px-2 py-1 rounded text-sm hover:bg-gray-100">
          Line
        </button>
      </div>
      <EditorContent editor={editor} className="prose max-w-none p-4 min-h-[300px]" />
    </div>
  )
}

