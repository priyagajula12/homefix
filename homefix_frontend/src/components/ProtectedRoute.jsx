import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check for the token 
  const token = localStorage.getItem('token') || localStorage.getItem('access_token');
  
  // If there is no token (because they logged out), kick them to the login page instantly
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If they ARE logged in, let them through to the private page
  return children;
};

export default ProtectedRoute;