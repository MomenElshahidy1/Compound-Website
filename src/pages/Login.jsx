import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextInput, PasswordInput, Button, Paper, Title, Text, Stack, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },
    validate: {
      username: (value) => (value ? null : 'Username is required'),
      password: (value) => (value ? null : 'Password is required'),
    },
  });

  const handleSubmit = async (values) => {
    try {
      setError('');
      setLoading(true);
      await login(values);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper shadow="md" p="xl" radius="md" mx="auto" mt="xl" maw={400}>
      <Title order={2} ta="center" mb="md">
        Login to MOSTAQBAL City
      </Title>

      {error && (
        <Alert color="red" mb="md">
          {error}
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Username"
            placeholder="Your username"
            required
            {...form.getInputProps('username')}
          />

          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            {...form.getInputProps('password')}
          />

          <Button type="submit" loading={loading}>
            Login
          </Button>

          <Text ta="center" size="sm">
            Don't have an account?{' '}
            <Link to="/register" style={{ textDecoration: 'none' }}>
              Register
            </Link>
          </Text>
        </Stack>
      </form>
    </Paper>
  );
}
