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
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../constants/urls';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const toast = useToast();
  const navigate = useNavigate();

  // Handle submit (register)
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = `${API_URL}/api/users/register`;
      const request = new Request(url, {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await fetch(request);

      /// Throw an error if the request isn't successful
      if (response.status !== 201) {
        throw new Error();
      }

      // Navigate to login
      navigate('/login');
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
      bgGradient="linear(to-r, indigo.500, purple.500)"
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
          bgImage="url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe')"
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
              Join Our Chat Community
            </Text>
            <Text fontSize="lg" maxW="400px">
              Connect with friends and start chatting instantly
            </Text>
          </Box>
        </Box>

        {/* Right Panel - Registration Form */}
        <Box
          w={['100%', '100%', '50%']}
          bg="white"
          p={[6, 8, 10]}
          display="flex"
          flexDirection="column"
          justifyContent="center"
        >
          {/* Mobile Header - Shown only on mobile */}
          <Box display={['block', 'block', 'none']} textAlign="center" mb={6}>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Create Account
            </Text>
          </Box>

          <VStack spacing={5} w="100%" maxW="400px" mx="auto">
            <FormControl id="username" isRequired>
              <FormLabel color="gray.700" fontWeight="medium">
                Username
              </FormLabel>
              <Input
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setUsername((e.target as HTMLInputElement).value)
                }
                type="text"
                size="lg"
                bg="gray.50"
                borderColor="gray.200"
                _hover={{ borderColor: 'indigo.500' }}
                _focus={{ borderColor: 'indigo.500' }}
                placeholder="Choose a username"
              />
            </FormControl>

            <FormControl id="email" isRequired>
              <FormLabel color="gray.700" fontWeight="medium">
                Email
              </FormLabel>
              <Input
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail((e.target as HTMLInputElement).value)
                }
                type="email"
                size="lg"
                bg="gray.50"
                borderColor="gray.200"
                _hover={{ borderColor: 'indigo.500' }}
                _focus={{ borderColor: 'indigo.500' }}
                placeholder="Enter your email"
              />
            </FormControl>

            <FormControl id="password" isRequired>
              <FormLabel color="gray.700" fontWeight="medium">
                Password
              </FormLabel>
              <Input
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword((e.target as HTMLInputElement).value)
                }
                type="password"
                size="lg"
                bg="gray.50"
                borderColor="gray.200"
                _hover={{ borderColor: 'indigo.500' }}
                _focus={{ borderColor: 'indigo.500' }}
                placeholder="Create a password"
              />
            </FormControl>

            <Button
              onClick={handleSubmit}
              isLoading={loading}
              colorScheme="purple"
              width="100%"
              transform="auto"
              _hover={{ scale: 1.05 }}
              transition="transform 0.2s"
              size="lg"
              fontSize="md"
              mt={4}
            >
              Create Account
            </Button>

            <Text color="gray.600" pt={4}>
              Already have an account?{' '}
              <Link
                to="/login"
                style={{
                  color: 'var(--chakra-colors-indigo-600)',
                  fontWeight: '500',
                  transition: 'color 0.2s',
                }}
              >
                Sign in
              </Link>
            </Text>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};

export default Register;
