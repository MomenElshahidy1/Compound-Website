import React from 'react';
import { 
  ScrollArea, Stack, Paper, Group, Avatar, 
  Text, Badge, Flex, Loader, TextInput
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

/**
 * A reusable user list component with search functionality
 * @param {Object} props
 * @param {Array} props.users - Array of user objects
 * @param {Function} props.onSelectUser - Function to handle selecting a user
 * @param {String} props.searchQuery - Current search query
 * @param {Function} props.onSearchChange - Function to handle search query changes
 * @param {Boolean} props.loading - Whether users are loading
 * @param {Object} props.conversations - Conversations data for unread indicators
 */
export default function UserList({ 
  users = [], 
  onSelectUser, 
  searchQuery = '',
  onSearchChange,
  loading = false,
  conversations = {}
}) {
  return (
    <Stack spacing="md" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TextInput
        placeholder="Search by name, username, building or apartment number"
        icon={<IconSearch size={14} />}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.currentTarget.value)}
        mb="md"
      />
      
      {loading ? (
        <Flex justify="center" align="center" style={{ flex: 1 }}>
          <Loader size="sm" />
          <Text ml="md">Loading users...</Text>
        </Flex>
      ) : users.length > 0 ? (
        <ScrollArea style={{ flex: 1 }} offsetScrollbars>
          <Stack spacing="sm">
            {users.map(user => {
              // Find if there are any conversations with this user
              const conversation = Object.values(conversations).find(c => c.userId === user.id);
              const hasUnread = conversation && conversation.unreadCount > 0;
              
              return (
                <Paper 
                  key={user.id} 
                  p="sm" 
                  withBorder 
                  radius="md"
                  sx={theme => ({
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
                    }
                  })}
                  onClick={() => onSelectUser(user.id)}
                >
                  <Group position="apart">
                    <Group>
                      <Avatar radius="xl" color="blue">
                        {user.username.charAt(0).toUpperCase()}
                      </Avatar>
                      <div>
                        <Group spacing="xs">
                          <Text weight={500}>{user.full_name}</Text>
                          {hasUnread && (
                            <Badge color="red" size="sm" variant="filled" radius="xl" p={5}>
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </Group>
                        <Text size="xs" color="dimmed">@{user.username}</Text>
                      </div>
                    </Group>
                    <Badge>
                      Building {user.building_number}, Apt {user.apartment_number}
                    </Badge>
                  </Group>
                </Paper>
              );
            })}
          </Stack>
        </ScrollArea>
      ) : (
        <Flex justify="center" align="center" style={{ flex: 1 }}>
          <Text c="dimmed">No users found matching your search criteria.</Text>
        </Flex>
      )}
    </Stack>
  );
}
