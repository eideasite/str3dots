import { Space, Spin, Typography } from 'antd'

export default function LoadingState({ message = 'சேமிக்கிறது…' }) {
  return <Space size={7}><Spin size="small" /><Typography.Text type="secondary">{message}</Typography.Text></Space>
}

