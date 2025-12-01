import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Tabs, List, Tag, Spin, message, Empty, Button } from 'antd';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import { MainLayout } from '../../components/common/MainLayout';
import { gamesService } from '../../services/api/gamesService';
import { sessionsService } from '../../services/api/sessionsService';
import { reviewsService } from '../../services/api/reviewsService';
import { useAuth } from '../../contexts/AuthContext';
import type { Game, Session, Review } from '../../types';

const { TabPane } = Tabs;

export const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [myGames, setMyGames] = useState<Game[]>([]);
  const [mySessions, setMySessions] = useState<Session[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const loadUserData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const [games, sessions, reviews] = await Promise.all([
        gamesService.getByAuthor(currentUser.uid),
        sessionsService.getByHost(currentUser.uid),
        reviewsService.getByUserId(currentUser.uid)
      ]);

      setMyGames(games);
      setMySessions(sessions);
      setMyReviews(reviews);
    } catch (error: any) {
      message.error('Failed to load profile data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <p>Please login to view your profile</p>
          <Button type="primary" onClick={() => navigate('/login')}>
            Login
          </Button>
        </div>
      </MainLayout>
    );
  }

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
      <Card title={`Profile: ${currentUser.displayName || currentUser.email}`}>
        <Tabs defaultActiveKey="games">
          <TabPane tab={`My Games (${myGames.length})`} key="games">
            {myGames.length > 0 ? (
              <List
                dataSource={myGames}
                renderItem={(game) => (
                  <List.Item
                    actions={[
                      <Button
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/games/${game.id}`)}
                        key="view"
                      >
                        View
                      </Button>,
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/games/${game.id}/edit`)}
                        key="edit"
                      >
                        Edit
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={game.title}
                      description={
                        <>
                          <Tag color="blue">{game.genre}</Tag>
                          <Tag color="green">{game.releaseYear}</Tag>
                          {game.reviewsCount && game.reviewsCount > 0 && (
                            <span style={{ marginLeft: '8px' }}>
                              ⭐ {game.averageRating} ({game.reviewsCount} reviews)
                            </span>
                          )}
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="You haven't created any games yet">
                <Button type="primary" onClick={() => navigate('/games/create')}>
                  Create Your First Game
                </Button>
              </Empty>
            )}
          </TabPane>

          <TabPane tab={`My Sessions (${mySessions.length})`} key="sessions">
            {mySessions.length > 0 ? (
              <List
                dataSource={mySessions}
                renderItem={(session) => (
                  <List.Item
                    actions={[
                      <Button
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/sessions/${session.id}`)}
                        key="view"
                      >
                        View
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={session.title}
                      description={
                        <>
                          <div><strong>{session.gameTitle}</strong></div>
                          <div>
                            <Tag color={
                              session.status === 'open' ? 'green' :
                              session.status === 'full' ? 'orange' : 'red'
                            }>
                              {session.status.toUpperCase()}
                            </Tag>
                            {session.currentPlayers.length}/{session.maxPlayers} players
                          </div>
                          <div>
                            Scheduled: {new Date(session.scheduledTime).toLocaleString()}
                          </div>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="You haven't created any sessions yet">
                <Button type="primary" onClick={() => navigate('/sessions/create')}>
                  Create Your First Session
                </Button>
              </Empty>
            )}
          </TabPane>

          <TabPane tab={`My Reviews (${myReviews.length})`} key="reviews">
            {myReviews.length > 0 ? (
              <List
                dataSource={myReviews}
                renderItem={(review) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <>
                          <span>⭐ {review.rating}/5</span>
                          <span style={{ marginLeft: '8px', color: '#999' }}>
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </>
                      }
                      description={
                        <>
                          <p>{review.comment}</p>
                          <Button
                            type="link"
                            onClick={() => navigate(`/games/${review.gameId}`)}
                          >
                            View Game
                          </Button>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="You haven't written any reviews yet">
                <Button type="primary" onClick={() => navigate('/games')}>
                  Browse Games
                </Button>
              </Empty>
            )}
          </TabPane>
        </Tabs>
      </Card>
    </MainLayout>
  );
};
