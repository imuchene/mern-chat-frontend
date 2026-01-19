import { Box, Flex } from '@chakra-ui/react';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import { useState } from 'react';

const Chat = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  return (
    <Flex h="100vh">
      <Box w="300px" borderRight="1px solid" borderColor="gray.200">
        <Sidebar setSelectedGroup={setSelectedGroup} />
      </Box>
      <Box flex="1">
        <ChatArea />
      </Box>
    </Flex>
  );
};

export default Chat;
