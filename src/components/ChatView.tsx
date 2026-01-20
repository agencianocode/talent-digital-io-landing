
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { useFileUpload } from '@/hooks/useFileUpload';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Send, MessageCircle, Paperclip, X, File, Download, Image as ImageIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { MessageActions } from '@/components/messaging/MessageActions';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  attachment_name?: string;
  attachment_size?: number;
  attachment_type?: string;
  created_at: string;
  is_read: boolean;
  read_at?: string;
  delivered_at?: string;
  edited_at?: string;
  sender?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface Conversation {
  id: string;
  participants: string[];
  participantNames: string[];
  participantAvatars?: string[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  type: 'application' | 'direct';
  opportunityTitle?: string;
}

interface ChatViewProps {
  conversation: Conversation | null;
  messages: Message[];
  onSendMessage: (content: string, fileUrl?: string, fileName?: string, fileSize?: number, fileType?: string) => void;
  onEditMessage?: (messageId: string, newContent: string) => Promise<boolean>;
  onDeleteMessage?: (messageId: string) => Promise<boolean>;
}

const ChatView: React.FC<ChatViewProps> = ({ conversation, messages, onSendMessage, onEditMessage, onDeleteMessage }) => {
  const { user } = useSupabaseAuth();
  const [messageText, setMessageText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Typing indicator hook
  const { isAnyoneTyping, sendTypingIndicator, stopTyping } = useTypingIndicator(
    conversation?.id || null
  );
  
  // File upload hook
  const { uploadFile, isUploading, uploadProgress } = useFileUpload();

  // Auto-scroll to bottom when new messages arrive or someone is typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAnyoneTyping]);

  if (!user) return null;

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Selecciona una conversación</h3>
          <p className="text-muted-foreground">Elige una conversación para comenzar a chatear</p>
        </div>
      </div>
    );
  }

  // Find the other participant by index (not by comparing to email)
  const currentUserIndex = conversation.participants.findIndex(id => id === user.id);
  const otherIndex = currentUserIndex === 0 ? 1 : 0;
  const otherParticipantName = conversation.participantNames?.[otherIndex] || 'Usuario';
  
  const getOtherParticipantAvatar = () => {
    if (!conversation.participantAvatars || conversation.participantAvatars.length === 0) {
      return null;
    }
    const otherIndex = conversation.participants.findIndex(id => id !== user.id);
    return conversation.participantAvatars[otherIndex] || null;
  };
  
  const otherParticipantAvatar = getOtherParticipantAvatar();

  const handleSendMessage = async () => {
    if (!messageText.trim() && !selectedFile) return;
    
    stopTyping(); // Stop typing indicator when sending
    
    // If there's a file, upload it first
    if (selectedFile) {
      const uploadResult = await uploadFile(selectedFile);
      if (uploadResult) {
        onSendMessage(
          messageText.trim() || `📎 ${uploadResult.name}`,
          uploadResult.url,
          uploadResult.name,
          uploadResult.size,
          uploadResult.type
        );
        setSelectedFile(null);
      }
    } else {
      onSendMessage(messageText);
    }
    
    setMessageText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    
    // Send typing indicator when user is typing
    if (e.target.value.length > 0) {
      sendTypingIndicator();
    } else {
      stopTyping();
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };
  
  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };
  
  const isImage = (type?: string) => {
    return type?.startsWith('image/');
  };
  
  const renderReadReceipt = (message: Message, isOwnMessage: boolean) => {
    if (!isOwnMessage) return null;
    
    if (message.is_read && message.read_at) {
      // Double check - Read
      return (
        <span className="inline-flex items-center ml-1 text-blue-400" title={`Leído ${format(new Date(message.read_at), 'HH:mm')}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline-block">
            <path d="M4 8L7 11L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline-block -ml-2">
            <path d="M4 8L7 11L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      );
    } else if (message.delivered_at) {
      // Single check - Delivered
      return (
        <span className="inline-flex items-center ml-1 opacity-70" title={`Enviado ${format(new Date(message.delivered_at), 'HH:mm')}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline-block">
            <path d="M4 8L7 11L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      );
    }
    
    return null;
  };

  const getSignedUrl = async (fileUrl: string): Promise<string> => {
    console.log('[ChatView] Getting signed URL for:', fileUrl);
    
    try {
      // Extract file path from URL
      const urlParts = fileUrl.split('/message-attachments/');
      console.log('[ChatView] URL parts:', urlParts);
      
      const pathPart = urlParts[1];
      if (urlParts.length === 2 && pathPart) {
        const filePathParts = pathPart.split('?');
        const filePath = filePathParts[0];
        
        console.log('[ChatView] Extracted file path:', filePath);
        
        if (!filePath) {
          console.warn('[ChatView] No file path found, returning original URL');
          return fileUrl;
        }
        
        // Get signed URL
        const { data, error } = await supabase.storage
          .from('message-attachments')
          .createSignedUrl(filePath, 3600); // 1 hour
        
        if (error) {
          console.error('[ChatView] Error creating signed URL:', error);
          throw error;
        }
        
        console.log('[ChatView] Signed URL created:', data.signedUrl);
        return data.signedUrl;
      }
      
      console.warn('[ChatView] Could not parse URL, returning original');
      return fileUrl;
    } catch (error) {
      console.error('[ChatView] Exception getting signed URL:', error);
      return fileUrl; // Fallback to original URL
    }
  };

  const handleFileDownload = async (fileUrl: string) => {
    console.log('[ChatView] Download clicked for:', fileUrl);
    try {
      const signedUrl = await getSignedUrl(fileUrl);
      console.log('[ChatView] Opening signed URL:', signedUrl);
      window.open(signedUrl, '_blank');
    } catch (error) {
      console.error('[ChatView] Error downloading file:', error);
      toast.error('Error al descargar el archivo');
    }
  };

  const renderAttachment = (message: Message) => {
    const fileUrl = message.file_url;
    const fileName = message.attachment_name || message.file_name || 'archivo';
    const fileSize = message.attachment_size || message.file_size;
    const fileType = message.attachment_type;
    
    console.log('[ChatView] Rendering attachment:', {
      messageId: message.id,
      fileUrl,
      fileName,
      fileSize,
      fileType
    });
    
    if (!fileUrl) {
      console.log('[ChatView] No file URL, skipping attachment render');
      return null;
    }
    
    return (
      <div className="mt-2">
        {isImage(fileType) ? (
          <Button
            variant="ghost"
            className="p-0 h-auto hover:bg-transparent"
            onClick={() => handleFileDownload(fileUrl)}
          >
            <img 
              src={fileUrl} 
              alt={fileName}
              loading="lazy"
              className="max-w-xs rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
              onError={async (e) => {
                // If image fails to load, try with signed URL
                const signedUrl = await getSignedUrl(fileUrl);
                (e.target as HTMLImageElement).src = signedUrl;
              }}
            />
          </Button>
        ) : (
          <Button
            variant="ghost"
            className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors max-w-xs h-auto w-full justify-start"
            onClick={() => handleFileDownload(fileUrl)}
          >
            <File className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium truncate">{fileName}</p>
              {fileSize && <p className="text-xs text-muted-foreground">{formatFileSize(fileSize)}</p>}
            </div>
            <Download className="h-4 w-4 flex-shrink-0" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-background h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherParticipantAvatar || undefined} alt={otherParticipantName} />
            <AvatarFallback className="text-sm">
              {getInitials(otherParticipantName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground">{otherParticipantName}</h3>
            {conversation.opportunityTitle && (
              <p className="text-sm text-muted-foreground">
                Re: {conversation.opportunityTitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No hay mensajes en esta conversación</p>
              <p className="text-sm">¡Envía el primer mensaje!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.sender_id === user.id;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end space-x-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {!isOwnMessage && (
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={message.sender?.avatar_url || ""} alt={message.sender?.full_name || "Usuario"} />
                        <AvatarFallback className="text-xs">
                          {getInitials(message.sender?.full_name || "Usuario")}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`relative group rounded-lg px-3 py-2 ${
                      isOwnMessage 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-foreground'
                    }`}>
                      {/* Message Actions (Edit/Delete) - Only for own messages */}
                      {isOwnMessage && onEditMessage && onDeleteMessage && (
                        <MessageActions
                          messageId={message.id}
                          content={message.content || ''}
                          createdAt={message.created_at}
                          onEdit={onEditMessage}
                          onDelete={onDeleteMessage}
                          isOwnMessage={isOwnMessage}
                        />
                      )}
                      
                      {message.content && (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                      {renderAttachment(message)}
                      <p className={`text-xs mt-1 flex items-center gap-1 ${
                        isOwnMessage 
                          ? 'text-primary-foreground/70' 
                          : 'text-muted-foreground'
                      }`}>
                        {format(new Date(message.created_at), 'HH:mm')}
                        {message.edited_at && (
                          <span className="italic">(editado)</span>
                        )}
                        {renderReadReceipt(message, isOwnMessage)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          {/* Typing Indicator */}
          {isAnyoneTyping && (
            <div className="flex justify-start">
              <div className="flex items-end space-x-2 max-w-[70%]">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={otherParticipantAvatar || undefined} alt={otherParticipantName} />
                  <AvatarFallback className="text-xs">
                    {getInitials(otherParticipantName)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="rounded-lg px-3 py-2 bg-secondary text-foreground">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card flex-shrink-0">
        {/* File Preview */}
        {selectedFile && (
          <div className="mb-3 p-3 bg-secondary/50 rounded-lg flex items-center gap-3">
            {isImage(selectedFile.type) ? (
              <ImageIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
            ) : (
              <File className="h-5 w-5 text-gray-600 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* Upload Progress */}
        {isUploading && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">Subiendo archivo...</span>
              <span className="text-sm font-medium">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
        
        <div className="flex space-x-2">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {/* Attach file button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="h-11 w-11"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <Textarea
            value={messageText}
            onChange={handleTextChange}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje..."
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
            disabled={isUploading}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={(!messageText.trim() && !selectedFile) || isUploading}
            size="icon"
            className="h-11 w-11"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
