import { useState, useEffect, useRef } from 'react';
import { 
  Text, Title, Alert, Badge, ActionIcon, Container, Flex,Group
} from '@mantine/core';
import { IconTrash, IconRefresh } from '@tabler/icons-react';
import { postsService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import ChatInterface from '../components/ChatInterface';

export default function GroupChat() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const { currentUser } = useAuth();
  const { socket, connected } = useSocket();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (socket) {
      // Listen for real-time post updates
      socket.on('post_update', (postData) => {
        // Check if this is a new post or an update to an existing post
        if (postData.is_deleted !== undefined && postData.id) {
          // This is an update to an existing post (like a deletion)
          setPosts(prevPosts => 
            prevPosts.map(post => 
              post.id === postData.id 
                ? { ...post, ...postData }
                : post
            )
          );
        } else if (postData.content && postData.author) {
          // This is a new post
          setPosts(prevPosts => [...prevPosts, postData]);
        }
      });

      return () => {
        socket.off('post_update');
      };
    }
  }, [socket]);
  
  // Auto-scroll to the bottom when new posts are added
  useEffect(() => {
    scrollToBottom();
  }, [posts]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postsService.getPosts();
      // Reverse the order to show oldest messages first
      setPosts(response.data.reverse());
      setError('');
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setError('Failed to load messages. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  const handleDeletePost = async (postId) => {
    try {
      await postsService.deletePost(postId);
      fetchPosts();
    } catch (err) {
      console.error("Failed to delete post:", err);
      setError("Failed to delete post. Please try again.");
    }
  };
  const handleSendMessage = async (values) => {
    if (!values.content.trim()) return;
    
    try {
      setSending(true);
      await postsService.createPost(values);
      // No need to fetch posts again as we'll receive the update via WebSocket
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



  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Convert posts to message format for ChatInterface
  const postsAsMessages = posts.map(post => ({
    id: post.id,
    content: post.is_deleted 
      ? (post.deletion_type === 'admin' ? "This message was deleted by an admin" : "This message was deleted")
      : post.content,
    created_at: post.created_at,
    is_read: true, // Posts don't have read status
    sender: {
      id: post.author.id,
      username: post.author.is_banned ? 'Deleted User' : post.author.username,
      is_admin: post.author.is_admin
    },
    recipient: {
      id: 0, // Public posts don't have a specific recipient
      username: 'Everyone'
    },
    is_deleted: post.is_deleted
  }));



  return (
    <Container fluid p={0} style={{ display: 'flex', flexDirection: 'column', maxWidth: '1200px', height: 'calc(100vh - 120px)' }}>
      <Flex justify="space-between" align="center" mb="xs">
        <Title order={3}>Neighborhood Chat</Title>
        <Group>
          {!connected && (
            <Badge color="yellow" variant="light">Offline</Badge>
          )}
          <ActionIcon 
            variant="light" 
            color="blue" 
            onClick={fetchPosts} 
            disabled={loading}
            title="Refresh messages"
          >
            <IconRefresh size={18} />
          </ActionIcon>
        </Group>
      </Flex>

      {error && (
        <Alert color="red" mb="md">
          {error}
        </Alert>
      )}

      <ChatInterface
        messages={postsAsMessages}
        currentUser={currentUser}
        onSendMessage={handleSendMessage}
        formatDate={formatDate}
        loading={loading}
        sending={sending}
        placeholder="Type a message..."
        messagesEndRef={messagesEndRef}
        showReadReceipts={false}
        handleDelete={handleDeletePost}
      />
    </Container>
  );
}
