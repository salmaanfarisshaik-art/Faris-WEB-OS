import { useState, useEffect, useRef } from 'react'

const API = 'http://localhost:3001'

interface SystemStats {
  cpu: {
    cores: number
    model: string
    speed: number
    avgUsage: number
    usage: { core: number; usage: number }[]
  }
  memory: {
    total: number
    used: number
    free: number
    usedPercent: number
  }
  os: {
    platform: string
    arch: string
    hostname: string
    uptime: number
    type: string
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${d}d ${h}h ${m}m`
}

function getUsageColor(percent: number): string {
  if (percent < 40) return '#00ff88'
  if (percent < 70) return '#f59e0b'
  return '#ef4444'
}

export default function SystemMonitor() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [cpuHistory, setCpuHistory] = useState<number[]>(Array(30).fill(0))
  const [memHistory, setMemHistory] = useState<number[]>(Array(30).fill(0))
  const [activeTab, setActiveTab] = useState<'overview' | 'cpu' | 'memory' | 'os'>('overview')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/api/system/stats`)
      const data = await res.json()
      if (data.success) {
        setStats(data)
        setCpuHistory(prev => [...prev.slice(1), data.cpu.avgUsage])
        setMemHistory(prev => [...prev.slice(1), data.memory.usedPercent])
      }
    } catch {}
  }

  useEffect(() => {
    fetchStats()
    intervalRef.current = setInterval(fetchStats, 2000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  if (!stats) return (
    <div style={{
      height: '100%', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      color: '#484f58', fontSize: '13px', background: '#060810'
    }}>
      Loading system data...
    </div>
  )

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'cpu', label: 'CPU', icon: '⚡' },
    { id: 'memory', label: 'Memory', icon: '🧠' },
    { id: 'os', label: 'System', icon: '🖥️' },
  ]

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: '#060810', overflow: 'hidden',
    }}>
      {/* Tab Bar */}
      <div style={{
        display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: '#0d1117', flexShrink: 0, padding: '0 12px',
        gap: '4px',
      }}>
        {tabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '10px 16px', cursor: 'pointer',
              fontSize: '12px', fontWeight: 500,
              color: activeTab === tab.id ? '#f0f4ff' : '#6b7a99',
              borderBottom: activeTab === tab.id
                ? '2px solid #00ff88' : '2px solid transparent',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'color 0.15s',
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </div>
        ))}

        {/* Live indicator */}
        <div style={{
          marginLeft: 'auto', display: 'flex',
          alignItems: 'center', gap: '6px',
          fontSize: '11px', color: '#484f58',
        }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#00ff88',
            boxShadow: '0 0 6px #00ff88',
            animation: 'pulse 2s infinite',
          }} />
          LIVE
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Big stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <StatCard
                label="CPU Usage"
                value={`${stats.cpu.avgUsage}%`}
                subtext={`${stats.cpu.cores} cores`}
                percent={stats.cpu.avgUsage}
                color={getUsageColor(stats.cpu.avgUsage)}
                icon="⚡"
              />
              <StatCard
                label="Memory"
                value={`${stats.memory.usedPercent}%`}
                subtext={`${formatBytes(stats.memory.used)} / ${formatBytes(stats.memory.total)}`}
                percent={stats.memory.usedPercent}
                color={getUsageColor(stats.memory.usedPercent)}
                icon="🧠"
              />
            </div>

            {/* CPU Graph */}
            <GraphCard
              title="CPU History"
              data={cpuHistory}
              color="#00ff88"
              unit="%"
            />

            {/* Memory Graph */}
            <GraphCard
              title="Memory History"
              data={memHistory}
              color="#3b82f6"
              unit="%"
            />

            {/* Quick info */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
              gap: '8px',
            }}>
              {[
                { label: 'Hostname', value: stats.os.hostname },
                { label: 'Platform', value: stats.os.platform },
                { label: 'Uptime', value: formatUptime(stats.os.uptime) },
                { label: 'Free RAM', value: formatBytes(stats.memory.free) },
                { label: 'CPU Cores', value: `${stats.cpu.cores}` },
                { label: 'Arch', value: stats.os.arch },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ fontSize: '10px', color: '#484f58', marginBottom: '4px', letterSpacing: '0.5px' }}>
                    {label.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '13px', color: '#f0f4ff', fontWeight: 500 }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CPU TAB */}
        {activeTab === 'cpu' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              padding: '16px', background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontSize: '12px', color: '#484f58', marginBottom: '8px' }}>
                MODEL
              </div>
              <div style={{ fontSize: '14px', color: '#f0f4ff' }}>
                {stats.cpu.model}
              </div>
              <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>
                {stats.cpu.speed} MHz · {stats.cpu.cores} cores
              </div>
            </div>

            <GraphCard
              title={`CPU Usage — ${stats.cpu.avgUsage}% average`}
              data={cpuHistory}
              color="#00ff88"
              unit="%"
            />

            {/* Per core usage */}
            <div style={{
              padding: '16px', background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontSize: '12px', color: '#484f58', marginBottom: '12px', letterSpacing: '0.5px' }}>
                PER CORE
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {stats.cpu.usage.map(core => (
                  <div key={core.core}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      marginBottom: '4px', fontSize: '12px',
                    }}>
                      <span style={{ color: '#8b949e' }}>Core {core.core}</span>
                      <span style={{ color: getUsageColor(core.usage), fontWeight: 600 }}>
                        {core.usage}%
                      </span>
                    </div>
                    <div style={{
                      height: '6px', background: 'rgba(255,255,255,0.06)',
                      borderRadius: '3px', overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%', width: `${core.usage}%`,
                        background: getUsageColor(core.usage),
                        borderRadius: '3px',
                        boxShadow: `0 0 8px ${getUsageColor(core.usage)}`,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MEMORY TAB */}
        {activeTab === 'memory' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <StatCard
              label="Memory Usage"
              value={`${stats.memory.usedPercent}%`}
              subtext={`${formatBytes(stats.memory.used)} used of ${formatBytes(stats.memory.total)}`}
              percent={stats.memory.usedPercent}
              color={getUsageColor(stats.memory.usedPercent)}
              icon="🧠"
            />

            <GraphCard
              title={`Memory History — ${stats.memory.usedPercent}% used`}
              data={memHistory}
              color="#3b82f6"
              unit="%"
            />

            {/* Memory breakdown */}
            <div style={{
              padding: '16px', background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontSize: '12px', color: '#484f58', marginBottom: '12px', letterSpacing: '0.5px' }}>
                BREAKDOWN
              </div>

              {[
                { label: 'Total', value: formatBytes(stats.memory.total), color: '#8b949e', percent: 100 },
                { label: 'Used', value: formatBytes(stats.memory.used), color: '#3b82f6', percent: stats.memory.usedPercent },
                { label: 'Free', value: formatBytes(stats.memory.free), color: '#00ff88', percent: 100 - stats.memory.usedPercent },
              ].map(item => (
                <div key={item.label} style={{ marginBottom: '12px' }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginBottom: '6px', fontSize: '13px',
                  }}>
                    <span style={{ color: '#8b949e' }}>{item.label}</span>
                    <span style={{ color: item.color, fontWeight: 600 }}>{item.value}</span>
                  </div>
                  <div style={{
                    height: '8px', background: 'rgba(255,255,255,0.06)',
                    borderRadius: '4px', overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', width: `${item.percent}%`,
                      background: item.color,
                      borderRadius: '4px',
                      boxShadow: `0 0 8px ${item.color}44`,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OS TAB */}
        {activeTab === 'os' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Operating System', value: stats.os.type },
              { label: 'Platform', value: stats.os.platform },
              { label: 'Architecture', value: stats.os.arch },
              { label: 'Hostname', value: stats.os.hostname },
              { label: 'System Uptime', value: formatUptime(stats.os.uptime) },
              { label: 'CPU Model', value: stats.cpu.model },
              { label: 'CPU Cores', value: `${stats.cpu.cores} cores @ ${stats.cpu.speed} MHz` },
              { label: 'Total Memory', value: formatBytes(stats.memory.total) },
            ].map(({ label, value }) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '12px 16px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <span style={{ fontSize: '13px', color: '#6b7a99' }}>{label}</span>
                <span style={{ fontSize: '13px', color: '#f0f4ff', fontWeight: 500 }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ label, value, subtext, percent, color, icon }: {
  label: string; value: string; subtext: string
  percent: number; color: string; icon: string
}) {
  return (
    <div style={{
      padding: '16px', background: 'rgba(255,255,255,0.03)',
      borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#484f58', letterSpacing: '0.5px', marginBottom: '4px' }}>
            {label.toUpperCase()}
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color, lineHeight: 1 }}>
            {value}
          </div>
          <div style={{ fontSize: '11px', color: '#6b7a99', marginTop: '4px' }}>
            {subtext}
          </div>
        </div>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: `${color}15`,
          border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px',
        }}>
          {icon}
        </div>
      </div>
      {/* Progress bar */}
      <div style={{
        height: '6px', background: 'rgba(255,255,255,0.06)',
        borderRadius: '3px', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${percent}%`,
          background: color, borderRadius: '3px',
          boxShadow: `0 0 8px ${color}`,
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  )
}

// Graph Card Component
function GraphCard({ title, data, color, unit }: {
  title: string; data: number[]; color: string; unit: string
}) {
  const max = 100
  const height = 80

  return (
    <div style={{
      padding: '16px', background: 'rgba(255,255,255,0.03)',
      borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{
        fontSize: '12px', color: '#484f58',
        letterSpacing: '0.5px', marginBottom: '12px',
      }}>
        {title.toUpperCase()}
      </div>
      <svg width="100%" height={height} style={{ overflow: 'visible' }}>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(pct => (
          <line
            key={pct}
            x1="0" y1={height - (pct / max) * height}
            x2="100%" y2={height - (pct / max) * height}
            stroke="rgba(255,255,255,0.05)" strokeWidth="1"
          />
        ))}
        {/* Area fill */}
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polyline
          points={data.map((v, i) => {
            const x = (i / (data.length - 1)) * 100
            const y = height - (v / max) * height
            return `${x}%,${y}`
          }).join(' ')}
          fill={`url(#grad-${color})`}
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      {/* Labels */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        marginTop: '6px', fontSize: '10px', color: '#484f58',
      }}>
        <span>30s ago</span>
        <span>Now: {data[data.length - 1]}{unit}</span>
      </div>
    </div>
  )
}