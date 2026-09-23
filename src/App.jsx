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
    <>
      <style>{`
        /* ================================
           GOPI ONLINE - MOBILE RESPONSIVE
           ================================ */

        .services-grid {
          width: 100%;
        }

        .service-card {
          box-sizing: border-box;
        }

        /* TABLET */
        @media (max-width: 900px) {
          .services-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 16px !important;
          }

          .service-card {
            min-height: 300px !important;
            padding: 20px !important;
          }
        }

        /* MOBILE */
        @media (max-width: 600px) {
          .services-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 12px !important;
          }

          .service-card {
            width: 100% !important;
            min-width: 0 !important;
            min-height: 0 !important;
            padding: 16px !important;
            border-radius: 16px !important;
          }

          .service-card h2 {
            font-size: 16px !important;
            line-height: 1.35 !important;
            word-break: normal !important;
            overflow-wrap: break-word !important;
            margin-bottom: 8px !important;
          }

          .service-card p {
            font-size: 12px !important;
            line-height: 1.55 !important;
            min-height: 72px !important;
            margin-bottom: 14px !important;
          }

          .service-card > div:first-child {
            width: 50px !important;
            height: 50px !important;
            font-size: 25px !important;
            border-radius: 15px !important;
            margin-bottom: 14px !important;
          }

          .service-card button {
            padding: 9px 10px !important;
            font-size: 11px !important;
            white-space: nowrap !important;
          }

          .service-card [style*="font-size: 23px"] {
            font-size: 19px !important;
          }

          /* One Stop Digital Solution */
          .one-stop-card {
            grid-column: 1 / -1 !important;
            min-height: 280px !important;
            width: 100% !important;
          }
        }

        /* SMALL PHONES */
        @media (max-width: 380px) {
          .services-grid {
            grid-template-columns: 1fr !important;
          }

          .service-card {
            min-height: 250px !important;
          }

          .one-stop-card {
            grid-column: 1 !important;
          }
        }
      `}</style>

      <div style={styles.loginPage}>

    {/* Animated Background */}
    <div style={styles.bgGlow1}></div>
    <div style={styles.bgGlow2}></div>
    <div style={styles.bgGlow3}></div>

    <div style={styles.loginCard}>

      {/* Logo */}
      <div style={styles.logoCircle}>
        <span>G</span>
      </div>

      <h1 style={styles.logoTitle}>GOPI ONLINE</h1>

      <p style={styles.logoSubtitle}>
        Digital Service & Online Center
      </p>

      {/* Login / Register Tabs */}
      <div style={styles.tabs}>

        <button
          type="button"
          onClick={() => setIsLogin(true)}
          style={{
            ...styles.tab,
            ...(isLogin ? styles.activeTab : {}),
          }}
        >
          LOGIN
        </button>

        <button
          type="button"
          onClick={() => setIsLogin(false)}
          style={{
            ...styles.tab,
            ...(!isLogin ? styles.activeTab : {}),
          }}
        >
          REGISTER
        </button>

      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>

        {!isLogin && (
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>FULL NAME</label>

            <input
              style={styles.input}
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}

        <div style={styles.inputGroup}>
          <label style={styles.inputLabel}>EMAIL ADDRESS</label>

          <input
            style={styles.input}
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.inputLabel}>PASSWORD</label>

          <input
            style={styles.input}
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        {/* Main Button */}
        <button
          type="submit"
          disabled={loading}
          style={styles.mainButton}
        >
          {loading
            ? 'PLEASE WAIT...'
            : isLogin
            ? 'LOGIN TO ACCOUNT'
            : 'CREATE ACCOUNT'}
        </button>

      </form>

      {/* Message */}
      {message && (
        <div style={styles.message}>
          {message}
        </div>
      )}

      {/* Contact */}
      <div style={styles.contactBox}>

        <div style={styles.contactItem}>
          <span style={styles.contactIcon}>☎</span>
          <span>9609047478</span>
        </div>

        <div style={styles.contactItem}>
          <span style={styles.contactIcon}>⌖</span>
          <span>BD SHERPUR, THAKUR PARA</span>
        </div>

      </div>

      <div style={styles.bottomText}>
        © 2026 GOPI ONLINE • All Rights Reserved
        
      </div>
    </div>
    </div>
    </>
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
        background: 'linear-gradient(135deg, #080808, #121212, #080808)',
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
            background: 'linear-gradient(145deg, #181818, #101010)',
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
              Open Google Pay, PhonePe, Paytm or any UPI app on your mobile and scan the QR code below.
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
              After completing the payment, enter the UTR or Transaction ID received from your UPI app.
            </p>

            <input
              type="text"
              placeholder="Enter UTR / Transaction ID"
              value={transactionReference}
              onChange={(e) => setTransactionReference(e.target.value)}
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
              {submitting ? 'SUBMITTING...' : 'SUBMIT PAYMENT DETAILS'}
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
          🔒 Payment is verified manually using the submitted UTR / Transaction ID. Your order will be processed after payment verification.
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
  const [hoveredService, setHoveredService] = useState(null)
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
    <>
      <div
        style={{
          minHeight: '100vh',
          position: 'relative',
          background:
            'radial-gradient(circle at 15% 20%, rgba(0,217,255,0.08), transparent 30%), radial-gradient(circle at 85% 30%, rgba(168,85,247,0.08), transparent 30%), radial-gradient(circle at 50% 90%, rgba(212,175,55,0.07), transparent 35%), linear-gradient(135deg, #050505 0%, #0d0d0d 50%, #050505 100%)',
          color: '#fff',
          padding: '30px 18px 60px',
        }}
      >
        <div
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 0,
            background:
              'radial-gradient(circle at 15% 20%, rgba(0,217,255,0.10), transparent 28%), radial-gradient(circle at 85% 25%, rgba(168,85,247,0.10), transparent 28%), radial-gradient(circle at 50% 85%, rgba(212,175,55,0.08), transparent 30%)',
          }}
        />

        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 1,
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
  className="services-grid"
  style={{
    display: 'grid',
    gridTemplateColumns:
      'repeat(4, minmax(0, 1fr))',
    gap: '22px',
  }}
>
              {services.map((service, index) => {
                const colors = [
                  '#00d9ff',
                  '#a855f7',
                  '#00ff88',
                  '#ffb000',
                  '#ff4fd8',
                  '#4f7cff',
                ]

                const glow = colors[index % colors.length]

                return (
                  <div
                  className="service-card"
                    key={service.id}
                    onMouseEnter={() => setHoveredService(service.id)}
                    onMouseLeave={() => setHoveredService(null)}
                    style={{
                      position: 'relative',
                      overflow: 'hidden',
                      background:
                        'linear-gradient(145deg, rgba(22,22,22,0.96), rgba(8,8,8,0.98))',
                      border:
                        hoveredService === service.id
                          ? `1px solid ${glow}`
                          : '1px solid #292929',
                      borderRadius: '20px',
                      padding: '25px',
                      minHeight: '280px',
                      transition:
                        'transform 0.35s ease, box-shadow 0.35s ease, border 0.35s ease',
                      transform:
                        hoveredService === service.id
                          ? 'translateY(-8px)'
                          : 'translateY(0)',
                      boxShadow:
                        hoveredService === service.id
                          ? `0 0 12px ${glow}88, 0 0 40px ${glow}33, 0 18px 50px rgba(0,0,0,0.55)`
                          : '0 8px 25px rgba(0,0,0,0.25)',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: '12%',
                        width: '76%',
                        height: '2px',
                        background: glow,
                        boxShadow: `0 0 15px ${glow}`,
                        opacity: hoveredService === service.id ? 1 : 0.35,
                        transition: '0.35s',
                      }}
                    />

                    <div
                      style={{
                        width: '62px',
                        height: '62px',
                        borderRadius: '18px',
                        background: `${glow}12`,
                        border: `1px solid ${glow}66`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '30px',
                        marginBottom: '20px',
                        boxShadow:
                          hoveredService === service.id
                            ? `0 0 25px ${glow}66`
                            : `0 0 12px ${glow}22`,
                        transform:
                          hoveredService === service.id
                            ? 'scale(1.08) rotate(2deg)'
                            : 'scale(1)',
                        transition: '0.35s',
                      }}
                    >
                      {getIcon(service.name)}
                    </div>

                    <h2
                      style={{
                        fontSize: '19px',
                        margin: '0 0 10px',
                        lineHeight: '1.4',
                        color: '#fff',
                        fontWeight: '800',
                      }}
                    >
                      {service.name}
                    </h2>

                    <p
                      style={{
                        color: '#c8d0df',
                        fontSize: '13px',
                        minHeight: '58px',
                        margin: '0 0 18px',
                        lineHeight: '1.65',
                      }}
                    >
                      {service.name === 'Xerox' &&
                        'Fast, reliable and secure document copying services for your needs.'}

                      {service.name === 'Printing' &&
                        'Print, scan and document services at your convenience.'}

                      {service.name === 'Online Form Fill-up' &&
                        'Fill up forms, applications and online submissions.'}

                      {service.name === 'Passport Size Photo' &&
                        'Photo editing, resizing and printing services.'}

                      {service.name === 'Voter Card Application Assistance' &&
                        'ID card, certificate and document services.'}

                      {service.name === 'PAN Card Application Assistance' &&
                        'PAN card application and document assistance.'}
                    </p>

                    <div
                      style={{
                        height: '1px',
                        background: `linear-gradient(90deg, ${glow}88, transparent)`,
                        marginBottom: '20px',
                      }}
                    />

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            color: '#666',
                            fontSize: '10px',
                            fontWeight: '700',
                            letterSpacing: '1.5px',
                            marginBottom: '4px',
                          }}
                        >
                          STARTING FROM
                        </div>

                        <div
                          style={{
                            color: glow,
                            fontSize: '23px',
                            fontWeight: '900',
                            textShadow:
                              hoveredService === service.id
                                ? `0 0 12px ${glow}`
                                : 'none',
                            transition: '0.3s',
                          }}
                        >
                          ₹{service.price}
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedService(service)}
                        style={{
                          padding: '12px 17px',
                          borderRadius: '12px',
                          border: `1px solid ${glow}`,
                          background:
                            hoveredService === service.id ? glow : `${glow}18`,
                          color: hoveredService === service.id ? '#050505' : '#fff',
                          fontWeight: '900',
                          cursor: 'pointer',
                          letterSpacing: '0.4px',
                          boxShadow:
                            hoveredService === service.id
                              ? `0 0 20px ${glow}88`
                              : `0 0 8px ${glow}22`,
                          transition: '0.3s',
                        }}
                      >
                        ORDER NOW →
                      </button>
                    </div>
                  </div>
                )
              })}

              <div
                style={{
                  gridColumn: '3 / span 2',
                  minHeight: '330px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '20px',
                  background:
                    'radial-gradient(circle at 50% 35%, rgba(0,217,255,0.10), transparent 35%), linear-gradient(145deg, rgba(7,18,40,0.95), rgba(5,8,25,0.98))',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    width: '180px',
                    height: '180px',
                    borderRadius: '50%',
                    background:
                      'radial-gradient(circle, rgba(0,217,255,0.18), transparent 65%)',
                    top: '10%',
                    left: '35%',
                    filter: 'blur(10px)',
                  }}
                />

                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div
                    style={{
                      width: '58px',
                      height: '58px',
                      margin: '0 auto 18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '28px',
                      background:
                        'linear-gradient(145deg, #075cff, #092d75)',
                      border: '1px solid #198cff',
                      boxShadow: '0 0 25px rgba(0,140,255,0.65)',
                    }}
                  >
                    ⚡
                  </div>

                  <h2
                    style={{
                      margin: 0,
                      fontSize: '28px',
                      fontWeight: '900',
                      color: '#fff',
                    }}
                  >
                    Your One Stop
                  </h2>

                  <h2
                    style={{
                      margin: '5px 0 15px',
                      fontSize: '28px',
                      fontWeight: '900',
                      background:
                        'linear-gradient(90deg, #00d9ff, #7b2cff)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Digital Solution
                  </h2>

                  <p
                    style={{
                      margin: 0,
                      color: '#b8c4d8',
                      fontSize: '14px',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Save time&nbsp; • &nbsp;Get it done&nbsp; • &nbsp;Stay ahead
                  </p>
                </div>
              </div>
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

    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#0d0d0d',
        border: '1px solid #292929',
        borderRadius: '12px',
        overflow: 'hidden',
        height: '58px',
      }}
    >
      {/* MINUS */}
      <button
        type="button"
        onClick={() =>
          setQuantity((prev) => Math.max(1, prev - 1))
        }
        style={{
          width: '65px',
          height: '100%',
          border: 'none',
          background: '#1d1d1d',
          color: '#d4af37',
          fontSize: '28px',
          fontWeight: '800',
          cursor: 'pointer',
        }}
      >
        −
      </button>

      {/* QUANTITY */}
      <div
        style={{
          flex: 1,
          textAlign: 'center',
          color: '#fff',
          fontSize: '20px',
          fontWeight: '800',
        }}
      >
        {quantity}
      </div>

      {/* PLUS */}
      <button
        type="button"
        onClick={() =>
          setQuantity((prev) => prev + 1)
        }
        style={{
          width: '65px',
          height: '100%',
          border: 'none',
          background: '#1d1d1d',
          color: '#d4af37',
          fontSize: '28px',
          fontWeight: '800',
          cursor: 'pointer',
        }}
      >
        +
      </button>
    </div>
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
    </>
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
  <>
    <style>{`
    @keyframes headerAppear {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes logoGlow {
  0%, 100% {
    text-shadow:
      0 0 10px rgba(60,180,255,0.45),
      0 0 25px rgba(0,110,255,0.25);
  }

  50% {
    text-shadow:
      0 0 18px rgba(60,210,255,0.9),
      0 0 40px rgba(0,130,255,0.5);
  }
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow:
      0 0 20px rgba(0,150,255,0.25);
  }

  50% {
    transform: scale(1.06);
    box-shadow:
      0 0 32px rgba(0,180,255,0.55);
  }
}

@keyframes buttonGlow {
  0%, 100% {
    box-shadow:
      0 0 20px rgba(0,160,255,0.35),
      0 12px 30px rgba(0,80,220,0.25);
  }

  50% {
    box-shadow:
      0 0 38px rgba(0,190,255,0.65),
      0 15px 40px rgba(0,80,220,0.35);
  }
}
  .infoCard:hover {
  transform: translateY(-8px);
  border-color: rgba(50,190,255,0.75);
  box-shadow:
    0 25px 55px rgba(0,0,0,0.45),
    0 0 35px rgba(0,140,255,0.2);
}

button:hover {
  filter: brightness(1.12);
}

button:active {
  transform: scale(0.97);
}
      @keyframes dashboardHeroIn {
        from {
          opacity: 0;
          transform: translateY(30px) scale(0.98);
        }

        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes heroGlowFloat {
        0%, 100% {
          transform: translate(0, 0) scale(1);
        }

        50% {
          transform: translate(35px, -25px) scale(1.12);
        }
      }

      @keyframes heroCenterGlow {
        0%, 100% {
          transform: scale(0.85);
          opacity: 0.12;
        }

        50% {
          transform: scale(1.25);
          opacity: 0.25;
        }
      }

      @keyframes particleFloat {
        0%, 100% {
          transform: translateY(0) scale(1);
          opacity: 0.45;
        }

        50% {
          transform: translateY(-25px) scale(1.25);
          opacity: 1;
        }
      }

      @keyframes waveMove {
        0%, 100% {
          transform: translateX(0) rotate(-5deg);
        }

        50% {
          transform: translateX(35px) rotate(-3deg);
        }
      }

      @keyframes waveMoveReverse {
        0%, 100% {
          transform: translateX(0) rotate(4deg);
        }

        50% {
          transform: translateX(-40px) rotate(6deg);
        }
      }

      @keyframes titleReveal {
        from {
          opacity: 0;
          transform: translateY(25px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes textReveal {
        from {
          opacity: 0;
          transform: translateY(15px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes buttonGlow {
        0%, 100% {
          box-shadow: 0 12px 35px rgba(0,120,255,0.30);
        }

        50% {
          box-shadow: 0 12px 45px rgba(0,170,255,0.55);
        }
      }
        /* ========================================= */
/*        GOPI ONLINE MOBILE ONLY            */
/* ========================================= */

@media (max-width: 768px) {

  /* ================= HEADER ================= */

  .dashboard-header-mobile {
    padding: 12px 12px !important;
    min-height: 76px !important;
    box-sizing: border-box !important;
    border-radius: 0 0 24px 24px !important;
  }

  .dashboard-header-mobile > div:first-child {
    min-width: 0 !important;
  }

  .dashboard-header-logo-mobile {
    font-size: 19px !important;
    letter-spacing: 1.5px !important;
    white-space: nowrap !important;
  }

  .dashboard-header-sub-mobile {
    font-size: 9px !important;
    letter-spacing: 0.5px !important;
    white-space: nowrap !important;
  }

  .dashboard-header-right-mobile {
    gap: 6px !important;
    flex-shrink: 0 !important;
  }

  .dashboard-welcome-mobile {
    display: block !important;
    font-size: 10px !important;
    white-space: nowrap !important;
  }

  .dashboard-header-mobile button {
    padding: 9px 11px !important;
    font-size: 10px !important;
  }


  /* ================= HERO ================= */

  .dashboard-hero-mobile {
    margin: 14px !important;
    padding: 38px 18px 32px !important;
    min-height: 0 !important;
    box-sizing: border-box !important;
    border-radius: 25px !important;
    overflow: hidden !important;
  }

  .dashboard-hero-mobile > div:first-child {
    position: relative !important;
    z-index: 20 !important;
  }

  .dashboard-hero-title-mobile {
    font-size: 34px !important;
    line-height: 1.08 !important;
    letter-spacing: -1px !important;
    text-align: center !important;
  }

  .dashboard-hero-mobile p {
    font-size: 13px !important;
    line-height: 1.6 !important;
  }

  .dashboard-hero-buttons-mobile {
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
    gap: 12px !important;
  }

  .dashboard-hero-buttons-mobile button {
    width: 100% !important;
    box-sizing: border-box !important;
  }


  /* ================= INFO CARDS ================= */

  .dashboard-info-section-mobile {
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
    box-sizing: border-box !important;
    padding: 10px 14px 25px !important;
    gap: 14px !important;
  }

  .dashboard-info-card-mobile {
    width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
    padding: 20px !important;
    display: flex !important;
    align-items: center !important;
  }


  /* ================= FOOTER ================= */

  .dashboard-footer-mobile {
    padding: 25px 15px !important;
    text-align: center !important;
  }
}


/* ========================================= */
/*             SMALL PHONES                  */
/* ========================================= */

@media (max-width: 400px) {

  .dashboard-header-mobile {
    padding: 10px !important;
  }

  .dashboard-header-logo-mobile {
    font-size: 17px !important;
  }

  .dashboard-header-sub-mobile {
    font-size: 8px !important;
  }

  .dashboard-welcome-mobile {
    font-size: 9px !important;
  }

  .dashboard-header-mobile button {
    padding: 8px 9px !important;
    font-size: 10px !important;
  }

  .dashboard-hero-mobile {
    margin: 10px !important;
    padding: 30px 15px 28px !important;
  }

  .dashboard-hero-title-mobile {
    font-size: 29px !important;
  }

  .dashboard-hero-mobile p {
    font-size: 12px !important;
  }
}
  /* ========================================= */
/*     MOBILE FLOATING PARTICLES + GLOW      */
/* ========================================= */

@media (max-width: 768px) {

  .dashboard-hero-mobile {
    position: relative !important;
    overflow: hidden !important;
    box-shadow:
      0 0 25px rgba(0, 130, 255, 0.12),
      inset 0 0 45px rgba(0, 100, 255, 0.08) !important;
  }

  /* Floating blue particle field */
  .dashboard-hero-mobile::before {
    content: "" !important;
    position: absolute !important;
    inset: -20px !important;
    pointer-events: none !important;
    z-index: 1 !important;

    background-image:
      radial-gradient(circle, rgba(0, 190, 255, 0.9) 0 2px, transparent 3px),
      radial-gradient(circle, rgba(40, 130, 255, 0.8) 0 1.5px, transparent 3px),
      radial-gradient(circle, rgba(0, 220, 255, 0.7) 0 2px, transparent 3px),
      radial-gradient(circle, rgba(80, 160, 255, 0.7) 0 1px, transparent 3px);

    background-size:
      110px 150px,
      170px 190px,
      210px 230px,
      140px 210px;

    background-position:
      20px 30px,
      80px 100px,
      150px 40px,
      40px 160px;

    opacity: 0.45;

    animation: mobileParticleDrift 10s linear infinite;
  }


  /* Blue atmospheric glow */
  .dashboard-hero-mobile::after {
    content: "" !important;
    position: absolute !important;
    width: 260px !important;
    height: 260px !important;
    left: 50% !important;
    top: 45% !important;
    transform: translate(-50%, -50%) !important;
    border-radius: 50% !important;
    pointer-events: none !important;
    z-index: 2 !important;

    background: radial-gradient(
      circle,
      rgba(0, 170, 255, 0.20) 0%,
      rgba(0, 100, 255, 0.10) 35%,
      transparent 70%
    );

    filter: blur(15px);

    animation: mobileCenterGlow 5s ease-in-out infinite;
  }


  /* Keep Hero content above particles */
  .dashboard-hero-mobile > div {
    position: relative !important;
    z-index: 10 !important;
  }
}


/* Particle movement */
@keyframes mobileParticleDrift {

  0% {
    background-position:
      20px 30px,
      80px 100px,
      150px 40px,
      40px 160px;
  }

  50% {
    background-position:
      35px 0px,
      55px 70px,
      180px 75px,
      20px 120px;
  }

  100% {
    background-position:
      20px 30px,
      80px 100px,
      150px 40px,
      40px 160px;
  }
}


/* Center glow breathing */
@keyframes mobileCenterGlow {

  0%, 100% {
    opacity: 0.45;
    transform: translate(-50%, -50%) scale(0.85);
  }

  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2);
  }
}
  /* ========================================= */
/*       MOBILE HERO NEON WAVE EFFECT        */
/* ========================================= */

@media (max-width: 768px) {

  .dashboard-hero-mobile {
    box-shadow:
      0 0 25px rgba(0, 130, 255, 0.16),
      0 0 60px rgba(0, 90, 255, 0.08),
      inset 0 0 45px rgba(0, 110, 255, 0.08) !important;
  }

  /* Animated cyan wave */
  .dashboard-hero-mobile .hero-wave-mobile {
    position: absolute !important;
    left: -15% !important;
    bottom: 35px !important;
    width: 130% !important;
    height: 75px !important;
    border-top: 2px solid rgba(0, 190, 255, 0.55) !important;
    border-radius: 50% !important;
    transform: rotate(-4deg) !important;
    pointer-events: none !important;
    z-index: 5 !important;
    box-shadow:
      0 -4px 18px rgba(0, 180, 255, 0.25) !important;

    animation: mobileWaveMove 5s ease-in-out infinite !important;
  }

  .dashboard-hero-mobile .hero-wave-mobile::after {
    content: "" !important;
    position: absolute !important;
    left: 0 !important;
    top: 12px !important;
    width: 100% !important;
    height: 55px !important;
    border-top: 1px solid rgba(30, 120, 255, 0.45) !important;
    border-radius: 50% !important;

    animation: mobileWaveMoveReverse 7s ease-in-out infinite !important;
  }

  /* Stronger animated hero border */
  .dashboard-hero-mobile {
    animation:
      dashboardHeroIn 0.8s ease-out,
      mobileHeroBorderGlow 4s ease-in-out infinite !important;
  }
}


/* Wave movement */
@keyframes mobileWaveMove {

  0%, 100% {
    transform: translateX(0) rotate(-4deg);
  }

  50% {
    transform: translateX(28px) rotate(-2deg);
  }
}


@keyframes mobileWaveMoveReverse {

  0%, 100% {
    transform: translateX(0) rotate(3deg);
  }

  50% {
    transform: translateX(-30px) rotate(5deg);
  }
}


/* Border breathing glow */
@keyframes mobileHeroBorderGlow {

  0%, 100% {
    border-color: rgba(40, 150, 255, 0.30);
    box-shadow:
      0 0 25px rgba(0, 130, 255, 0.12),
      0 0 55px rgba(0, 90, 255, 0.06),
      inset 0 0 40px rgba(0, 100, 255, 0.06);
  }

  50% {
    border-color: rgba(40, 200, 255, 0.60);
    box-shadow:
      0 0 35px rgba(0, 170, 255, 0.25),
      0 0 75px rgba(0, 100, 255, 0.12),
      inset 0 0 55px rgba(0, 140, 255, 0.10);
  }
}
  


    `}</style>

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
    <span
  className="dashboard-welcome-mobile"
  style={styles.welcome}
>
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
  width: '44px',
  height: '44px',
  borderRadius: '14px',
  border: '1px solid rgba(56,167,255,0.35)',
  background:
    'linear-gradient(145deg, rgba(18,65,120,0.55), rgba(3,15,30,0.85))',
  color: '#58b7ff',
  fontSize: '20px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  boxShadow:
    '0 8px 25px rgba(0,110,255,0.15), inset 0 0 15px rgba(50,150,255,0.05)',
  transition: 'all 0.3s ease',
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
            background: 'linear-gradient(135deg, #38bdf8, #2563eb)',
color: '#ffffff',
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
          background: 'rgba(5,18,36,0.96)',
border: '1px solid rgba(56,167,255,0.22)',
          borderRadius: '16px',
         boxShadow:
  '0 20px 60px rgba(0,0,0,0.55), 0 0 35px rgba(0,110,255,0.12)',
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
<section
  className="dashboard-hero-mobile"
  style={styles.hero}
>
  {/* Animated background glow */}
  <div style={styles.heroGlowOne}></div>
  <div style={styles.heroGlowTwo}></div>
  <div style={styles.heroGlowThree}></div>

  {/* Floating particles */}
  <span style={{ ...styles.heroParticle, ...styles.particle1 }}>✦</span>
  <span style={{ ...styles.heroParticle, ...styles.particle2 }}>•</span>
  <span style={{ ...styles.heroParticle, ...styles.particle3 }}>✦</span>
  <span style={{ ...styles.heroParticle, ...styles.particle4 }}>•</span>
  <span style={{ ...styles.heroParticle, ...styles.particle5 }}>✦</span>

  {/* Floating service icons */}
  <div style={styles.floatingCard}>
    <div style={styles.floatingCardIcon}>▣</div>
    <div style={styles.floatingCardLine}></div>
    <div style={styles.floatingCardLineSmall}></div>
  </div>

  <div style={styles.floatingPrinter}>
    <div style={styles.printerIcon}>▤</div>
  </div>

  {/* Animated light waves */}
  <div style={styles.lightWaveOne}></div>
  <div style={styles.lightWaveTwo}></div>

  {/* HERO CONTENT */}
  <div style={styles.heroContent}>

    <p style={styles.smallGold}>
      ✦ &nbsp; WELCOME TO GOPI ONLINE &nbsp; ✦
    </p>

    <h1
      className="dashboard-hero-title-mobile"
      style={styles.heroTitle}
    >
      Your Digital Services,
      <br />
      <span style={styles.heroHighlight}>
        Simple & Fast.
      </span>
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
        style={styles.heroPrimaryButton}
      >
        ✦ &nbsp; Explore Services
      </button>

      <button
        onClick={() => {
          window.location.href = '/orders'
        }}
        style={styles.heroSecondaryButton}
      >
        ▣ &nbsp; My Orders
      </button>
    </div>

  </div>
  <div className="hero-wave-mobile"></div>
</section>
{/* INFORMATION CARDS */}
<section
  className="dashboard-info-section-mobile"
  style={styles.infoSection}
>

  {/* NEED HELP */}
  <div
    className="dashboard-info-card-mobile"
    style={styles.infoCard}
  >
    <div style={styles.infoIcon}>
      📞
    </div>

    <div>
      <h3 style={styles.infoTitle}>
        Need Help?
      </h3>

      <p style={styles.infoText}>
        Call us at{' '}
        <strong style={styles.infoHighlight}>
          9609047478
        </strong>
      </p>
    </div>
  </div>


  {/* VISIT US */}
  <div
    className="dashboard-info-card-mobile"
    style={styles.infoCard}
  >
    <div style={styles.infoIcon}>
      📍
    </div>

    <div>
      <h3 style={styles.infoTitle}>
        Visit Us
      </h3>

      <p style={styles.infoText}>
        BD SHERPUR, THAKUR PARA
      </p>
    </div>
  </div>


  {/* EASY PAYMENT */}
  <div
    className="dashboard-info-card-mobile"
    style={styles.infoCard}
  >
    <div style={styles.infoIcon}>
      💳
    </div>

    <div>
      <h3 style={styles.infoTitle}>
        Easy Payment
      </h3>

      <p style={styles.infoText}>
        Google Pay Available
      </p>
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

  <section style={styles.infoSection}>
    {/* Intentionally empty section */}
  </section>

  {/* FOOTER */}
  <footer
    className="footer-mobile"
    style={styles.footer}
  >
    <strong>GOPI ONLINE</strong>
    <span>
      © {new Date().getFullYear()} GOPI ONLINE. Digital Service Center.
    </span>
  </footer>
</div>
</>
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
if (typeof document !== 'undefined') {
  const style = document.createElement('style')

  style.innerHTML = `
    @keyframes cardAppear {
      from {
        opacity: 0;
        transform: translateY(30px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes logoPulse {
      0%, 100% {
        transform: scale(1);
        box-shadow:
          0 0 30px rgba(0,140,255,0.45),
          inset 0 0 20px rgba(255,255,255,0.08);
      }

      50% {
        transform: scale(1.06);
        box-shadow:
          0 0 45px rgba(0,140,255,0.65),
          inset 0 0 25px rgba(255,255,255,0.12);
      }
    }

    @keyframes floatGlow {
      0%, 100% {
        transform: translate(0, 0);
      }

      50% {
        transform: translate(25px, 30px);
      }
    }

    input:focus {
      border-color: #168cff !important;
      box-shadow:
        0 0 0 3px rgba(0,140,255,0.10),
        0 0 20px rgba(0,140,255,0.12) !important;
    }

    input::placeholder {
      color: #50647d;
    }

    button:hover {
      transform: translateY(-1px);
    }

    button:active {
      transform: scale(0.98);
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 30px 20px;
      }
    }
  `

  document.head.appendChild(style)
}
const styles = {
  floatingCard: {
  position: 'absolute',
  zIndex: 5,
  left: '7%',
  top: '32%',
  width: '105px',
  height: '135px',
  padding: '15px',
  boxSizing: 'border-box',

  borderRadius: '18px',
  border: '1px solid rgba(80,180,255,0.45)',

  background:
    'linear-gradient(145deg, rgba(30,100,220,0.38), rgba(3,25,65,0.72))',

  boxShadow:
    '0 0 35px rgba(0,120,255,0.25), inset 0 0 20px rgba(50,170,255,0.08)',

  transform: 'rotate(-12deg)',
  animation: 'floatingCardMove 6s ease-in-out infinite',
},

floatingCardIcon: {
  fontSize: '42px',
  color: '#45baff',
  textAlign: 'center',
  textShadow: '0 0 20px rgba(0,170,255,0.7)',
},

floatingCardLine: {
  height: '7px',
  marginTop: '15px',
  borderRadius: '10px',
  background: 'rgba(80,180,255,0.5)',
},

floatingCardLineSmall: {
  width: '65%',
  height: '6px',
  marginTop: '9px',
  borderRadius: '10px',
  background: 'rgba(80,180,255,0.3)',
},

floatingPrinter: {
  position: 'absolute',
  zIndex: 5,
  right: '7%',
  top: '39%',
  width: '100px',
  height: '85px',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  borderRadius: '20px',
  border: '1px solid rgba(60,190,255,0.4)',

  background:
    'linear-gradient(145deg, rgba(25,95,190,0.4), rgba(3,22,55,0.75))',

  boxShadow:
    '0 0 35px rgba(0,140,255,0.22)',

  animation: 'floatingPrinterMove 5s ease-in-out infinite',
},

printerIcon: {
  fontSize: '46px',
  color: '#42c5ff',
  textShadow: '0 0 20px rgba(0,180,255,0.7)',
},

lightWaveOne: {
  position: 'absolute',
  width: '130%',
  height: '130px',
  left: '-15%',
  bottom: '-35px',
  borderTop: '3px solid rgba(0,190,255,0.55)',
  borderRadius: '50%',
  transform: 'rotate(-5deg)',
  boxShadow: '0 -8px 30px rgba(0,150,255,0.35)',
  animation: 'waveMove 6s ease-in-out infinite',
},

lightWaveTwo: {
  position: 'absolute',
  width: '120%',
  height: '110px',
  left: '-10%',
  bottom: '5px',
  borderTop: '2px solid rgba(37,99,235,0.5)',
  borderRadius: '50%',
  transform: 'rotate(4deg)',
  animation: 'waveMoveReverse 8s ease-in-out infinite',
},
 loginPage: {
  minHeight: '100vh',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  background:
    'radial-gradient(circle at top, #102a55 0%, #050b16 45%, #02050a 100%)',
  padding: '20px',
  boxSizing: 'border-box',
},

bgGlow1: {
  position: 'absolute',
  width: '420px',
  height: '420px',
  borderRadius: '50%',
  background: '#087cff',
  filter: 'blur(120px)',
  opacity: 0.18,
  top: '-180px',
  left: '-120px',
  animation: 'floatGlow 8s ease-in-out infinite',
},

bgGlow2: {
  position: 'absolute',
  width: '350px',
  height: '350px',
  borderRadius: '50%',
  background: '#00b7ff',
  filter: 'blur(120px)',
  opacity: 0.13,
  right: '-100px',
  bottom: '-100px',
  animation: 'floatGlow 10s ease-in-out infinite reverse',
},

bgGlow3: {
  position: 'absolute',
  width: '180px',
  height: '180px',
  borderRadius: '50%',
  background: '#2563eb',
  filter: 'blur(90px)',
  opacity: 0.15,
  top: '45%',
  left: '45%',
},

loginCard: {
  width: '100%',
  maxWidth: '430px',
  position: 'relative',
  zIndex: 5,
  padding: '38px 32px',
  boxSizing: 'border-box',
  borderRadius: '28px',
  background: 'rgba(8, 18, 35, 0.78)',
  border: '1px solid rgba(70, 150, 255, 0.25)',
  boxShadow:
    '0 30px 80px rgba(0,0,0,0.55), 0 0 50px rgba(0,110,255,0.12)',
  backdropFilter: 'blur(25px)',
  WebkitBackdropFilter: 'blur(25px)',
  animation: 'cardAppear 0.7s ease-out',
},

logoCircle: {
  width: '78px',
  height: '78px',
  margin: '0 auto 16px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background:
    'linear-gradient(135deg, #0ea5ff, #2563eb, #123b9b)',
  border: '2px solid rgba(255,255,255,0.2)',
  boxShadow:
    '0 0 30px rgba(0,140,255,0.45), inset 0 0 20px rgba(255,255,255,0.08)',
  animation: 'logoPulse 3s ease-in-out infinite',
},

logoTitle: {
  margin: '0',
  textAlign: 'center',
  fontSize: '30px',
  fontWeight: '900',
  letterSpacing: '3px',
  color: '#ffffff',
  textShadow: '0 0 25px rgba(0,140,255,0.35)',
},

logoSubtitle: {
  textAlign: 'center',
  margin: '8px 0 28px',
  color: '#8da9c9',
  fontSize: '13px',
  letterSpacing: '0.5px',
},

tabs: {
  display: 'flex',
  padding: '5px',
  marginBottom: '25px',
  borderRadius: '14px',
  background: 'rgba(0,0,0,0.28)',
  border: '1px solid rgba(255,255,255,0.06)',
},

tab: {
  flex: 1,
  border: 'none',
  background: 'transparent',
  color: '#7187a5',
  padding: '13px 10px',
  borderRadius: '10px',
  fontSize: '13px',
  fontWeight: '800',
  letterSpacing: '1px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
},

activeTab: {
  background:
    'linear-gradient(135deg, #087cff, #2563eb)',
  color: '#ffffff',
  boxShadow:
    '0 6px 20px rgba(0,120,255,0.35)',
},

inputGroup: {
  marginBottom: '17px',
},

inputLabel: {
  display: 'block',
  color: '#8fa8c7',
  fontSize: '11px',
  fontWeight: '800',
  letterSpacing: '1px',
  marginBottom: '8px',
},

input: {
  width: '100%',
  boxSizing: 'border-box',
  padding: '15px 16px',
  borderRadius: '13px',
  border: '1px solid rgba(100,150,210,0.22)',
  outline: 'none',
  background: 'rgba(2,8,18,0.65)',
  color: '#ffffff',
  fontSize: '14px',
  transition: 'all 0.3s ease',
},

mainButton: {
  width: '100%',
  marginTop: '8px',
  padding: '16px',
  border: 'none',
  borderRadius: '14px',
  background:
    'linear-gradient(135deg, #008cff, #2563eb, #1d4ed8)',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '900',
  letterSpacing: '1px',
  cursor:'pointer',
  boxShadow:
    '0 12px 30px rgba(0,120,255,0.28)',
  transition: 'all 0.3s ease',
},

message: {
  marginTop: '18px',
  padding: '12px 14px',
  borderRadius: '12px',
  background: 'rgba(0,120,255,0.08)',
  border: '1px solid rgba(0,140,255,0.2)',
  color: '#8fc7ff',
  fontSize: '13px',
  textAlign: 'center',
  lineHeight: '1.5',
},

contactBox: {
  marginTop: '25px',
  padding: '15px',
  borderRadius: '15px',
  background: 'rgba(0,0,0,0.20)',
  border: '1px solid rgba(100,150,210,0.12)',
},

contactItem: {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  color: '#9eb6d4',
  fontSize: '12px',
  marginBottom: '8px',
},

contactIcon: {
  width: '25px',
  height: '25px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '8px',
  background: 'rgba(0,130,255,0.12)',
  color: '#39a7ff',
  fontSize: '14px',
},

bottomText: {
  marginTop: '20px',
  textAlign: 'center',
  color: '#50647d',
  fontSize: '10px',
  letterSpacing: '0.5px',
},
dashboardPage: {
  minHeight: '100vh',
  background:
    'radial-gradient(circle at top right, #08295a 0%, #030914 38%, #02050a 100%)',
  color: '#fff',
  overflow: 'hidden',
  position: 'relative',
},

header: {
  position: 'sticky',
  top: 0,
  zIndex: 100,

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  padding: '17px 28px',

  background:
    'linear-gradient(135deg, rgba(2,18,45,0.94), rgba(1,8,22,0.94))',

  border: '1px solid rgba(30,140,255,0.35)',
  borderTop: '1px solid rgba(70,190,255,0.55)',

  borderRadius: '0 0 20px 20px',

  backdropFilter: 'blur(22px)',
  WebkitBackdropFilter: 'blur(22px)',

  boxShadow:
    '0 10px 40px rgba(0,0,0,0.45), 0 0 35px rgba(0,100,255,0.12)',

  animation: 'headerAppear 0.7s ease-out',
},

headerLogo: {
  fontSize: '23px',
  fontWeight: '900',
  letterSpacing: '2px',

  color: '#ffffff',

  textShadow:
    '0 0 12px rgba(60,180,255,0.7), 0 0 30px rgba(0,110,255,0.35)',

  animation: 'logoGlow 3s ease-in-out infinite',
},

headerSub: {
  marginTop: '4px',
  fontSize: '11px',
  color: '#48bfff',
  letterSpacing: '1px',
},

headerRight: {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
},

welcome: {
  color: '#b8d5f5',
  fontSize: '12px',
  fontWeight: '700',
},

logoutButton: {
  padding: '11px 18px',
  borderRadius: '12px',

  border: '1px solid rgba(40,160,255,0.5)',

  background:
    'linear-gradient(135deg, rgba(10,80,170,0.35), rgba(5,30,70,0.5))',

  color: '#5bc7ff',

  fontSize: '12px',
  fontWeight: '900',

  cursor: 'pointer',

  boxShadow:
    '0 0 18px rgba(0,130,255,0.12)',

  transition: 'all 0.3s ease',
},

hero: {
  position: 'relative',
  margin: '25px',
  minHeight: '500px',
  padding: '55px 35px',
  borderRadius: '28px',
  overflow: 'hidden',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  background:
    'radial-gradient(circle at 50% 20%, rgba(0,140,255,0.28), transparent 42%), linear-gradient(135deg, #061c42 0%, #03122d 48%, #020817 100%)',

  border: '1px solid rgba(40,180,255,0.55)',

  boxShadow:
    '0 25px 80px rgba(0,0,0,0.55), 0 0 60px rgba(0,110,255,0.18), inset 0 0 50px rgba(0,120,255,0.08)',

  animation: 'dashboardHeroIn 0.9s ease-out',

  boxSizing: 'border-box',
},
heroContent: {
  position: 'relative',
  zIndex: 10,
  width: '100%',
  maxWidth: '950px',
  textAlign: 'center',
},

heroHighlight: {
  background:
    'linear-gradient(90deg, #38bdf8, #08aaff, #60a5fa)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
},

heroGlowOne: {
  position: 'absolute',
  width: '330px',
  height: '330px',
  borderRadius: '50%',
  background: '#087cff',
  filter: 'blur(110px)',
  opacity: 0.20,
  top: '-150px',
  left: '-120px',
  animation: 'heroGlowFloat 7s ease-in-out infinite',
},

heroGlowTwo: {
  position: 'absolute',
  width: '380px',
  height: '380px',
  borderRadius: '50%',
  background: '#00c6ff',
  filter: 'blur(120px)',
  opacity: 0.14,
  right: '-150px',
  bottom: '-180px',
  animation: 'heroGlowFloat 9s ease-in-out infinite reverse',
},

heroGlowThree: {
  position: 'absolute',
  width: '190px',
  height: '190px',
  borderRadius: '50%',
  background: '#2563eb',
  filter: 'blur(85px)',
  opacity: 0.20,
  left: '45%',
  top: '38%',
  animation: 'heroCenterGlow 5s ease-in-out infinite',
},

heroParticle: {
  position: 'absolute',
  zIndex: 4,
  color: '#38bdf8',
  fontSize: '22px',
  textShadow: '0 0 20px #00aaff',
  opacity: 0.8,
  animation: 'particleFloat 5s ease-in-out infinite',
},

particle1: {
  top: '18%',
  left: '10%',
},

particle2: {
  top: '32%',
  right: '11%',
  fontSize: '30px',
  animationDelay: '1s',
},

particle3: {
  bottom: '18%',
  left: '18%',
  animationDelay: '2s',
},

particle4: {
  top: '22%',
  left: '78%',
  fontSize: '15px',
  animationDelay: '3s',
},

particle5: {
  bottom: '25%',
  right: '19%',
  animationDelay: '1.5s',
},

heroHighlight: {
  background:
    'linear-gradient(90deg, #38bdf8, #2563eb, #60a5fa)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  textShadow: '0 0 35px rgba(37,150,255,0.25)',
},

heroGlowOne: {
  position: 'absolute',
  width: '300px',
  height: '300px',
  borderRadius: '50%',
  background: '#087cff',
  filter: 'blur(100px)',
  opacity: 0.20,
  top: '-130px',
  left: '-100px',
  animation: 'heroGlowFloat 7s ease-in-out infinite',
},

heroGlowTwo: {
  position: 'absolute',
  width: '350px',
  height: '350px',
  borderRadius: '50%',
  background: '#00c6ff',
  filter: 'blur(110px)',
  opacity: 0.15,
  right: '-130px',
  bottom: '-160px',
  animation: 'heroGlowFloat 9s ease-in-out infinite reverse',
},

heroGlowThree: {
  position: 'absolute',
  width: '180px',
  height: '180px',
  borderRadius: '50%',
  background: '#2563eb',
  filter: 'blur(80px)',
  opacity: 0.18,
  left: '48%',
  top: '35%',
  animation: 'heroCenterGlow 5s ease-in-out infinite',
},

heroParticle: {
  position: 'absolute',
  zIndex: 3,
  color: '#38bdf8',
  fontSize: '22px',
  textShadow: '0 0 18px #00aaff',
  opacity: 0.75,
  animation: 'particleFloat 5s ease-in-out infinite',
},

particle1: {
  top: '18%',
  left: '10%',
  animationDelay: '0s',
},

particle2: {
  top: '35%',
  right: '12%',
  fontSize: '28px',
  animationDelay: '1s',
},

particle3: {
  bottom: '18%',
  left: '17%',
  animationDelay: '2s',
},

particle4: {
  top: '23%',
  left: '78%',
  fontSize: '16px',
  animationDelay: '3s',
},

particle5: {
  bottom: '25%',
  right: '20%',
  animationDelay: '1.5s',
},

lightWaveOne: {
  position: 'absolute',
  width: '130%',
  height: '120px',
  left: '-15%',
  bottom: '-35px',
  borderTop: '3px solid rgba(0,190,255,0.55)',
  borderRadius: '50%',
  transform: 'rotate(-5deg)',
  boxShadow:
    '0 -8px 25px rgba(0,150,255,0.35)',
  animation: 'waveMove 6s ease-in-out infinite',
},

lightWaveTwo: {
  position: 'absolute',
  width: '120%',
  height: '100px',
  left: '-10%',
  bottom: '5px',
  borderTop: '2px solid rgba(37,99,235,0.45)',
  borderRadius: '50%',
  transform: 'rotate(4deg)',
  animation: 'waveMoveReverse 8s ease-in-out infinite',
},

hero: {
  position: 'relative',
  margin: '25px',
  minHeight: '500px',
  padding: '55px 35px',
  borderRadius: '28px',
  overflow: 'hidden',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  background:
    'radial-gradient(circle at 50% 20%, rgba(37,99,235,0.28), transparent 45%), linear-gradient(135deg, #061b3d 0%, #031027 48%, #020817 100%)',

  border: '1px solid rgba(56,189,248,0.45)',

  boxShadow:
    '0 25px 80px rgba(0,0,0,0.55), 0 0 60px rgba(0,110,255,0.16), inset 0 0 50px rgba(0,120,255,0.08)',

  animation: 'dashboardHeroIn 0.8s ease-out',

  boxSizing: 'border-box',
},

smallGold: {
  color: '#38a7ff',
  fontSize: '11px',
  fontWeight: '900',
  letterSpacing: '2px',
  marginBottom: '12px',
},

heroTitle: {
  margin: 0,
  fontSize: 'clamp(34px, 6vw, 64px)',
  lineHeight: '1.08',
  fontWeight: '900',
  color: '#ffffff',
  letterSpacing: '-1.5px',
  textShadow:
    '0 4px 30px rgba(0,0,0,0.45), 0 0 25px rgba(255,255,255,0.08)',
  animation: 'titleReveal 1s ease-out',
},

heroText: {
  maxWidth: '720px',
  margin: '20px auto 0',
  color: '#a8c7e8',
  fontSize: '15px',
  lineHeight: '1.7',
  animation: 'textReveal 1.2s ease-out',
},

heroButtons: {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap',
  marginTop: '25px',
},

secondaryButton: {
  padding: '14px 22px',
  borderRadius: '13px',
  border: '1px solid rgba(70,160,255,0.3)',
  background: 'rgba(20,90,170,0.15)',
  color: '#8ec7ff',
  fontWeight: '800',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
},
infoSection: {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '20px',
  margin: '35px 25px',
},

infoCard: {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: '18px',
  padding: '24px',
  borderRadius: '22px',

  background:
    'linear-gradient(145deg, rgba(8,45,100,0.72), rgba(2,14,32,0.92))',

  border: '1px solid rgba(45,160,255,0.35)',

  boxShadow:
    '0 18px 45px rgba(0,0,0,0.35), inset 0 0 30px rgba(0,130,255,0.06)',

  overflow: 'hidden',

  transition:
    'transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease',

  animation: 'infoCardAppear 0.8s ease-out',
},

infoIcon: {
  width: '62px',
  height: '62px',
  minWidth: '62px',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  borderRadius: '50%',

  background:
    'radial-gradient(circle at 35% 30%, #159cff, #063d91 70%, #021a40)',

  border: '1px solid rgba(60,190,255,0.65)',

  fontSize: '27px',

  boxShadow:
    '0 0 25px rgba(0,150,255,0.35), inset 0 0 15px rgba(255,255,255,0.08)',

  animation: 'iconPulse 3s ease-in-out infinite',
},

infoTitle: {
  margin: 0,
  color: '#ffffff',
  fontSize: '17px',
  fontWeight: '900',
},

infoText: {
  margin: '7px 0 0',
  color: '#8eb5dc',
  fontSize: '12px',
  lineHeight: '1.5',
},

infoHighlight: {
  display: 'block',
  marginTop: '3px',
  color: '#38bdf8',
  fontSize: '14px',
},
heroPrimaryButton: {
  minWidth: '300px',
  padding: '17px 28px',

  borderRadius: '15px',
  border: '1px solid rgba(100,220,255,0.8)',

  background:
    'linear-gradient(135deg, #08baff, #1674ff, #2454e8)',

  color: '#fff',

  fontSize: '14px',
  fontWeight: '900',

  cursor: 'pointer',

  boxShadow:
    '0 0 25px rgba(0,160,255,0.45), 0 12px 35px rgba(0,80,220,0.3)',

  transition: 'all 0.3s ease',

  animation: 'buttonGlow 3s ease-in-out infinite',
},

heroSecondaryButton: {
  minWidth: '240px',
  padding: '17px 28px',

  borderRadius: '15px',

  border: '1px solid rgba(40,170,255,0.65)',

  background: 'rgba(4,30,70,0.5)',

  color: '#72d3ff',

  fontSize: '14px',
  fontWeight: '900',

  cursor: 'pointer',

  boxShadow:
    '0 0 20px rgba(0,130,255,0.12)',

  transition: 'all 0.3s ease',
},
};

export default App