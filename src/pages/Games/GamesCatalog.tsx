import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Row, Col, Card, Spin, message, Empty, Tag, Rate, Input, Dropdown, Button, Space} from 'antd';
import {EyeOutlined} from '@ant-design/icons';
import {MainLayout} from '../../components/common/MainLayout';
import {gamesService} from '../../services/api/gamesService';
import type {Game} from '../../types';
import {GENRES} from "../../services/constants/contants.ts";

const {Search} = Input;

export const GamesCatalog = () => {
    const [games, setGames] = useState<Game[]>([]);
    const [filteredGames, setFilteredGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadGames();
    }, []);

    useEffect(() => {
        filterGames();
    }, [games, searchTerm]);

    const loadGames = async () => {
        try {
            setLoading(true);
            const data = await gamesService.getAll();
            setGames(data);
            setFilteredGames(data);
        } catch (error: any) {
            message.error('Failed to load games');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filterGames = () => {
        if (!searchTerm) {
            setFilteredGames(games);
            return;
        }

        const filtered = games.filter(game =>
            game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            game.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredGames(filtered);
    };

    if (loading) {
        return (
            <MainLayout>
                <div style={{display: 'flex', justifyContent: 'center', padding: '100px'}}>
                    <Spin size="large"/>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <h1>Games Catalog</h1>

            <Space style={{marginBottom: '24px', width: '100%'}}>
                <Search
                    placeholder="Search games by title or description..."
                    allowClear
                    size="large"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{width: '500px'}}
                />
                <div style={{padding: 20}}>
                    <Dropdown
                        menu={{
                            items: GENRES.map((genre, idx) => ({
                                key: idx.toString(),
                                label: <span>{genre}</span>,
                            })),
                        }}
                        placement="bottomLeft" arrow>
                        <Button>Category</Button>
                    </Dropdown>
                </div>
            </Space>

            {/* Games Grid */}
            {filteredGames.length > 0 ? (
                <Row gutter={[16, 16]}>
                    {filteredGames.map(game => (
                        <Col xs={24} sm={12} lg={8} xl={6} key={game.id}>
                            <Card
                                hoverable
                                cover={
                                    <img
                                        alt={game.title}
                                        src={game.imageUrl}
                                        style={{height: '200px', objectFit: 'cover'}}
                                    />
                                }
                                actions={[
                                    <div onClick={() => navigate(`/games/${game.id}`)}>
                                        <EyeOutlined key="view"/> View Details
                                    </div>
                                ]}
                            >
                                <Card.Meta
                                    title={game.title}
                                    description={
                                        <>
                                            <div style={{marginBottom: '8px'}}>
                                                <Tag color="blue">{game.genre}</Tag>
                                                <Tag color="green">{game.releaseYear}</Tag>
                                            </div>
                                            {game.averageRating && game.averageRating > 0 ? (
                                                <div>
                                                    <Rate disabled defaultValue={game.averageRating}/>
                                                    <span style={{marginLeft: '8px'}}>
                            ({game.reviewsCount || 0} reviews)
                          </span>
                                                </div>
                                            ) : (
                                                <span style={{color: '#999'}}>No reviews yet</span>
                                            )}
                                            <p style={{marginTop: '8px'}}>
                                                {game.description.substring(0, 100)}...
                                            </p>
                                        </>
                                    }
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <Empty description="No games found"/>
            )}
        </MainLayout>
    );
};
