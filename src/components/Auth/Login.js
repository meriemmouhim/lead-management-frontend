import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  TextField, 
  Button, 
  Container, 
  Typography, 
  Box,
  CircularProgress,
  Alert
} from '@mui/material';

export default function Login() {
  const { login, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    email: false,
    password: false
  });
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      email: !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
      password: formData.password.length < 6
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!validateForm()) {
      setSubmitError('Please fix form errors');
      return;
    }

    try {
      const result = await login(formData.email, formData.password);
      if (result?.success) {
        navigate(
          result.user.role === 'employer' 
            ? '/employer/dashboard' 
            : '/manager/leads'
        );
      }
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          p: 4,
          boxShadow: 3,
          borderRadius: 2
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Login
        </Typography>

        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        <TextField
          label="Email"
          name="email"
          type="email"
          fullWidth
          margin="normal"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          helperText={errors.email ? 'Enter a valid email address' : ''}
          disabled={loading}
        />

        <TextField
          label="Password"
          name="password"
          type="password"
          fullWidth
          margin="normal"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          helperText={errors.password ? 'Password must be at least 6 characters' : ''}
          disabled={loading}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Login'
          )}
        </Button>
      </Box>
    </Container>
  );
}