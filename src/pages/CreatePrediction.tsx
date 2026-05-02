import { useState } from 'react'
import { supabase } from '../utils/supabase'
import { useNavigate } from 'react-router-dom'

export default function CreatePrediction() {
  const [question, setQuestion] = useState('')
  const [category, setCategory] = useState('')
  const [confidence, setConfidence] = useState(50)
  const [resolutionDate, setResolutionDate] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase
        .from('predictions')
        .insert({
          question,
          category,
          confidence,
          resolution_date: resolutionDate,
          user_id: user.id
        })

      if (!error) {
        navigate('/feed')
      }
    }
  }

  const categories = ['Politics', 'Sports', 'Technology', 'Economy', 'Other']

  return (
    <div style={{ backgroundColor: '#1A3C5E', color: 'white', minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>Create Prediction</h1>
        <form onSubmit={handleSubmit} style={{
          backgroundColor: '#2A4A6E',
          padding: '30px',
          borderRadius: '10px',
          border: '2px solid #00B4D8'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'white' }}>Question</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              placeholder="What do you predict will happen?"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#1A3C5E',
                color: 'white',
                border: '2px solid #00B4D8',
                borderRadius: '5px',
                fontSize: '16px'
              }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'white' }}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#1A3C5E',
                color: 'white',
                border: '2px solid #00B4D8',
                borderRadius: '5px',
                fontSize: '16px'
              }}
            >
              <option value="" style={{ backgroundColor: '#1A3C5E' }}>Select category</option>
              {categories.map(cat => <option key={cat} value={cat} style={{ backgroundColor: '#1A3C5E' }}>{cat}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'white' }}>Confidence: {confidence}%</label>
            <input
              type="range"
              min="1"
              max="99"
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#00B4D8'
              }}
            />
          </div>
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'white' }}>Resolution Date</label>
            <input
              type="date"
              value={resolutionDate}
              onChange={(e) => setResolutionDate(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#1A3C5E',
                color: 'white',
                border: '2px solid #00B4D8',
                borderRadius: '5px',
                fontSize: '16px'
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              backgroundColor: '#00B4D8',
              color: 'white',
              border: 'none',
              padding: '15px',
              borderRadius: '5px',
              cursor: 'pointer',
              width: '100%',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            Post Prediction
          </button>
        </form>
      </div>
    </div>
  )
}