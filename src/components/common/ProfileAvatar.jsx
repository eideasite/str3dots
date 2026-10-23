import { Avatar } from 'antd'

const DEFAULT_INITIAL = '\u0b9c\u0bc6'
const graphemeSegmenter = typeof Intl.Segmenter === 'function'
  ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
  : null

function getInitial(name) {
  const value = typeof name === 'string' ? name.trim() : ''
  if (!value) return DEFAULT_INITIAL
  if (graphemeSegmenter) return graphemeSegmenter.segment(value)[Symbol.iterator]().next().value?.segment || DEFAULT_INITIAL
  return Array.from(value)[0] || DEFAULT_INITIAL
}

export default function ProfileAvatar({ profile, size = 'default', className = '' }) {
  return <Avatar size={size} className={className}>{profile?.avatar || getInitial(profile?.name)}</Avatar>
}
