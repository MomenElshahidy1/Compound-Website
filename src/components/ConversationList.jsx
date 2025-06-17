import React from 'react';
import { 
  ScrollArea, Stack, Paper, Group, Avatar, 
  Text, Badge, Flex, Loader
} from '@mantine/core';

/**
 * A reusable conversation list component
 * @param {Object} props
 * @param {Array} props.conversations - Array of conversation objects
 * @param {Function} props.onSelectConversation - Function to handle selecting a conversation
 * @param {Function} props.formatDate - Function to format date strings
 * @param {Boolean} props.loading - Whether conversations are loading
 */
export default function ConversationList({ 
  conversations = [], 
  onSelectConversation, 
  formatDate,
  loading = false
}) {
  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ flex: 1 }}>
        <Loader size="sm" />
        <Text ml="md">Loading conversations...</Text>
      </Flex>
    );
  }

  if (conversations.length === 0) {
    return (
      <Flex justify="center" align="center" style={{ flex: 1 }}>
        <Text c="dimmed">No conversations yet.</Text>
      </Flex>
    );
  }

  return (
    <ScrollArea style={{ flex: 1 }} offsetScrollbars>
      <Stack spacing="md" p={0}>
        {conversations.map((conversation) => (
          <Paper 
            key={conversation.userId} 
            p="md" 
            withBorder 
            radius="md"
            sx={theme => ({
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
              }
            })}
            onClick={() => onSelectConversation(conversation.userId)}
          >
            <Group position="apart">
              <Group>
                <Avatar radius="xl" color="blue">
                  {conversation.username.charAt(0).toUpperCase()}
                </Avatar>
                <div>
                  <Group spacing="xs">
                    <Text weight={500}>{conversation.username}</Text>
                    {conversation.unreadCount > 0 && (
                      <Badge color="red" size="sm" variant="filled" radius="xl" p={5}>
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </Group>
                  {conversation.lastMessage && (
                    <Text size="xs" color="dimmed" lineClamp={1} style={{ maxWidth: '300px' }}>
                      {conversation.lastMessage.content}
                    </Text>
                  )}
                </div>
              </Group>
              {conversation.lastMessage && (
                <Text size="xs" c="dimmed">
                  {formatDate(conversation.lastMessage.created_at)}
                </Text>
              )}
            </Group>
          </Paper>
        ))}
      </Stack>
    </ScrollArea>
  );
}
