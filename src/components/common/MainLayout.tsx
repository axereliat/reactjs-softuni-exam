import { Layout } from 'antd';
import { Header } from './Header';
import { Footer } from './Footer';
import type { ReactNode } from 'react';

const { Content } = Layout;

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Content style={{ padding: '24px 50px' }}>
        {children}
      </Content>
      <Footer />
    </Layout>
  );
};
