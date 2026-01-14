import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLogIn } from 'react-icons/fi';
import React, { useState } from 'react';
import { API_URL } from '../constants/urls';
import { LocalStorageEnum } from '../enums/local-storage.enum';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const toast = useToast();
  const navigate = useNavigate();

  // Handle submit (login)
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = `${API_URL}/api/users/login`;

      const request = new Request(url, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await fetch(request);

      const body = await response.json();

      // Throw an error if the request isn't successful
      if (response.status !== 200) {
        throw new Error();
      }

      localStorage.setItem(LocalStorageEnum.UserInfo, JSON.stringify(body));

      // Navigate to chat
      navigate('/chat');
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: 'Error',
          description: error.message || 'An error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
      }
    }
  };

  return (
    <Box
      w="100%"
      h="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(to-r, blue.600, purple.600)"
    >
      <Box
        display="flex"
        w={['95%', '90%', '80%', '75%']}
        maxW="1200px"
        h={['auto', 'auto', '600px']}
        borderRadius="2xl"
        overflow="hidden"
        boxShadow="2xl"
      >
        {/* Left Panel - Hidden on mobile */}
        <Box
          display={['none', 'none', 'flex']}
          w="50%"
          bgImage="url('https://images.unsplash.com/photo-1579548122080-c35fd6820ecb')"
          bgSize="cover"
          bgPosition="center"
          position="relative"
        >
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="blackAlpha.600"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            p={10}
            color="white"
          >
            <Text fontSize="4xl" fontWeight="bold" mb={4}>
              Welcome Back
            </Text>
            <Text fontSize="lg" maxW="400px">
              Stay connected with friends and family through instant messaging
            </Text>
          </Box>
        </Box>

        {/* Right Panel - Login Form */}
        <Box
          w={['100%', '100%', '50%']}
          bg="white"
          p={[6, 8, 10]}
          display="flex"
          flexDirection="column"
          justifyContent="center"
        >
          <Box display={['block', 'block', 'none']} textAlign="center" mb={6}>
            <Box
              as={FiLogIn}
              mx="auto"
              fontSize="3rem"
              color="blue.600"
              mb={2}
            />
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Welcome Back
            </Text>
          </Box>

          <VStack spacing={6} w="100%" maxW="400px" mx="auto">
            <FormControl id="email" isRequired>
              <FormLabel color="gray.700" fontWeight="medium">
                Email
              </FormLabel>
              <Input
                type="email"
                placeholder="Enter your email"
                size="lg"
                bg="gray.50"
                borderColor="gray.200"
                _hover={{ borderColor: 'blue.500' }}
                _focus={{ borderColor: 'blue.500' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>

            <FormControl id="password" isRequired>
              <FormLabel color="gray.700" fontWeight="medium">
                Password
              </FormLabel>
              <Input
                type="password"
                placeholder="Enter your password"
                size="lg"
                bg="gray.50"
                borderColor="gray.200"
                _hover={{ borderColor: 'blue.500' }}
                _focus={{ borderColor: 'blue.500' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>

            <Button
              onClick={handleSubmit}
              isLoading={loading}
              colorScheme="blue"
              width="100%"
              size="lg"
              fontSize="md"
              leftIcon={<FiLogIn />}
            >
              Sign In
            </Button>

            <Text color="gray.600">
              Don't have an account?{' '}
              <Link
                to="/register"
                style={{
                  color: 'var(--chakra-colors-blue-600)',
                  fontWeight: '500',
                }}
              >
                Register now
              </Link>
            </Text>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
