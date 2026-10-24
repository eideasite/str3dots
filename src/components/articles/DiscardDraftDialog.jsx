import ConfirmDialog from '../common/ConfirmDialog.jsx'
import { getArticleTitle } from '../../utils/article.js'
import { useLanguage } from '../../context/LanguageContext.jsx'

export default function DiscardDraftDialog({ open, article, onCancel, onConfirm }) {
  const { t } = useLanguage()
  const description = t('The draft “{title}” will be removed permanently. Cancel to keep your writing.')
    .replace('{title}', getArticleTitle(article))

  return (
    <ConfirmDialog
      open={open}
      title={t('Discard this draft?')}
      description={description}
      confirmText={t('Discard draft')}
      cancelText={t('Cancel')}
      onCancel={onCancel}
      onConfirm={onConfirm}
      danger
    />
  )
}
