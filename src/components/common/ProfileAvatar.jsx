import { Avatar } from 'antd'


export default function ProfileAvatar({ profile, size = 'default', className = '' }) {
  const initial = profile?.name?.trim()?.[0] || '\\u0b9c\\u0bc6'
  return <Avatar size={size} className={className}>{profile?.avatar || initial}</Avatar>
}
