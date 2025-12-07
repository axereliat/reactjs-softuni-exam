import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Select, InputNumber, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { MainLayout } from '../../components/common/MainLayout';
import { gamesService } from '../../services/api/gamesService';
import { cloudinaryService } from '../../services/cloudinary/cloudinaryService';
import { useAuth } from '../../contexts/AuthContext';
import type { GameFormData } from '../../types';
import {GENRES, PLATFORMS} from "../../services/constants/contants.ts";

const { TextArea } = Input;
const { Option } = Select;

export const CreateGame = () => {
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleFileChange = (info: any) => {
    const { fileList: newFileList } = info;
    setFileList(newFileList.slice(-1)); // Keep only the last file

    if (newFileList.length > 0) {
      const file = newFileList[0].originFileObj;

      // Validate file
      const validationError = cloudinaryService.validateImage(file);
      if (validationError) {
        message.error(validationError);
        setFileList([]);
        setUploadedFile(null);
        return;
      }

      setUploadedFile(file);
    } else {
      setUploadedFile(null);
    }
  };

  const onFinish = async (values: GameFormData) => {
    if (!currentUser) {
      message.error('You must be logged in to create a game');
      return;
    }

    // Validate that an image file is uploaded
    if (!uploadedFile) {
      message.error('Please upload an image');
      return;
    }

    try {
      setLoading(true);

      // Upload image to Cloudinary
      message.loading({ content: 'Uploading image...', key: 'upload' });
      const imageUrl = await cloudinaryService.uploadImage(uploadedFile);
      message.success({ content: 'Image uploaded!', key: 'upload' });

      const gameId = await gamesService.create(
        { ...values, imageUrl },
        currentUser.uid,
        currentUser.email!
      );
      message.success('Game created successfully!');
      navigate(`/games/${gameId}`);
    } catch (error: any) {
      message.error('Failed to create game');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Card title="Add New Game">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              platform: []
            }}
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
              label="Game Image"
              required
              help={!uploadedFile ? 'Please upload an image' : undefined}
              validateStatus={!uploadedFile ? 'warning' : 'success'}
            >
              <Upload
                fileList={fileList}
                onChange={handleFileChange}
                beforeUpload={() => false}
                accept="image/*"
                maxCount={1}
              >
                <Button icon={<UploadOutlined />} size="large">
                  Upload Image
                </Button>
              </Upload>
              <div style={{ marginTop: '8px', color: '#888', fontSize: '12px' }}>
                Max size: 10MB. Supports: JPEG, PNG, GIF, WebP
              </div>
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
                Create Game
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </MainLayout>
  );
};
