import { Box, Flex } from '@chakra-ui/react';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { LocalStorageEnum } from '../enums/local-storage.enum';
import { API_URL } from '../constants/urls';

const Chat = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [socket, setSocket] = useState<Socket>();

  useEffect(() => {
    const userInfo = JSON.parse(
      localStorage.getItem(LocalStorageEnum.UserInfo) || '{}',
    );
    const newSocket = io(API_URL, {
      auth: { user: userInfo.user },
    });
    setSocket(newSocket);
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  return (
    <Flex h="100vh">
      <Box w="300px" borderRight="1px solid" borderColor="gray.200">
        <Sidebar setSelectedGroup={setSelectedGroup} />
      </Box>
      <Box flex="1">
        {socket && <ChatArea selectedGroup={selectedGroup} socket={socket} />}
      </Box>
    </Flex>
  );
};

export default Chat;
