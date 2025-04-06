import React, { useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';

interface UserData {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface GoogleAuthProps {
  onLoginSuccess?: (userData: UserData) => void;
  buttonText?: string;
  buttonVariant?: string;
  className?: string;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({
  buttonText = 'Sign in with Google',
  buttonVariant = 'outline-primary',
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google OAuth client ID - should be moved to environment variables
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id';
  const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || window.location.origin + '/auth/callback';

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Construct the Google OAuth URL
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID);
      authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('scope', 'email profile');
      authUrl.searchParams.append('access_type', 'offline');
      authUrl.searchParams.append('prompt', 'consent');
      
      // Redirect to Google login
      window.location.href = authUrl.toString();
    } catch (err) {
      console.error('Error initiating Google login:', err);
      setError('Failed to initiate Google login. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <Button
        variant={buttonVariant}
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="d-flex align-items-center justify-content-center"
      >
        {isLoading ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="me-2"
            />
            Authenticating...
          </>
        ) : (
          <>
            <img
              src="/google-icon.png"
              alt="Google"
              className="me-2"
              style={{ width: '18px', height: '18px' }}
            />
            {buttonText}
          </>
        )}
      </Button>
      
      {error && (
        <div className="text-danger mt-2 small">
          {error}
        </div>
      )}
    </div>
  );
};

export default GoogleAuth; 