import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import ConversationsList from '@/components/ConversationsList';
import ChatView from '@/components/ChatView';
import { useSupabaseMessages } from '@/contexts/SupabaseMessagesContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';

const BusinessMessagesPage = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useSupabaseAuth();
  const { 
    conversations, 
    messagesByConversation, 
    loadMessages, 
    loadConversations,
    sendMessageToConversation, 
    markAsRead,
    markAsUnread,
    archiveConversation,
    unarchiveConversation,
    getOrCreateConversation,
  } = useSupabaseMessages();
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isResolvingId, setIsResolvingId] = useState(false);
  const [pendingRecipientId, setPendingRecipientId] = useState<string | null>(null);
  const [tempConversation, setTempConversation] = useState<any>(null);
  const [isInitializingFromQuery, setIsInitializingFromQuery] = useState(false);

  // Handle ?user= query param to start conversation with specific user
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/73b4eba3-5756-4c0a-8df1-ac27537707cc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BusinessMessagesPage.tsx:33',message:'useEffect user query param - ENTRY',data:{targetUserId:searchParams.get('user'),userExists:!!user,currentUrl:window.location.href},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    const targetUserId = searchParams.get('user');
    if (!targetUserId || !user) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/73b4eba3-5756-4c0a-8df1-ac27537707cc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BusinessMessagesPage.tsx:36',message:'useEffect user query param - EARLY RETURN',data:{targetUserId,userExists:!!user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return;
    }

    const initConversation = async () => {
      setIsResolvingId(true);
      setIsInitializingFromQuery(true);
      try {
        console.log('[BusinessMessagesPage] Creating conversation with user:', targetUserId);
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/73b4eba3-5756-4c0a-8df1-ac27537707cc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BusinessMessagesPage.tsx:42',message:'BEFORE getOrCreateConversation',data:{targetUserId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        
        // Get or create conversation with the target user
        const convId = await getOrCreateConversation(targetUserId, 'profile_contact');
        console.log('[BusinessMessagesPage] Conversation ID:', convId);
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/73b4eba3-5756-4c0a-8df1-ac27537707cc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BusinessMessagesPage.tsx:45',message:'AFTER getOrCreateConversation',data:{convId,targetUserId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        setPendingRecipientId(targetUserId);
        
        // Fetch target user profile to create temp conversation
        const { data: targetProfile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('user_id', targetUserId)
          .single();
        
        // Create temporary conversation object to show chat interface
        const tempConv = {
          id: convId,
          participants: [user.id, targetUserId],
          participantNames: [
            user.email || 'Usuario',
            targetProfile?.full_name || 'Usuario'
          ],
          participantAvatars: [
            null,
            targetProfile?.avatar_url || null
          ],
          lastMessage: '',
          lastMessageAt: new Date().toISOString(),
          unread_count: 0,
          type: 'profile_contact' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/73b4eba3-5756-4c0a-8df1-ac27537707cc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BusinessMessagesPage.tsx:74',message:'BEFORE setTempConversation and setActiveId',data:{tempConvId:tempConv.id,convId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        setTempConversation(tempConv);
        setActiveId(convId);
        setIsResolvingId(false); // Ya tenemos la conversación temporal, podemos mostrar la UI
        // Mark initialization as complete after a short delay to ensure state is set
        setTimeout(() => {
          setIsInitializingFromQuery(false);
        }, 100);
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/73b4eba3-5756-4c0a-8df1-ac27537707cc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BusinessMessagesPage.tsx:76',message:'AFTER setTempConversation and setActiveId',data:{tempConvId:tempConv.id,activeId:convId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        
        // Reload conversations to ensure the new one appears in the list
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/73b4eba3-5756-4c0a-8df1-ac27537707cc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BusinessMessagesPage.tsx:79',message:'BEFORE loadConversations',data:{convId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        await loadConversations();
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/73b4eba3-5756-4c0a-8df1-ac27537707cc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BusinessMessagesPage.tsx:80',message:'AFTER loadConversations',data:{convId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        
        // Wait a bit and reload again, then clear query param
        // Increase timeout to ensure tempConversation is fully set before clearing query param
        setTimeout(async () => {
          await loadConversations();
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/73b4eba3-5756-4c0a-8df1-ac27537707cc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BusinessMessagesPage.tsx:85',message:'BEFORE clear query param',data:{expectedConvId:convId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          // Clear the query param from URL (pero mantener activeId y tempConversation)
          // The activeId should already be set to convId, so we can safely clear the query param
          setSearchParams({}, { replace: true });
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/73b4eba3-5756-4c0a-8df1-ac27537707cc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BusinessMessagesPage.tsx:86',message:'AFTER clear query param',data:{expectedConvId:convId,currentUrl:window.location.href},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
        }, 500);
      } catch (error) {
        console.error('Error creating conversation:', error);
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/73b4eba3-5756-4c0a-8df1-ac27537707cc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BusinessMessagesPage.tsx:88',message:'ERROR in initConversation',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        setTempConversation(null);
        setIsResolvingId(false);
      }
    };

    initConversation();
  }, [searchParams, user, getOrCreateConversation, setSearchParams, loadConversations]);

  // Resolve conversationId from URL parameter
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/73b4eba3-5756-4c0a-8df1-ac27537707cc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BusinessMessagesPage.tsx:98',message:'useEffect conversationId - ENTRY',data:{conversationId,hasTempConv:!!tempConversation,pendingRecipientId,activeId,userParam:searchParams.get('user')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    if (!conversationId) {
      // Don't reset activeId if we have an active conversation (temp or real)
      // Also, don't reset if activeId already has a value - it might be from a temp conversation
      const hasActiveConversation = tempConversation || 
                                    pendingRecipientId || 
                                    (activeId && conversations.some(c => c.id === activeId));
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/73b4eba3-5756-4c0a-8df1-ac27537707cc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BusinessMessagesPage.tsx:103',message:'Checking hasActiveConversation',data:{hasActiveConversation,tempConversation:!!tempConversation,pendingRecipientId,activeId,conversationsCount:conversations.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      // Only reset activeId if:
      // 1. There's no user query param
      // 2. There's no active conversation (temp or real)
      // 3. activeId is currently null (don't reset if it already has a value)
      // 4. We're not currently initializing from a query param
      if (!searchParams.get('user') && !hasActiveConversation && !activeId && !isInitializingFromQuery) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/73b4eba3-5756-4c0a-8df1-ac27537707cc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BusinessMessagesPage.tsx:106',message:'RESETTING activeId to null',data:{activeIdBefore:activeId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        setActiveId(null);
      }
      return;
    }

    setIsResolvingId(true);
    setActiveId(conversationId);
    setIsResolvingId(false);
  }, [conversationId, searchParams, tempConversation, pendingRecipientId, activeId, conversations, isInitializingFromQuery]);

  // Load conversations on mount only if user is authenticated
  useEffect(() => {
    if (user) {
      loadConversations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Clear temp conversation when real conversation becomes available and has messages
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/73b4eba3-5756-4c0a-8df1-ac27537707cc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BusinessMessagesPage.tsx:125',message:'useEffect clear tempConversation - ENTRY',data:{hasTempConv:!!tempConversation,tempConvId:tempConversation?.id,activeId,conversationsCount:conversations.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    if (tempConversation && activeId === tempConversation.id) {
      const realConv = conversations.find(c => c.id === tempConversation.id);
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/73b4eba3-5756-4c0a-8df1-ac27537707cc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BusinessMessagesPage.tsx:128',message:'Checking real conversation',data:{hasRealConv:!!realConv,tempConvId:tempConversation.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      if (realConv) {
        // Solo limpiar temp si la conversación real tiene mensajes o esperar un poco más
        const hasMessages = (messagesByConversation[tempConversation.id]?.length ?? 0) > 0;
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/73b4eba3-5756-4c0a-8df1-ac27537707cc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BusinessMessagesPage.tsx:131',message:'Checking messages',data:{hasMessages,messageCount:messagesByConversation[tempConversation.id]?.length??0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        if (hasMessages) {
          // Esperar un poco más para asegurar que todo esté cargado
          setTimeout(() => {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/73b4eba3-5756-4c0a-8df1-ac27537707cc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BusinessMessagesPage.tsx:134',message:'CLEARING tempConversation',data:{tempConvId:tempConversation.id,activeId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            setTempConversation(null);
          }, 500);
        }
      }
    }
  }, [conversations, tempConversation, activeId, messagesByConversation]);

  const activeConversation = useMemo(() => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/73b4eba3-5756-4c0a-8df1-ac27537707cc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BusinessMessagesPage.tsx:141',message:'activeConversation useMemo - ENTRY',data:{activeId,hasTempConv:!!tempConversation,tempConvId:tempConversation?.id,conversationsCount:conversations.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    // Use temp conversation if available, otherwise find in conversations
    let result = null;
    if (tempConversation && tempConversation.id === activeId) {
      result = tempConversation;
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/73b4eba3-5756-4c0a-8df1-ac27537707cc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BusinessMessagesPage.tsx:144',message:'activeConversation - USING TEMP',data:{tempConvId:tempConversation.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
    } else {
      result = conversations.find(c => c.id === activeId) || null;
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/73b4eba3-5756-4c0a-8df1-ac27537707cc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BusinessMessagesPage.tsx:147',message:'activeConversation - USING REAL OR NULL',data:{resultId:result?.id,activeId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
    }
    return result;
  }, [conversations, activeId, tempConversation]);
  
  const activeMessages = messagesByConversation[activeId || ''] || [];

  useEffect(() => {
    if (!activeId) return;
    
    const loadConversationData = async () => {
      await loadMessages(activeId);
      // Marcar automáticamente como leído al seleccionar la conversación
      await markAsRead(activeId);
    };
    
    loadConversationData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const handleSendMessage = async (
    content: string,
    fileUrl?: string,
    fileName?: string,
    fileSize?: number,
    fileType?: string
  ) => {
    if (!activeId) return;
    
    console.log('[BusinessMessagesPage] handleSendMessage called with:', {
      content,
      fileUrl,
      fileName,
      fileSize,
      fileType
    });
    
    await sendMessageToConversation(
      activeId, 
      content,
      fileUrl,
      fileName,
      fileSize,
      fileType
    );
    
    // Clear pending recipient and temp conversation after first message
    if (pendingRecipientId) {
      setPendingRecipientId(null);
      setTempConversation(null);
      // Reload conversations to get the real conversation with the message
      await loadConversations();
    }
  };

  // Show loading state while resolving conversation ID
  if (isResolvingId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando conversación...</p>
        </div>
      </div>
    );
  }

  // Show authentication message if user is not logged in
  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Inicia sesión para ver tus mensajes</h2>
          <p className="text-muted-foreground mb-6">
            Necesitas estar autenticado para acceder a la bandeja de mensajes.
          </p>
          <button 
            onClick={() => window.location.href = '/auth'}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  // Create a key that changes when conversations change
  const conversationsKey = useMemo(() => 
    conversations.map(c => `${c.id}-${c.unread_count}`).join(','),
    [conversations]
  );

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/73b4eba3-5756-4c0a-8df1-ac27537707cc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BusinessMessagesPage.tsx:237',message:'RENDER - Final state',data:{activeId,hasActiveConv:!!activeConversation,activeConvId:activeConversation?.id,hasTempConv:!!tempConversation,tempConvId:tempConversation?.id,pendingRecipientId,isResolvingId,currentUrl:window.location.href},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  return (
    <div className="flex h-[calc(100vh-64px)]">
      <ConversationsList
        key={conversationsKey}
        conversations={conversations as any}
        activeConversationId={activeId}
        onSelectConversation={setActiveId}
        onMarkAsUnread={markAsUnread}
        onMarkAsRead={markAsRead}
        onArchive={archiveConversation}
        onUnarchive={unarchiveConversation}
      />
      {activeConversation ? (
        <ChatView
          conversation={activeConversation as any}
          messages={activeMessages as any}
          onSendMessage={handleSendMessage}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando conversación...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessMessagesPage;
