import{useState,useEffect}from 'react'
import{useParams,useNavigate}from 'react-router-dom'
import{supabase}from '../utils/supabase'

export default function Market(){
const{id}=useParams()
const navigate=useNavigate()
const[pred,setPred]=useState<any>(null)
const[votes,setVotes]=useState<any[]>([])
const[myVote,setMyVote]=useState<number>(50)
const[submitted,setSubmitted]=useState(false)
const[communityProb,setCommunityProb]=useState(50)
const[loading,setLoading]=useState(true)
const[currentUser,setCurrentUser]=useState<any>(null)
const[timeLeft,setTimeLeft]=useState({days:0,hours:0,minutes:0,seconds:0})
const[chartData,setChartData]=useState<{time:string,prob:number}[]>([])

useEffect(()=>{fetchData()},[id])

const fetchData=async()=>{
const{data:predData}=await supabase.from('predictions').select('*').eq('id',id).single()
if(!predData){navigate('/feed');return}
setPred(predData)
const{data:votesData}=await supabase.from('votes').select('*').eq('prediction_id',id)
setVotes(votesData||[])
if(votesData&&votesData.length>0){
const avg=votesData.reduce((s:number,v:any)=>s+v.probability,0)/votesData.length
setCommunityProb(Math.round(avg))
}else{setCommunityProb(predData.confidence)}
const{data:{user}}=await supabase.auth.getUser()
if(user){
const{data:u}=await supabase.from('users').select('id').eq('email',user.email).single()
setCurrentUser(u)
if(u){const existing=votesData?.find((v:any)=>v.user_id===u.id);if(existing){setMyVote(existing.probability);setSubmitted(true)}}
}
// Build chart data from votes timeline
if(votesData && votesData.length > 0) {
  const sorted = [...votesData].sort((a:any,b:any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  const points: {time:string,prob:number}[] = []
  let running = 0
  sorted.forEach((v:any, i:number) => {
    running = Math.round(sorted.slice(0,i+1).reduce((s:number,x:any)=>s+x.probability,0)/(i+1))
    points.push({time: new Date(v.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric'}), prob: running})
  })
  // Add current point
  if(predData) points.unshift({time: new Date(predData.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric'}), prob: predData.confidence})
  setChartData(points)
}
setLoading(false)
}

useEffect(()=>{
if(!pred)return
const timer=setInterval(()=>{
const diff=new Date(pred.resolution_date).getTime()-Date.now()
if(diff>0){setTimeLeft({days:Math.floor(diff/86400000),hours:Math.floor((diff/3600000)%24),minutes:Math.floor((diff/60000)%60),seconds:Math.floor((diff/1000)%60)})}
},1000)
return()=>clearInterval(timer)
},[pred])

const handleVote=async()=>{
if(!currentUser){navigate('/auth');return}
if(submitted){
await supabase.from('votes').update({probability:myVote}).eq('prediction_id',id).eq('user_id',currentUser.id)
}else{
await supabase.from('votes').insert({prediction_id:id,user_id:currentUser.id,probability:myVote})
}
setSubmitted(true)
const newAvg=Math.round([...votes.filter((v:any)=>v.user_id!==currentUser.id),{probability:myVote}].reduce((s,v)=>s+v.probability,0)/([...votes.filter((v:any)=>v.user_id!==currentUser.id),{probability:myVote}].length))
setCommunityProb(newAvg)
}

// SVG Line Chart Component
const ProbChart = ({data}:{data:{time:string,prob:number}[]}) => {
  if(data.length < 2) return null
  const w = 500, h = 140, pad = {top:20,right:20,bottom:30,left:40}
  const iw = w - pad.left - pad.right
  const ih = h - pad.top - pad.bottom
  const minP = Math.max(0, Math.min(...data.map(d=>d.prob)) - 10)
  const maxP = Math.min(100, Math.max(...data.map(d=>d.prob)) + 10)
  const xScale = (i:number) => pad.left + (i / (data.length-1)) * iw
  const yScale = (p:number) => pad.top + ih - ((p - minP) / (maxP - minP)) * ih
  const points = data.map((d,i) => `${xScale(i)},${yScale(d.prob)}`).join(' ')
  const areaPoints = `${pad.left},${pad.top+ih} ${points} ${xScale(data.length-1)},${pad.top+ih}`
  const lastProb = data[data.length-1].prob
  const color = lastProb >= 60 ? '#00ff88' : lastProb >= 40 ? '#00B4D8' : '#ff4444'
  return (
    <div style={{background:'#0d1f35',border:'1px solid #1a3050',borderRadius:'16px',padding:'20px',marginBottom:'20px'}}>
      <div style={{fontSize:'13px',color:'#6b7f99',fontWeight:700,textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:'12px'}}>Probability Over Time</div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`}>
        {/* Grid lines */}
        {[25,50,75].map(p => (
          <g key={p}>
            <line x1={pad.left} y1={yScale(p)} x2={w-pad.right} y2={yScale(p)} stroke="#1a3050" strokeWidth="1" strokeDasharray="4"/>
            <text x={pad.left-6} y={yScale(p)+4} fill="#3a5070" fontSize="10" textAnchor="end">{p}%</text>
          </g>
        ))}
        {/* Area fill */}
        <polygon points={areaPoints} fill={color} opacity="0.08"/>
        {/* Line */}
        <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
        {/* Data points */}
        {data.map((d,i) => (
          <circle key={i} cx={xScale(i)} cy={yScale(d.prob)} r="4" fill={color} stroke="#0d1f35" strokeWidth="2"/>
        ))}
        {/* Last value label */}
        <text x={xScale(data.length-1)+8} y={yScale(lastProb)+4} fill={color} fontSize="12" fontWeight="700">{lastProb}%</text>
        {/* X axis labels */}
        {data.filter((_,i) => i === 0 || i === data.length-1).map((d,_,arr) => (
          <text key={d.time} x={d === arr[0] ? pad.left : xScale(data.length-1)} y={h-8} fill="#3a5070" fontSize="10" textAnchor={d === arr[0] ? "start" : "end"}>{d.time}</text>
        ))}
      </svg>
    </div>
  )
}

if(loading)return<div style={{backgroundColor:'#0a1628',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:'#6b7f99'}}>Loading...</div>
if(!pred)return null

const yesProb=communityProb
const noProb=100-communityProb

return(
<div style={{backgroundColor:'#0a1628',minHeight:'100vh',padding:'32px'}}>
<div style={{maxWidth:'1100px',margin:'0 auto'}}>

{/* Back */}
<button onClick={()=>navigate('/feed')} style={{background:'none',border:'none',color:'#6b7f99',cursor:'pointer',fontSize:'14px',marginBottom:'24px',display:'flex',alignItems:'center',gap:'6px'}}>
← Back to Feed
</button>

{/* Category */}
<div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
<span style={{background:'#0a1f35',border:'1px solid #1a3a5c',color:'#00B4D8',padding:'4px 12px',borderRadius:'12px',fontSize:'12px',fontWeight:700}}>{pred.category}</span>
</div>

{/* Title */}
<h1 style={{fontSize:'28px',fontWeight:900,marginBottom:'32px',lineHeight:1.3,maxWidth:'700px'}}>{pred.question}</h1>

<div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:'24px',alignItems:'start'}}>

{/* LEFT */}
<div>
{/* Community Probability */}
<div style={{background:'#0d1f35',border:'1px solid #1a3050',borderRadius:'16px',padding:'28px',marginBottom:'20px'}}>
<div style={{fontSize:'13px',color:'#6b7f99',fontWeight:700,textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:'16px'}}>Community Probability</div>
<div style={{display:'flex',alignItems:'baseline',gap:'12px',marginBottom:'20px'}}>
<span style={{fontSize:'56px',fontWeight:900,color:'#00ff88',lineHeight:1}}>{yesProb}%</span>
<span style={{fontSize:'20px',color:'#6b7f99'}}>YES</span>
<span style={{fontSize:'20px',color:'#6b7f99',marginLeft:'16px'}}>{noProb}%</span>
<span style={{fontSize:'20px',color:'#6b7f99'}}>NO</span>
</div>
{/* Bar */}
<div style={{background:'#ff444440',borderRadius:'8px',height:'12px',overflow:'hidden'}}>
<div style={{background:'linear-gradient(90deg,#00ff88,#00B4D8)',width:`${yesProb}%`,height:'100%',borderRadius:'8px',transition:'width 0.5s'}}/>
</div>
<div style={{display:'flex',justifyContent:'space-between',marginTop:'8px'}}>
<span style={{fontSize:'12px',color:'#00ff88',fontWeight:700}}>YES {yesProb}%</span>
<span style={{fontSize:'12px',color:'#ff4444',fontWeight:700}}>NO {noProb}%</span>
</div>
</div>

{/* Stats */}
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px',marginBottom:'20px'}}>
{[
{label:'Total Votes',value:votes.length},
{label:'Resolves',value:new Date(pred.resolution_date).toLocaleDateString()},
{label:'Status',value:pred.status.toUpperCase()}
].map(s=>(
<div key={s.label} style={{background:'#0d1f35',border:'1px solid #1a3050',borderRadius:'12px',padding:'16px',textAlign:'center'}}>
<div style={{fontSize:'11px',color:'#6b7f99',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'6px'}}>{s.label}</div>
<div style={{fontSize:'18px',fontWeight:700,color:'#ffffff'}}>{s.value}</div>
</div>
))}
</div>

{/* Countdown */}
<ProbChart data={chartData}/>
<div style={{background:'#0d1f35',border:'1px solid #1a3050',borderRadius:'16px',padding:'24px'}}>
<div style={{fontSize:'13px',color:'#6b7f99',fontWeight:700,textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:'16px'}}>Time Remaining</div>
<div style={{display:'flex',gap:'16px'}}>
{[
{v:timeLeft.days,l:'DAYS'},
{v:timeLeft.hours,l:'HRS'},
{v:timeLeft.minutes,l:'MIN'},
{v:timeLeft.seconds,l:'SEC'}
].map(t=>(
<div key={t.l} style={{textAlign:'center'}}>
<div style={{fontSize:'32px',fontWeight:900,color:'#ffffff',lineHeight:1}}>{String(t.v).padStart(2,'0')}</div>
<div style={{fontSize:'11px',color:'#00B4D8',fontWeight:700,marginTop:'4px'}}>{t.l}</div>
</div>
))}
</div>
</div>
</div>

{/* RIGHT — Vote Panel */}
<div style={{background:'#0d1f35',border:'1px solid #1a3050',borderRadius:'16px',padding:'24px',position:'sticky',top:'32px'}}>
<div style={{fontSize:'15px',fontWeight:700,marginBottom:'20px',color:'#ffffff'}}>
{submitted?'Update your forecast':'Submit your forecast'}
</div>

{/* YES/NO big buttons */}
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'24px'}}>
<button onClick={()=>setMyVote(Math.min(99,myVote+10))} style={{background:myVote>50?'#00ff8820':'#0a1628',border:`2px solid ${myVote>50?'#00ff88':'#1a3050'}`,borderRadius:'12px',padding:'16px',cursor:'pointer',transition:'all 0.2s'}}>
<div style={{fontSize:'22px',fontWeight:900,color:myVote>50?'#00ff88':'#6b7f99'}}>YES</div>
<div style={{fontSize:'14px',color:myVote>50?'#00ff88':'#6b7f99',fontWeight:700}}>{myVote}¢</div>
</button>
<button onClick={()=>setMyVote(Math.max(1,myVote-10))} style={{background:myVote<50?'#ff444420':'#0a1628',border:`2px solid ${myVote<50?'#ff4444':'#1a3050'}`,borderRadius:'12px',padding:'16px',cursor:'pointer',transition:'all 0.2s'}}>
<div style={{fontSize:'22px',fontWeight:900,color:myVote<50?'#ff4444':'#6b7f99'}}>NO</div>
<div style={{fontSize:'14px',color:myVote<50?'#ff4444':'#6b7f99',fontWeight:700}}>{100-myVote}¢</div>
</button>
</div>

{/* Slider */}
<div style={{marginBottom:'20px'}}>
<div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
<span style={{fontSize:'13px',color:'#6b7f99'}}>Your probability</span>
<span style={{fontSize:'16px',fontWeight:900,color:myVote>50?'#00ff88':myVote<50?'#ff4444':'#ffffff'}}>{myVote}%</span>
</div>
<input type="range" min="1" max="99" value={myVote} onChange={e=>setMyVote(Number(e.target.value))} style={{width:'100%',accentColor:'#00B4D8',cursor:'pointer'}}/>
<div style={{display:'flex',justifyContent:'space-between',marginTop:'4px'}}>
<span style={{fontSize:'11px',color:'#ff4444',fontWeight:700}}>NO 0%</span>
<span style={{fontSize:'11px',color:'#00ff88',fontWeight:700}}>YES 100%</span>
</div>
</div>

{/* Submit */}
<button onClick={handleVote} style={{width:'100%',padding:'16px',background:myVote>50?'#00ff88':myVote<50?'#ff4444':'#00B4D8',border:'none',borderRadius:'12px',color:'#000000',fontSize:'16px',fontWeight:900,cursor:'pointer',marginBottom:'16px'}}>
{submitted?'Update Forecast':myVote>50?`Vote YES — ${myVote}%`:`Vote NO — ${100-myVote}%`}
</button>

{submitted&&(
<div style={{background:'#00ff8815',border:'1px solid #00ff88',borderRadius:'10px',padding:'12px',textAlign:'center'}}>
<div style={{color:'#00ff88',fontSize:'13px',fontWeight:700}}>✓ Forecast submitted — {myVote}% YES</div>
</div>
)}

<div style={{marginTop:'16px',padding:'12px',background:'#0a1628',borderRadius:'10px'}}>
<div style={{fontSize:'12px',color:'#6b7f99',textAlign:'center'}}>Community average: <span style={{color:'#00B4D8',fontWeight:700}}>{communityProb}% YES</span></div>
</div>
<button onClick={()=>{const text=`I think there's a ${myVote}% chance: "${pred?.question}" — HiveMind prediction market`;window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}} style={{marginTop:'12px',width:'100%',padding:'12px',background:'#1DA1F220',border:'1px solid #1DA1F240',borderRadius:'10px',color:'#1DA1F2',fontSize:'13px',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{marginRight:"6px"}}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> Share on X
</button>
<div style={{display:'none'}}>
</div>
</div>

</div>
</div>
</div>
)
}