import { Button, Result } from 'antd'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function NotFoundPage({ onHome }) {
  const { t } = useLanguage()
  return <div className="page-wrap"><Result status="404" title={t('Page not found')} subTitle={t('Go back to your articles.')} extra={<Button type="primary" onClick={onHome}>{t('Go to articles')}</Button>} /></div>
}
