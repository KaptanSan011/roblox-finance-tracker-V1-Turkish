import { useState, useMemo, useTransition, memo, useCallback, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'
import { Wallet, TrendingUp, ArrowUpRight, Calendar, PiggyBank, Hourglass, Activity } from 'lucide-react'

// --- TİP TANIMLAMALARI ---
interface DashboardProps {
  transactions: any[]; 
  stats: { robux: number, pendingRobux: number } | null 
}

type FilterType = 'today' | 'yesterday' | 'this_month' | '7' | '30' | 'all';

// --- FORMATLAYICILAR ---
const TR_DATE_FORMATTER = new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul', year: 'numeric', month: 'short', day: 'numeric' });
const TR_TIME_FORMATTER = new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit', hour12: false });

// =================================================================================================
// 🚀 ALT BİLEŞENLER
// =================================================================================================

// --- COUNT UP (SAYAÇ) BİLEŞENİ ---
const CountUp = ({ value, prefix = "", suffix = "" }: { value: number, prefix?: string, suffix?: string }) => {
    const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
    const display = useTransform(spring, (current) => 
        `${prefix}${Math.round(current).toLocaleString('tr-TR')}${suffix}`
    );

    useEffect(() => {
        spring.set(value);
    }, [value, spring]);

    return <motion.span>{display}</motion.span>;
};

// YENİ: Boş Durum Bileşeni (Görsel Zenginlik İçin)
const EmptyState = memo(({ message }: { message: string }) => (
    <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: 'var(--text-muted)',
        padding: '40px',
        opacity: 0.7,
        minHeight: '200px' // Yükseklik garantisi
    }}>
        <div style={{ 
            width: '60px', height: '60px', borderRadius: '50%', 
            background: 'rgba(255,255,255,0.03)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '15px'
        }}>
            <Calendar size={24} color="#71717a" />
        </div>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>{message}</p>
        <p style={{ margin: '5px 0 0 0', fontSize: '12px', opacity: 0.5 }}>İşlem geçmişi bulunamadı.</p>
    </div>
));

// 1. İstatistik Kartı
const StatCard = memo(({ title, value, sub, icon, color, delay, isCurrency = false }: any) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: delay, duration: 0.4, ease: "easeOut" }}
        className="glass" 
        style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}
    >
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '100px', height: '100px', background: color, filter: 'blur(60px)', opacity: 0.15 }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px', position: 'relative', zIndex: 2 }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>{icon}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <ArrowUpRight size={12} /> <span style={{fontWeight: 600}}>Canlı</span>
            </div>
        </div>
        <div style={{ position: 'relative', zIndex: 2 }}>
            <h3 style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.5px' }}>{title}</h3>
            <div style={{ fontSize: '28px', fontWeight: '700', margin: '6px 0', letterSpacing: '-0.5px', color: '#fff' }}>
                {typeof value === 'number' ? <CountUp value={value} prefix={isCurrency ? "R$ " : ""} /> : value}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{sub}</div>
        </div>
    </motion.div>
));

// 2. Grafik Tooltip
const CustomTooltip = memo(({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass" style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', minWidth: '120px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', marginBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>{label}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
             <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Gelir:</span>
             <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
                {payload[0].value} <span style={{color: '#6366f1', fontSize: '12px'}}>R$</span>
             </p>
          </div>
        </div>
      );
    }
    return null;
});

// 3. Filtre Butonu
const FilterButton = memo(({ label, value, isActive, onClick }: { label: string, value: FilterType, isActive: boolean, onClick: (val: FilterType) => void }) => (
    <button 
        onClick={() => onClick(value)} 
        className="no-drag"
        style={{ 
            padding: '6px 16px', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            background: isActive ? '#27272a' : 'transparent', 
            color: isActive ? '#fff' : '#71717a', 
            transition: 'all 0.2s ease',
            boxShadow: isActive ? '0 2px 10px rgba(0,0,0,0.2)' : 'none'
        }}
    >
        {label}
    </button>
));

// =================================================================================================
// 🧠 ANA DASHBOARD BİLEŞENİ
// =================================================================================================

const Dashboard = ({ transactions, stats }: DashboardProps) => {
  const [tlRate, setTlRate] = useState(0.25)
  const [filter, setFilter] = useState<FilterType>('today')
  // isPending kullanılmadığı için kaldırıldı, sadece startTransition alındı
  const [, startTransition] = useTransition()

  // --- 1. VERİ İŞLEME ---
  const processedTransactions = useMemo(() => {
    return transactions.map((t) => {
        const rawDate = t.created.endsWith('Z') ? t.created : t.created + 'Z';
        const dateObj = new Date(rawDate);
        return {
            ...t, 
            timestamp: dateObj.getTime(), 
            dateStr: TR_DATE_FORMATTER.format(dateObj), 
            timeStr: TR_TIME_FORMATTER.format(dateObj)
        };
    }).sort((a, b) => b.timestamp - a.timestamp);
  }, [transactions]);

  // --- 2. FİLTRELEME ---
  const filteredData = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.toLocaleDateString('en-US', { timeZone: 'Europe/Istanbul' })).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return processedTransactions.filter(item => {
        const ts = item.timestamp;
        switch (filter) {
            case 'today': return ts >= startOfToday;
            case 'yesterday': return ts >= (startOfToday - 86400000) && ts < startOfToday;
            case 'this_month': return ts >= startOfMonth;
            case '7': return ts >= (now.getTime() - 7 * 86400000);
            case '30': return ts >= (now.getTime() - 30 * 86400000);
            default: return true;
        }
    });
  }, [processedTransactions, filter]);

  // --- 3. GRAFİK VERİSİ ---
  const chartData = useMemo(() => {
    const grouped: { [key: string]: any } = {}
    const dataForChart = [...filteredData].reverse(); 
    
    dataForChart.forEach((item) => {
      let key, sortTime;
      if (filter === 'today' || filter === 'yesterday') {
          key = item.timeStr.split(':')[0] + ":00"; 
          sortTime = parseInt(key.split(':')[0]);
      } else {
          key = item.dateStr; 
          sortTime = item.timestamp;
      }
      
      if (!grouped[key]) grouped[key] = { name: key, robux: 0, sortTime: sortTime };
      grouped[key].robux += item.currency.amount;
    })
    
    return Object.values(grouped).sort((a: any, b: any) => a.sortTime - b.sortTime);
  }, [filteredData, filter])

  // --- 4. TOPLAM HESAPLAMA ---
  const totalFilteredRobux = useMemo(() => filteredData.reduce((acc, curr) => acc + curr.currency.amount, 0), [filteredData])

  const handleFilterChange = useCallback((val: FilterType) => {
      startTransition(() => { setFilter(val); });
  }, []);

  const formatTRY = (amount: number) => {
      return `≈ ₺ ${(amount * tlRate).toLocaleString(undefined, {minimumFractionDigits: 2})}`;
  }

  // --- RENDER ---
  return (
    <div style={{ padding: '30px', maxWidth: '1800px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. ÜST KARTLAR */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
         <StatCard 
            title="Kasadaki Nakit" 
            value={stats ? stats.robux : 0} 
            isCurrency={true}
            sub={stats ? formatTRY(stats.robux) : '...'}
            icon={<PiggyBank size={24} color="#6366f1" />} color="#6366f1" delay={0.1}
         />
         <StatCard 
            title="Bekleyen Bakiye" 
            value={stats ? stats.pendingRobux : 0} 
            isCurrency={true}
            sub={stats ? formatTRY(stats.pendingRobux) : '...'}
            icon={<Hourglass size={24} color="#f59e0b" />} color="#f59e0b" delay={0.2}
         />
         <StatCard 
             title="Seçili Dönem Satışı" 
             value={totalFilteredRobux}
             isCurrency={true}
             sub={formatTRY(totalFilteredRobux)}
             icon={<Wallet size={24} color="#10b981" />} color="#10b981" delay={0.3}
         />
         
         {/* Kur Ayarı */}
         <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} 
            className="glass" style={{ padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
             <div>
                <h3 style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Kur Ayarı (1K R$)</h3>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
                    <span style={{ fontSize: '20px', color: 'var(--text-muted)', marginRight: '5px' }}>₺</span>
                    <input type="number" step="0.01" value={tlRate} onChange={(e) => setTlRate(parseFloat(e.target.value))} 
                    className="no-drag" style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '28px', fontWeight: 'bold', width: '100px', outline: 'none' }} />
                </div>
             </div>
             <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '50%' }}><TrendingUp size={24} color="#ec4899"/></div>
         </motion.div>
      </div>

      {/* 2. ORTA BÖLÜM */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', flex: 1, minHeight: 0 }}>
         
         {/* Grafik */}
         <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} 
            className="glass" style={{ borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '8px' }}><Activity size={18} color="#6366f1"/></div>
                    <span style={{ fontWeight: '600', fontSize: '16px' }}>Satış Performansı</span>
                </div>
                <div className="no-drag" style={{ background: '#18181b', padding: '4px', borderRadius: '12px', display: 'flex', gap: '4px' }}>
                    <FilterButton label="Bugün" value="today" isActive={filter === 'today'} onClick={handleFilterChange} />
                    <FilterButton label="Hafta" value="7" isActive={filter === '7'} onClick={handleFilterChange} />
                    <FilterButton label="Ay" value="30" isActive={filter === '30'} onClick={handleFilterChange} />
                    <FilterButton label="Tümü" value="all" isActive={filter === 'all'} onClick={handleFilterChange} />
                </div>
            </div>

            <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="#52525b" tickLine={false} axisLine={false} dy={10} fontSize={12} minTickGap={30} />
                        <YAxis stroke="#52525b" tickLine={false} axisLine={false} dx={-10} fontSize={12} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                        <Area type="monotone" dataKey="robux" stroke="#6366f1" strokeWidth={3} fill="url(#colorGradient)" animationDuration={800} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
         </motion.div>

         {/* Liste */}
         <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} 
            className="glass" style={{ borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={18} color="#a1a1aa"/> İşlem Geçmişi
            </h3>

            {/* List Container: Flex Column eklendi ki EmptyState ortalansın */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px', display: 'flex', flexDirection: 'column' }}>
                <AnimatePresence mode='popLayout'>
                {filteredData.slice(0, 50).map((t, i) => (
                    <motion.div 
                        key={t.id || i} 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: i * 0.03, duration: 0.2 }} 
                        style={{ padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}
                    >
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>{i + 1}</div>
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#e4e4e7' }}>{t.dateStr}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>{t.timeStr}</div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#10b981', fontWeight: '700', fontSize: '14px' }}>+{t.currency.amount.toLocaleString()} R$</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Satış</div>
                        </div>
                    </motion.div>
                ))}
                </AnimatePresence>
                
                {/* YENİ: Boş Durum Bileşeni */}
                {filteredData.length === 0 && <EmptyState message="Bu tarihte işlem bulunamadı" />}
            </div>
         </motion.div>
      </div>
    </div>
  )
}

export default memo(Dashboard)