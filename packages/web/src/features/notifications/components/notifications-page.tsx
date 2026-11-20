import { useNavigate } from '@tanstack/react-router'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardPage } from '@/components/layout/dashboard-page'
import { useNotificationStore } from '../store'
import { NotificationCard } from './notification-card'

const actionRoutes = {
  view: '/workspaces',
  'view-product': '/products',
  billing: '/billing',
  open: '/tasks',
  'open-chat': '/chats',
} as const

export function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, unreadCount } =
    useNotificationStore()
  const navigate = useNavigate()
  const count = unreadCount()
  const unreadNotifications = notifications.filter(
    (notification) => notification.status === 'unread'
  )
  const readNotifications = notifications.filter(
    (notification) => notification.status === 'read'
  )

  const renderList = (items: typeof notifications) => {
    if (items.length === 0) {
      return (
        <div className='flex flex-col items-center justify-center py-16'>
          <Bell className='mb-3 size-10 text-muted-foreground/40' />
          <p className='text-sm text-muted-foreground'>No notifications</p>
        </div>
      )
    }

    return (
      <div className='flex flex-col gap-2'>
        {items.map((notification) => (
          <NotificationCard
            key={notification.id}
            id={notification.id}
            title={notification.title}
            body={notification.body}
            status={notification.status}
            createdAt={notification.createdAt}
            actions={notification.actions}
            onMarkAsRead={markAsRead}
            onAction={(notificationId, actionId) => {
              const route = actionRoutes[actionId as keyof typeof actionRoutes]
              if (!route) return
              markAsRead(notificationId)
              void navigate({ to: route })
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <DashboardPage
      title='Notifications'
      description='View and manage all your notifications.'
      action={
        count > 0 ? (
          <Button variant='outline' size='sm' onClick={markAllAsRead}>
            Mark all as read
          </Button>
        ) : null
      }
    >
      <Tabs defaultValue='all'>
        <TabsList>
          <TabsTrigger value='all'>All ({notifications.length})</TabsTrigger>
          <TabsTrigger value='unread'>
            Unread ({unreadNotifications.length})
          </TabsTrigger>
          <TabsTrigger value='read'>
            Read ({readNotifications.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value='all' className='mt-4'>
          {renderList(notifications)}
        </TabsContent>
        <TabsContent value='unread' className='mt-4'>
          {renderList(unreadNotifications)}
        </TabsContent>
        <TabsContent value='read' className='mt-4'>
          {renderList(readNotifications)}
        </TabsContent>
      </Tabs>
    </DashboardPage>
  )
}
