import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextInput, PasswordInput, Button, Paper, Title, Text, Stack, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const form = useForm({
    initialValues: {
      username: '',
      password: '',
      full_name: '',
      building_number: '',
      apartment_number: '',
    },
    validate: {
      username: (value) => (value ? null : 'Username is required'),
      password: (value) => (value.length >= 6 ? null : 'Password must be at least 6 characters'),
      full_name: (value) => (value ? null : 'Full name is required'),
      building_number: (value) => (value ? null : 'Building number is required'),
      apartment_number: (value) => (value ? null : 'Apartment number is required'),
    },
  });

  const handleSubmit = async (values) => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      
      const response = await register(values);
      setSuccess(response.message);
      
      // Clear form
      form.reset();
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper shadow="md" p="xl" radius="md" mx="auto" mt="xl" maw={500}>
      <Title order={2} ta="center" mb="md">
        Register for Neighborhood Forum
      </Title>

      {error && (
        <Alert color="red" mb="md">
          {error}
        </Alert>
      )}

      {success && (
        <Alert color="green" mb="md">
          {success} Redirecting to login...
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Username"
            placeholder="Choose a username"
            required
            {...form.getInputProps('username')}
          />

          <PasswordInput
            label="Password"
            placeholder="Choose a password"
            required
            {...form.getInputProps('password')}
          />

          <TextInput
            label="Full Name"
            placeholder="Your full name"
            required
            {...form.getInputProps('full_name')}
          />

          <TextInput
            label="Building Number"
            placeholder="Your building number"
            required
            {...form.getInputProps('building_number')}
          />

          <TextInput
            label="Apartment Number"
            placeholder="Your apartment number"
            required
            {...form.getInputProps('apartment_number')}
          />

          <Text size="sm" c="dimmed">
            Note: Your account will need to be approved by an admin before you can access the forum.
          </Text>

          <Button type="submit" loading={loading}>
            Register
          </Button>

          <Text ta="center" size="sm">
            Already have an account?{' '}
            <Link to="/login" style={{ textDecoration: 'none' }}>
              Login
            </Link>
          </Text>
        </Stack>
      </form>
    </Paper>
  );
}
