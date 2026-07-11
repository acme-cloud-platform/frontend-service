import { useState, useEffect } from 'react'

// Same-origin relative path — since both frontend and backend sit behind
// the SAME ALB (one Ingress routes "/" to frontend, another routes "/api"
// to backend-service, see k8s/ingress.yaml), the browser just calls "/api"
// directly. No CORS config needed, no separate backend URL to manage.
const API_BASE = '/api'

export default function App() {
  const [item, setItem] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [orders, setOrders] = useState([])
  const [status, setStatus] = useState('')

  async function fetchOrders() {
    try {
      const res = await fetch(`${API_BASE}/orders`)
      if (res.ok) setOrders(await res.json())
    } catch (e) {
      console.error('Failed to fetch orders', e)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  async function placeOrder(e) {
    e.preventDefault()
    setStatus('Placing order...')
    try {
      const res = await fetch(`${API_BASE}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item, quantity: Number(quantity) }),
      })
      if (!res.ok) throw new Error(`Backend returned ${res.status}`)
      setStatus('Order placed!')
      setItem('')
      setQuantity(1)
      fetchOrders()
    } catch (e) {
      setStatus(`Failed: ${e.message}`)
    }
  }

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 480, margin: '40px auto', padding: 16 }}>
      <h1>Acme Cloud — Order Demo</h1>
      <p style={{ color: '#666' }}>
        Proves frontend-service → backend-service → RDS, end to end, through the platform we built.
      </p>

      <form onSubmit={placeOrder} style={{ display: 'flex', gap: 8, margin: '24px 0' }}>
        <input
          placeholder="Item name"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          required
          style={{ flex: 1, padding: 8 }}
        />
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          style={{ width: 70, padding: 8 }}
        />
        <button type="submit" style={{ padding: '8px 16px' }}>
          Place Order
        </button>
      </form>

      {status && <p>{status}</p>}

      <h2>Recent Orders</h2>
      <ul>
        {orders.map((o) => (
          <li key={o.id}>
            #{o.id} — {o.item} × {o.quantity} — {new Date(o.created_at).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  )
}
