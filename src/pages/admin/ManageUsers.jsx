import { useState, useEffect } from 'react';
import { Card, Text, Button, Stack, Group, Title, Alert, Table, Badge } from '@mantine/core';
import { adminService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { useNavigate } from 'react-router-dom';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const { socket, connected } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    // Only admin can access this page
    if (!currentUser?.is_admin) {
      navigate('/');
      return;
    }
    
    fetchUsers();
  }, [currentUser, navigate]);
  
  useEffect(() => {
    if (socket && currentUser?.is_admin) {
      // Listen for user registration events
      socket.on('user_registered', (userData) => {
        setUsers(prevUsers => [...prevUsers, userData]);
      });
      
      // Listen for user status changes
      socket.on('user_status_changed', (data) => {
        const { user_id, status } = data;
        setUsers(prevUsers => {
          // If user was rejected (deleted), remove them from the list
          if (status === 'rejected') {
            return prevUsers.filter(user => user.id !== user_id);
          }
          
          // Otherwise update their status
          return prevUsers.map(user => {
            if (user.id === user_id) {
              switch(status) {
                case 'approved':
                  return { ...user, is_approved: true };
                case 'banned':
                  return { ...user, is_banned: true };
                case 'unbanned':
                  return { ...user, is_banned: false };
                default:
                  return user;
              }
            }
            return user;
          });
        });
      });
      
      return () => {
        socket.off('user_registered');
        socket.off('user_status_changed');
      };
    }
  }, [socket, currentUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllUsers();
      setUsers(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId) => {
    try {
      await adminService.banUser(userId);
      // No need to fetch users again as we'll receive the update via WebSocket
    } catch (err) {
      console.error('Failed to ban user:', err);
      setError('Failed to ban user. Please try again.');
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await adminService.unbanUser(userId);
      // No need to fetch users again as we'll receive the update via WebSocket
    } catch (err) {
      console.error('Failed to unban user:', err);
      setError('Failed to unban user. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Stack spacing="lg">
      <Title order={2}>Manage Users</Title>

      {error && (
        <Alert color="red" mb="md">
          {error}
        </Alert>
      )}

      {!connected && (
        <Alert color="yellow" mb="md">
          Not connected to real-time updates. User status changes may be delayed.
        </Alert>
      )}
      
      {loading ? (
        <Text>Loading users...</Text>
      ) : users.length === 0 ? (
        <Text ta="center">No users found.</Text>
      ) : (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Username</Table.Th>
              <Table.Th>Full Name</Table.Th>
              <Table.Th>Building</Table.Th>
              <Table.Th>Apartment</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Registered</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.map((user) => (
              <Table.Tr key={user.id}>
                <Table.Td>{user.username}</Table.Td>
                <Table.Td>{user.full_name}</Table.Td>
                <Table.Td>{user.building_number}</Table.Td>
                <Table.Td>{user.apartment_number}</Table.Td>
                <Table.Td>
                  {user.is_admin ? (
                    <Badge color="blue">Admin</Badge>
                  ) : user.is_banned ? (
                    <Badge color="red">Banned</Badge>
                  ) : user.is_approved ? (
                    <Badge color="green">Approved</Badge>
                  ) : (
                    <Badge color="yellow">Pending</Badge>
                  )}
                </Table.Td>
                <Table.Td>{formatDate(user.created_at)}</Table.Td>
                <Table.Td>
                  {!user.is_admin && (
                    <Group>
                      {user.is_banned ? (
                        <Button
                          size="xs"
                          color="green"
                          onClick={() => handleUnbanUser(user.id)}
                        >
                          Unban
                        </Button>
                      ) : (
                        <Button
                          size="xs"
                          color="red"
                          onClick={() => handleBanUser(user.id)}
                        >
                          Ban
                        </Button>
                      )}
                    </Group>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Stack>
  );
}
