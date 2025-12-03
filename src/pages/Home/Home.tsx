import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, Typography, Statistic, Spin, message } from 'antd';
import { AppstoreOutlined, TeamOutlined, RocketOutlined } from '@ant-design/icons';
import { MainLayout } from '../../components/common/MainLayout';
import { gamesService } from '../../services/api/gamesService';
import { sessionsService } from '../../services/api/sessionsService';
import type { Game, Session } from '../../types';

const { Title, Paragraph } = Typography;

export const Home = () => {
  const [loading, setLoading] = useState(true);
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [openSessions, setOpenSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState({ gamesCount: 0, sessionsCount: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [games, sessions] = await Promise.all([
        gamesService.getAll(),
        sessionsService.getOpen()
      ]);

      setFeaturedGames(games.slice(0, 3));
      setOpenSessions(sessions.slice(0, 3));
      setStats({
        gamesCount: games.length,
        sessionsCount: sessions.length
      });
    } catch (error: any) {
      message.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
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
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '8px',
        padding: '60px',
        marginBottom: '40px',
        color: 'white',
        textAlign: 'center'
      }}>
        <Title level={1} style={{ color: 'white', marginBottom: '20px' }}>
          Welcome to GameHub
        </Title>
        <Paragraph style={{ fontSize: '18px', color: 'white', marginBottom: '30px' }}>
          Your ultimate platform for discovering games and connecting with fellow gamers
        </Paragraph>
        <Button
          type="primary"
          size="large"
          icon={<RocketOutlined />}
          onClick={() => navigate('/games')}
          style={{ marginRight: '10px' }}
        >
          Browse Games
        </Button>
        <Button
          size="large"
          style={{ background: 'white', color: '#667eea' }}
          onClick={() => navigate('/sessions')}
        >
          Join Sessions
        </Button>
      </div>

      {/* Stats Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: '40px' }}>
        <Col xs={24} md={12}>
          <Card>
            <Statistic
              title="Total Games"
              value={stats.gamesCount}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card>
            <Statistic
              title="Open Gaming Sessions"
              value={stats.sessionsCount}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Featured Games */}
      <Title level={2} style={{ marginBottom: '20px' }}>Featured Games</Title>
      {featuredGames.length > 0 ? (
        <Row gutter={[16, 16]} style={{ marginBottom: '40px' }}>
          {featuredGames.map(game => (
            <Col xs={24} sm={12} lg={8} key={game.id}>
              <Card
                hoverable
                cover={
                  <img
                    alt={game.title}
                    src={game.imageUrl}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                }
                onClick={() => navigate(`/games/${game.id}`)}
              >
                <Card.Meta
                  title={game.title}
                  description={`${game.genre} | ${game.releaseYear}`}
                />
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Paragraph>No games available yet. Be the first to add one!</Paragraph>
      )}

      {/* Open Sessions */}
      <Title level={2} style={{ marginBottom: '20px' }}>Open Gaming Sessions</Title>
      {openSessions.length > 0 ? (
        <Row gutter={[16, 16]}>
          {openSessions.map(session => (
            <Col xs={24} sm={12} lg={8} key={session.id}>
              <Card
                hoverable
                onClick={() => navigate(`/sessions/${session.id}`)}
              >
                <Card.Meta
                  title={session.title}
                  description={`${session.gameTitle} | ${session.currentPlayers.length}/${session.maxPlayers} players`}
                />
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Paragraph>No open sessions available. Create one now!</Paragraph>
      )}
    </MainLayout>
  );
};
