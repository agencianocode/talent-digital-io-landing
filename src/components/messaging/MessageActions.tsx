import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { MoreVertical, Pencil, Trash2, X, Check } from 'lucide-react';

interface MessageActionsProps {
  messageId: string;
  content: string;
  createdAt: string;
  onEdit: (messageId: string, newContent: string) => Promise<boolean>;
  onDelete: (messageId: string) => Promise<boolean>;
  /** Only allow editing within this many minutes (default: 15) */
  editTimeLimit?: number;
  isOwnMessage?: boolean;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  messageId,
  content,
  createdAt,
  onEdit,
  onDelete,
  editTimeLimit = 15,
  isOwnMessage = true,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate if editing is still allowed
  const messageAge = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60);
  const canEdit = isOwnMessage && messageAge <= editTimeLimit;
  const canDelete = isOwnMessage;

  const handleEdit = async () => {
    if (!editedContent.trim() || editedContent === content) {
      setIsEditing(false);
      setEditedContent(content);
      return;
    }

    setIsLoading(true);
    const success = await onEdit(messageId, editedContent);
    setIsLoading(false);

    if (success) {
      setIsEditing(false);
    } else {
      // Restore original content on failure
      setEditedContent(content);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    await onDelete(messageId);
    setIsLoading(false);
    setShowDeleteDialog(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(content);
  };

  // If in editing mode, render inline editor
  if (isEditing) {
    return (
      <div className="w-full space-y-2">
        <Textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="min-h-[60px] text-sm bg-background text-foreground"
          autoFocus
          disabled={isLoading}
        />
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancelEdit}
            disabled={isLoading}
            className="h-7 px-2"
          >
            <X className="h-4 w-4 mr-1" />
            Cancelar
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleEdit}
            disabled={isLoading || !editedContent.trim()}
            className="h-7 px-2"
          >
            <Check className="h-4 w-4 mr-1" />
            Guardar
          </Button>
        </div>
      </div>
    );
  }

  // Don't show menu if no actions available
  if (!canEdit && !canDelete) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity absolute -right-1 -top-1 bg-background/80 hover:bg-background shadow-sm"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {canEdit && (
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar mensaje
            </DropdownMenuItem>
          )}
          {canDelete && (
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar mensaje?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El mensaje será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MessageActions;
