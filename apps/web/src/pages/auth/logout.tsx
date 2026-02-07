import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const LogoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useUser();

  useEffect(() => {
    logout();
    navigate('/', { replace: true });
  }, [logout, navigate]);

  return null;
};

export default LogoutPage;
