import { Button, Modal, Typography } from 'antd'

const { Paragraph } = Typography

export default function ConfirmDialog({ open, title, description, confirmText, cancelText = 'Cancel', onCancel, onConfirm, danger = false }) {
  return (
    <Modal title={title} open={open} onCancel={onCancel} footer={[
      <Button key="cancel" onClick={onCancel}>{cancelText}</Button>,
      <Button key="confirm" type="primary" danger={danger} onClick={onConfirm}>{confirmText}</Button>,
    ]}>
      <Paragraph>{description}</Paragraph>
    </Modal>
  )
}
