import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toggle } from '@/components/ui/toggle';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Escribe aquí...',
  className,
  error = false,
}) => {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const minHeight = 360; // Altura mínima en píxeles
  const maxHeight = 800; // Altura máxima en píxeles

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      // Ajustar altura después de actualizar
      adjustHeight();
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none px-3 py-2',
      },
    },
  });

  // Función para ajustar la altura del editor
  const adjustHeight = React.useCallback(() => {
    if (!editor || !editorRef.current) return;
    
    const editorElement = editorRef.current.querySelector('.ProseMirror');
    if (!editorElement) return;

    // Resetear altura para obtener el scrollHeight correcto
    (editorElement as HTMLElement).style.height = 'auto';
    const scrollHeight = (editorElement as HTMLElement).scrollHeight;
    
    // Calcular nueva altura (mínimo minHeight, máximo maxHeight)
    const newHeight = Math.max(minHeight, Math.min(scrollHeight + 20, maxHeight));
    (editorElement as HTMLElement).style.height = `${newHeight}px`;
    
    // Si excede maxHeight, activar scroll
    if (scrollHeight > maxHeight) {
      (editorElement as HTMLElement).style.overflowY = 'auto';
    } else {
      (editorElement as HTMLElement).style.overflowY = 'hidden';
    }
  }, [editor, minHeight, maxHeight]);

  // Ajustar altura cuando cambia el contenido
  React.useEffect(() => {
    if (editor) {
      adjustHeight();
    }
  }, [editor, adjustHeight]);

  // Sync external value changes
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
      // Ajustar altura después de cambiar el contenido
      setTimeout(adjustHeight, 0);
    }
  }, [value, editor, adjustHeight]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn(
      'rounded-md border bg-background',
      error ? 'border-red-500' : 'border-input',
      className
    )}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-input p-1 bg-muted/30">
        <Toggle
          size="sm"
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          aria-label="Negrita"
          title="Negrita (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Cursiva"
          title="Cursiva (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <div className="w-px h-4 bg-border mx-1" />
        <Toggle
          size="sm"
          pressed={editor.isActive('bulletList')}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Lista con viñetas"
          title="Lista con viñetas"
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('orderedList')}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Lista numerada"
          title="Lista numerada"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <div className="w-px h-4 bg-border mx-1" />
        <Toggle
          size="sm"
          pressed={editor.isActive('link')}
          onPressedChange={() => {
            if (editor.isActive('link')) {
              editor.chain().focus().unsetLink().run();
            } else {
              const url = window.prompt('URL del enlace:');
              if (url) {
                editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
              }
            }
          }}
          aria-label="Hipervínculo"
          title="Agregar enlace"
        >
          <LinkIcon className="h-4 w-4" />
        </Toggle>
      </div>
      
      {/* Editor Content */}
      <div ref={editorRef}>
        <EditorContent editor={editor} />
      </div>
      
      {/* Styles for placeholder and lists */}
      <style>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          height: 0;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .ProseMirror li {
          margin: 0.25rem 0;
        }
        .ProseMirror strong {
          font-weight: 600;
        }
        .ProseMirror em {
          font-style: italic;
        }
        .ProseMirror:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
};

// Helper function to get plain text length from HTML
export const getPlainTextLength = (html: string): number => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent?.length || 0;
};

export { RichTextEditor };
