import { useState, useEffect, useRef } from 'react';
import { 
  Text, Title, Alert, Badge, ActionIcon, Container, Flex
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { messagesService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useNavigate, useParams } from 'react-router-dom';
import ChatInterface from '../components/ChatInterface';

export default function Conversation() {
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const { socket, connected } = useSocket();
  const messagesEndRef = useRef(null);
  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMessages();
  }, [userId]);

  useEffect(() => {
    if (socket) {
      // Listen for real-time message updates
      socket.on('message_update', (newMessage) => {
        // Check if the message belongs to this conversation
        const isRelevantMessage = 
          (newMessage.sender.id === parseInt(userId) || newMessage.recipient.id === parseInt(userId)) &&
          (newMessage.sender.id === currentUser.id || newMessage.recipient.id === currentUser.id);
        
        if (isRelevantMessage) {
          setMessages(prevMessages => [...prevMessages, newMessage]);
          
          // Automatically mark as read if the message is from the other user
          if (newMessage.sender.id === parseInt(userId) && !newMessage.is_read) {
            handleMarkAsRead(newMessage.id);
          }
        }
      });

      return () => {
        socket.off('message_update');
      };
    }
  }, [socket, userId, currentUser]);
  
  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await messagesService.getMessages();
      
      // Filter messages for this conversation
      const conversationMessages = response.data.filter(message => 
        (message.sender.id === parseInt(userId) || message.recipient.id === parseInt(userId)) &&
        (message.sender.id === currentUser.id || message.recipient.id === currentUser.id)
      );
      
      setMessages(conversationMessages);
      
      // Set the other user info
      if (conversationMessages.length > 0) {
        const message = conversationMessages[0];
        const otherUserInfo = message.sender.id === currentUser.id ? message.recipient : message.sender;
        setOtherUser(otherUserInfo);
      }
      
      // Automatically mark unread messages as read
      conversationMessages.forEach(message => {
        if (message.recipient.id === currentUser.id && !message.is_read) {
          handleMarkAsRead(message.id);
        }
      });
      
      setError('');
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError('Failed to load messages. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (values) => {
    try {
      setSending(true);
      if (currentUser.is_admin) {
        await messagesService.replyToUser(userId, { content: values.content });
      } else {
        await messagesService.messageAdmin({ content: values.content });
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) =>{
    try {
      await messagesService.deleteMessage(currentUser.id, userId, id);
      fetchMessages();
    } catch (err) {
      console.error("Failed to delete message:", err);
      setError("Failed to delete message. Please try again.");
    }
  }
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await messagesService.markAsRead(messageId);
      // Update the local state to mark the message as read
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      );
    } catch (err) {
      console.error('Failed to mark message as read:', err);
      // Don't show error to user for automatic read receipts
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const goBack = () => {
    navigate('/messages');
  };

  return (
    <Container fluid p={0} style={{ display: 'flex', flexDirection: 'column', maxWidth: '1200px', height: 'calc(100vh - 120px)' }}>
      <Flex justify="space-between" align="center" mb="xs">
        <Flex align="center">
          <ActionIcon 
            variant="light" 
            color="blue" 
            onClick={goBack}
            title="Back to messages"
            mr="xs"
          >
            <IconArrowLeft size={18} />
          </ActionIcon>
          <Title order={3}>
            {otherUser ? `Conversation with ${otherUser.username}` : 'Conversation'}
          </Title>
        </Flex>
        {!connected && (
          <Badge color="yellow" variant="light">Offline</Badge>
        )}
      </Flex>

      {error && (
        <Alert color="red" mb="md">
          {error}
        </Alert>
      )}

      <ChatInterface
        messages={messages}
        currentUser={currentUser}
        onSendMessage={handleSendMessage}
        formatDate={formatDate}
        loading={loading}
        sending={sending}
        placeholder="Type a message..."
        messagesEndRef={messagesEndRef}
        showReadReceipts={true}
        fetchPosts={fetchMessages}
        handleDelete={handleDelete}
      />
    </Container>
  );
}
