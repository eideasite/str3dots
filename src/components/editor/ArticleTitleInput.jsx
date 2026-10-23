import { Input } from 'antd'
import { useLanguage } from '../../context/LanguageContext.jsx'

export default function ArticleTitleInput({ value, onChange }) {
  const { t } = useLanguage()

  return (
    <Input
      id="article-title"
      name="articleTitle"
      type="text"
      className="article-title-input"
      variant="borderless"
      aria-label={t('Article title')}
      placeholder={t('Write an article title...')}
      maxLength={180}
      autoComplete="off"
      value={typeof value === 'string' ? value : ''}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}
