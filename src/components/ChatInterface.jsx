import React, { useRef } from 'react';
import { 
  Paper, ScrollArea, Stack, Group, Textarea, ActionIcon, 
  Text, Flex, Loader
} from '@mantine/core';
import { IconSend } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import ChatMessage from './ChatMessage';

/**
 * A reusable chat interface component
 * @param {Object} props
 * @param {Array} props.messages - Array of message objects
 * @param {Object} props.currentUser - The current user object
 * @param {Function} props.onSendMessage - Function to handle sending messages
 * @param {Function} props.formatDate - Function to format date strings
 * @param {Boolean} props.loading - Whether messages are loading
 * @param {Boolean} props.sending - Whether a message is being sent
 * @param {String} props.placeholder - Placeholder text for the message input
 * @param {React.RefObject} props.messagesEndRef - Ref for auto-scrolling
 * @param {Boolean} props.showReadReceipts - Whether to show read receipts
 */
export default function ChatInterface({ 
  messages = [], 
  currentUser, 
  onSendMessage, 
  formatDate, 
  loading = false, 
  sending = false,
  placeholder = "Type a message...",
  messagesEndRef,
  showReadReceipts = true,
  handleDelete
}) {
  const textareaRef = useRef(null);
  
  const form = useForm({
    initialValues: {
      content: '',
    },
    validate: {
      content: (value) => (value ? null : 'Message content is required'),
    },
  });

  const handleSubmit = (values) => {
    if (!values.content.trim()) return;
    
    onSendMessage(values);
    form.reset();
    // Focus back on the textarea after sending
    textareaRef.current?.focus();
  };

  return (
    <Paper shadow="sm" radius="md" p={0} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Messages area */}
      <ScrollArea style={{ flex: 1 }} offsetScrollbars>
        {loading ? (
          <Flex justify="center" align="center" style={{ height: '100%' }}>
            <Loader size="md" />
            <Text ml="md">Loading messages...</Text>
          </Flex>
        ) : messages.length === 0 ? (
          <Flex justify="center" align="center" style={{ height: '100%' }}>
            <Text c="dimmed">No messages yet. Start a conversation!</Text>
          </Flex>
        ) : (
          <Stack spacing="md" p="md">
            {messages
              .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
              .map((message) => (
                <ChatMessage 
                  key={message.id}
                  message={message}
                  currentUser={currentUser}
                  formatDate={formatDate}
                  showReadReceipt={showReadReceipts}
                  handleDelete={handleDelete}
                />
              ))}
            <div ref={messagesEndRef} />
          </Stack>
        )}
      </ScrollArea>
      
      {/* Message input area */}
      <Paper 
        shadow="xs" 
        p="xs" 
        style={{ 
          borderTop: '1px solid #e0e0e0',
          backgroundColor: 'white',
          zIndex: 10
        }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Group align="flex-end" spacing="xs">
            <Textarea
              placeholder={placeholder}
              autosize
              minRows={1}
              maxRows={4}
              style={{ flex: 1 }}
              ref={textareaRef}
              disabled={sending}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  form.onSubmit(handleSubmit)();
                }
              }}
              {...form.getInputProps('content')}
            />
            <ActionIcon 
              color="blue" 
              variant="filled" 
              size="lg" 
              radius="xl"
              type="submit"
              loading={sending}
              disabled={!form.values.content.trim()}
            >
              <IconSend size={18} />
            </ActionIcon>
          </Group>
        </form>
      </Paper>
    </Paper>
  );
}
