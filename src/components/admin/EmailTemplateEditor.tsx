import React, { useCallback, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Link as LinkIcon, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

interface EmailRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
}

const COMMON_EMOJIS = ['😊', '👋', '🎉', '✨', '🚀', '💼', '📧', '✅', '⭐', '💡', '🔥', '👍', '❤️', '📌', '🎯', '📣'];

export const EmailRichTextEditor: React.FC<EmailRichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Escribe el contenido del email...',
  className,
  minHeight = 200,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [linkUrl, setLinkUrl] = React.useState('');
  const [showLinkInput, setShowLinkInput] = React.useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        code: false,
        heading: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none px-4 py-3',
        style: `min-height: ${minHeight}px`,
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const addLink = useCallback(() => {
    if (!editor || !linkUrl) return;
    
    if (editor.state.selection.empty) {
      editor.chain().focus().insertContent(`<a href="${linkUrl}">${linkUrl}</a>`).run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setLinkUrl('');
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  const removeLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
  }, [editor]);

  const insertEmoji = useCallback((emoji: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(emoji).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn('rounded-md border bg-background border-input', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-input p-2 bg-muted/30 flex-wrap">
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
        
        {/* Link */}
        <Popover open={showLinkInput} onOpenChange={setShowLinkInput}>
          <PopoverTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive('link')}
              aria-label="Enlace"
              title="Agregar enlace"
            >
              <LinkIcon className="h-4 w-4" />
            </Toggle>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3" align="start">
            <div className="space-y-2">
              <p className="text-sm font-medium">Agregar enlace</p>
              <div className="flex gap-2">
                <Input
                  placeholder="https://ejemplo.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addLink()}
                />
                <Button size="sm" onClick={addLink}>Agregar</Button>
              </div>
              {editor.isActive('link') && (
                <Button variant="ghost" size="sm" onClick={removeLink} className="text-destructive">
                  Remover enlace
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-4 bg-border mx-1" />

        {/* Emoji Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Toggle size="sm" aria-label="Emojis" title="Insertar emoji">
              <Smile className="h-4 w-4" />
            </Toggle>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="start">
            <div className="grid grid-cols-8 gap-1">
              {COMMON_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => insertEmoji(emoji)}
                  className="text-xl hover:bg-muted p-1 rounded cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Editor Content */}
      <div ref={editorRef}>
        <EditorContent editor={editor} />
      </div>
      
      {/* Styles */}
      <style>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          height: 0;
        }
        .ProseMirror strong {
          font-weight: 600;
        }
        .ProseMirror em {
          font-style: italic;
        }
        .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
        }
        .ProseMirror:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
};
