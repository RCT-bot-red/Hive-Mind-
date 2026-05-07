 
import{useState}from 'react'
import{supabase}from '../utils/supabase'
import{useNavigate}from 'react-router-dom'
export default function Auth(){
const[isLogin,setIsLogin]=useState(true)
const[email,setEmail]=useState('')
const[password,setPassword]=useState('')
const[username,setUsername]=useState('')
const[error,setError]=useState('')
const[loading,setLoading]=useState(false)
const navigate=useNavigate()
const s={width:'100%',padding:'13px',background:'#0a1628',border:'1px solid #1a3050',borderRadius:'10px',color:'#fff',fontSize:'15px',outline:'none',boxSizing:'border-box' as const,marginBottom:'16px'}
const handleSubmit=async(e:React.FormEvent)=>{
e.preventDefault()
setError('')
setLoading(true)
if(isLogin){
const{error}=await supabase.auth.signInWithPassword({email,password})
if(error){setError(error.message);setLoading(false);return}
navigate('/')
}else{
const{data,error}=await supabase.auth.signUp({email,password})
if(error){setError(error.message);setLoading(false);return}
if(data.user){
  await supabase.from('users').insert({email,username:email.split('@')[0],bio:'',accuracy_score:0,total_predictions:0,correct_predictions:0,resolved_predictions:0})
  navigate('/onboarding')
  return
}
navigate('/')
}
setLoading(false)
}
return(
<div style={{backgroundColor:'#0a1628',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'32px'}}>
<div style={{width:'100%',maxWidth:'420px'}}>
<div style={{textAlign:'center',marginBottom:'40px'}}>
<div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',marginBottom:'8px'}}>
<div style={{width:'36px',height:'36px',background:'#00B4D8',clipPath:'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)'}}/>
<span style={{fontSize:'24px',fontWeight:900,color:'#fff'}}>HiveMind</span>
</div>
<p style={{color:'#6b7f99',fontSize:'14px'}}>{isLogin?'Welcome back':'Join the prediction market'}</p>
</div>
<div style={{background:'#0d1f35',border:'1px solid #1a3050',borderRadius:'16px',padding:'36px'}}>
<h2 style={{fontSize:'22px',fontWeight:900,marginBottom:'28px',textAlign:'center',color:'#fff'}}>{isLogin?'Sign In':'Create Account'}</h2>
<form onSubmit={handleSubmit}>
{!isLogin&&<input type="text" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} style={s}/>}
<input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required style={s}/>
<input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required style={{...s,marginBottom:'24px'}}/>
{error&&<div style={{background:'#ff444420',border:'1px solid #ff4444',borderRadius:'8px',padding:'12px',marginBottom:'16px',color:'#ff4444',fontSize:'14px'}}>{error}</div>}
<button type="submit" disabled={loading} style={{width:'100%',padding:'14px',background:'#00B4D8',border:'none',borderRadius:'10px',color:'#000',fontSize:'16px',fontWeight:700,cursor:'pointer',marginBottom:'16px'}}>{loading?'Loading...':isLogin?'Sign In':'Create Account'}</button>
</form>
<div style={{textAlign:'center'}}>
<button onClick={()=>{setIsLogin(!isLogin);setError('')}} style={{background:'none',border:'none',color:'#00B4D8',cursor:'pointer',fontSize:'14px',fontWeight:600}}>{isLogin?"Don't have an account? Sign up":'Already have an account? Sign in'}</button>
</div>
</div>
</div>
</div>
)
}