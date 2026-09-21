import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from 'react-router-dom'
import { supabase } from './supabase'
import paymentQR from './assets/payment-qr.png'

function App() {
  const [session, setSession] = useState(null)
  const [isLogin, setIsLogin] = useState(true)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) {
      loadServices()
    }
  }, [session])

  const loadServices = async () => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('id')

  if (error) {
    console.error('Services loading error:', error)
    alert('Services load failed: ' + error.message)
    return
  }

  console.log('Services loaded:', data)
  setServices(data || [])
}

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        setMessage('Login successful!')
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        })

        if (error) throw error

        setMessage(
          'Registration successful! Email verification প্রয়োজন হতে পারে।'
        )
      }
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  if (session) {
  const userEmail = session.user.email

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/dashboard"
          element={
            userEmail === 'gopi742301@gmail.com' ? (
              <AdminDashboard
                session={session}
                logout={logout}
              />
            ) : (
              <Dashboard
                session={session}
                services={services}
                logout={logout}
              />
            )
          }
        />
        <Route
  path="/orders"
  element={
    userEmail === 'gopi742301@gmail.com' ? (
      <Navigate to="/dashboard" replace />
    ) : (
      <OrdersPage
        session={session}
        logout={logout}
      />
    )
  }
  />
  {/* SERVICES PAGE */}
  <Route
  path="/services"
  element={
    userEmail === 'gopi742301@gmail.com' ? (
      <Navigate to="/dashboard" replace />
    ) : (
      <ServicesPage
        session={session}
        services={services}
        logout={logout}
      />
    )
  }
/>
<Route
  path="/payment/:orderId"
  element={
    userEmail === 'gopi742301@gmail.com' ? (
      <Navigate to="/dashboard" replace />
    ) : (
      <PaymentPage session={session} />
    )
  }
/>

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

  return (
    <div style={styles.loginPage}>
      <div style={styles.loginCard}>
        <div style={styles.logoCircle}>G</div>

        <h1 style={styles.logoTitle}>GOPI ONLINE</h1>

        <p style={styles.logoSubtitle}>
          Digital Service & Online Center
        </p>

        <div style={styles.tabs}>
          <button
            onClick={() => setIsLogin(true)}
            style={{
              ...styles.tab,
              ...(isLogin ? styles.activeTab : {}),
            }}
          >
            Login
          </button>

          <button
            onClick={() => setIsLogin(false)}
            style={{
              ...styles.tab,
              ...(!isLogin ? styles.activeTab : {}),
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              style={styles.input}
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <input
            style={styles.input}
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          <button
            type="submit"
            disabled={loading}
            style={styles.mainButton}
          >
            {loading
              ? 'Please wait...'
              : isLogin
              ? 'LOGIN'
              : 'CREATE ACCOUNT'}
          </button>
        </form>

        {message && (
          <div style={styles.message}>
            {message}
          </div>
        )}

        <div style={styles.contactBox}>
          <div>📞 9609047478</div>
          <div>📍 BD SHERPUR, THAKUR PARA</div>
        </div>
      </div>
    </div>
  )
}
function PaymentPage({ session }) {
  const { orderId } = useParams()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [transactionReference, setTransactionReference] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadOrder = async () => {
      if (!session?.user?.id || !orderId) return

      setLoading(true)

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', session.user.id)
        .single()

      if (error) {
        console.error('Payment order load error:', error)
        alert('Order load failed: ' + error.message)
        setOrder(null)
      } else {
        setOrder(data)
      }

      setLoading(false)
    }

    loadOrder()
  }, [session?.user?.id, orderId])

  const submitPayment = async () => {
    if (!transactionReference.trim()) {
      alert('Please enter UTR / Transaction ID.')
      return
    }

    if (!order) return

    setSubmitting(true)

    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: order.id,
        user_id: session.user.id,
        amount: order.amount,
        payment_method: 'Google Pay / UPI',
        transaction_reference: transactionReference.trim(),
        status: 'Pending',
      })

    if (paymentError) {
      alert(
        'Payment submission failed: ' +
        paymentError.message
      )
      setSubmitting(false)
      return
    }

    const { error: orderError } = await supabase
      .from('orders')
      .update({
        status: 'Payment Submitted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)
      .eq('user_id', session.user.id)

    if (orderError) {
      alert(
        'Payment submitted, but order status update failed: ' +
        orderError.message
      )
      setSubmitting(false)
      return
    }

    alert('✅ Payment details submitted successfully.')

    window.location.href = '/orders'
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#090909',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Loading payment details...
      </div>
    )
  }

  if (!order) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#090909',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <div>
          <h2>Order not found</h2>

          <button
            onClick={() => {
              window.location.href = '/orders'
            }}
            style={{
              marginTop: '15px',
              padding: '12px 20px',
              borderRadius: '10px',
              border: 'none',
              background: '#d4af37',
              color: '#111',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            ← My Orders
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, #080808, #121212, #080808)',
        color: '#fff',
        padding: '30px 18px 60px',
      }}
    >
  
  
     <div
  style={{
    maxWidth: '760px',
    margin: '0 auto',
  }}
>
  {/* HEADER */}
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '25px',
      gap: '15px',
    }}
  >
    <div>
      <div
        style={{
          color: '#d4af37',
          fontSize: '12px',
          fontWeight: '800',
          letterSpacing: '3px',
        }}
      >
        GOPI ONLINE
      </div>

      <h1
        style={{
          margin: '7px 0 0',
          fontSize: '30px',
        }}
      >
        Secure Payment
      </h1>

      <div
        style={{
          color: '#777',
          fontSize: '13px',
          marginTop: '5px',
        }}
      >
        Complete your payment using UPI
      </div>
    </div>

    <button
      onClick={() => {
        window.location.href = '/orders'
      }}
      style={{
        padding: '10px 15px',
        borderRadius: '9px',
        border: '1px solid #444',
        background: '#171717',
        color: '#fff',
        cursor: 'pointer',
      }}
    >
      ← Orders
    </button>
  </div>

  {/* ORDER SUMMARY */}
  <div
    style={{
      background: '#151515',
      border: '1px solid #292929',
      borderRadius: '18px',
      padding: '22px',
      marginBottom: '20px',
    }}
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '15px',
        flexWrap: 'wrap',
      }}
    >
      <div>
        <div
          style={{
            color: '#777',
            fontSize: '11px',
            letterSpacing: '1px',
            marginBottom: '6px',
          }}
        >
          ORDER ID
        </div>

        <div
          style={{
            fontSize: '18px',
            fontWeight: '800',
          }}
        >
          #{order.id}
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <div
          style={{
            color: '#777',
            fontSize: '11px',
            marginBottom: '5px',
          }}
        >
          AMOUNT TO PAY
        </div>

        <div
          style={{
            color: '#d4af37',
            fontSize: '28px',
            fontWeight: '900',
          }}
        >
          ₹{order.amount}
        </div>
      </div>
    </div>
  </div>

  {/* MAIN PAYMENT CARD */}
  <div
    style={{
      background:
        'linear-gradient(145deg, #181818, #101010)',
      border: '1px solid #292929',
      borderRadius: '20px',
      padding: '28px',
    }}
  >
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          display: 'inline-block',
          padding: '7px 14px',
          borderRadius: '30px',
          background: '#25210f',
          color: '#d4af37',
          fontSize: '11px',
          fontWeight: '800',
          letterSpacing: '1px',
          marginBottom: '12px',
        }}
      >
        UPI PAYMENT
      </div>

      <h2
        style={{
          margin: '0',
          fontSize: '24px',
        }}
      >
        Scan & Pay
      </h2>

      <p
        style={{
          color: '#888',
          fontSize: '14px',
          lineHeight: '1.6',
          margin: '8px auto 22px',
          maxWidth: '480px',
        }}
      >
        Open Google Pay, PhonePe, Paytm or any UPI app
        on your mobile and scan the QR code below.
      </p>

      {/* QR CODE */}
      <div
        style={{
          display: 'inline-block',
          background: '#fff',
          padding: '14px',
          borderRadius: '18px',
          boxShadow: '0 15px 40px rgba(0,0,0,0.4)',
        }}
      >
        <img
          src={paymentQR}
          alt="GOPI ONLINE UPI QR Code"
          style={{
            width: '280px',
            height: '280px',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>

      {/* QR INSTRUCTION */}
      <div
        style={{
          marginTop: '16px',
          color: '#aaa',
          fontSize: '13px',
        }}
      >
        Scan this QR code to pay
      </div>
    </div>

    {/* PAYMENT DETAILS */}
    <div
      style={{
        marginTop: '25px',
        display: 'grid',
        gap: '12px',
      }}
    >
      <div
        style={{
          padding: '17px',
          background: '#0d0d0d',
          border: '1px solid #333',
          borderRadius: '13px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            color: '#777',
            fontSize: '11px',
            marginBottom: '7px',
          }}
        >
          UPI ID
        </div>

        <div
          style={{
            color: '#d4af37',
            fontSize: '18px',
            fontWeight: '900',
            wordBreak: 'break-all',
          }}
        >
          gopi742301@okicici
        </div>
      </div>

      <div
        style={{
          padding: '14px',
          borderRadius: '12px',
          background: '#121212',
          border: '1px solid #292929',
          color: '#aaa',
          fontSize: '13px',
          textAlign: 'center',
        }}
      >
        Please pay exactly{' '}
        <strong style={{ color: '#fff' }}>
          ₹{order.amount}
        </strong>{' '}
        for this order.
      </div>
    </div>

    {/* OPTIONAL UPI BUTTON */}
    <button
      onClick={() => {
        const upiUrl =
          `upi://pay?pa=gopi742301@okicici` +
          `&pn=GOPI%20ONLINE` +
          `&am=${order.amount}` +
          `&cu=INR`

        window.location.href = upiUrl
      }}
      style={{
        width: '100%',
        marginTop: '18px',
        padding: '15px',
        borderRadius: '11px',
        border: 'none',
        background: '#d4af37',
        color: '#111',
        fontWeight: '900',
        fontSize: '15px',
        cursor: 'pointer',
      }}
    >
      OPEN UPI PAYMENT →
    </button>

    {/* UTR SECTION */}
    <div
      style={{
        marginTop: '30px',
        paddingTop: '25px',
        borderTop: '1px solid #292929',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '7px',
        }}
      >
        <div
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: '#25210f',
            color: '#d4af37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '900',
          }}
        >
          2
        </div>

        <h3
          style={{
            margin: 0,
            fontSize: '18px',
          }}
        >
          Submit Payment Details
        </h3>
      </div>

      <p
        style={{
          color: '#888',
          fontSize: '13px',
          lineHeight: '1.6',
          marginBottom: '12px',
        }}
      >
        After completing the payment, enter the UTR or
        Transaction ID received from your UPI app.
      </p>

      <input
        type="text"
        placeholder="Enter UTR / Transaction ID"
        value={transactionReference}
        onChange={(e) =>
          setTransactionReference(e.target.value)
        }
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '14px',
          borderRadius: '11px',
          border: '1px solid #333',
          background: '#0d0d0d',
          color: '#fff',
          outline: 'none',
          fontSize: '14px',
        }}
      />

      <button
        onClick={submitPayment}
        disabled={submitting}
        style={{
          width: '100%',
          marginTop: '12px',
          padding: '14px',
          borderRadius: '11px',
          border: '1px solid #444',
          background: submitting ? '#181818' : '#202020',
          color: '#fff',
          fontWeight: '800',
          cursor: submitting ? 'not-allowed' : 'pointer',
        }}
      >
        {submitting
          ? 'SUBMITTING...'
          : 'SUBMIT PAYMENT DETAILS'}
      </button>
    </div>
  </div>

  {/* SECURITY NOTICE */}
  <div
    style={{
      marginTop: '16px',
      padding: '15px',
      borderRadius: '12px',
      background: '#171717',
      border: '1px solid #292929',
      color: '#777',
      fontSize: '12px',
      lineHeight: '1.6',
      textAlign: 'center',
    }}
  >
    🔒 Payment is verified manually using the submitted
    UTR / Transaction ID. Your order will be processed
    after payment verification.
  </div>
</div>
</div>
  )
}

function AdminDashboard({ session, logout }) {
  const [adminOrders, setAdminOrders] = useState([])
  const [adminLoading, setAdminLoading] = useState(true)
  const [adminPayments, setAdminPayments] = useState([])
  const [paymentLoading, setPaymentLoading] = useState(true)

  const fetchAdminPayments = async () => {
    setPaymentLoading(true)

  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Admin payments error:', error)
    alert('Payments load failed: ' + error.message)
    setAdminPayments([])
  } else {
    setAdminPayments(data || [])
  }

  setPaymentLoading(false)
}

  const fetchAdminOrders = async () => {
    setAdminLoading(true)

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Admin orders error:', error)
      alert('Orders load failed: ' + error.message)
      setAdminOrders([])
    } else {
      setAdminOrders(data || [])
    }

    setAdminLoading(false)
  }

  useEffect(() => {
    fetchAdminOrders()
    fetchAdminPayments()
  }, [])

  const updateOrderStatus = async (orderId, newStatus) => {
  const { data, error } = await supabase
    .from('orders')
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()

  if (error) {
    console.error('Status update error:', error)
    alert('Status update failed: ' + error.message)
    return
  }

  console.log('Updated order:', data)

  const statusMessages = {
    'Payment Verified':
      'Your payment has been verified successfully.',
    'Order Received':
      'Your order has been received and is now in our queue.',
    Processing:
      'Your order is currently being processed.',
    Ready:
      'Your order is ready for collection/delivery.',
    Completed:
      'Your order has been completed successfully.',
    Rejected:
      'Your order has been rejected. Please contact Gopi Online for assistance.',
    Cancelled:
      'Your order has been cancelled.',
  }

  const message =
    statusMessages[newStatus] ||
    'Your order status has been updated.'

  alert(`Order status updated successfully.\n\n${message}`)

  await fetchAdminOrders()
}
const verifyPayment = async (payment) => {
  const { error: paymentError } = await supabase
    .from('payments')
    .update({
      status: 'Verified',
      verified_by: session.user.id,
      verified_at: new Date().toISOString(),
    })
    .eq('id', payment.id)

  if (paymentError) {
    alert('Payment verification failed: ' + paymentError.message)
    return
  }

  const { data: updatedOrder, error: orderError } = await supabase
    .from('orders')
    .update({
      status: 'Payment Verified',
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment.order_id)
    .select()

  console.log('Updated order after payment verification:', updatedOrder)

  if (orderError) {
    alert('Payment verified, but order status update failed: ' + orderError.message)
    return
  }

  alert('✅ Payment verified successfully.')

  await fetchAdminPayments()
await fetchAdminOrders()
}
  return (
  
<>
  <style>{responsiveCSS}</style>
    <div
  className="admin-page-mobile"
  style={{
    minHeight: '100vh',
    background: '#0b0b0b',
    color: '#fff',
    padding: '30px 20px',
  }}
>
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
      <div
  className="admin-header-mobile"
  style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  }}
>
          <div>
            <div
              style={{
                color: '#d4af37',
                fontSize: '13px',
                letterSpacing: '2px',
              }}
            >
              GOPI ONLINE
            </div>

            <h1 style={{ margin: '8px 0 0' }}>
              Admin Dashboard
            </h1>
          </div>

          <button
            onClick={logout}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: '1px solid #444',
              background: 'transparent',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '15px',
            marginBottom: '30px',
          }}
        >
          <div
            style={{
              background: '#151515',
              border: '1px solid #333',
              borderRadius: '14px',
              padding: '20px',
            }}
          >
            <div style={{ color: '#999' }}>Total Orders</div>
            <div
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                marginTop: '8px',
              }}
            >
              {adminOrders.length}
            </div>
          </div>

          <div
            style={{
              background: '#151515',
              border: '1px solid #333',
              borderRadius: '14px',
              padding: '20px',
            }}
          >
            <div style={{ color: '#999' }}>Payment Submitted</div>
            <div
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                marginTop: '8px',
              }}
            >
              {
                adminOrders.filter(
                  (order) => order.status === 'Payment Submitted'
                ).length
              }
            </div>
          </div>
        </div>
<section
className="admin-section-mobile"
  style={{
    background: '#111',
    border: '1px solid #333',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '20px',
  }}
>
  <h2 style={{ marginTop: 0 }}>
    Payment Verification
  </h2>

  {paymentLoading ? (
    <p style={{ color: '#aaa' }}>
      Loading payments...
    </p>
  ) : adminPayments.length === 0 ? (
    <p style={{ color: '#aaa' }}>
      No payments found.
    </p>
  ) : (
    adminPayments.map((payment) => (
      <div
        key={payment.id}
        className="admin-payment-mobile"
        style={{
          background: '#181818',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '18px',
          marginBottom: '15px',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
          Order #{payment.order_id}
        </div>

        <div style={{ color: '#ccc', marginBottom: '6px' }}>
          Amount: ₹{payment.amount}
        </div>

        <div style={{ color: '#ccc', marginBottom: '6px' }}>
          Payment Method: {payment.payment_method}
        </div>
        <div style={{ color: '#888', marginBottom: '6px', fontSize: '13px' }}>
  Payment Submitted: {formatDateTime(payment.created_at)}
</div>

        <div style={{ color: '#ccc', marginBottom: '12px' }}>
          UTR / Transaction ID:{' '}
          <strong>
            {payment.transaction_reference || '-'}
          </strong>
        </div>

        <div style={{ marginBottom: '12px' }}>
          Status:{' '}
          <strong>{payment.status}</strong>
        </div>
        {payment.verified_at && (
  <div
    style={{
      color: '#888',
      marginBottom: '12px',
      fontSize: '13px',
    }}
  >
    Verified At: {formatDateTime(payment.verified_at)}
  </div>
)}

        {payment.status === 'Pending' ? (
  <button
    onClick={() => verifyPayment(payment)}
    style={{
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: 'none',
      background: '#d4af37',
      color: '#000',
      fontWeight: 'bold',
      cursor: 'pointer',
    }}
  >
    ✅ VERIFY PAYMENT
  </button>
) : (
  <select
    defaultValue="Payment Verified"
    onChange={(e) =>
      updateOrderStatus(payment.order_id, e.target.value)
    }
    style={{
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #444',
      background: '#0b0b0b',
      color: '#fff',
    }}
  >
    <option value="Payment Verified">
  Payment Verified
</option>

<option value="Order Received">
  Order Received
</option>

<option value="Processing">
  Processing
</option>

<option value="Ready">
  Ready
</option>

<option value="Completed">
  Completed
</option>

<option value="Rejected">
  Rejected
</option>

<option value="Cancelled">
  Cancelled
</option>
  </select>
)}
      </div>
    ))
  )}
</section>
        <section
          className="admin-section-mobile"
          style={{
            background: '#111',
            border: '1px solid #333',
            borderRadius: '16px',
            padding: '20px',
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            All Customer Orders
          </h2>

          {adminLoading ? (
            <p style={{ color: '#aaa' }}>
              Loading orders...
            </p>
          ) : adminOrders.length === 0 ? (
            <p style={{ color: '#aaa' }}>
              No orders found.
            </p>
          ) : (
            adminOrders.map((order) => (
              <div
              className="admin-order-mobile"
                key={order.id}
                style={{
                  background: '#181818',
                  border: '1px solid #333',
                  borderRadius: '12px',
                  padding: '18px',
                  marginBottom: '15px',
                }}
              >
                <div
                  style={{
                    fontWeight: 'bold',
                    fontSize: '17px',
                    marginBottom: '10px',
                  }}
                >
                  Order #{order.id}
                </div>

                <div style={{ color: '#ccc', marginBottom: '6px' }}>
                  Customer: {order.customer_name || 'Customer'}
                </div>

                <div style={{ color: '#ccc', marginBottom: '6px' }}>
                  Phone: {order.customer_phone || '-'}
                </div>

                <div style={{ color: '#ccc', marginBottom: '6px' }}>
                  Amount: ₹{order.amount}
                </div>
                <div
  style={{
    color: '#888',
    marginBottom: '6px',
    fontSize: '13px',
  }}
>
  Order Date & Time: {formatDateTime(order.created_at)}
</div>

<div
  style={{
    color: '#777',
    marginBottom: '10px',
    fontSize: '12px',
  }}
>
  Last Updated: {formatDateTime(order.updated_at)}
</div>

                <div style={{ marginBottom: '12px' }}>
                  Current Status:{' '}
                  <strong>{order.status}</strong>
                </div>

                <select
                  value={order.status}
                  onChange={(e) =>
                    updateOrderStatus(order.id, e.target.value)
                  }
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #444',
                    background: '#0b0b0b',
                    color: '#fff',
                  }}
                >
                  <option value="Pending Payment">
                    Pending Payment
                  </option>

                  <option value="Payment Submitted">
                    Payment Submitted
                  </option>

                  <option value="Payment Verified">
                    Payment Verified
                  </option>

                  <option value="Processing">
                    Processing
                  </option>

                  <option value="Completed">
                    Completed
                  </option>

                  <option value="Cancelled">
                    Cancelled
                  </option>
                </select>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
    </>
  )
}

function OrdersPage({ session, logout }) {
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      if (!session?.user?.id) return

      setOrdersLoading(true)

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Orders fetch error:', error)
        setOrders([])
      } else {
        setOrders(data || [])
      }

      setOrdersLoading(false)
    }

    fetchOrders()
  }, [session?.user?.id])

  const formatDateTime = (dateString) => {
    if (!dateString) return '-'

    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(dateString))
  }

  const getStatusStyle = (status) => {
    if (status === 'Payment Verified' || status === 'Completed') {
      return {
        background: '#143d27',
        color: '#63e6a1',
        border: '1px solid #236b45',
      }
    }

    if (status === 'Payment Submitted') {
      return {
        background: '#3d3214',
        color: '#f5d76e',
        border: '1px solid #6b5923',
      }
    }

    if (status === 'Processing' || status === 'Ready') {
      return {
        background: '#172d46',
        color: '#6db7ff',
        border: '1px solid #28527d',
      }
    }

    if (status === 'Rejected' || status === 'Cancelled') {
      return {
        background: '#3d1818',
        color: '#ff7777',
        border: '1px solid #713333',
      }
    }

    return {
      background: '#292929',
      color: '#d4af37',
      border: '1px solid #555',
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, #080808 0%, #111111 50%, #080808 100%)',
        color: '#fff',
        padding: '30px 18px 50px',
      }}
    >
      <div
        style={{
          maxWidth: '1050px',
          margin: '0 auto',
        }}
      >

        {/* HEADER */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '35px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              style={{
                color: '#d4af37',
                fontSize: '12px',
                fontWeight: '700',
                letterSpacing: '3px',
                marginBottom: '7px',
              }}
            >
              GOPI ONLINE
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: '32px',
                fontWeight: '800',
                letterSpacing: '-0.5px',
              }}
            >
              My Orders
            </h1>

            <p
              style={{
                margin: '8px 0 0',
                color: '#999',
                fontSize: '14px',
              }}
            >
              Track and manage your service orders
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => {
                window.location.href = '/dashboard'
              }}
              style={{
                padding: '11px 18px',
                borderRadius: '10px',
                border: '1px solid #444',
                background: '#171717',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              ← Dashboard
            </button>

            <button
              onClick={logout}
              style={{
                padding: '11px 18px',
                borderRadius: '10px',
                border: '1px solid #444',
                background: '#171717',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* SUMMARY */}
        {!ordersLoading && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '15px',
              marginBottom: '25px',
            }}
          >
            <div
              style={{
                background: '#121212',
                border: '1px solid #292929',
                borderRadius: '14px',
                padding: '20px',
              }}
            >
              <div
                style={{
                  color: '#888',
                  fontSize: '13px',
                  marginBottom: '8px',
                }}
              >
                TOTAL ORDERS
              </div>

              <div
                style={{
                  fontSize: '28px',
                  fontWeight: '800',
                  color: '#d4af37',
                }}
              >
                {orders.length}
              </div>
            </div>

            <div
              style={{
                background: '#121212',
                border: '1px solid #292929',
                borderRadius: '14px',
                padding: '20px',
              }}
            >
              <div
                style={{
                  color: '#888',
                  fontSize: '13px',
                  marginBottom: '8px',
                }}
              >
                PENDING PAYMENT
              </div>

              <div
                style={{
                  fontSize: '28px',
                  fontWeight: '800',
                  color: '#f5d76e',
                }}
              >
                {
                  orders.filter(
                    (order) => order.status === 'Pending Payment'
                  ).length
                }
              </div>
            </div>

            <div
              style={{
                background: '#121212',
                border: '1px solid #292929',
                borderRadius: '14px',
                padding: '20px',
              }}
            >
              <div
                style={{
                  color: '#888',
                  fontSize: '13px',
                  marginBottom: '8px',
                }}
              >
                COMPLETED
              </div>

              <div
                style={{
                  fontSize: '28px',
                  fontWeight: '800',
                  color: '#63e6a1',
                }}
              >
                {
                  orders.filter(
                    (order) => order.status === 'Completed'
                  ).length
                }
              </div>
            </div>
          </div>
        )}

        {/* ORDERS */}
        {ordersLoading ? (
          <div
            style={{
              background: '#121212',
              border: '1px solid #292929',
              borderRadius: '16px',
              padding: '50px 20px',
              textAlign: 'center',
              color: '#aaa',
            }}
          >
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>
              Loading your orders...
            </div>

            <div style={{ fontSize: '13px', color: '#666' }}>
              Please wait
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div
            style={{
              background: '#121212',
              border: '1px solid #292929',
              borderRadius: '16px',
              padding: '60px 20px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '45px',
                marginBottom: '15px',
              }}
            >
              📦
            </div>

            <h2
              style={{
                margin: '0 0 8px',
                fontSize: '21px',
              }}
            >
              No Orders Yet
            </h2>

            <p
              style={{
                color: '#888',
                fontSize: '14px',
                marginBottom: '22px',
              }}
            >
              Your service orders will appear here.
            </p>

            <button
              onClick={() => {
                window.location.href = '/dashboard'
              }}
              style={{
                padding: '12px 22px',
                borderRadius: '10px',
                border: 'none',
                background: '#d4af37',
                color: '#111',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              Browse Services
            </button>
          </div>
        ) : (
          <div>
            {orders.map((order) => (
              <div
                key={order.id}
                style={{
                  background:
                    'linear-gradient(145deg, #151515, #101010)',
                  border: '1px solid #292929',
                  borderRadius: '16px',
                  padding: '22px',
                  marginBottom: '15px',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.25)',
                }}
              >
                {/* TOP */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '15px',
                    flexWrap: 'wrap',
                    marginBottom: '20px',
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: '#777',
                        fontSize: '12px',
                        marginBottom: '5px',
                      }}
                    >
                      ORDER ID
                    </div>

                    <div
                      style={{
                        fontSize: '19px',
                        fontWeight: '800',
                      }}
                    >
                      #{order.id}
                    </div>
                  </div>

                  <div
                    style={{
                      ...getStatusStyle(order.status),
                      padding: '7px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '700',
                    }}
                  >
                    {order.status}
                  </div>
                </div>

                {/* DETAILS */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '15px',
                    borderTop: '1px solid #252525',
                    borderBottom: '1px solid #252525',
                    padding: '18px 0',
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: '#777',
                        fontSize: '12px',
                        marginBottom: '5px',
                      }}
                    >
                      ORDER DATE
                    </div>

                    <div
                      style={{
                        fontSize: '14px',
                        color: '#ddd',
                      }}
                    >
                      {formatDateTime(order.created_at)}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        color: '#777',
                        fontSize: '12px',
                        marginBottom: '5px',
                      }}
                    >
                      LAST UPDATED
                    </div>

                    <div
                      style={{
                        fontSize: '14px',
                        color: '#ddd',
                      }}
                    >
                      {formatDateTime(order.updated_at)}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        color: '#777',
                        fontSize: '12px',
                        marginBottom: '5px',
                      }}
                    >
                      TOTAL AMOUNT
                    </div>

                    <div
                      style={{
                        fontSize: '21px',
                        fontWeight: '800',
                        color: '#d4af37',
                      }}
                    >
                      ₹{order.amount}
                    </div>
                  </div>
                </div>
{/* STATUS NOTIFICATION */}
{order.status !== 'Pending Payment' && (
  <div
    style={{
      marginTop: '18px',
      padding: '14px 16px',
      borderRadius: '12px',
      background:
        order.status === 'Rejected' ||
        order.status === 'Cancelled'
          ? 'rgba(180, 60, 60, 0.10)'
          : 'rgba(212, 175, 55, 0.08)',
      border:
        order.status === 'Rejected' ||
        order.status === 'Cancelled'
          ? '1px solid rgba(220, 80, 80, 0.35)'
          : '1px solid rgba(212, 175, 55, 0.25)',
    }}
  >
    <div
      style={{
        fontSize: '12px',
        fontWeight: '800',
        letterSpacing: '0.8px',
        color:
          order.status === 'Rejected' ||
          order.status === 'Cancelled'
            ? '#ff7777'
            : '#d4af37',
        marginBottom: '6px',
      }}
    >
      🔔 ORDER UPDATE
    </div>

    <div
      style={{
        color: '#ddd',
        fontSize: '13px',
        lineHeight: '1.6',
      }}
    >
      {order.status === 'Payment Verified' &&
        'Your payment has been verified successfully.'}

      {order.status === 'Order Received' &&
        'Your order has been received and is now in our queue.'}

      {order.status === 'Processing' &&
        'Your order is currently being processed.'}

      {order.status === 'Ready' &&
        'Your order is ready for collection/delivery.'}

      {order.status === 'Completed' &&
        'Your order has been completed successfully.'}

      {order.status === 'Rejected' &&
        'Your order has been rejected. Please contact Gopi Online for assistance.'}

      {order.status === 'Cancelled' &&
        'Your order has been cancelled.'}
    </div>

    <div
      style={{
        color: '#666',
        fontSize: '11px',
        marginTop: '7px',
      }}
    >
      Updated: {formatDateTime(order.updated_at)}
    </div>
  </div>
)}
                {/* ACTIONS */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: '18px',
                  }}
                >
                  {order.status === 'Pending Payment' && (
  <button
    onClick={() => {
      window.location.href = `/payment/${order.id}`
    }}
    style={{
      padding: '12px 22px',
      borderRadius: '10px',
      border: 'none',
      background: '#d4af37',
      color: '#111',
      fontWeight: '800',
      cursor: 'pointer',
      minWidth: '130px',
    }}
  >
    PAY NOW →
  </button>
)}

                  {order.status !== 'Pending Payment' && (
  <div
    style={{
      marginTop: '18px',
      paddingTop: '18px',
      borderTop: '1px solid #292929',
    }}
  >
    <div
      style={{
        color: '#888',
        fontSize: '12px',
        fontWeight: '700',
        letterSpacing: '1px',
        marginBottom: '15px',
      }}
    >
      ORDER PROGRESS
    </div>

    {[
      'Payment Verified',
      'Order Received',
      'Processing',
      'Ready',
      'Completed',
    ].map((step, index) => {
      const steps = [
        'Payment Verified',
        'Order Received',
        'Processing',
        'Ready',
        'Completed',
      ]

      const currentIndex = steps.indexOf(order.status)

      const completed = currentIndex >= 0 && index < currentIndex
      const current = step === order.status

      return (
        <div
          key={step}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            position: 'relative',
            paddingBottom:
              index === steps.length - 1 ? '0' : '16px',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              minWidth: '28px',
              borderRadius: '50%',
              background:
                completed || current
                  ? '#d4af37'
                  : '#292929',
              color:
                completed || current
                  ? '#111'
                  : '#777',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              fontSize: '12px',
              zIndex: 2,
            }}
          >
            {completed ? '✓' : index + 1}
          </div>

          {index < steps.length - 1 && (
            <div
              style={{
                position: 'absolute',
                left: '13px',
                top: '28px',
                width: '2px',
                height: '16px',
                background: completed
                  ? '#d4af37'
                  : '#292929',
              }}
            />
          )}

          <div style={{ paddingTop: '4px' }}>
            <div
              style={{
                color: current
                  ? '#d4af37'
                  : completed
                  ? '#fff'
                  : '#666',
                fontSize: '14px',
                fontWeight:
                  current || completed ? '800' : '600',
              }}
            >
              {step}
            </div>

            {current && (
              <div
                style={{
                  marginTop: '7px',
                  display: 'inline-block',
                  background: '#1d1d1d',
                  border: '1px solid #3a3a3a',
                  borderRadius: '8px',
                  padding: '6px 9px',
                  color: '#aaa',
                  fontSize: '11px',
                  fontWeight: '600',
                }}
              >
                🔔 Current status
              </div>
            )}
          </div>
        </div>
      )
    })}
  </div>
)}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
function ServicesPage({ session, services, logout }) {
  const [selectedService, setSelectedService] = useState(null)
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [photoCount, setPhotoCount] = useState(3)
  const [printingCount, setPrintingCount] = useState(1)
  const [loading, setLoading] = useState(false)

  const customerName =
    session.user.user_metadata?.full_name || 'Customer'

  const getOrderAmount = () => {
    if (!selectedService) return 0

    const name = selectedService.name

    if (name === 'PAN Card Application Assistance') return 150
    if (name === 'Voter Card Application Assistance') return 50
    if (name === 'Online Form Fill-up') return 50

    if (name === 'Xerox') {
      return quantity * 3
    }

    if (name === 'Passport Size Photo') {
      if (photoCount === 3) return 20
      if (photoCount === 6) return 35
      if (photoCount === 9) return 50
      if (photoCount === 12) return 65
    }

    if (name === 'Printing') {
      if (printingCount >= 100) {
        return printingCount * 3
      }

      return printingCount * 10
    }

    return selectedService.price || 0
  }

  const createOrder = async () => {
    if (!customerPhone || !customerAddress) {
      alert('Please enter mobile number and address.')
      return
    }

    if (!selectedService) return

    setLoading(true)

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: session.user.id,
        service_id: selectedService.id,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        amount: getOrderAmount(),
        status: 'Pending Payment',
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      alert('Order creation failed: ' + error.message)
      setLoading(false)
      return
    }

    setLoading(false)

    alert(`Order #${order.id} created successfully.`)

    setSelectedService(null)
    setCustomerPhone('')
    setCustomerAddress('')
    setQuantity(1)
    setPhotoCount(3)
    setPrintingCount(1)

    window.location.href = '/orders'
  }

  const getIcon = (name) => {
    if (name === 'PAN Card Application Assistance') return '🪪'
    if (name === 'Voter Card Application Assistance') return '🗳️'
    if (name === 'Online Form Fill-up') return '📝'
    if (name === 'Xerox') return '📄'
    if (name === 'Passport Size Photo') return '📸'
    if (name === 'Printing') return '🖨️'

    return '💼'
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, #080808 0%, #111111 50%, #080808 100%)',
        color: '#fff',
        padding: '30px 18px 60px',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >

        {/* HEADER */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '15px',
            flexWrap: 'wrap',
            marginBottom: '35px',
          }}
        >
          <div>
            <div
              style={{
                color: '#d4af37',
                fontSize: '12px',
                fontWeight: '700',
                letterSpacing: '3px',
                marginBottom: '7px',
              }}
            >
              GOPI ONLINE
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: '32px',
                fontWeight: '800',
              }}
            >
              Our Services
            </h1>

            <p
              style={{
                margin: '8px 0 0',
                color: '#888',
                fontSize: '14px',
              }}
            >
              Digital services made simple and convenient
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => {
                window.location.href = '/dashboard'
              }}
              style={{
                padding: '11px 18px',
                borderRadius: '10px',
                border: '1px solid #444',
                background: '#171717',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              ← Dashboard
            </button>

            <button
              onClick={() => {
                window.location.href = '/orders'
              }}
              style={{
                padding: '11px 18px',
                borderRadius: '10px',
                border: '1px solid #444',
                background: '#171717',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              My Orders
            </button>

            <button
              onClick={logout}
              style={{
                padding: '11px 18px',
                borderRadius: '10px',
                border: '1px solid #444',
                background: '#171717',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* SERVICE GRID */}
        {services.length === 0 ? (
          <div
            style={{
              background: '#121212',
              border: '1px solid #292929',
              borderRadius: '16px',
              padding: '50px 20px',
              textAlign: 'center',
              color: '#888',
            }}
          >
            No services available right now.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '18px',
            }}
          >
            {services.map((service) => (
              <div
                key={service.id}
                style={{
                  background:
                    'linear-gradient(145deg, #161616, #101010)',
                  border: '1px solid #292929',
                  borderRadius: '17px',
                  padding: '24px',
                  transition: '0.2s',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                }}
              >
                <div
                  style={{
                    width: '55px',
                    height: '55px',
                    borderRadius: '14px',
                    background: '#1d1d1d',
                    border: '1px solid #333',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    marginBottom: '18px',
                  }}
                >
                  {getIcon(service.name)}
                </div>

                <h2
                  style={{
                    fontSize: '18px',
                    margin: '0 0 10px',
                    lineHeight: '1.35',
                  }}
                >
                  {service.name}
                </h2>

                <p
                  style={{
                    color: '#777',
                    fontSize: '13px',
                    minHeight: '38px',
                    margin: '0 0 18px',
                    lineHeight: '1.5',
                  }}
                >
                  Professional online service assistance.
                </p>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: '#777',
                        fontSize: '11px',
                        marginBottom: '3px',
                      }}
                    >
                      STARTING FROM
                    </div>

                    <div
                      style={{
                        color: '#d4af37',
                        fontSize: '22px',
                        fontWeight: '800',
                      }}
                    >
                      ₹{service.price}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedService(service)}
                    style={{
                      padding: '11px 16px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#d4af37',
                      color: '#111',
                      fontWeight: '800',
                      cursor: 'pointer',
                    }}
                  >
                    ORDER NOW
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ORDER MODAL */}
        {selectedService && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.78)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              zIndex: 1000,
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '500px',
                background: '#141414',
                border: '1px solid #333',
                borderRadius: '18px',
                padding: '25px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '15px',
                  marginBottom: '25px',
                }}
              >
                <div>
                  <div
                    style={{
                      color: '#d4af37',
                      fontSize: '12px',
                      fontWeight: '700',
                      letterSpacing: '2px',
                    }}
                  >
                    NEW ORDER
                  </div>

                  <h2
                    style={{
                      margin: '7px 0 0',
                      fontSize: '22px',
                    }}
                  >
                    {selectedService.name}
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedService(null)}
                  style={{
                    border: 'none',
                    background: '#222',
                    color: '#aaa',
                    width: '35px',
                    height: '35px',
                    borderRadius: '9px',
                    cursor: 'pointer',
                    fontSize: '18px',
                  }}
                >
                  ×
                </button>
              </div>

              {/* PHONE */}
              <label style={styles.formLabel}>
                Mobile Number
              </label>

              <input
                type="tel"
                placeholder="Enter mobile number"
                value={customerPhone}
                onChange={(e) =>
                  setCustomerPhone(e.target.value)
                }
                style={styles.input}
              />

              {/* ADDRESS */}
              <label style={styles.formLabel}>
                Customer Address
              </label>

              <textarea
                placeholder="Enter your full address"
                value={customerAddress}
                onChange={(e) =>
                  setCustomerAddress(e.target.value)
                }
                style={{
                  ...styles.input,
                  minHeight: '90px',
                  resize: 'vertical',
                }}
              />

              {/* XEROX */}
              {selectedService.name === 'Xerox' && (
                <>
                  <label style={styles.formLabel}>
                    Number of Copies
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.max(1, Number(e.target.value))
                      )
                    }
                    style={styles.input}
                  />
                </>
              )}

              {/* PHOTO */}
              {selectedService.name === 'Passport Size Photo' && (
                <>
                  <label style={styles.formLabel}>
                    Photo Package
                  </label>

                  <select
                    value={photoCount}
                    onChange={(e) =>
                      setPhotoCount(Number(e.target.value))
                    }
                    style={styles.input}
                  >
                    <option value={3}>3 Photos — ₹20</option>
                    <option value={6}>6 Photos — ₹35</option>
                    <option value={9}>9 Photos — ₹50</option>
                    <option value={12}>12 Photos — ₹65</option>
                  </select>
                </>
              )}

              {/* PRINTING */}
              {selectedService.name === 'Printing' && (
                <>
                  <label style={styles.formLabel}>
                    Number of Prints
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={printingCount}
                    onChange={(e) =>
                      setPrintingCount(
                        Math.max(1, Number(e.target.value))
                      )
                    }
                    style={styles.input}
                  />

                  <div
                    style={{
                      marginTop: '-5px',
                      marginBottom: '15px',
                      color: '#777',
                      fontSize: '12px',
                    }}
                  >
                    1–99 prints: ₹10 each · 100+ prints: ₹3 each
                  </div>
                </>
              )}

              {/* TOTAL */}
              <div
                style={{
                  marginTop: '20px',
                  padding: '17px',
                  background: '#0d0d0d',
                  border: '1px solid #292929',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    color: '#999',
                    fontSize: '14px',
                  }}
                >
                  Total Amount
                </span>

                <span
                  style={{
                    color: '#d4af37',
                    fontSize: '25px',
                    fontWeight: '800',
                  }}
                >
                  ₹{getOrderAmount()}
                </span>
              </div>

              {/* CREATE ORDER */}
              <button
                onClick={createOrder}
                disabled={loading}
                style={{
                  width: '100%',
                  marginTop: '18px',
                  padding: '14px',
                  borderRadius: '11px',
                  border: 'none',
                  background: '#d4af37',
                  color: '#111',
                  fontWeight: '800',
                  fontSize: '15px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading
                  ? 'CREATING ORDER...'
                  : 'CONFIRM ORDER'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
function Dashboard({ session, services, logout }) {

  const [paymentOrder, setPaymentOrder] = useState(null)
const [transactionReference, setTransactionReference] = useState('')
const [paymentLoading, setPaymentLoading] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [showNotifications, setShowNotifications] = useState(false)
const [notifications, setNotifications] = useState([])
const [unreadCount, setUnreadCount] = useState(0)
const loadNotifications = async () => {
  if (!session?.user?.id) return

  const { data, error } = await supabase
    .from('orders')
    .select('id, status, updated_at, amount')
    .eq('user_id', session.user.id)
    .neq('status', 'Pending Payment')
    .order('updated_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Notification loading error:', error)
    return
  }

  const orderNotifications = data || []

  setNotifications(orderNotifications)

  const seenKey = `gopi_notifications_seen_${session.user.id}`

  const savedSeen = localStorage.getItem(seenKey)

  const seenNotifications = savedSeen
    ? JSON.parse(savedSeen)
    : []

  const unread = orderNotifications.filter((notification) => {
    const notificationKey =
      `${notification.id}_${notification.status}_${notification.updated_at}`

    return !seenNotifications.includes(notificationKey)
  })

  setUnreadCount(unread.length)
}
useEffect(() => {
  if (!session?.user?.id) return

  loadNotifications()

  const notificationTimer = setInterval(() => {
    loadNotifications()
  }, 30000)

  return () => {
    clearInterval(notificationTimer)
  }
}, [session?.user?.id])
const [customerPhone, setCustomerPhone] = useState('')
const [customerAddress, setCustomerAddress] = useState('')
const [quantity, setQuantity] = useState(1)
const [photoCount, setPhotoCount] = useState(3)
const [printingCount, setPrintingCount] = useState(1)


  const customerName =
    session.user.user_metadata?.full_name || 'Customer'
    const getOrderAmount = () => {
  if (!selectedService) return 0

  const name = selectedService.name

  if (name === 'PAN Card Application Assistance') {
    return 150
  }

  if (name === 'Voter Card Application Assistance') {
    return 50
  }

  if (name === 'Online Form Fill-up') {
    return 50
  }

  if (name === 'Xerox') {
    return quantity * 3
  }

  if (name === 'Passport Size Photo') {
    if (photoCount === 3) return 20
    if (photoCount === 6) return 35
    if (photoCount === 9) return 50
    if (photoCount === 12) return 65
  }

  if (name === 'Printing') {
    if (printingCount >= 100) {
      return printingCount * 3
    }

    return printingCount * 10
  }

  return selectedService.price || 0
}
const [orders, setOrders] = useState([]);
useEffect(() => {
  const fetchOrders = async () => {
    if (!session?.user?.id) return;

    setOrdersLoading(true);

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Orders fetch error:', error);
      setOrders([]);
    } else {
      setOrders(data || []);
    }

    setOrdersLoading(false);
  };

  fetchOrders();
}, [session?.user?.id]);
const [ordersLoading, setOrdersLoading] = useState(false);
const createOrder = async () => {
  if (!customerPhone || !customerAddress) {
    alert('Please enter mobile number and address.')
    return
  }

  setPaymentLoading(true)

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      user_id: session.user.id,
      service_id: selectedService.id,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_address: customerAddress,
     amount: getOrderAmount(), 
      status: 'Pending Payment',
       updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    alert('Order creation failed: ' + error.message)
    setPaymentLoading(false)
    return
  }

  setPaymentOrder(order)
  setPaymentLoading(false)
}
  return (
 
    <div style={styles.dashboardPage}>

      {/* HEADER */}
<header
  className="dashboard-header-mobile"
  style={styles.header}
>
  <div>
    <div style={styles.headerLogo}>
      GOPI ONLINE
    </div>

    <div style={styles.headerSub}>
      Digital Service Center
    </div>
  </div>

  <div
    className="dashboard-header-right-mobile"
    style={{
      ...styles.headerRight,
      position: 'relative',
    }}
  >
    <span style={styles.welcome}>
      Hi, {customerName}
    </span>

    {/* NOTIFICATION BUTTON */}
    <button
      onClick={async () => {
  await loadNotifications()

  const seenKey = `gopi_notifications_seen_${session.user.id}`

  const seenNotifications = notifications.map((notification) =>
    `${notification.id}_${notification.status}_${notification.updated_at}`
  )

  localStorage.setItem(
    seenKey,
    JSON.stringify(seenNotifications)
  )

  setUnreadCount(0)
  setShowNotifications(!showNotifications)
}}
      style={{
        width: '42px',
        height: '42px',
        borderRadius: '12px',
        border: '1px solid #333',
        background: '#171717',
        color: '#d4af37',
        fontSize: '20px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
      title="Notifications"
    >
      🔔

      {/* NOTIFICATION COUNT */}
      {unreadCount > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            minWidth: '18px',
            height: '18px',
            padding: '0 4px',
            borderRadius: '10px',
            background: '#d4af37',
            color: '#111',
            fontSize: '10px',
            fontWeight: '900',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #101010',
          }}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>

    {/* NOTIFICATION PANEL */}
    {showNotifications && (
      <div
        style={{
          position: 'absolute',
          top: '52px',
          right: '55px',
          width: '340px',
          maxWidth: 'calc(100vw - 30px)',
          background: '#151515',
          border: '1px solid #303030',
          borderRadius: '16px',
          boxShadow: '0 18px 45px rgba(0,0,0,0.45)',
          zIndex: 1000,
          overflow: 'hidden',
        }}
      >
        {/* PANEL HEADER */}
        <div
          style={{
            padding: '16px 18px',
            borderBottom: '1px solid #292929',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                color: '#fff',
                fontSize: '15px',
                fontWeight: '800',
              }}
            >
              Notifications
            </div>

            <div
              style={{
                color: '#777',
                fontSize: '11px',
                marginTop: '3px',
              }}
            >
              Your latest order updates
            </div>
          </div>

          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: '#242424',
              color: '#d4af37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            🔔
          </div>
        </div>

        {/* NOTIFICATION LIST */}
        <div
          style={{
            maxHeight: '360px',
            overflowY: 'auto',
          }}
        >
          {notifications.length === 0 ? (
            <div
              style={{
                padding: '35px 20px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '30px',
                  marginBottom: '10px',
                }}
              >
                🔕
              </div>

              <div
                style={{
                  color: '#aaa',
                  fontSize: '13px',
                  fontWeight: '700',
                }}
              >
                No notifications
              </div>

              <div
                style={{
                  color: '#666',
                  fontSize: '11px',
                  marginTop: '5px',
                }}
              >
                New order updates will appear here.
              </div>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
  key={notification.id}
  onClick={() => {
    setShowNotifications(false)
    window.location.href = '/orders'
  }}
  style={{
    padding: '15px 18px',
    borderBottom: '1px solid #242424',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  }}
>
                <div
                  style={{
                    display: 'flex',
                    gap: '11px',
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      minWidth: '34px',
                      borderRadius: '10px',
                      background:
                        notification.status === 'Rejected' ||
                        notification.status === 'Cancelled'
                          ? 'rgba(220,70,70,0.12)'
                          : 'rgba(212,175,55,0.10)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                    }}
                  >
                    {notification.status === 'Completed'
                      ? '🎉'
                      : notification.status === 'Ready'
                      ? '📦'
                      : notification.status === 'Processing'
                      ? '⚙️'
                      : notification.status === 'Rejected' ||
                        notification.status === 'Cancelled'
                      ? '⚠️'
                      : '🔔'}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        color: '#fff',
                        fontSize: '13px',
                        fontWeight: '800',
                      }}
                    >
                      Order #{notification.id}
                    </div>

                    <div
                      style={{
                        color: '#d4af37',
                        fontSize: '12px',
                        fontWeight: '700',
                        marginTop: '3px',
                      }}
                    >
                      {notification.status}
                    </div>

                    <div
                      style={{
                        color: '#888',
                        fontSize: '11px',
                        lineHeight: '1.5',
                        marginTop: '5px',
                      }}
                    >
                      {notification.status === 'Payment Verified' &&
                        'Your payment has been verified successfully.'}

                      {notification.status === 'Order Received' &&
                        'Your order has been received.'}

                      {notification.status === 'Processing' &&
                        'Your order is currently being processed.'}

                      {notification.status === 'Ready' &&
                        'Your order is ready for collection/delivery.'}

                      {notification.status === 'Completed' &&
                        'Your order has been completed successfully.'}

                      {notification.status === 'Rejected' &&
                        'Your order has been rejected. Please contact Gopi Online.'}

                      {notification.status === 'Cancelled' &&
                        'Your order has been cancelled.'}
                    </div>

                    <div
                      style={{
                        color: '#555',
                        fontSize: '10px',
                        marginTop: '6px',
                      }}
                    >
                      {formatDateTime(notification.updated_at)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )}

    {/* LOGOUT */}
    <button
      onClick={logout}
      style={styles.logoutButton}
    >
      Logout
    </button>
  </div>
</header>

      {/* HERO */}
      <section className="dashboard-hero-mobile" 
        style={styles.hero}>
        <div>
          <p style={styles.smallGold}>
            WELCOME TO GOPI ONLINE
          </p>

          <h1 
          className="dashboard-hero-title-mobile"
          style={styles.heroTitle}>
            Your Digital Services,
            <br />
            <span>Simple & Fast.</span>
          </h1>

          <p style={styles.heroText}>
            PAN, Voter Card, Online Forms, Xerox,
            Photo & Printing services — all in one place.
          </p>

         <div
  className="dashboard-hero-buttons-mobile"
  style={styles.heroButtons}
>
  <button
    onClick={() => {
      window.location.href = '/services'
    }}
    style={styles.mainButton}
  >
    Explore Services
  </button>
  <button
    onClick={() => {
      window.location.href = '/orders'
    }}
    style={styles.secondaryButton}
  >
    My Orders
  </button>
</div>
</div>
</section>


      
{/* ORDER FORM */}
{selectedService && !paymentOrder && (
  <section
    className="order-form-mobile"
    style={{
      maxWidth: '760px',
      margin: '0 auto 60px',
      padding: '0 6%',
      boxSizing: 'border-box',
    }}
  >
    <div
    className="order-form-card-mobile"
      style={{
        background: 'linear-gradient(145deg, #151515, #0d0d0d)',
        border: '1px solid #d4af37',
        borderRadius: '22px',
        padding: '32px',
        boxShadow: '0 20px 60px rgba(0,0,0,.45)',
      }}
    >
      {/* FORM HEADER */}
      <div
        style={{
          borderBottom: '1px solid #292929',
          paddingBottom: '22px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '7px 12px',
            borderRadius: '20px',
            background: '#2a2410',
            color: '#d4af37',
            fontSize: '11px',
            fontWeight: 'bold',
            letterSpacing: '1.5px',
            marginBottom: '12px',
          }}
        >
          SERVICE APPLICATION
        </div>

        <h2
          style={{
            margin: '0 0 10px',
            color: '#ffffff',
            fontSize: '28px',
            lineHeight: '1.3',
          }}
        >
          {selectedService.name}
        </h2>

        <p
          style={{
            margin: '0',
            color: '#999',
            fontSize: '14px',
            lineHeight: '1.6',
          }}
        >
          {selectedService.description ||
            'Please provide your details to continue with this service.'}
        </p>
      </div>

      {/* CUSTOMER DETAILS */}
      <div style={{ marginBottom: '18px' }}>
        <label style={styles.formLabel}>
          Customer Name
        </label>

        <input
          type="text"
          value={customerName}
          readOnly
          style={styles.input}
        />
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label style={styles.formLabel}>
          Mobile Number
        </label>

        <input
          type="tel"
          value={customerPhone}
          onChange={(e) =>
            setCustomerPhone(e.target.value)
          }
          placeholder="Enter your mobile number"
          style={styles.input}
          required
        />
      </div>

      <div style={{ marginBottom: '22px' }}>
        <label style={styles.formLabel}>
          Full Address
        </label>

        <textarea
          value={customerAddress}
          onChange={(e) =>
            setCustomerAddress(e.target.value)
          }
          placeholder="Enter your full address"
          rows="4"
          style={{
            ...styles.input,
            resize: 'vertical',
          }}
          required
        />
      </div>

      {/* QUANTITY / OPTIONS */}
{selectedService.name === 'Xerox' && (
  <div style={{ marginBottom: '20px' }}>
    <label
      style={{
        display: 'block',
        color: '#aaa',
        fontSize: '14px',
        fontWeight: '600',
        marginBottom: '10px',
      }}
    >
      Number of Pages
    </label>

    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#191919',
        border: '1px solid #333',
        borderRadius: '12px',
        padding: '8px',
      }}
    >
      <button
        type="button"
        onClick={() =>
          setQuantity(Math.max(1, quantity - 1))
        }
        style={{
          width: '45px',
          height: '45px',
          borderRadius: '10px',
          border: '1px solid #444',
          background: '#242424',
          color: '#fff',
          fontSize: '24px',
          cursor: 'pointer',
        }}
      >
        −
      </button>

      <div
        style={{
          textAlign: 'center',
          minWidth: '100px',
        }}
      >
        <div
          style={{
            fontSize: '22px',
            fontWeight: '800',
            color: '#fff',
          }}
        >
          {quantity}
        </div>

        <div
          style={{
            fontSize: '11px',
            color: '#777',
          }}
        >
          pages
        </div>
      </div>

      <button
        type="button"
        onClick={() =>
          setQuantity(quantity + 1)
        }
        style={{
          width: '45px',
          height: '45px',
          borderRadius: '10px',
          border: '1px solid #444',
          background: '#242424',
          color: '#fff',
          fontSize: '24px',
          cursor: 'pointer',
        }}
      >
        +
      </button>
    </div>
  </div>
)}

{/* PASSPORT PHOTO */}
{selectedService.name === 'Passport Size Photo' && (
  <div style={{ marginBottom: '20px' }}>
    <label
      style={{
        display: 'block',
        color: '#aaa',
        fontSize: '14px',
        fontWeight: '600',
        marginBottom: '10px',
      }}
    >
      Photo Quantity
    </label>

    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
      }}
    >
      {[3, 6, 9, 12].map((count) => (
        <button
          key={count}
          type="button"
          onClick={() => setPhotoCount(count)}
          style={{
            padding: '13px 8px',
            borderRadius: '10px',
            border:
              photoCount === count
                ? '1px solid #d4af37'
                : '1px solid #333',
            background:
              photoCount === count
                ? '#2a2412'
                : '#191919',
            color:
              photoCount === count
                ? '#d4af37'
                : '#ddd',
            fontWeight: '700',
            cursor: 'pointer',
          }}
        >
          {count} Photos
          <div
            style={{
              fontSize: '12px',
              marginTop: '4px',
              color:
                photoCount === count
                  ? '#d4af37'
                  : '#777',
            }}
          >
            ₹
            {count === 3
              ? 20
              : count === 6
              ? 35
              : count === 9
              ? 50
              : 65}
          </div>
        </button>
      ))}
    </div>
  </div>
)}

{/* PRINTING */}
{selectedService.name === 'Printing' && (
  <div style={{ marginBottom: '20px' }}>
    <label
      style={{
        display: 'block',
        color: '#aaa',
        fontSize: '14px',
        fontWeight: '600',
        marginBottom: '10px',
      }}
    >
      Number of Pages
    </label>

    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#191919',
        border: '1px solid #333',
        borderRadius: '12px',
        padding: '8px',
      }}
    >
      <button
        type="button"
        onClick={() =>
          setPrintingCount(
            Math.max(1, printingCount - 1)
          )
        }
        style={{
          width: '45px',
          height: '45px',
          borderRadius: '10px',
          border: '1px solid #444',
          background: '#242424',
          color: '#fff',
          fontSize: '24px',
          cursor: 'pointer',
        }}
      >
        −
      </button>

      <div
        style={{
          textAlign: 'center',
          minWidth: '100px',
        }}
      >
        <div
          style={{
            fontSize: '22px',
            fontWeight: '800',
            color: '#fff',
          }}
        >
          {printingCount}
        </div>

        <div
          style={{
            fontSize: '11px',
            color: '#777',
          }}
        >
          pages
        </div>
      </div>

      <button
        type="button"
        onClick={() =>
          setPrintingCount(printingCount + 1)
        }
        style={{
          width: '45px',
          height: '45px',
          borderRadius: '10px',
          border: '1px solid #444',
          background: '#242424',
          color: '#fff',
          fontSize: '24px',
          cursor: 'pointer',
        }}
      >
        +
      </button>
    </div>

    <div
      style={{
        marginTop: '8px',
        color: '#777',
        fontSize: '12px',
      }}
    >
      1–99 pages: ₹10/page • 100+ pages: ₹3/page
    </div>
  </div>
)}

{/* PRICE */}
<div
  style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 18px',
    marginBottom: '20px',
    borderRadius: '12px',
    background: '#191919',
    border: '1px solid #292929',
  }}
>
  <span style={{ color: '#999' }}>
    Service Charge
  </span>

  <strong
    style={{
      color: '#d4af37',
      fontSize: '20px',
    }}
  >
    {getOrderAmount()
      ? `₹${getOrderAmount()}`
      : 'Contact us'}
  </strong>
</div>

      {/* ACTION BUTTONS */}
      <div
        className="action-buttons-mobile"
        style={{
          display: 'flex',
          gap: '12px',
        }}
      >
        <button
          type="button"
          onClick={() => setSelectedService(null)}
          style={{
            flex: '0 0 110px',
            padding: '14px',
            borderRadius: '10px',
            border: '1px solid #444',
            background: 'transparent',
            color: '#aaa',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Close
        </button>

        <button
          type="button"
          onClick={() => {
            if (!customerPhone || !customerAddress) {
              alert(
                'Please enter mobile number and address.'
              )
              return
            }

            createOrder()
          }}
          style={{
            flex: 1,
            padding: '14px',
            border: 'none',
            borderRadius: '10px',
            background: '#d4af37',
            color: '#000',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '15px',
          }}
        >
          CONTINUE TO ORDER →
        </button>
      </div>
    </div>
  </section>
)}
{/* PAYMENT SCREEN */}
{paymentOrder && (
  <section
  className="payment-form-mobile"
    style={{
      maxWidth: '760px',
      margin: '0 auto 60px',
      padding: '0 6%',
      boxSizing: 'border-box',
    }}
  >
    <div
      className="payment-form-card-mobile"
      style={{
        background: 'linear-gradient(145deg, #151515, #0d0d0d)',
        border: '1px solid #d4af37',
        borderRadius: '22px',
        padding: '32px',
        boxShadow: '0 20px 60px rgba(0,0,0,.45)',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-block',
            padding: '7px 14px',
            borderRadius: '20px',
            background: '#2a2410',
            color: '#d4af37',
            fontSize: '11px',
            fontWeight: 'bold',
            letterSpacing: '1.5px',
          }}
        >
          SECURE PAYMENT
        </div>

        <h2
          style={{
            color: '#fff',
            margin: '18px 0 8px',
            fontSize: '28px',
          }}
        >
          Complete Your Payment
        </h2>

        <p style={{ color: '#888', marginBottom: '25px' }}>
          {selectedService?.name}
        </p>
      </div>

      {/* AMOUNT */}
      <div
        style={{
          textAlign: 'center',
          padding: '22px',
          background: '#191919',
          borderRadius: '15px',
          border: '1px solid #292929',
          marginBottom: '20px',
        }}
      >
        <div style={{ color: '#888', fontSize: '13px' }}>
          PAYABLE AMOUNT
        </div>

        <div
          style={{
            color: '#d4af37',
            fontSize: '38px',
            fontWeight: 'bold',
            marginTop: '5px',
          }}
        >
          ₹{paymentOrder.amount}
        </div>
      </div>

      {/* UPI DETAILS */}
      <div
        style={{
          background: '#101010',
          border: '1px solid #292929',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '20px',
          textAlign: 'center',
        }}
      >
        {/* QR PAYMENT */}
<div
  style={{
    background: '#ffffff',
    borderRadius: '18px',
    padding: '18px',
    marginBottom: '20px',
    textAlign: 'center',
    border: '1px solid #292929',
  }}
>
  <div
    style={{
      color: '#222',
      fontSize: '14px',
      fontWeight: 'bold',
      marginBottom: '12px',
    }}
  >
    SCAN & PAY
  </div>

  <img
    src={paymentQR}
    alt="GOPI ONLINE UPI QR Code"
    style={{
      width: '100%',
      maxWidth: '330px',
      display: 'block',
      margin: '0 auto',
      borderRadius: '12px',
    }}
  />

  <div
    style={{
      marginTop: '12px',
      color: '#333',
      fontSize: '14px',
      fontWeight: '600',
    }}
  >
    Scan to pay with any UPI app
  </div>

  <div
    style={{
      marginTop: '6px',
      color: '#666',
      fontSize: '13px',
    }}
  >
    UPI ID: gopi742301@okicici
  </div>
</div>
        <div
          style={{
            color: '#999',
            fontSize: '13px',
            marginBottom: '8px',
          }}
        >
          GOPI ONLINE UPI ID
        </div>

        <div
          style={{
            color: '#fff',
            fontSize: '20px',
            fontWeight: 'bold',
            letterSpacing: '1px',
          }}
        >
          gopi742301@okicici
        </div>
      </div>
<div style={{
  marginTop: '14px',
  padding: '12px 16px',
  borderRadius: '10px',
  background: 'rgba(255, 193, 7, 0.08)',
  border: '1px solid rgba(255, 193, 7, 0.25)',
  textAlign: 'center'
}}>
  
</div>
      {/* GOOGLE PAY */}
      <a
        href={`upi://pay?pa=gopi742301@okicici&pn=GOPI%20ONLINE&am=${paymentOrder.amount}&cu=INR`}
        style={{
          display: 'block',
          textAlign: 'center',
          textDecoration: 'none',
          padding: '15px',
          borderRadius: '11px',
          background: '#d4af37',
          color: '#000',
          fontWeight: 'bold',
          fontSize: '16px',
          marginBottom: '18px',
        }}
      >
        💳 PAY ₹{paymentOrder.amount} NOW
      </a>

      <p
        style={{
          color: '#777',
          textAlign: 'center',
          fontSize: '12px',
          lineHeight: '1.6',
        }}
      >
        Google Pay/UPI app খুলে payment complete করুন।
        <br />
        Payment করার পরে নিচে UTR / Transaction ID দিন।
      </p>

      {/* TRANSACTION ID */}
      <label style={styles.formLabel}>
        UTR / Transaction ID
      </label>

      <input
        type="text"
        value={transactionReference}
        onChange={(e) =>
          setTransactionReference(e.target.value)
        }
        placeholder="Enter UTR / Transaction ID"
        style={styles.input}
      />

      {/* SUBMIT PAYMENT */}
      <button
        type="button"
        disabled={paymentLoading}
        onClick={async () => {
          if (!transactionReference.trim()) {
            alert('Please enter UTR / Transaction ID.')
            return
          }

          setPaymentLoading(true)

          const { error } = await supabase
            .from('payments')
            .insert({
              order_id: paymentOrder.id,
              user_id: session.user.id,
              amount: paymentOrder.amount,
              payment_method: 'Google Pay / UPI',
              transaction_reference:
                transactionReference.trim(),
              status: 'Pending',
            })

          if (error) {
            alert(
              'Payment submission failed: ' +
                error.message
            )
            setPaymentLoading(false)
            return
          }
          const { error: orderError } = await supabase
  .from('orders')
  .update({
    status: 'Payment Submitted',
    updated_at: new Date().toISOString(),
  })
  .eq('id', paymentOrder.id)
  .eq('user_id', session.user.id)

if (orderError) {
  alert(
    'Payment saved, but order status update failed: ' +
      orderError.message
  )
  setPaymentLoading(false)
  return
}

          alert(
            '✅ Payment submitted successfully! Your payment is waiting for verification.'
          )
          setOrders((prevOrders) =>
  prevOrders.map((order) =>
    order.id === paymentOrder.id
      ? {
          ...order,
          status: 'Payment Submitted',
          updated_at: new Date().toISOString(),
        }
      : order
  )
)

          setPaymentOrder(null)
          setSelectedService(null)
          setTransactionReference('')
          setCustomerPhone('')
          setCustomerAddress('')
          setPaymentLoading(false)
        }}
        style={{
          width: '100%',
          padding: '15px',
          border: 'none',
          borderRadius: '10px',
          background: '#d4af37',
          color: '#000',
          fontWeight: 'bold',
          fontSize: '15px',
          cursor: 'pointer',
        }}
      >
        {paymentLoading
          ? 'PLEASE WAIT...'
          : '✅ I HAVE PAID — SUBMIT PAYMENT'}
      </button>

      <button
        type="button"
        onClick={() => {
          setOrders((prevOrders) =>
  prevOrders.map((order) =>
    order.id === paymentOrder.id
      ? { ...order, status: 'Payment Submitted' }
      : order
  )
)
          setPaymentOrder(null)
          setTransactionReference('')
        }}
        style={{
          width: '100%',
          marginTop: '10px',
          padding: '12px',
          border: '1px solid #444',
          borderRadius: '10px',
          background: 'transparent',
          color: '#888',
          cursor: 'pointer',
        }}
      >
        Cancel Payment
      </button>
    </div>
  </section>
)}
      {/* INFO */}
      <section 
      className="info-section-mobile"
      style={styles.infoSection}>
        <div style={styles.infoCard}>
          <div style={styles.infoIcon}>📞</div>

          <div>
            <h3>Need Help?</h3>
            <p>Call us at 9609047478</p>
          </div>
        </div>

        <div style={styles.infoCard}>
          <div style={styles.infoIcon}>📍</div>

          <div>
            <h3>Visit Us</h3>
            <p>BD SHERPUR, THAKUR PARA</p>
          </div>
        </div>

        <div style={styles.infoCard}>
          <div style={styles.infoIcon}>💳</div>

          <div>
            <h3>Easy Payment</h3>
            <p>Google Pay Available</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer 
      className="footer-mobile"
      style={styles.footer}>
        <strong>GOPI ONLINE</strong>
        <span>
  © {new Date().getFullYear()} GOPI ONLINE. Digital Service Center.
</span>
      </footer>
    </div>
  )
}
function formatDateTime(dateString) {
  if (!dateString) return '-'

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(dateString))
}
function getServiceIcon(name) {
  const text = name.toLowerCase()

  if (text.includes('pan')) return '🪪'
  if (text.includes('voter')) return '🗳️'
  if (text.includes('form')) return '📝'
  if (text.includes('xerox')) return '📄'
  if (text.includes('photo')) return '📸'
  if (text.includes('printing')) return '🖨️'

  return '💼'
}
const responsiveCSS = `
  * {
    box-sizing: border-box;
  }

  @media (max-width: 600px) {

    /* LOGIN */
    .login-card-mobile {
      padding: 24px !important;
      border-radius: 18px !important;
    }

    /* CUSTOMER DASHBOARD */
    .dashboard-header-mobile {
      padding: 14px 5% !important;
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 12px !important;
    }

    .dashboard-header-right-mobile {
      width: 100% !important;
      justify-content: space-between !important;
    }

    .dashboard-hero-mobile {
      padding: 40px 5% !important;
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 25px !important;
    }

    .dashboard-hero-title-mobile {
      font-size: 36px !important;
    }

    .dashboard-hero-icon-mobile {
      font-size: 70px !important;
      align-self: center !important;
    }

    .dashboard-hero-buttons-mobile {
      width: 100% !important;
      flex-direction: column !important;
    }

    .dashboard-hero-buttons-mobile button {
      width: 100% !important;
    }

    .dashboard-section-mobile {
      padding: 20px 5% 50px !important;
    }

    .dashboard-section-heading-mobile {
      align-items: flex-start !important;
      flex-direction: column !important;
      gap: 8px !important;
    }

    .dashboard-section-title-mobile {
      font-size: 27px !important;
    }

    .service-grid-mobile {
      grid-template-columns: 1fr !important;
    }

    .order-form-mobile,
    .payment-form-mobile {
      padding: 0 5% !important;
    }

    .order-form-card-mobile,
    .payment-form-card-mobile {
      padding: 20px !important;
      border-radius: 16px !important;
    }

    .action-buttons-mobile {
      flex-direction: column !important;
    }

    .action-buttons-mobile button {
      width: 100% !important;
      flex: 1 1 auto !important;
    }

    .info-section-mobile {
      padding: 0 5% 45px !important;
      grid-template-columns: 1fr !important;
    }

    .footer-mobile {
      padding: 20px 5% !important;
      flex-direction: column !important;
      gap: 10px !important;
      text-align: center !important;
    }

    /* ADMIN DASHBOARD */
    .admin-page-mobile {
      padding: 20px 12px !important;
    }

    .admin-header-mobile {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 15px !important;
    }

    .admin-header-mobile button {
      width: 100% !important;
    }

    .admin-card-mobile {
      padding: 16px !important;
    }

    .admin-section-mobile {
      padding: 16px !important;
      border-radius: 12px !important;
    }

    .admin-section-mobile h2 {
      font-size: 22px !important;
    }

    .admin-order-card-mobile {
      padding: 15px !important;
      overflow-wrap: anywhere !important;
    }

    .admin-order-card-mobile select {
      font-size: 14px !important;
    }
  }
`
const styles = {
  formLabel: {
  display: 'block',
  color: '#d4af37',
  fontSize: '13px',
  fontWeight: 'bold',
  marginBottom: '8px',
},
  loginPage: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background:
      'linear-gradient(135deg, #050505, #111111)',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },

  loginCard: {
    width: '100%',
    maxWidth: '430px',
    background: '#111',
    border: '1px solid #292929',
    borderRadius: '24px',
    padding: '35px',
    boxShadow: '0 25px 70px rgba(0,0,0,.5)',
  },

  logoCircle: {
    width: '65px',
    height: '65px',
    borderRadius: '50%',
    background: '#d4af37',
    color: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '0 auto 15px',
  },

  logoTitle: {
    color: '#d4af37',
    textAlign: 'center',
    margin: '0',
    letterSpacing: '2px',
  },

  logoSubtitle: {
    color: '#aaa',
    textAlign: 'center',
    marginBottom: '28px',
  },

  tabs: {
    display: 'flex',
    background: '#080808',
    borderRadius: '12px',
    padding: '4px',
    marginBottom: '22px',
  },

  tab: {
    flex: 1,
    padding: '12px',
    border: 'none',
    borderRadius: '9px',
    background: 'transparent',
    color: '#aaa',
    cursor: 'pointer',
    fontWeight: 'bold',
  },

  activeTab: {
    background: '#d4af37',
    color: '#000',
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '14px',
    marginBottom: '14px',
    borderRadius: '10px',
    border: '1px solid #333',
    background: '#080808',
    color: '#fff',
    outline: 'none',
    fontSize: '15px',
  },

  mainButton: {
    width: '100%',
    padding: '14px',
    border: 'none',
    borderRadius: '10px',
    background: '#d4af37',
    color: '#000',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '15px',
  },

  message: {
    marginTop: '15px',
    padding: '12px',
    borderRadius: '10px',
    background: '#1c1c1c',
    color: '#d4af37',
    textAlign: 'center',
  },

  contactBox: {
    marginTop: '25px',
    paddingTop: '20px',
    borderTop: '1px solid #292929',
    color: '#999',
    textAlign: 'center',
    lineHeight: '1.9',
    fontSize: '13px',
  },

  dashboardPage: {
    minHeight: '100vh',
    background: '#080808',
    color: '#fff',
    fontFamily: 'Arial, sans-serif',
  },

  header: {
    minHeight: '75px',
    padding: '0 6%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #242424',
    background: '#0d0d0d',
    boxSizing: 'border-box',
  },

  headerLogo: {
    color: '#d4af37',
    fontSize: '22px',
    fontWeight: 'bold',
    letterSpacing: '2px',
  },

  headerSub: {
    color: '#777',
    fontSize: '12px',
    marginTop: '3px',
  },

  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },

  welcome: {
    color: '#ccc',
    fontSize: '14px',
  },

  logoutButton: {
    padding: '9px 16px',
    border: '1px solid #444',
    borderRadius: '8px',
    background: 'transparent',
    color: '#ddd',
    cursor: 'pointer',
  },

  hero: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '70px 6%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
  },

  smallGold: {
    color: '#d4af37',
    fontSize: '12px',
    fontWeight: 'bold',
    letterSpacing: '2px',
  },

  heroTitle: {
    fontSize: '48px',
    lineHeight: '1.1',
    margin: '15px 0',
  },

  heroText: {
    color: '#999',
    maxWidth: '570px',
    lineHeight: '1.7',
    fontSize: '16px',
  },

  heroButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '25px',
  },

  goldButton: {
    padding: '13px 22px',
    border: 'none',
    borderRadius: '9px',
    background: '#d4af37',
    color: '#000',
    fontWeight: 'bold',
    cursor: 'pointer',
  },

  outlineButton: {
    padding: '13px 22px',
    border: '1px solid #444',
    borderRadius: '9px',
    background: 'transparent',
    color: '#fff',
    cursor: 'pointer',
  },

  heroIcon: {
    fontSize: '110px',
    opacity: '.8',
  },

  section: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px 6% 70px',
    boxSizing: 'border-box',
  },

  sectionHeading: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'end',
    marginBottom: '30px',
  },

  sectionTitle: {
    fontSize: '32px',
    margin: '5px 0 0',
  },

  serviceCount: {
    color: '#888',
    fontSize: '14px',
  },

  serviceGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '18px',
  },

  serviceCard: {
    background: '#111',
    border: '1px solid #252525',
    borderRadius: '18px',
    padding: '23px',
    transition: '0.2s',
  },

  serviceIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    background: '#1c1a12',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '25px',
    marginBottom: '18px',
  },

  serviceTitle: {
    fontSize: '18px',
    margin: '0 0 10px',
  },

  serviceDescription: {
    color: '#888',
    lineHeight: '1.6',
    minHeight: '48px',
    fontSize: '14px',
  },

  cardBottom: {
    marginTop: '20px',
    paddingTop: '15px',
    borderTop: '1px solid #242424',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  price: {
    color: '#d4af37',
    fontWeight: 'bold',
  },

  orderButton: {
    border: 'none',
    background: '#d4af37',
    color: '#000',
    padding: '9px 14px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },

  infoSection: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 6% 60px',
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '15px',
    boxSizing: 'border-box',
  },

  infoCard: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    padding: '20px',
    background: '#101010',
    border: '1px solid #242424',
    borderRadius: '14px',
  },

  infoIcon: {
    fontSize: '28px',
  },

  footer: {
    borderTop: '1px solid #242424',
    padding: '25px 6%',
    display: 'flex',
    justifyContent: 'space-between',
    color: '#777',
    fontSize: '13px',
    boxSizing: 'border-box',
  },
}

export default App