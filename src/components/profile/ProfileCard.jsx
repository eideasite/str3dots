import { Button, Card, Input, Typography } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { useLanguage } from '../../context/LanguageContext.jsx'
import ProfileAvatar from '../common/ProfileAvatar.jsx'
import { PROFILE_AVATARS } from '../common/profileAvatars.js'

const { Title, Text } = Typography

export default function ProfileCard({ profile, onChange, onContinue }) {
  const { t } = useLanguage()
  return (
    <Card className="surface-card profile-card">
      <div className="profile-summary">
        <ProfileAvatar profile={profile} size={72} className="profile-avatar" />
        <div><Title level={4}>{profile.name || t('Writer')}</Title><Text type="secondary">{t('Article writer')}</Text></div>
      </div>
      <div className="field-label" id="profile-avatar-label">{t('Choose an avatar')}</div>
      <div className="profile-avatar-picker" role="group" aria-labelledby="profile-avatar-label">
        {PROFILE_AVATARS.map((avatar) => <button key={avatar} type="button" className={`profile-avatar-choice ${profile.avatar === avatar ? 'is-selected' : ''}`} aria-label={`${t('Choose avatar')} ${avatar}`} aria-pressed={profile.avatar === avatar} onClick={() => onChange({ ...profile, avatar })}>{avatar}</button>)}
      </div>
      <label className="field-label" htmlFor="profile-name">{t('Name shown to readers')}</label>
      <Input id="profile-name" size="large" maxLength={80} value={profile.name} onChange={(event) => onChange({ ...profile, name: event.target.value })} placeholder={t('Your name')} />
      <label className="field-label" htmlFor="profile-bio">{t('Short introduction')}</label>
      <Input.TextArea id="profile-bio" rows={4} maxLength={400} showCount value={profile.bio} onChange={(event) => onChange({ ...profile, bio: event.target.value })} placeholder={t('A few lines about you')} />
      <div className="form-actions"><Button type="primary" icon={<SaveOutlined />} onClick={onContinue}>{t('Save profile and continue to editor')}</Button></div>
    </Card>
  )
}
