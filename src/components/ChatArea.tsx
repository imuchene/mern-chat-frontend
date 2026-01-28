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
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { LocalStorageEnum } from '../enums/local-storage.enum';
import { API_URL } from '../constants/urls';
import { SocketEvents } from '../enums/socket-events.enum';

const ChatArea = ({ selectedGroup, socket }: any) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [connectedUsers, setConnectedUsers] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
      setMessages(groupMessages);
    } catch (error) {
      console.log('error', error);
    }
  };

  // send message
  const sendMessage = async () => {
    if (!newMessage.trim()) {
      return;
    }

    try {
      const url = `${API_URL}/api/messages`;
      const request = new Request(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedGroup._id,
          content: newMessage,
        }),
      });

      const response = await fetch(request);

      const data = await response.json();
      socket.emit(SocketEvents.NewMessage, {
        ...data,
        groupId: selectedGroup._id,
      });
      setMessages([...messages, data]);
      setNewMessage('');
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: 'Error sending message',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  // handle typing
  const handleTyping = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setNewMessage(target.value);
    if (!isTyping && selectedGroup) {
      setIsTyping(true);
      socket.emit(SocketEvents.Typing, {
        groupId: selectedGroup._id,
        username: currentUser.username,
      });
    }
    // clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (selectedGroup) {
        socket.emit(SocketEvents.StopTyping, {
          groupId: selectedGroup._id,
        });
      }
      setIsTyping(false);
    }, 2000);
  };

  // format time
  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // render typing indicator
  const renderTypingIndicator = () => {
    if (typingUsers.size === 0) return null;
    const typingUsersArray = Array.from(typingUsers);

    return typingUsersArray.map((username: any) => (
      <Box
        key={username}
        alignSelf={
          username === currentUser.username ? 'flex-start' : 'flex-end'
        }
        maxW="70%"
      >
        <Flex
          align="center"
          bg={username === currentUser.username ? 'blue.50' : 'gray.50'}
          p={2}
          borderRadius="lg"
          gap={2}
        >
          {/* current user (You) - left side */}
          {username === currentUser.username ? (
            <>
              <Avatar size="xs" name={username} />
              <Flex align="center" gap={1}>
                <Text fontSize="sm" color="gray.500" fontStyle="italic">
                  You are typing
                </Text>
                <Flex gap={1}>
                  {[1, 2, 3].map((dot) => (
                    <Box
                      key={dot}
                      w="3px"
                      h="3px"
                      borderRadius="full"
                      bg="gray.500"
                    />
                  ))}
                </Flex>
              </Flex>
            </>
          ) : (
            <>
              <Flex align="center" gap={1}>
                <Text fontSize="sm" color="gray.500" fontStyle="italic">
                  {username} is typing
                </Text>
                <Flex gap={1}>
                  {[1, 2, 3].map((dot) => (
                    <Box
                      key={dot}
                      w="3px"
                      h="3px"
                      borderRadius="full"
                      bg="gray.500"
                    />
                  ))}
                </Flex>
              </Flex>
              <Avatar size="xs" name={username} />
            </>
          )}
        </Flex>
      </Box>
    ));
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
          {messages.map((message) => (
            <Box
              key={message._id}
              alignSelf={
                message.sender._id === currentUser._id
                  ? 'flex-start'
                  : 'flex-end'
              }
              maxW="70%"
            >
              <Flex direction="column" gap={1}>
                <Flex
                  align="center"
                  mb={1}
                  justifyContent={
                    message.sender._id === currentUser._id
                      ? 'flex-start'
                      : 'flex-end'
                  }
                  gap={2}
                >
                  {message.sender._id === currentUser._id ? (
                    <>
                      <Avatar size="xs" name={message.sender.username} />
                      <Text fontSize="xs" color="gray.500">
                        You • {formatTime(message.createdAt)}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text fontSize="xs" color="gray.500">
                        {message.sender.username} •{' '}
                        {formatTime(message.createdAt)}
                      </Text>
                      <Avatar size="xs" name={message.sender.username} />
                    </>
                  )}
                </Flex>

                <Box
                  bg={
                    message.sender._id === currentUser?._id
                      ? 'blue.500'
                      : 'white'
                  }
                  color={
                    message.sender._id === currentUser?._id
                      ? 'white'
                      : 'gray.800'
                  }
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
        {renderTypingIndicator()}
        <div ref={messagesEndRef} />
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
              value={newMessage}
              onChange={handleTyping}
              placeholder="Type your message..."
              pr="4.5rem"
              bg="gray.50"
              border="none"
              _focus={{
                boxShadow: 'none',
                bg: 'gray.100',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  sendMessage();
                }
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
