import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Tag, Spin, message, Empty, Button } from 'antd';
import {
  CalendarOutlined,
  UserOutlined,
  TeamOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { MainLayout } from '../../components/common/MainLayout';
import { sessionsService } from '../../services/api/sessionsService';
import { useAuth } from '../../contexts/AuthContext';
import type { Session } from '../../types';

export const SessionsCatalog = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await sessionsService.getAll();
      setSessions(data);
    } catch (error: any) {
      message.error('Failed to load sessions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <MainLayout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Gaming Sessions</h1>
        {currentUser && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => navigate('/sessions/create')}
          >
            Create Session
          </Button>
        )}
      </div>

      {sessions.length > 0 ? (
        <Row gutter={[16, 16]}>
          {sessions.map(session => (
            <Col xs={24} sm={12} lg={8} key={session.id}>
              <Card
                hoverable
                onClick={() => navigate(`/sessions/${session.id}`)}
                extra={<Tag color={getStatusColor(session.status)}>{session.status.toUpperCase()}</Tag>}
              >
                <Card.Meta
                  title={session.title}
                  description={
                    <>
                      <p><strong>{session.gameTitle}</strong></p>
                      <p style={{ marginTop: '8px' }}>
                        <TeamOutlined /> {session.currentPlayers.length}/{session.maxPlayers} players
                      </p>
                      <p>
                        <CalendarOutlined /> {new Date(session.scheduledTime).toLocaleString()}
                      </p>
                      <p>
                        <UserOutlined /> Host: {session.hostEmail}
                      </p>
                      <p style={{ marginTop: '8px', color: '#666' }}>
                        {session.description.substring(0, 100)}...
                      </p>
                    </>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Empty description="No sessions available. Create one now!" />
      )}
    </MainLayout>
  );
};
