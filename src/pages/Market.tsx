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
  <span>🐦</span> Share on Twitter
</button>
<div style={{display:'none'}}>
</div>
</div>

</div>
</div>
</div>
)
}