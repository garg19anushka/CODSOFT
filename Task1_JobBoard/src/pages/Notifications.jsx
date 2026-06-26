import { useEffect, useState } from 'react'
import { Bell, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const icons = {
  success: CheckCircle2,
  warning: AlertCircle,
  info: Info,
}
const iconColors = {
  success: 'text-leaf',
  warning: 'text-rust',
  info: 'text-amber-dark',
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function Notifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) load()
  }, [user])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setNotifications(data || [])
    setLoading(false)

    const unreadIds = (data || []).filter((n) => !n.is_read).map((n) => n.id)
    if (unreadIds.length > 0) {
      await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <h1 className="font-display font-black text-3xl mb-1 flex items-center gap-3">
        <Bell size={26} /> Notifications
      </h1>
      <p className="text-slate text-sm mb-8">Updates on your jobs and applications</p>

      {loading ? (
        <p className="text-slate">Loading...</p>
      ) : notifications.length === 0 ? (
        <div className="border-2 border-dashed border-ink/30 p-16 text-center">
          <Bell size={28} className="mx-auto mb-3 text-slate" />
          <p className="font-display font-bold mb-1">All quiet</p>
          <p className="text-slate text-sm">You'll see updates here as things happen.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = icons[n.type] || Info
            return (
              <div
                key={n.id}
                className={`border-2 border-ink p-4 flex gap-3 ${
                  !n.is_read ? 'bg-amber-light/30' : 'bg-paper'
                }`}
              >
                <Icon size={20} className={`${iconColors[n.type]} flex-shrink-0 mt-0.5`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-display font-bold text-sm">{n.title}</p>
                    <span className="text-xs text-slate whitespace-nowrap">{timeAgo(n.created_at)}</span>
                  </div>
                  <p className="text-sm text-ink/80 mt-0.5">{n.message}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
