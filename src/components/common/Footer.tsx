import { Layout } from 'antd';

const { Footer: AntFooter } = Layout;

export const Footer = () => {
  return (
    <AntFooter style={{ textAlign: 'center', background: '#f0f2f5' }}>
      GameHub ©{new Date().getFullYear()} - Your Ultimate Gaming Platform
    </AntFooter>
  );
};
