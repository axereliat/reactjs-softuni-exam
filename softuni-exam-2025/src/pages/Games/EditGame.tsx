import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Button, Card, message, Select, InputNumber, Spin } from 'antd';
import { MainLayout } from '../../components/common/MainLayout';
import { gamesService } from '../../services/api/gamesService';
import { useAuth } from '../../contexts/AuthContext';
import type { GameFormData } from '../../types';

const { TextArea } = Input;
const { Option } = Select;

const GENRES = [
  'Action',
  'Adventure',
  'RPG',
  'Strategy',
  'Sports',
  'Racing',
  'Puzzle',
  'Simulation',
  'Fighting',
  'Shooter',
  'Horror',
  'Platform',
  'MMORPG',
  'Battle Royale'
];

const PLATFORMS = [
  'PC',
  'PlayStation 5',
  'PlayStation 4',
  'Xbox Series X/S',
  'Xbox One',
  'Nintendo Switch',
  'Mobile',
  'VR'
];

export const EditGame = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    loadGame();
  }, [id]);

  const loadGame = async () => {
    try {
      setPageLoading(true);
      const gameData = await gamesService.getById(id!);

      if (!gameData) {
        message.error('Game not found');
        navigate('/games');
        return;
      }

      if (gameData.authorId !== currentUser?.uid) {
        message.error('You are not authorized to edit this game');
        navigate(`/games/${id}`);
        return;
      }

      form.setFieldsValue({
        title: gameData.title,
        genre: gameData.genre,
        description: gameData.description,
        imageUrl: gameData.imageUrl,
        platform: gameData.platform,
        releaseYear: gameData.releaseYear
      });
    } catch (error: any) {
      message.error('Failed to load game');
      console.error(error);
    } finally {
      setPageLoading(false);
    }
  };

  const onFinish = async (values: GameFormData) => {
    if (!currentUser) {
      message.error('You must be logged in to edit a game');
      return;
    }

    try {
      setLoading(true);
      await gamesService.update(id!, values);
      message.success('Game updated successfully!');
      navigate(`/games/${id}`);
    } catch (error: any) {
      message.error('Failed to update game');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
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
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Card title="Edit Game">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item
              label="Game Title"
              name="title"
              rules={[
                { required: true, message: 'Please enter the game title!' },
                { min: 3, message: 'Title must be at least 3 characters!' }
              ]}
            >
              <Input placeholder="Enter game title" size="large" />
            </Form.Item>

            <Form.Item
              label="Genre"
              name="genre"
              rules={[{ required: true, message: 'Please select a genre!' }]}
            >
              <Select placeholder="Select genre" size="large">
                {GENRES.map(genre => (
                  <Option key={genre} value={genre}>{genre}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              rules={[
                { required: true, message: 'Please enter a description!' },
                { min: 20, message: 'Description must be at least 20 characters!' }
              ]}
            >
              <TextArea
                rows={6}
                placeholder="Describe the game..."
              />
            </Form.Item>

            <Form.Item
              label="Image URL"
              name="imageUrl"
              rules={[
                { required: true, message: 'Please enter an image URL!' },
                { type: 'url', message: 'Please enter a valid URL!' }
              ]}
            >
              <Input placeholder="https://example.com/image.jpg" size="large" />
            </Form.Item>

            <Form.Item
              label="Platforms"
              name="platform"
              rules={[
                { required: true, message: 'Please select at least one platform!' }
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Select platforms"
                size="large"
              >
                {PLATFORMS.map(platform => (
                  <Option key={platform} value={platform}>{platform}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Release Year"
              name="releaseYear"
              rules={[
                { required: true, message: 'Please enter the release year!' },
                {
                  type: 'number',
                  min: 1970,
                  max: new Date().getFullYear() + 1,
                  message: `Year must be between 1970 and ${new Date().getFullYear() + 1}!`
                }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="2024"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                block
              >
                Update Game
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </MainLayout>
  );
};
