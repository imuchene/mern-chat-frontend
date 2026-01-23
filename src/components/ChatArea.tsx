import {
  Box,
  VStack,
  Text,
  Input,
  Button,
  Flex,
  Icon,
  Avatar,
  InputGroup,
  InputRightElement,
  useToast,
} from '@chakra-ui/react';
import { FiSend, FiInfo, FiMessageCircle } from 'react-icons/fi';
import UsersList from './UsersList';
import { useEffect, useRef, useState } from 'react';
import { LocalStorageEnum } from '../enums/local-storage.enum';
import { API_URL } from '../constants/urls';
import { SocketEvents } from '../enums/socket-events.enum';

const ChatArea = ({ selectedGroup, socket }: any) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [connectedUsers, setConnectedUsers] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const toast = useToast();

  const currentUser = JSON.parse(
    localStorage.getItem(LocalStorageEnum.UserInfo) || '{}',
  );

  useEffect(() => {
    if (selectedGroup && socket) {
      // fetch messages
      fetchMessages();
      socket.emit(SocketEvents.JoinRoom, selectedGroup._id);
      socket.on(SocketEvents.MessageReceived, (newMessage: string) => {
        setMessages((prev) => [...prev, newMessage]);
      });

      socket.on(SocketEvents.UsersInRoom, (users: any) => {
        setConnectedUsers(users);
      });

      socket.on(SocketEvents.UserJoined, (user: any) => {
        setConnectedUsers((prev) => [...prev, user]);
      });

      socket.on(SocketEvents.UserLeft, (userId: string) => {
        setConnectedUsers((prev) => prev.filter((user) => user._id !== userId));
      });

      socket.on(SocketEvents.Notification, (notification: any) => {
        toast({
          title:
            notification.type === SocketEvents.UserJoined
              ? SocketEvents.NewUser
              : SocketEvents.Notification,
          description: notification.message,
          status: 'info',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
        });
      });

      socket.on(SocketEvents.UserTyping, ({ username }: any) => {
        setTypingUsers((prev) => new Set(prev).add(username));
      });

      socket.on(SocketEvents.UserStopTyping, ({ username }: any) => {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(username);
          return newSet;
        });
      });

      // clean up
      return () => {
        socket.emit(SocketEvents.LeaveRoom, selectedGroup._id);
        socket.off(SocketEvents.MessageReceived);
        socket.off(SocketEvents.UsersInRoom);
        socket.off(SocketEvents.UserJoined);
        socket.off(SocketEvents.UserLeft);
        socket.off(SocketEvents.Notification);
        socket.off(SocketEvents.UserTyping);
        socket.off(SocketEvents.UserStopTyping);
      };
    }
  }, [selectedGroup, socket, toast]);

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const url = `${API_URL}/api/messages/${selectedGroup?._id}`;
      const request = new Request(url, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await fetch(request);

      const groupMessages = await response.json();
    } catch (error) {
      console.log('error', error);
    }
  };

  // Sample data for demonstration
  const sampleMessages = [
    {
      id: 1,
      content: 'Hey team! Just pushed the new updates to staging.',
      sender: { username: 'Sarah Chen' },
      createdAt: '10:30 AM',
      isCurrentUser: false,
    },
    {
      id: 2,
      content: 'Great work! The new features look amazing 🚀',
      sender: { username: 'Alex Thompson' },
      createdAt: '10:31 AM',
      isCurrentUser: false,
    },
    {
      id: 3,
      content: "Thanks! Let's review it in our next standup.",
      sender: { username: 'You' },
      createdAt: '10:32 AM',
      isCurrentUser: true,
    },
  ];

  return (
    <Flex h="100%" position="relative">
      <Box
        flex="1"
        display="flex"
        flexDirection="column"
        bg="gray.50"
        maxW={`calc(100% - 260px)`}
      >
        {/* Chat Header */}
        <Flex
          px={6}
          py={4}
          bg="white"
          borderBottom="1px solid"
          borderColor="gray.200"
          align="center"
          boxShadow="sm"
        >
          <Icon as={FiMessageCircle} fontSize="24px" color="blue.500" mr={3} />
          <Box flex="1">
            <Text fontSize="lg" fontWeight="bold" color="gray.800">
              Team Chat
            </Text>
            <Text fontSize="sm" color="gray.500">
              General Discussion
            </Text>
          </Box>
          <Icon
            as={FiInfo}
            fontSize="20px"
            color="gray.400"
            cursor="pointer"
            _hover={{ color: 'blue.500' }}
          />
        </Flex>

        {/* Messages Area */}
        <VStack
          flex="1"
          overflowY="auto"
          spacing={4}
          align="stretch"
          px={6}
          py={4}
          position="relative"
          sx={{
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              width: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'gray.200',
              borderRadius: '24px',
            },
          }}
        >
          {sampleMessages.map((message) => (
            <Box
              key={message.id}
              alignSelf={message.isCurrentUser ? 'flex-start' : 'flex-end'}
              maxW="70%"
            >
              <Flex direction="column" gap={1}>
                <Flex
                  align="center"
                  mb={1}
                  justifyContent={
                    message.isCurrentUser ? 'flex-start' : 'flex-end'
                  }
                  gap={2}
                >
                  {message.isCurrentUser ? (
                    <>
                      <Avatar size="xs" name={message.sender.username} />
                      <Text fontSize="xs" color="gray.500">
                        You • {message.createdAt}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text fontSize="xs" color="gray.500">
                        {message.sender.username} • {message.createdAt}
                      </Text>
                      <Avatar size="xs" name={message.sender.username} />
                    </>
                  )}
                </Flex>

                <Box
                  bg={message.isCurrentUser ? 'blue.500' : 'white'}
                  color={message.isCurrentUser ? 'white' : 'gray.800'}
                  p={3}
                  borderRadius="lg"
                  boxShadow="sm"
                >
                  <Text>{message.content}</Text>
                </Box>
              </Flex>
            </Box>
          ))}
        </VStack>

        {/* Message Input */}
        <Box
          p={4}
          bg="white"
          borderTop="1px solid"
          borderColor="gray.200"
          position="relative"
          zIndex="1"
        >
          <InputGroup size="lg">
            <Input
              placeholder="Type your message..."
              pr="4.5rem"
              bg="gray.50"
              border="none"
              _focus={{
                boxShadow: 'none',
                bg: 'gray.100',
              }}
            />
            <InputRightElement width="4.5rem">
              <Button
                h="1.75rem"
                size="sm"
                colorScheme="blue"
                borderRadius="full"
                _hover={{
                  transform: 'translateY(-1px)',
                }}
                transition="all 0.2s"
              >
                <Icon as={FiSend} />
              </Button>
            </InputRightElement>
          </InputGroup>
        </Box>
      </Box>

      {/* UsersList with fixed width */}
      <Box
        width="260px"
        position="sticky"
        right={0}
        top={0}
        height="100%"
        flexShrink={0}
      >
        {selectedGroup && <UsersList users={connectedUsers} />}
      </Box>
    </Flex>
  );
};

export default ChatArea;
