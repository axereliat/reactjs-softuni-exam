import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Card, message, Select, InputNumber, DatePicker } from 'antd';
import { MainLayout } from '../../components/common/MainLayout';
import { sessionsService } from '../../services/api/sessionsService';
import { gamesService } from '../../services/api/gamesService';
import { useAuth } from '../../contexts/AuthContext';
import type { Game, SessionFormData } from '../../types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

export const CreateSession = () => {
  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();

  useEffect(() => {
    loadGames();

    // Check if we have gameId and gameTitle from navigation state
    const state = location.state as { gameId?: string; gameTitle?: string };
    if (state?.gameId && state?.gameTitle) {
      form.setFieldsValue({
        gameId: state.gameId
      });
    }
  }, [location]);

  const loadGames = async () => {
    try {
      const data = await gamesService.getAll();
      setGames(data);
    } catch (error) {
      message.error('Failed to load games');
    }
  };

  const onFinish = async (values: any) => {
    if (!currentUser) {
      message.error('You must be logged in to create a session');
      return;
    }

    try {
      setLoading(true);

      const selectedGame = games.find(g => g.id === values.gameId);
      if (!selectedGame) {
        message.error('Please select a valid game');
        return;
      }

      const sessionData: SessionFormData = {
        gameId: values.gameId,
        gameTitle: selectedGame.title,
        title: values.title,
        description: values.description,
        maxPlayers: values.maxPlayers,
        scheduledTime: values.scheduledTime.toDate()
      };

      const sessionId = await sessionsService.create(
        sessionData,
        currentUser.uid,
        currentUser.email!
      );

      message.success('Gaming session created successfully!');
      navigate(`/sessions/${sessionId}`);
    } catch (error: any) {
      message.error('Failed to create session');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Card title="Create Gaming Session">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item
              label="Game"
              name="gameId"
              rules={[{ required: true, message: 'Please select a game!' }]}
            >
              <Select
                placeholder="Select a game"
                size="large"
                showSearch
                filterOption={(input, option) =>
                  String(option?.children || '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {games.map(game => (
                  <Option key={game.id} value={game.id}>
                    {game.title}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Session Title"
              name="title"
              rules={[
                { required: true, message: 'Please enter the session title!' },
                { min: 5, message: 'Title must be at least 5 characters!' }
              ]}
            >
              <Input placeholder="e.g., Casual Friday Night Match" size="large" />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              rules={[
                { required: true, message: 'Please enter a description!' },
                { min: 10, message: 'Description must be at least 10 characters!' }
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Describe the session, rules, skill level, etc..."
              />
            </Form.Item>

            <Form.Item
              label="Maximum Players"
              name="maxPlayers"
              rules={[
                { required: true, message: 'Please enter maximum players!' },
                {
                  type: 'number',
                  min: 2,
                  max: 100,
                  message: 'Maximum players must be between 2 and 100!'
                }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="4"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Scheduled Time"
              name="scheduledTime"
              rules={[
                { required: true, message: 'Please select a scheduled time!' }
              ]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                style={{ width: '100%' }}
                size="large"
                disabledDate={(current) => {
                  return current && current < dayjs().startOf('day');
                }}
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
                Create Session
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </MainLayout>
  );
};
