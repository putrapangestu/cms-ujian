// components/RichEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { useEffect, useRef, useState } from 'react'

// Extend Image with resize functionality
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: (attributes) => {
          return {
            width: attributes.width,
          }
        },
      },
      height: {
        default: null,
        renderHTML: (attributes) => {
          return {
            height: attributes.height,
          }
        },
      },
    }
  },
})

interface TiptapEditorProps {
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
}

export default function RichEditor({
  content = '',
  onChange,
  placeholder = 'Mulai mengetik...',
}: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showImageSizeModal, setShowImageSizeModal] = useState(false)
  const [imageSize, setImageSize] = useState({ width: '100%', height: 'auto' })

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      ResizableImage.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-3 shadow-sm cursor-pointer',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary text-decoration-underline',
        },
      }),
    ],
    content,
    onUpdate: ({ editor: currentEditor }) => {
      onChange?.(currentEditor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none',
      },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Harap pilih file gambar')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 5MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string

      // Show size selection modal
      setShowImageSizeModal(true)

      // Store the base64 for later use
      ;(window as any).pendingImageSrc = base64String
    }
    reader.readAsDataURL(file)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const insertImageWithSize = (
    size: 'extra-small' | 'small' | 'medium' | 'large' | 'full',
  ) => {
    const src = (window as any).pendingImageSrc
    if (!src) return

    let width: string
    const height = 'auto'

    switch (size) {
      case 'extra-small':
        width = '50px'
        break
      case 'small':
        width = '300px'
        break
      case 'medium':
        width = '500px'
        break
      case 'large':
        width = '700px'
        break
      case 'full':
        width = '100%'
        break
      default:
        width = '100%'
    }

    editor
      .chain()
      .focus()
      .setImage({
        src,
        width: Number(width.replace('px', '')),
        height: Number(height.replace('px', '')),
      })
      .run()

    setShowImageSizeModal(false)
    delete (window as any).pendingImageSrc
  }

  const handleAddLink = () => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('Masukkan URL:', previousUrl)

    if (url === null) return

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  if (!editor) {
    return (
      <div className="border border-light rounded-3 p-3 text-center text-muted">
        <div className="spinner-border spinner-border-sm me-2" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        Memuat editor...
      </div>
    )
  }

  return (
    <>
      <div className="border border-light rounded-3 overflow-hidden bg-white shadow-sm">
        {/* Toolbar */}
        <div className="bg-light bg-opacity-50 border-bottom border-light p-2 d-flex flex-wrap gap-1 align-items-center">
          {/* Text Formatting */}
          <div className="btn-group btn-group-sm" role="group">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`btn ${
                editor.isActive('bold')
                  ? 'btn-primary'
                  : 'btn-light border-0 text-primary'
              }`}
              title="Bold (Ctrl+B)"
            >
              <i className="ti ti-bold"></i>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`btn ${
                editor.isActive('italic')
                  ? 'btn-primary'
                  : 'btn-light border-0 text-primary'
              }`}
              title="Italic (Ctrl+I)"
            >
              <i className="ti ti-italic"></i>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`btn ${
                editor.isActive('strike')
                  ? 'btn-primary'
                  : 'btn-light border-0 text-primary'
              }`}
              title="Strikethrough"
            >
              <i className="ti ti-strikethrough"></i>
            </button>
          </div>

          <div className="vr opacity-25"></div>

          {/* Lists */}
          <div className="btn-group btn-group-sm" role="group">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`btn ${
                editor.isActive('bulletList')
                  ? 'btn-primary'
                  : 'btn-light border-0 text-primary'
              }`}
              title="Bullet List"
            >
              <i className="ti ti-list"></i>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`btn ${
                editor.isActive('orderedList')
                  ? 'btn-primary'
                  : 'btn-light border-0 text-primary'
              }`}
              title="Numbered List"
            >
              <i className="ti ti-list-numbers"></i>
            </button>
          </div>

          <div className="vr opacity-25"></div>

          {/* Link & Image */}
          <button
            type="button"
            onClick={handleAddLink}
            className={`btn btn-sm ${
              editor.isActive('link')
                ? 'btn-primary'
                : 'btn-light border-0 text-primary'
            }`}
            title="Add Link"
          >
            <i className="ti ti-link"></i>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-sm btn-light border-0 text-primary"
            title="Upload Image (max 5MB)"
          >
            <i className="ti ti-photo"></i>
          </button>
        </div>

        {/* Editor Content */}
        <div
          className="p-3"
          style={{ minHeight: '160px', maxHeight: '400px', overflowY: 'auto' }}
        >
          <EditorContent editor={editor} />
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="d-none"
        />
      </div>

      {/* Image Size Modal */}
      {showImageSizeModal && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Pilih Ukuran Gambar</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowImageSizeModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="d-grid gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-primary text-start d-flex align-items-center justify-content-between"
                    onClick={() => insertImageWithSize('small')}
                  >
                    <span>
                      <i className="ti ti-photo me-2"></i>
                      Ekstra Kecil
                    </span>
                    <span className="badge bg-light text-dark">100px</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary text-start d-flex align-items-center justify-content-between"
                    onClick={() => insertImageWithSize('extra-small')}
                  >
                    <span>
                      <i className="ti ti-photo me-2"></i>
                      Kecil
                    </span>
                    <span className="badge bg-light text-dark">300px</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary text-start d-flex align-items-center justify-content-between"
                    onClick={() => insertImageWithSize('medium')}
                  >
                    <span>
                      <i className="ti ti-photo me-2"></i>
                      Sedang
                    </span>
                    <span className="badge bg-light text-dark">500px</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary text-start d-flex align-items-center justify-content-between"
                    onClick={() => insertImageWithSize('large')}
                  >
                    <span>
                      <i className="ti ti-photo-plus me-2"></i>
                      Besar
                    </span>
                    <span className="badge bg-light text-dark">700px</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary text-start d-flex align-items-center justify-content-between"
                    onClick={() => insertImageWithSize('full')}
                  >
                    <span>
                      <i className="ti ti-arrows-maximize me-2"></i>
                      Penuh
                    </span>
                    <span className="badge bg-white text-primary">100%</span>
                  </button>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowImageSizeModal(false)}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
