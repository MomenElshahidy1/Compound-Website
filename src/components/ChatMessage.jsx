import React from "react";
import { Text, Avatar, Group, Box, ActionIcon } from "@mantine/core";
import { postsService } from "../services/api";
import { IconTrash } from "@tabler/icons-react";

/**
 * A reusable chat message component
 * @param {Object} props
 * @param {Object} props.message - The message object
 * @param {Object} props.currentUser - The current user object
 * @param {Function} props.formatDate - Function to format date strings
 * @param {Boolean} props.showReadReceipt - Whether to show read receipts
 */
export default function ChatMessage({
  message,
  currentUser,
  formatDate,
  showReadReceipt = true,
  handleDelete
}) {
  const isFromCurrentUser = message.sender.id === currentUser.id;

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isFromCurrentUser ? "flex-end" : "flex-start",
        marginBottom: 8,
      }}
    >
      <Group spacing="xs" align="center" mb={4}>
        {!isFromCurrentUser && (
          <Avatar
            size="sm"
            radius="xl"
            color={message.sender.is_admin ? "blue" : "gray"}
          >
            {message.sender.username.charAt(0).toUpperCase()}
          </Avatar>
        )}

        {!isFromCurrentUser && (
          <Text size="xs" fw={500}>
            {message.sender.username}
          </Text>
        )}
      </Group>

      <Box
        style={{
          position: "relative",
          backgroundColor: isFromCurrentUser ? "#e3f2fd" : "#f5f5f5",
          padding: "8px 12px",
          borderRadius: isFromCurrentUser
            ? "12px 12px 0 12px"
            : "12px 12px 12px 0",
          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
          maxWidth: "70%",
        }}
      >
        {(isFromCurrentUser || currentUser.is_admin) && !message.is_deleted ? (
          <ActionIcon
            color="red"
            variant="subtle"
            size="xs"
            style={{
              position: "absolute",
              bottom: "2px",
              left: isFromCurrentUser ? "-1.5rem" : "auto",
              right: isFromCurrentUser ? "auto" : "-1.5rem",
              opacity: 0.7,
            }}
            onClick={() => handleDelete(message.id)}
          >
            <IconTrash size={14} />
          </ActionIcon>
        ) : (
          ""
        )}
        <Text
          size="sm"
          style={{ wordBreak: "break-word", whiteSpace: "pre-wrap"}}
          c={message.is_deleted?"dimmed":""}
        >
          {message.content}
        </Text>

        <Group position="apart" spacing="xs" mt={4}>
          <Text size="xs" c="dimmed">
            {formatDate(message.created_at)}
          </Text>
          {showReadReceipt && isFromCurrentUser && message.is_read && (
            <Text size="xs" c="dimmed">
              Read
            </Text>
          )}
        </Group>
      </Box>
    </Box>
  );
}
