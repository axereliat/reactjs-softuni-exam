import { Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Space, Dropdown } from 'antd';
import {
  HomeOutlined,
  AppstoreOutlined,
  TeamOutlined,
  PlusOutlined,
  LoginOutlined,
  UserOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import type { MenuProps } from 'antd';

const { Header: AntHeader } = Layout;

export const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: 'My Profile',
      icon: <UserOutlined />,
      onClick: () => navigate('/profile')
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
      danger: true
    }
  ];

  const menuItems: MenuProps['items'] = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: <Link to="/">Home</Link>
    },
    {
      key: 'games',
      icon: <AppstoreOutlined />,
      label: <Link to="/games">Games</Link>
    },
    {
      key: 'sessions',
      icon: <TeamOutlined />,
      label: <Link to="/sessions">Sessions</Link>
    }
  ];

  return (
    <AntHeader style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 50px',
      background: '#001529'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold',
          marginRight: '50px'
        }}>
          🎮 GameHub
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          items={currentUser != null ? menuItems : []}
          style={{ flex: 1, minWidth: 0, border: 'none' }}
        />
      </div>

      <Space>
        {currentUser ? (
          <>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/games/create')}
            >
              Add Game
            </Button>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button icon={<UserOutlined />}>
                {currentUser.displayName || currentUser.email}
              </Button>
            </Dropdown>
          </>
        ) : (
          <>
            <Button
              icon={<LoginOutlined />}
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
            <Button
              type="primary"
              onClick={() => navigate('/register')}
            >
              Register
            </Button>
          </>
        )}
      </Space>
    </AntHeader>
  );
};
