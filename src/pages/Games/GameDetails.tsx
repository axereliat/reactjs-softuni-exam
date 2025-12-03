import {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {
    Card,
    Button,
    Typography,
    Tag,
    Spin,
    message,
    Row,
    Col,
    List,
    Rate,
    Form,
    Input,
    Divider,
    Popconfirm,
    Space
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    CalendarOutlined,
    UserOutlined
} from '@ant-design/icons';
import {MainLayout} from '../../components/common/MainLayout';
import {gamesService} from '../../services/api/gamesService';
import {reviewsService} from '../../services/api/reviewsService';
import {sessionsService} from '../../services/api/sessionsService';
import {useAuth} from '../../contexts/AuthContext';
import type {Game, Review, Session} from '../../types';

const {Title, Paragraph, Text} = Typography;
const {TextArea} = Input;

export const GameDetails = () => {
    const {id} = useParams<{ id: string }>();
    const [game, setGame] = useState<Game | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [imageError, setImageError] = useState(false);
    const {currentUser} = useAuth();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    useEffect(() => {
        if (id) {
            loadGameData();
        }
    }, [id]);

    const loadGameData = async () => {
        try {
            setLoading(true);
            const [gameData, reviewsData, sessionsData] = await Promise.all([
                gamesService.getById(id!),
                reviewsService.getByGameId(id!),
                sessionsService.getByGameId(id!)
            ]);

            if (!gameData) {
                message.error('Game not found');
                navigate('/games');
                return;
            }

            setGame(gameData);
            setReviews(reviewsData);
            setSessions(sessionsData.filter(s => s.status === 'open'));

            if (currentUser) {
                const reviewed = await reviewsService.hasUserReviewed(id!, currentUser.uid);
                setHasReviewed(reviewed);
            }
        } catch (error: any) {
            message.error('Failed to load game details');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleReviewSubmit = async (values: { rating: number; comment: string }) => {
        if (!currentUser) {
            message.warning('Please login to leave a review');
            return;
        }

        try {
            setReviewLoading(true);
            await reviewsService.create(
                id!,
                currentUser.uid,
                currentUser.email!,
                values.rating,
                values.comment
            );
            message.success('Review added successfully!');
            form.resetFields();
            loadGameData();
        } catch (error: any) {
            message.error('Failed to add review');
            console.error(error);
        } finally {
            setReviewLoading(false);
        }
    };

    const handleDeleteGame = async () => {
        try {
            await gamesService.delete(id!);
            message.success('Game deleted successfully');
            navigate('/games');
        } catch (error: any) {
            message.error('Failed to delete game');
            console.error(error);
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        try {
            await reviewsService.delete(reviewId, id!);
            message.success('Review deleted successfully');
            loadGameData();
        } catch (error: any) {
            message.error('Failed to delete review');
            console.error(error);
        }
    };

    if (loading || !game) {
        return (
            <MainLayout>
                <div style={{display: 'flex', justifyContent: 'center', padding: '100px'}}>
                    <Spin size="large"/>
                </div>
            </MainLayout>
        );
    }

    const isAuthor = currentUser?.uid === game.authorId;

    return (
        <MainLayout>
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <Card
                        cover={
                            game.imageUrl ? <img
                                alt={game.title}
                                src={game.imageUrl}
                                style={{maxHeight: '400px', objectFit: 'cover'}}
                                onError={() => setImageError(true)}
                            /> : <span>N/A</span>
                        }
                    >
                        <div style={{marginBottom: '16px'}}>
                            <Title level={2}>{game.title}</Title>
                            <Space>
                                <Tag color="blue">{game.genre}</Tag>
                                <Tag color="green">{game.releaseYear}</Tag>
                                {game.platform.map(p => (
                                    <Tag key={p} color="purple">{p}</Tag>
                                ))}
                            </Space>
                        </div>

                        {game.averageRating && game.averageRating > 0 && (
                            <div style={{marginBottom: '16px'}}>
                                <Rate disabled value={game.averageRating}/>
                                <Text style={{marginLeft: '8px'}}>
                                    {game.averageRating} / 5 ({game.reviewsCount} reviews)
                                </Text>
                            </div>
                        )}

                        <Paragraph>{game.description}</Paragraph>

                        <div style={{marginTop: '16px'}}>
                            <Text type="secondary">
                                <UserOutlined/> Added by: {game.authorEmail}
                            </Text>
                        </div>

                        {isAuthor && (
                            <div style={{marginTop: '16px'}}>
                                <Space>
                                    <Button
                                        type="primary"
                                        icon={<EditOutlined/>}
                                        onClick={() => navigate(`/games/${id}/edit`)}
                                    >
                                        Edit
                                    </Button>
                                    <Popconfirm
                                        title="Are you sure you want to delete this game?"
                                        onConfirm={handleDeleteGame}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button danger icon={<DeleteOutlined/>}>
                                            Delete
                                        </Button>
                                    </Popconfirm>
                                </Space>
                            </div>
                        )}
                    </Card>

                    <Divider/>

                    {/* Reviews Section */}
                    <Card title="Reviews">
                        {currentUser && !hasReviewed && (
                            <Form form={form} onFinish={handleReviewSubmit} layout="vertical">
                                <Form.Item
                                    label="Rating"
                                    name="rating"
                                    rules={[{required: true, message: 'Please provide a rating!'}]}
                                >
                                    <Rate/>
                                </Form.Item>

                                <Form.Item
                                    label="Comment"
                                    name="comment"
                                    rules={[
                                        {required: true, message: 'Please write a comment!'},
                                        {min: 10, message: 'Comment must be at least 10 characters!'}
                                    ]}
                                >
                                    <TextArea rows={4} placeholder="Share your thoughts about this game..."/>
                                </Form.Item>

                                <Form.Item>
                                    <Button type="primary" htmlType="submit" loading={reviewLoading}>
                                        Submit Review
                                    </Button>
                                </Form.Item>
                            </Form>
                        )}

                        {hasReviewed && (
                            <Paragraph type="secondary">
                                You have already reviewed this game.
                            </Paragraph>
                        )}

                        <List
                            dataSource={reviews}
                            renderItem={(review) => (
                                <List.Item
                                    actions={
                                        currentUser?.uid === review.userId
                                            ? [
                                                <Popconfirm
                                                    title="Delete this review?"
                                                    onConfirm={() => handleDeleteReview(review.id)}
                                                    key="delete"
                                                >
                                                    <Button type="link" danger>Delete</Button>
                                                </Popconfirm>
                                            ]
                                            : []
                                    }
                                >
                                    <List.Item.Meta
                                        title={
                                            <>
                                                <Rate disabled value={review.rating}/>
                                                <Text style={{marginLeft: '8px'}}>by {review.userEmail}</Text>
                                            </>
                                        }
                                        description={review.comment}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="Gaming Sessions" extra={
                        currentUser && (
                            <Button
                                type="primary"
                                size="small"
                                onClick={() => navigate('/sessions/create', {state: {gameId: id, gameTitle: game.title}})}
                            >
                                Create Session
                            </Button>
                        )
                    }>
                        {sessions.length > 0 ? (
                            <List
                                dataSource={sessions}
                                renderItem={(session) => (
                                    <List.Item
                                        onClick={() => navigate(`/sessions/${session.id}`)}
                                        style={{cursor: 'pointer'}}
                                    >
                                        <List.Item.Meta
                                            title={session.title}
                                            description={
                                                <>
                                                    <div>
                                                        <CalendarOutlined/> {new Date(session.scheduledTime).toLocaleString()}
                                                    </div>
                                                    <div>
                                                        <UserOutlined/> {session.currentPlayers.length}/{session.maxPlayers} players
                                                    </div>
                                                </>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Paragraph type="secondary">No active sessions for this game.</Paragraph>
                        )}
                    </Card>
                </Col>
            </Row>
        </MainLayout>
    );
};
