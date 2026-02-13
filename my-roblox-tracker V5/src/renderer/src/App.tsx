import React, { useState, useEffect } from 'react'

import Dashboard from './components/Dashboard'
import Sidebar from './components/Sidebar'
import { Shield, Key, Loader2, ChevronRight, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRobloxData } from './hooks/useRobloxData'

function App(): React.JSX.Element {
  const {
    transactions,
    stats,
    groupId,
    cookie,
    loading,
    error,
    statusText,
    timer,
    login,
    logout,
    resetData,
    refresh,
    setGroupId,
    setCookie
  } = useRobloxData()

  const [shake, setShake] = useState(0)

  useEffect(() => {
    if (error) setShake(prev => prev + 1)
  }, [error])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      login(groupId, cookie)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        background: 'var(--bg-app)',
        fontFamily: 'Inter, sans-serif',
        color: 'white',
        overflow: 'hidden'
      }}
    >
      <div className="title-drag-region" />

      <AnimatePresence mode="wait">
        {!transactions ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{
              opacity: 0,
              y: -50,
              filter: 'blur(20px)',
              transition: { duration: 0.5 }
            }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <motion.div
              animate={{
                x: shake % 2 === 0 ? 0 : [0, -10, 10, -10, 10, 0]
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 10 }}
              className="glass"
              style={{
                width: '420px',
                padding: '50px',
                borderRadius: '32px',
                textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <div style={{ marginBottom: '40px' }}>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  style={{
                    width: '80px',
                    height: '80px',
                    margin: '0 auto 25px',
                    background:
                      'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow:
                      '0 10px 40px rgba(99, 102, 241, 0.4)'
                  }}
                >
                  <Shield size={40} color="white" />
                </motion.div>

                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  style={{
                    fontSize: '28px',
                    fontWeight: '800',
                    letterSpacing: '-1px',
                    marginBottom: '8px',
                    background:
                      'linear-gradient(to right, #fff, #94a3b8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Yönetim Paneli
                </motion.h1>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '14px'
                  }}
                >
                  Roblox finansal verilerine güvenle erişin.
                </motion.p>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  style={{ position: 'relative' }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '16px',
                      left: '16px',
                      color: '#6366f1'
                    }}
                  >
                    <Shield size={18} />
                  </div>

                  <input
                    type="text"
                    placeholder="Grup ID"
                    value={groupId}
                    onChange={e => setGroupId(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className="no-drag"
                    style={{
                      width: '100%',
                      padding: '16px 16px 16px 45px',
                      borderRadius: '16px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(0,0,0,0.2)',
                      color: 'white',
                      fontSize: '14px',
                      transition: 'border-color 0.2s',
                      outline: 'none'
                    }}
                    onFocus={e => (e.target.style.borderColor = '#6366f1')}
                    onBlur={e =>
                      (e.target.style.borderColor =
                        'rgba(255,255,255,0.1)')
                    }
                  />
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  style={{ position: 'relative' }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '16px',
                      left: '16px',
                      color: '#6366f1'
                    }}
                  >
                    <Key size={18} />
                  </div>

                  <input
                    type="password"
                    placeholder="Cookie (.ROBLOSECURITY)"
                    value={cookie}
                    onChange={e => setCookie(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="no-drag"
                    style={{
                      width: '100%',
                      padding: '16px 16px 16px 45px',
                      borderRadius: '16px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(0,0,0,0.2)',
                      color: 'white',
                      fontSize: '14px',
                      transition: 'border-color 0.2s',
                      outline: 'none'
                    }}
                    onFocus={e => (e.target.style.borderColor = '#6366f1')}
                    onBlur={e =>
                      (e.target.style.borderColor =
                        'rgba(255,255,255,0.1)')
                    }
                  />
                </motion.div>

                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{
                    scale: 1.02,
                    boxShadow:
                      '0 0 20px rgba(99, 102, 241, 0.6)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => login(groupId, cookie)}
                  disabled={loading}
                  className="no-drag"
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    border: 'none',
                    background: '#6366f1',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '15px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow:
                      '0 4px 20px rgba(99, 102, 241, 0.4)',
                    transition: 'all 0.3s'
                  }}
                >
                  {loading ? (
                    <Loader2 className="spin" />
                  ) : (
                    <>
                      Bağlan <ChevronRight size={18} />
                    </>
                  )}
                </motion.button>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                      marginTop: '20px',
                      color: '#f87171',
                      fontSize: '13px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      padding: '12px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}
                  >
                    <AlertCircle size={16} /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {statusText && loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    marginTop: '20px',
                    color: '#818cf8',
                    fontSize: '13px',
                    fontWeight: 500
                  }}
                >
                  {statusText}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1]
            }}
            style={{
              display: 'flex',
              width: '100%',
              height: '100%'
            }}
          >
            <Sidebar
              onRefresh={refresh}
              onReset={resetData}
              onLogout={logout}
              loading={loading}
              timer={timer}
            />

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                position: 'relative'
              }}
            >
              <Dashboard
                transactions={transactions}
                stats={stats}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
