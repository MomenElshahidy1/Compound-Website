import { useState, useEffect, useRef } from 'react';
import { 
  Title, Alert, Badge, Container, Flex, Tabs
} from '@mantine/core';
import { messagesService, adminService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { IconMessage, IconUser } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import ChatInterface from '../components/ChatInterface';
import UserList from '../components/UserList';
import ConversationList from '../components/ConversationList';


export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const { socket, connected } = useSocket();
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();



  useEffect(() => {
    fetchMessages();
    
    // If user is admin, fetch all users
    if (currentUser?.is_admin) {
      fetchUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    if (socket) {
      // Listen for real-time message updates
      socket.on('message_update', (newMessage) => {
        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages, newMessage];
          
          // Automatically mark as read if the message is to the current user
          if (newMessage.recipient.id === currentUser.id && !newMessage.is_read) {
            handleMarkAsRead(newMessage.id, false);
          }
          
          return updatedMessages;
        });
      });

      return () => {
        socket.off('message_update');
      };
    }
  }, [socket, currentUser]);
  
  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await messagesService.getMessages();
      setMessages(response.data);
      
      // Automatically mark unread messages as read
      response.data.forEach(message => {
        if (message.recipient.id === currentUser.id && !message.is_read) {
          handleMarkAsRead(message.id, false);
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

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await adminService.getAllUsers();
      // Filter out admins and the current user
      const filteredUsers = response.data.filter(user => 
        !user.is_admin && user.id !== currentUser.id && user.is_approved && !user.is_banned
      );
      setUsers(filteredUsers);
      setFilteredUsers(filteredUsers);
      setError('');
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users. Please try again later.');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const lowerCaseQuery = query.toLowerCase();
    const filtered = users.filter(user => 
      user.username.toLowerCase().includes(lowerCaseQuery) ||
      user.full_name.toLowerCase().includes(lowerCaseQuery) ||
      user.building_number.toString().includes(lowerCaseQuery) ||
      user.apartment_number.toString().includes(lowerCaseQuery)
    );
    
    setFilteredUsers(filtered);
  };

  const handleReply = async (values) => {
    try {
      setSending(true);
      await messagesService.replyToUser(values.userId, { content: values.content });
      // No need to fetch messages again as we'll receive the update via WebSocket
    } catch (err) {
      console.error('Failed to send reply:', err);
      setError('Failed to send reply. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Handler for non-admin users to send messages to admin
  const handleSendMessage = async (values) => {
    try {
      setSending(true);
      await messagesService.messageAdmin({ content: values.content });
      // No need to fetch messages again as we'll receive the update via WebSocket
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleConversationClick = (userId) => {
    navigate(`/messages/${userId}`);
  };

  const handleMarkAsRead = async (messageId, showError = true) => {
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
      if (showError) {
        setError('Failed to mark message as read. Please try again.');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Group messages by conversation (sender/recipient pair)
  const groupedMessages = messages.reduce((groups, message) => {
    const isFromCurrentUser = message.sender.id === currentUser.id;
    const otherUserId = isFromCurrentUser ? message.recipient.id : message.sender.id;
    const otherUsername = isFromCurrentUser ? message.recipient.username : message.sender.username;
    
    if (!groups[otherUserId]) {
      groups[otherUserId] = {
        userId: otherUserId,
        username: otherUsername,
        messages: [],
        unreadCount: 0,
        lastMessage: null
      };
    }
    
    groups[otherUserId].messages.push(message);
    
    // Count unread messages from the other user
    if (!isFromCurrentUser && !message.is_read) {
      groups[otherUserId].unreadCount++;
    }

    // Update last message
    if (!groups[otherUserId].lastMessage || 
        new Date(message.created_at) > new Date(groups[otherUserId].lastMessage.created_at)) {
      groups[otherUserId].lastMessage = message;
    }
    
    return groups;
  }, {});

  // For non-admin users, find the admin conversation
  const adminConversation = !currentUser?.is_admin ? 
    Object.values(groupedMessages).find(conv => 
      messages.some(msg => 
        (msg.sender.id === conv.userId || msg.recipient.id === conv.userId) && 
        (msg.sender.is_admin || msg.recipient.is_admin)
      )
    ) : null;

  return (
    <Container fluid p={0} style={{ display: 'flex', flexDirection: 'column', maxWidth: '1200px', height: 'calc(100vh - 120px)' }}>
      <Flex justify="space-between" align="center" mb="xs">
        <Title order={3}>Messages</Title>
        {!connected && (
          <Badge color="yellow" variant="light">Offline</Badge>
        )}
      </Flex>

      {error && (
        <Alert color="red" mb="md">
          {error}
        </Alert>
      )}

      {!currentUser.is_admin && (
        <ChatInterface
          messages={adminConversation ? adminConversation.messages : []}
          currentUser={currentUser}
          onSendMessage={handleSendMessage}
          formatDate={formatDate}
          loading={loading}
          sending={sending}
          placeholder="Send a message to the admin..."
          messagesEndRef={messagesEndRef}
          showReadReceipts={true}
        />
      )}

      {currentUser.is_admin && (
        <Tabs defaultValue="users" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Tabs.List mb="md">
            <Tabs.Tab value="users" icon={<IconUser size={14} />}>Users</Tabs.Tab>
            <Tabs.Tab value="conversations" icon={<IconMessage size={14} />}>Conversations</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="users" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <UserList
              users={filteredUsers}
              onSelectUser={handleConversationClick}
              searchQuery={searchQuery}
              onSearchChange={handleSearch}
              loading={usersLoading}
              conversations={groupedMessages}
            />
          </Tabs.Panel>

          <Tabs.Panel value="conversations" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <ConversationList
              conversations={Object.values(groupedMessages)}
              onSelectConversation={handleConversationClick}
              formatDate={formatDate}
              loading={loading}
            />
          </Tabs.Panel>
        </Tabs>
      )}
    </Container>
  );
}
