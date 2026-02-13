import { memo } from 'react'
import { motion } from 'framer-motion'
import { LayoutDashboard, RefreshCw, LogOut, Trash2, Shield } from 'lucide-react'

interface SidebarProps {
  onRefresh: () => void;
  onReset: () => void;
  onLogout: () => void;
  loading: boolean;
  timer: number;
}

// --- 1. LOGO BİLEŞENİ (Sabit) ---
const Logo = memo(() => (
  <motion.div 
    whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(99, 102, 241, 0.6)" }}
    style={{ 
      width: '48px',
      height: '48px',
      borderRadius: '16px',
      background: 'linear-gradient(135deg, #6366f1, #a855f7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '40px',
      boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
      cursor: 'default'
    }}
  >
    <Shield size={24} color="white" />
  </motion.div>
))

// --- 2. MENÜ BUTONU (Navigasyon) ---
const NavButton = memo(({ isActive }: { isActive?: boolean }) => (
  <motion.div 
    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.15)' }}
    whileTap={{ scale: 0.95 }}
    className="no-drag"
    style={{ 
      padding: '12px',
      borderRadius: '16px',
      background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
      color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'center',
      border: isActive
        ? '1px solid rgba(255,255,255,0.1)'
        : '1px solid transparent'
    }}
  >
    <LayoutDashboard size={24} />
  </motion.div>
))

// --- 3. AKSİYON BUTONU (Refresh, Reset, Logout) ---
const ActionButton = memo(
  ({ onClick, icon: Icon, color, disabled, spin, title, bg }: any) => (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="no-drag"
      whileHover={{ scale: 1.1, filter: 'brightness(1.2)' }}
      whileTap={{ scale: 0.9 }}
      style={{
        width: '42px',
        height: '42px',
        borderRadius: '14px',
        background: bg || 'rgba(255,255,255,0.03)',
        color: color || '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.5 : 1,
        border: `1px solid ${
          color ? color + '20' : 'rgba(255,255,255,0.05)'
        }`,
        transition: 'box-shadow 0.2s'
      }}
    >
      <Icon size={20} className={spin ? 'spin' : ''} />
    </motion.button>
  )
)

// --- 4. TIMER DAİRESİ ---
const TimerRing = memo(({ timer }: { timer: number }) => {
  const radius = 16
  const circumference = 100
  const offset = circumference - (timer / 60) * circumference

  return (
    <div
      style={{
        position: 'relative',
        width: '42px',
        height: '42px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <svg width="42" height="42" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="21"
          cy="21"
          r={radius}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="3"
          fill="transparent"
        />
        <circle
          cx="21"
          cy="21"
          r={radius}
          stroke={timer < 10 ? '#ef4444' : '#10b981'}
          strokeWidth="3"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease'
          }}
        />
      </svg>
      <span
        style={{
          position: 'absolute',
          fontSize: '11px',
          fontWeight: '700',
          color: timer < 10 ? '#ef4444' : 'white',
          fontFamily: 'JetBrains Mono'
        }}
      >
        {timer}
      </span>
    </div>
  )
})

// --- 5. ANA SIDEBAR ---
const Sidebar = ({
  onRefresh,
  onReset,
  onLogout,
  loading,
  timer
}: SidebarProps) => {
  return (
    <motion.div
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="glass"
      style={{
        width: '80px',
        height: 'calc(100vh - 40px)',
        margin: '20px 0 20px 20px',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '30px 0',
        zIndex: 50,
        border: '1px solid rgba(255,255,255,0.08)'
      }}
    >
      <Logo />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          width: '100%',
          alignItems: 'center'
        }}
      >
        <NavButton isActive={true} />
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          alignItems: 'center',
          paddingBottom: '10px'
        }}
      >
        <TimerRing timer={timer} />

        <div
          style={{
            width: '40px',
            height: '1px',
            background: 'rgba(255,255,255,0.1)',
            margin: '5px 0'
          }}
        ></div>

        <ActionButton
          onClick={onRefresh}
          disabled={loading}
          icon={RefreshCw}
          spin={loading}
          title="Verileri Yenile"
          bg={loading ? 'rgba(99, 102, 241, 0.2)' : '#6366f1'}
          color="white"
        />

        <ActionButton
          onClick={onReset}
          icon={Trash2}
          color="#ef4444"
          title="Geçmişi Temizle"
        />

        <ActionButton
          onClick={onLogout}
          icon={LogOut}
          color="#9ca3af"
          title="Çıkış Yap"
        />
      </div>
    </motion.div>
  )
}

export default Sidebar