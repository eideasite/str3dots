import { Space, Spin, Typography } from 'antd'

export default function LoadingState({ message }) {
  return (
    <Space size={7} role="status" aria-live="polite">
      <Spin size="small" />
      <Typography.Text type="secondary">{message}</Typography.Text>
    </Space>
  )
}

