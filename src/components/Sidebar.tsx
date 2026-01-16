import {
  Box,
  VStack,
  Text,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Flex,
  Icon,
  Badge,
  Tooltip,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FiLogOut, FiPlus, FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { LocalStorageEnum } from '../enums/local-storage.enum';
import { API_URL } from '../constants/urls';
import { Group } from '../interfaces/group.interface';
import { User } from '../interfaces/user.interface';

const Sidebar = ({ setSelectedGroup }: any) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newGroupName, setNewGroupName] = useState('');
  const [groups, setGroups] = useState(Array<Group>);
  const [userGroups, setUserGroups] = useState(Array<string>);
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [isAdmin, setIsAdmin] = useState(true);
  const toast = useToast();

  useEffect(() => {
    checkAdminStatus();
    fetchGroups();
  }, []);

  const userInfo: any =
    JSON.parse(String(localStorage.getItem(LocalStorageEnum.UserInfo))) || {};

  // Check if logged in user is an admin
  const checkAdminStatus = () => {
    setIsAdmin(userInfo?.user.isAdmin || false);
  };
  // Fetch all groups
  const fetchGroups = async () => {
    try {
      const url = `${API_URL}/api/groups`;
      const request = new Request(url, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await fetch(request);

      const groups: Group[] = await response.json();
      setGroups(groups);

      // get user groups
      let userGroupIds: string[] = [];

      groups.forEach((group: Group) => {
        group.members.forEach((member: User) => {
          if (member._id === userInfo.user._id) {
            userGroupIds.push(group._id);
          }
        });
      });

      setUserGroups(userGroupIds);

      // Throw an error if the request isn't successful
      if (response.status !== 200) {
        throw new Error();
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: 'Error',
          description: error.message || 'An error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  // Create groups
  const handleCreateGroup = async () => {
    try {
      const url = `${API_URL}/api/groups`;
      const request = new Request(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroupName,
          description: newGroupDescription,
        }),
      });

      const response = await fetch(request);

      // Throw an error if the request isn't successful
      if (response.status !== 201) {
        throw new Error();
      }

      toast({
        title: 'Group Created',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onClose();
      fetchGroups();
      setNewGroupName('');
      setNewGroupDescription('');
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: 'Error Creating Group',
          description: error.message || 'An error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };
  // Logout
  // Join group
  // Leave group

  return (
    <Box
      h="100%"
      bg="white"
      borderRight="1px"
      borderColor="gray.200"
      width="300px"
      display="flex"
      flexDirection="column"
    >
      <Flex
        p={4}
        borderBottom="1px solid"
        borderColor="gray.200"
        bg="white"
        position="sticky"
        top={0}
        zIndex={1}
        backdropFilter="blur(8px)"
        align="center"
        justify="space-between"
      >
        <Flex align="center">
          <Icon as={FiUsers} fontSize="24px" color="blue.500" mr={2} />
          <Text fontSize="xl" fontWeight="bold" color="gray.800">
            Groups
          </Text>
        </Flex>
        {isAdmin && (
          <Tooltip label="Create New Group" placement="right">
            <Button
              size="sm"
              colorScheme="blue"
              variant="ghost"
              onClick={onOpen}
              borderRadius="full"
            >
              <Icon as={FiPlus} fontSize="20px" />
            </Button>
          </Tooltip>
        )}
      </Flex>

      <Box flex="1" overflowY="auto" p={4} mb={16}>
        <VStack spacing={3} align="stretch">
          {groups.map((group) => (
            <Box
              key={group._id}
              p={4}
              cursor="pointer"
              borderRadius="lg"
              bg={userGroups.includes(group?._id) ? 'blue.50' : 'gray.50'}
              borderWidth="1px"
              borderColor={
                userGroups.includes(group?._id) ? 'blue.200' : 'gray.200'
              }
              transition="all 0.2s"
              _hover={{
                transform: 'translateY(-2px)',
                shadow: 'md',
                borderColor: 'blue.300',
              }}
            >
              <Flex justify="space-between" align="center">
                <Box
                  onClick={() =>
                    userGroups.includes(group?._id) && setSelectedGroup(group)
                  }
                  flex="1"
                >
                  <Flex align="center" mb={2}>
                    <Text fontWeight="bold" color="gray.800">
                      {group.name}
                    </Text>
                    {userGroups.includes(group?._id) && (
                      <Badge ml={2} colorScheme="blue" variant="subtle">
                        Joined
                      </Badge>
                    )}
                  </Flex>
                  <Text fontSize="sm" color="gray.600" noOfLines={2}>
                    {group.description}
                  </Text>
                </Box>
                <Button
                  size="sm"
                  colorScheme={group.isJoined ? 'red' : 'blue'}
                  variant={group.isJoined ? 'ghost' : 'solid'}
                  ml={3}
                  _hover={{
                    transform: group.isJoined ? 'scale(1.05)' : 'none',
                    bg: group.isJoined ? 'red.50' : 'blue.600',
                  }}
                  transition="all 0.2s"
                >
                  {userGroups.includes(group?._id) ? (
                    <Text fontSize="sm" fontWeight="medium">
                      Leave
                    </Text>
                  ) : (
                    'Join'
                  )}
                </Button>
              </Flex>
            </Box>
          ))}
        </VStack>
      </Box>

      <Box
        p={4}
        borderTop="1px solid"
        borderColor="gray.200"
        bg="gray.50"
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        width="100%"
      >
        <Button
          as={Link}
          to="/login"
          width="full"
          variant="ghost"
          colorScheme="red"
          leftIcon={<Icon as={FiLogOut} />}
          _hover={{
            bg: 'red.50',
            transform: 'translateY(-2px)',
            shadow: 'md',
          }}
          transition="all 0.2s"
        >
          Logout
        </Button>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader>Create New Group</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Group Name</FormLabel>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
                focusBorderColor="blue.400"
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Description</FormLabel>
              <Input
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="Enter group description"
                focusBorderColor="blue.400"
              />
            </FormControl>

            <Button
              colorScheme="blue"
              mr={3}
              mt={4}
              width="full"
              onClick={handleCreateGroup}
            >
              Create Group
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Sidebar;
