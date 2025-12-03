import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Typography,
  Tag,
  Spin,
  message,
  Descriptions,
  List,
  Popconfirm,
  Space
} from 'antd';
import {
  CalendarOutlined,
  UserOutlined,
  TeamOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { MainLayout } from '../../components/common/MainLayout';
import { sessionsService } from '../../services/api/sessionsService';
import { useAuth } from '../../contexts/AuthContext';
import type { Session } from '../../types';

const { Title } = Typography;

export const SessionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadSession();
    }
  }, [id]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const data = await sessionsService.getById(id!);

      if (!data) {
        message.error('Session not found');
        navigate('/sessions');
        return;
      }

      setSession(data);
    } catch (error: any) {
      message.error('Failed to load session details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!currentUser) {
      message.warning('Please login to join this session');
      navigate('/login');
      return;
    }

    try {
      setActionLoading(true);
      await sessionsService.join(id!, currentUser.uid);
      message.success('Joined session successfully!');
      loadSession();
    } catch (error: any) {
      message.error(error.message || 'Failed to join session');
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!currentUser) return;

    try {
      setActionLoading(true);
      await sessionsService.leave(id!, currentUser.uid);
      message.success('Left session successfully');
      loadSession();
    } catch (error: any) {
      message.error(error.message || 'Failed to leave session');
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await sessionsService.delete(id!);
      message.success('Session deleted successfully');
      navigate('/sessions');
    } catch (error: any) {
      message.error('Failed to delete session');
      console.error(error);
    }
  };

  const handleClose = async () => {
    try {
      await sessionsService.close(id!);
      message.success('Session closed successfully');
      loadSession();
    } catch (error: any) {
      message.error('Failed to close session');
      console.error(error);
    }
  };

  if (loading || !session) {
    return (
      <MainLayout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  const isHost = currentUser?.uid === session.hostId;
  const isParticipant = currentUser && session.currentPlayers.includes(currentUser.uid);
  const canJoin = currentUser && !isParticipant && session.status === 'open';
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'green';
      case 'full':
        return 'orange';
      case 'closed':
        return 'red';
      default:
        return 'default';
    }
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Title level={2}>{session.title}</Title>
            <Tag color={getStatusColor(session.status)} style={{ fontSize: '16px', padding: '4px 12px' }}>
              {session.status.toUpperCase()}
            </Tag>
          </div>

          <Descriptions bordered column={1}>
            <Descriptions.Item label="Game">
              <Button type="link" onClick={() => navigate(`/games/${session.gameId}`)}>
                {session.gameTitle}
              </Button>
            </Descriptions.Item>
            <Descriptions.Item label="Host">
              <UserOutlined /> {session.hostEmail}
            </Descriptions.Item>
            <Descriptions.Item label="Players">
              <TeamOutlined /> {session.currentPlayers.length} / {session.maxPlayers}
            </Descriptions.Item>
            <Descriptions.Item label="Scheduled Time">
              <CalendarOutlined /> {new Date(session.scheduledTime).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {session.description}
            </Descriptions.Item>
          </Descriptions>

          <div style={{ marginTop: '24px' }}>
            <Title level={4}>Participants ({session.currentPlayers.length})</Title>
            <List
              dataSource={session.currentPlayers}
              renderItem={(playerId, index) => (
                <List.Item>
                  <UserOutlined /> Player {index + 1} {playerId === session.hostId && <Tag color="gold">Host</Tag>}
                </List.Item>
              )}
            />
          </div>

          <div style={{ marginTop: '24px' }}>
            <Space>
              {canJoin && (
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  size="large"
                  loading={actionLoading}
                  onClick={handleJoin}
                >
                  Join Session
                </Button>
              )}

              {isParticipant && !isHost && (
                <Popconfirm
                  title="Are you sure you want to leave this session?"
                  onConfirm={handleLeave}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    size="large"
                    loading={actionLoading}
                  >
                    Leave Session
                  </Button>
                </Popconfirm>
              )}

              {isHost && (
                <>
                  {session.status !== 'closed' && (
                    <Popconfirm
                      title="Close this session?"
                      onConfirm={handleClose}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button size="large">
                        Close Session
                      </Button>
                    </Popconfirm>
                  )}

                  <Popconfirm
                    title="Are you sure you want to delete this session?"
                    onConfirm={handleDelete}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button danger icon={<DeleteOutlined />} size="large">
                      Delete Session
                    </Button>
                  </Popconfirm>
                </>
              )}
            </Space>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};
