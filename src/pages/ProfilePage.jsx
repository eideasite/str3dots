import { Typography } from 'antd'
import ProfileCard from '../components/profile/ProfileCard.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

const { Title, Text, Paragraph } = Typography

export default function ProfilePage({ profile, onChange, onContinue }) {
  const { t } = useLanguage()
  return (
    <div className="page-wrap narrow-page">
      <div className="page-heading">
        <Text className="eyebrow">{t('Writer profile')}</Text>
        <Title level={2}>{t('Profile')}</Title>
        <Paragraph>{t('Manage the name and introduction shown on your writing profile.')}</Paragraph>
      </div>
      <ProfileCard profile={profile} onChange={onChange} onContinue={onContinue} />
    </div>
  )
}
