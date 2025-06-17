import { useState, useEffect } from 'react';
import { Card, Text, Button, Stack, Group, Title, Alert, Table, Badge } from '@mantine/core';
import { adminService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { useNavigate } from 'react-router-dom';

export default function PendingApprovals() {
  const [pendingUsers, setPendingUsers] = useState([]);
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
    
    fetchPendingUsers();
  }, [currentUser, navigate]);
  
  useEffect(() => {
    if (socket && currentUser?.is_admin) {
      // Listen for user registration events
      socket.on('user_registered', (userData) => {
        setPendingUsers(prevUsers => [...prevUsers, userData]);
      });
      
      // Listen for user approval/rejection events
      socket.on('user_status_changed', (data) => {
        const { user_id, status } = data;
        if (status === 'approved' || status === 'rejected') {
          setPendingUsers(prevUsers => 
            prevUsers.filter(user => user.id !== user_id)
          );
        }
      });
      
      return () => {
        socket.off('user_registered');
        socket.off('user_status_changed');
      };
    }
  }, [socket, currentUser]);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPendingUsers();
      setPendingUsers(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch pending users:', err);
      setError('Failed to load pending users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      await adminService.approveUser(userId);
      fetchPendingUsers();
    } catch (err) {
      console.error('Failed to approve user:', err);
      setError('Failed to approve user. Please try again.');
    }
  };

  const handleRejectUser = async (userId) => {
    try {
      await adminService.rejectUser(userId);
      fetchPendingUsers();
    } catch (err) {
      console.error('Failed to reject user:', err);
      setError('Failed to reject user. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Stack spacing="lg">
      <Title order={2}>Pending User Approvals</Title>

      {error && (
        <Alert color="red" mb="md">
          {error}
        </Alert>
      )}

      {loading ? (
        <Text>Loading pending users...</Text>
      ) : pendingUsers.length === 0 ? (
        <Text ta="center">No pending users to approve.</Text>
      ) : (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Username</Table.Th>
              <Table.Th>Full Name</Table.Th>
              <Table.Th>Building</Table.Th>
              <Table.Th>Apartment</Table.Th>
              <Table.Th>Registered</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {pendingUsers.map((user) => (
              <Table.Tr key={user.id}>
                <Table.Td>{user.username}</Table.Td>
                <Table.Td>{user.full_name}</Table.Td>
                <Table.Td>{user.building_number}</Table.Td>
                <Table.Td>{user.apartment_number}</Table.Td>
                <Table.Td>{formatDate(user.created_at)}</Table.Td>
                <Table.Td>
                  <Group>
                    <Button
                      size="xs"
                      color="green"
                      onClick={() => handleApproveUser(user.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="xs"
                      color="red"
                      onClick={() => handleRejectUser(user.id)}
                    >
                      Reject
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Stack>
  );
}
