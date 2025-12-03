import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Input, Select, Spin, message, Empty, Tag, Rate } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { MainLayout } from '../../components/common/MainLayout';
import { gamesService } from '../../services/api/gamesService';
import type { Game } from '../../types';

const { Search } = Input;
const { Option } = Select;

export const GamesCatalog = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadGames();
  }, []);

  useEffect(() => {
    filterGames();
  }, [games, searchTerm, genreFilter]);

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
    let filtered = [...games];

    if (searchTerm) {
      filtered = filtered.filter(game =>
        game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (genreFilter !== 'all') {
      filtered = filtered.filter(game => game.genre === genreFilter);
    }

    setFilteredGames(filtered);
  };

  const uniqueGenres = Array.from(new Set(games.map(game => game.genre)));

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
      <h1>Games Catalog</h1>

      {/* Search and Filter */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} md={16}>
          <Search
            placeholder="Search games..."
            allowClear
            size="large"
            onSearch={setSearchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col xs={24} md={8}>
          <Select
            size="large"
            style={{ width: '100%' }}
            placeholder="Filter by genre"
            value={genreFilter}
            onChange={setGenreFilter}
          >
            <Option value="all">All Genres</Option>
            {uniqueGenres.map(genre => (
              <Option key={genre} value={genre}>{genre}</Option>
            ))}
          </Select>
        </Col>
      </Row>

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
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                }
                actions={[
                  <div onClick={() => navigate(`/games/${game.id}`)}>
                    <EyeOutlined key="view" /> View Details
                  </div>
                ]}
              >
                <Card.Meta
                  title={game.title}
                  description={
                    <>
                      <div style={{ marginBottom: '8px' }}>
                        <Tag color="blue">{game.genre}</Tag>
                        <Tag color="green">{game.releaseYear}</Tag>
                      </div>
                      {game.averageRating && game.averageRating > 0 ? (
                        <div>
                          <Rate disabled defaultValue={game.averageRating} />
                          <span style={{ marginLeft: '8px' }}>
                            ({game.reviewsCount || 0} reviews)
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: '#999' }}>No reviews yet</span>
                      )}
                      <p style={{ marginTop: '8px' }}>
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
        <Empty description="No games found" />
      )}
    </MainLayout>
  );
};
