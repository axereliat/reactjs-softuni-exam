import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Button, Card, message, Select, InputNumber, Spin, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { MainLayout } from '../../components/common/MainLayout';
import { gamesService } from '../../services/api/gamesService';
import { cloudinaryService } from '../../services/cloudinary/cloudinaryService';
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
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

      setOriginalImageUrl(gameData.imageUrl);
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

  const handleFileChange = (info: any) => {
    const { fileList: newFileList } = info;
    setFileList(newFileList.slice(-1));

    if (newFileList.length > 0) {
      const file = newFileList[0].originFileObj;

      const validationError = cloudinaryService.validateImage(file);
      if (validationError) {
        message.error(validationError);
        setFileList([]);
        setUploadedFile(null);
        return;
      }

      setUploadedFile(file);
      form.setFieldsValue({ imageUrl: '' });
    } else {
      setUploadedFile(null);
    }
  };

  const onFinish = async (values: GameFormData) => {
    if (!currentUser) {
      message.error('You must be logged in to edit a game');
      return;
    }

    try {
      setLoading(true);

      let imageUrl = values.imageUrl;

      // Upload new image if file is selected
      if (uploadedFile) {
        message.loading({ content: 'Uploading image...', key: 'upload' });
        imageUrl = await cloudinaryService.uploadImage(uploadedFile);
        message.success({ content: 'Image uploaded!', key: 'upload' });

        // Note: Cloudinary deletion requires backend API
        // Old image will remain in Cloudinary but won't be referenced
        if (originalImageUrl && originalImageUrl.includes('cloudinary.com')) {
          await cloudinaryService.deleteImage(originalImageUrl);
        }
      }

      if (!imageUrl) {
        message.error('Please provide an image URL or upload an image');
        return;
      }

      await gamesService.update(id!, { ...values, imageUrl });
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

            <Form.Item label="Game Image">
              <Upload
                fileList={fileList}
                onChange={handleFileChange}
                beforeUpload={() => false}
                accept="image/*"
                maxCount={1}
              >
                <Button icon={<UploadOutlined />} size="large">
                  Upload New Image
                </Button>
              </Upload>
              <div style={{ marginTop: '8px', color: '#888', fontSize: '12px' }}>
                Max size: 10MB. Supports: JPEG, PNG, GIF, WebP
              </div>
            </Form.Item>

            <Form.Item
              label="Or provide Image URL"
              name="imageUrl"
              rules={[
                { type: 'url', message: 'Please enter a valid URL!' }
              ]}
            >
              <Input
                placeholder="https://example.com/image.jpg"
                size="large"
                disabled={!!uploadedFile}
              />
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
