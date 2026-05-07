import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabase'

export default function Market() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pred, setPred] = useState<any>(null)
  const [votes, setVotes] = useState<any[]>([])
  const [myVote, setMyVote] = useState<number>(50)
  const [submitted, setSubmitted] = useState(false)
  const [communityProb, setCommunityProb] = useState(50)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [chartData, setChartData] = useState<{ time: string; prob: number; label: string }[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

  useEffect(() => { fetchData() }, [id])

  const fetchData = async () => {
    const { data: predData } = await supabase.from('predictions').select('*').eq('id', id).single()
    if (!predData) { navigate('/feed'); return }
    setPred(predData)

    const { data: votesData } = await supabase.from('votes').select('*').eq('prediction_id', id).order('created_at', { ascending: true })
    setVotes(votesData || [])

    if (votesData && votesData.length > 0) {
      const avg = votesData.reduce((s: number, v: any) => s + v.probability, 0) / votesData.length
      setCommunityProb(Math.round(avg))

      // Build chart — starting point + each vote
      const points = [{ time: new Date(predData.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), prob: predData.confidence, label: 'Start' }]
      votesData.forEach((v: any, i: number) => {
        const running = Math.round(votesData.slice(0, i + 1).reduce((s: number, x: any) => s + x.probability, 0) / (i + 1))
        points.push({ time: new Date(v.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), prob: running, label: `${i + 1} vote${i > 0 ? 's' : ''}` })
      })
      setChartData(points)
    } else {
      setCommunityProb(predData.confidence)
      setChartData([
        { time: new Date(predData.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), prob: predData.confidence, label: 'Start' },
        { time: 'Now', prob: predData.confidence, label: 'Current' }
      ])
    }

    // Auth
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      let { data: u } = await supabase.from('users').select('id, username').eq('email', user.email).single()
      if (!u) {
        const { data: newU } = await supabase.from('users').upsert({ email: user.email, username: user.email.split('@')[0] }, { onConflict: 'email' }).select('id, username').single()
        u = newU
      }
      setCurrentUser(u)
      if (u && votesData) {
        const existing = votesData.find((v: any) => v.user_id === u.id)
        if (existing) { setMyVote(existing.probability); setSubmitted(true) }
      }
    }

    // Comments
    const { data: commentsData } = await supabase.from('comments').select('*, users(username)').eq('prediction_id', id).order('created_at', { ascending: true })
    setComments(commentsData || [])
    setLoading(false)
  }

  useEffect(() => {
    if (!pred) return
    const timer = setInterval(() => {
      const diff = new Date(pred.resolution_date).getTime() - Date.now()
      if (diff > 0) setTimeLeft({ days: Math.floor(diff / 86400000), hours: Math.floor((diff / 3600000) % 24), minutes: Math.floor((diff / 60000) % 60), seconds: Math.floor((diff / 1000) % 60) })
    }, 1000)
    return () => clearInterval(timer)
  }, [pred])

  const handleVote = async (probability: number) => {
    if (!currentUser) { navigate('/auth'); return }
    setMyVote(probability)
    const { error } = await supabase.from('votes').upsert({ prediction_id: id, user_id: currentUser.id, probability }, { onConflict: 'prediction_id,user_id' })
    if (!error) {
      setSubmitted(true)
      const allVotes = [...votes.filter((v: any) => v.user_id !== currentUser.id), { probability }]
      setCommunityProb(Math.round(allVotes.reduce((s: number, v: any) => s + v.probability, 0) / allVotes.length))
    }
  }

  const submitComment = async () => {
    if (!newComment.trim() || !currentUser) return
    setSubmittingComment(true)
    const { data } = await supabase.from('comments').insert({ prediction_id: id, user_id: currentUser.id, content: newComment.trim() }).select('*, users(username)').single()
    if (data) { setComments(prev => [...prev, data]); setNewComment('') }
    setSubmittingComment(false)
  }

  // Polymarket-style SVG chart
  const ProbChart = () => {
    if (chartData.length < 2) return null
    const W = 500, H = 160, PAD = { top: 20, right: 20, bottom: 36, left: 44 }
    const IW = W - PAD.left - PAD.right
    const IH = H - PAD.top - PAD.bottom
    const probs = chartData.map(d => d.prob)
    const minP = Math.max(0, Math.min(...probs) - 8)
    const maxP = Math.min(100, Math.max(...probs) + 8)
    const xS = (i: number) => PAD.left + (i / (chartData.length - 1)) * IW
    const yS = (p: number) => PAD.top + IH - ((p - minP) / (maxP - minP)) * IH
    const pts = chartData.map((d, i) => `${xS(i)},${yS(d.prob)}`).join(' ')
    const area = `${PAD.left},${PAD.top + IH} ${pts} ${xS(chartData.length - 1)},${PAD.top + IH}`
    const lastProb = chartData[chartData.length - 1].prob
    const trend = chartData.length > 1 ? lastProb - chartData[0].prob : 0
    const lineColor = lastProb >= 60 ? '#00ff88' : lastProb >= 40 ? '#00B4D8' : '#ff4444'
    const gridProbs = [25, 50, 75]

    return (
      <div style={{ background: '#0a1628', borderRadius: '12px', padding: '16px 8px 8px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px 12px' }}>
          <div>
            <span style={{ fontSize: '13px', color: '#6b7f99', fontWeight: 600 }}>Probability over time</span>
            {trend !== 0 && (
              <span style={{ marginLeft: '10px', fontSize: '12px', fontWeight: 700, color: trend > 0 ? '#00ff88' : '#ff4444' }}>
                {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}%
              </span>
            )}
          </div>
          <span style={{ fontSize: '12px', color: '#3a5070' }}>{votes.length} vote{votes.length !== 1 ? 's' : ''}</span>
        </div>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridProbs.map(p => (
            <g key={p}>
              <line x1={PAD.left} y1={yS(p)} x2={W - PAD.right} y2={yS(p)} stroke="#1a3050" strokeWidth="1" strokeDasharray="4 4" />
              <text x={PAD.left - 6} y={yS(p) + 4} fill="#3a5070" fontSize="10" textAnchor="end">{p}%</text>
            </g>
          ))}

          {/* 50% line highlight */}
          <line x1={PAD.left} y1={yS(50)} x2={W - PAD.right} y2={yS(50)} stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.15" />

          {/* Area fill */}
          <polygon points={area} fill="url(#areaGrad)" />

          {/* Line */}
          <polyline points={pts} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

          {/* Data points — show on hover */}
          {chartData.map((d, i) => (
            <g key={i}>
              <circle
                cx={xS(i)} cy={yS(d.prob)} r={hoveredPoint === i ? 6 : 4}
                fill={hoveredPoint === i ? lineColor : '#0a1628'}
                stroke={lineColor} strokeWidth="2"
                style={{ cursor: 'pointer', transition: 'r 0.15s' }}
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              {/* Tooltip */}
              {hoveredPoint === i && (
                <g>
                  <rect x={xS(i) - 28} y={yS(d.prob) - 30} width="56" height="22" rx="4" fill="#0d1f35" stroke={lineColor} strokeWidth="1" />
                  <text x={xS(i)} y={yS(d.prob) - 15} fill={lineColor} fontSize="11" fontWeight="700" textAnchor="middle">{d.prob}%</text>
                </g>
              )}
            </g>
          ))}

          {/* X axis labels */}
          <text x={PAD.left} y={H - 6} fill="#3a5070" fontSize="10" textAnchor="start">{chartData[0].time}</text>
          <text x={W - PAD.right} y={H - 6} fill="#3a5070" fontSize="10" textAnchor="end">{chartData[chartData.length - 1].time}</text>
        </svg>
      </div>
    )
  }

  if (loading) return <div style={{ backgroundColor: '#0a1628', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7f99' }}>Loading...</div>
  if (!pred) return null

  const yesProb = communityProb
  const noProb = 100 - communityProb

  return (
    <div style={{ backgroundColor: '#0a1628', minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        {/* Back */}
        <button onClick={() => navigate('/feed')} style={{ background: 'none', border: 'none', color: '#6b7f99', cursor: 'pointer', fontSize: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '6px' }}>← Back to Feed</button>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          {pred.image_url && (
            <div style={{ height: '200px', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px', position: 'relative' }}>
              <img src={pred.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, #0a1628 100%)' }} />
            </div>
          )}
          <span style={{ background: '#0a1f35', border: '1px solid #1a3a5c', color: '#00B4D8', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, marginBottom: '12px', display: 'inline-block' }}>{pred.category}</span>
          <h1 style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: 900, margin: 0, lineHeight: 1.3, color: '#ffffff' }}>{pred.question}</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>

          {/* LEFT */}
          <div>
            {/* Community prob */}
            <div style={{ background: '#0d1f35', border: '1px solid #1a3050', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', color: '#6b7f99', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>Community Probability</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '56px', fontWeight: 900, color: yesProb >= 60 ? '#00ff88' : yesProb >= 40 ? '#00B4D8' : '#ff4444', lineHeight: 1 }}>{yesProb}%</span>
                <span style={{ color: '#6b7f99', fontSize: '16px' }}>YES</span>
                <span style={{ color: '#6b7f99', fontSize: '16px', marginLeft: '8px' }}>{noProb}%</span>
                <span style={{ color: '#6b7f99', fontSize: '16px' }}>NO</span>
              </div>
              <div style={{ background: '#ff444430', borderRadius: '8px', height: '10px', overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(90deg, #00ff88, #00B4D8)', width: `${yesProb}%`, height: '100%', borderRadius: '8px', transition: 'width 0.5s' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ fontSize: '12px', color: '#00ff88', fontWeight: 700 }}>YES {yesProb}%</span>
                <span style={{ fontSize: '12px', color: '#ff4444', fontWeight: 700 }}>NO {noProb}%</span>
              </div>
            </div>

            {/* CHART */}
            <div style={{ background: '#0d1f35', border: '1px solid #1a3050', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
              <ProbChart />
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {[{ label: 'Total Votes', value: votes.length }, { label: 'Resolves', value: new Date(pred.resolution_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }, { label: 'Status', value: pred.status?.toUpperCase() }].map(s => (
                <div key={s.label} style={{ background: '#0d1f35', border: '1px solid #1a3050', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#6b7f99', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>{s.label}</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Time remaining */}
            <div style={{ background: '#0d1f35', border: '1px solid #1a3050', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', color: '#6b7f99', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '14px' }}>Time Remaining</div>
              <div style={{ display: 'flex', gap: '20px' }}>
                {[{ v: timeLeft.days, l: 'DAYS' }, { v: timeLeft.hours, l: 'HRS' }, { v: timeLeft.minutes, l: 'MIN' }, { v: timeLeft.seconds, l: 'SEC' }].map(t => (
                  <div key={t.l} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>{String(t.v).padStart(2, '0')}</div>
                    <div style={{ fontSize: '11px', color: '#00B4D8', fontWeight: 700, marginTop: '4px' }}>{t.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div style={{ background: '#0d1f35', border: '1px solid #1a3050', borderRadius: '16px', padding: '20px' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Comments <span style={{ color: '#3a5070', fontSize: '14px', fontWeight: 400 }}>({comments.length})</span></div>
              {currentUser && (
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#00B4D8,#0077B6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                    {currentUser?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Share your analysis..." rows={2}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment() } }}
                      style={{ width: '100%', background: '#0a1628', border: '1px solid #1a3050', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '14px', resize: 'none', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                    <button onClick={submitComment} disabled={!newComment.trim() || submittingComment}
                      style={{ marginTop: '8px', background: '#00B4D8', border: 'none', color: '#000', padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', opacity: !newComment.trim() ? 0.5 : 1 }}>
                      {submittingComment ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {comments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: '#3a5070', fontSize: '14px' }}>No comments yet. Be the first to share your analysis.</div>
                ) : comments.map((c: any) => (
                  <div key={c.id} style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#00B4D8,#0077B6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                      {c.users?.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div style={{ flex: 1, background: '#0a1628', border: '1px solid #1a3050', borderRadius: '10px', padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#00B4D8' }}>{c.users?.username || 'Anonymous'}</span>
                        <span style={{ fontSize: '11px', color: '#3a5070' }}>{new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <p style={{ fontSize: '14px', color: '#c0d0e0', margin: 0, lineHeight: 1.6 }}>{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — Vote panel */}
          <div style={{ background: '#0d1f35', border: '1px solid #1a3050', borderRadius: '16px', padding: '24px', position: 'sticky', top: '32px' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>{submitted ? 'Update your forecast' : 'Make your forecast'}</div>

            {/* YES / NO buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
              <button onClick={() => handleVote(Math.max(myVote, 60))}
                style={{ background: myVote > 50 ? '#00ff8820' : '#0a1628', border: `2px solid ${myVote > 50 ? '#00ff88' : '#1a3050'}`, borderRadius: '12px', padding: '16px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s' }}>
                <div style={{ fontSize: '22px', fontWeight: 900, color: myVote > 50 ? '#00ff88' : '#6b7f99' }}>YES</div>
                <div style={{ fontSize: '14px', color: myVote > 50 ? '#00ff88' : '#6b7f99', fontWeight: 700 }}>{myVote > 50 ? myVote : 100 - myVote}¢</div>
              </button>
              <button onClick={() => handleVote(Math.min(myVote, 40))}
                style={{ background: myVote < 50 ? '#ff444420' : '#0a1628', border: `2px solid ${myVote < 50 ? '#ff4444' : '#1a3050'}`, borderRadius: '12px', padding: '16px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s' }}>
                <div style={{ fontSize: '22px', fontWeight: 900, color: myVote < 50 ? '#ff4444' : '#6b7f99' }}>NO</div>
                <div style={{ fontSize: '14px', color: myVote < 50 ? '#ff4444' : '#6b7f99', fontWeight: 700 }}>{myVote < 50 ? 100 - myVote : myVote}¢</div>
              </button>
            </div>

            {/* Slider */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#6b7f99' }}>Your probability</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#00B4D8' }}>{myVote}%</span>
              </div>
              <input type="range" min="1" max="99" value={myVote} onChange={e => setMyVote(Number(e.target.value))} style={{ width: '100%', accentColor: '#00B4D8' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{ fontSize: '11px', color: '#6b7f99' }}>NO 0%</span>
                <span style={{ fontSize: '11px', color: '#6b7f99' }}>YES 100%</span>
              </div>
            </div>

            <button onClick={() => handleVote(myVote)}
              style={{ width: '100%', padding: '16px', background: myVote > 50 ? '#00ff88' : myVote < 50 ? '#ff4444' : '#00B4D8', border: 'none', borderRadius: '12px', color: '#000', fontSize: '16px', fontWeight: 900, cursor: 'pointer', marginBottom: '12px' }}>
              {submitted ? 'Update Forecast' : 'Submit Forecast'}
            </button>

            {submitted && (
              <div style={{ background: '#00ff8815', border: '1px solid #00ff88', borderRadius: '10px', padding: '12px', textAlign: 'center', marginBottom: '12px' }}>
                <div style={{ color: '#00ff88', fontSize: '13px', fontWeight: 700 }}>✓ Forecast submitted — {myVote}% YES</div>
              </div>
            )}

            <div style={{ padding: '12px', background: '#0a1628', borderRadius: '10px', marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#6b7f99', textAlign: 'center' }}>Community average: <span style={{ color: '#00B4D8', fontWeight: 700 }}>{communityProb}% YES</span></div>
            </div>

            <button onClick={() => { const text = `I think there's a ${myVote}% chance: "${pred?.question}"`; window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`, '_blank') }}
              style={{ width: '100%', padding: '12px', background: '#1DA1F220', border: '1px solid #1DA1F240', borderRadius: '10px', color: '#1DA1F2', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              Share on X
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
