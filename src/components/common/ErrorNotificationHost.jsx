import { useEffect } from 'react'
import { App as AntApp } from 'antd'
import { CloseOutlined, ExclamationCircleFilled } from '@ant-design/icons'
import { useLanguage } from '../../context/LanguageContext.jsx'

export default function ErrorNotificationHost() {
  const { notification } = AntApp.useApp()
  const { t } = useLanguage()

  useEffect(() => {
    const showNotification = (title, description) => {
      notification.open({
        message: t(title || 'Something went wrong'),
        description: String(description || t('An unexpected error occurred.')),
        icon: <ExclamationCircleFilled />,
        placement: 'topRight',
        duration: 6,
        closeIcon: <CloseOutlined />,
        className: 'system-error-notification',
      })
    }
    const onAppError = (event) => {
      showNotification(event.detail?.title, event.detail?.message)
    }
    const onWindowError = (event) => {
      showNotification('Something went wrong', event.message || event.error?.message)
    }
    const onUnhandledRejection = (event) => {
      showNotification('Something went wrong', event.reason?.message || event.reason)
    }

    window.addEventListener('jeyamohan:app-error', onAppError)
    window.addEventListener('error', onWindowError)
    window.addEventListener('unhandledrejection', onUnhandledRejection)

    return () => {
      window.removeEventListener('jeyamohan:app-error', onAppError)
      window.removeEventListener('error', onWindowError)
      window.removeEventListener('unhandledrejection', onUnhandledRejection)
    }
  }, [notification, t])

  return null
}
