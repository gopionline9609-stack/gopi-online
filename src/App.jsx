import { useEffect, useState } from 'react'
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

    if (!error) {
      setServices(data || [])
    }
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

  if (userEmail === 'gopi742301@gmail.com') {
    return (
      <AdminDashboard
        session={session}
        logout={logout}
      />
    )
  }

  return (
    <Dashboard
      session={session}
      services={services}
      logout={logout}
    />
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

  alert('Order status updated successfully.')

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
function Dashboard({ session, services, logout }) {

  const [paymentOrder, setPaymentOrder] = useState(null)
const [transactionReference, setTransactionReference] = useState('')
const [paymentLoading, setPaymentLoading] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
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
      style={styles.header}>
        <div>
          <div style={styles.headerLogo}>GOPI ONLINE</div>
          <div style={styles.headerSub}>
            Digital Service Center
          </div>
        </div>

        <div
        className="dashboard-header-right-mobile"
        style={styles.headerRight}>
          <span style={styles.welcome}>
            Hi, {customerName}
          </span>

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
          style={styles.heroButtons}>
            <button style={styles.goldButton}>
              Explore Services
            </button>

            <button
  style={styles.outlineButton}
  onClick={() => {
    document.getElementById("my-orders")?.scrollIntoView({
      behavior: "smooth",
    });
  }}
>
  My Orders
</button>
          </div>
        </div>

        <div 
        className="dashboard-hero-icon-mobile"
        style={styles.heroIcon}>
          💻
        </div>
      </section>
{/* MY ORDERS */}
<section id="my-orders" className="dashboard-my-orders-mobile" style={styles.section}>
  <div style={styles.sectionHeading}>
    <div>
      <p style={styles.smallGold}>MY ORDERS</p>
      <h2 style={styles.sectionTitle}>Your Orders</h2>
    </div>
  </div>

  {ordersLoading ? (
    <p style={{ textAlign: 'center', color: '#aaa' }}>
      Loading your orders...
    </p>
  ) : orders.length === 0 ? (
    <p style={{ textAlign: 'center', color: '#aaa' }}>
      No orders found.
    </p>
  ) : (
    <div>
      {orders.map((order) => (
        <div
          key={order.id}
          style={{
            background: '#151515',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '18px',
            marginBottom: '15px'
          }}
        >
         <div
  style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '10px',
  }}
>
  <div>
    <div
      style={{
        fontWeight: 'bold',
        fontSize: '18px',
      }}
    >
      Order #{order.id}
    </div>

    <div
      style={{
        color: '#777',
        fontSize: '12px',
        marginTop: '5px',
      }}
    >
      {formatDateTime(order.created_at)}
    </div>
  </div>

  <div
    style={{
      color: '#d4af37',
      fontSize: '12px',
      fontWeight: 'bold',
      padding: '6px 9px',
      borderRadius: '20px',
      background: '#2a2410',
      whiteSpace: 'nowrap',
    }}
  >
    ORDER
  </div>
</div>

          <div style={{ marginTop: '8px', color: '#ccc' }}>
            Amount: ₹{order.amount}
          </div>

          <div style={{ marginTop: '8px' }}>
            Status: <strong>{order.status}</strong>
          </div>
          <div
  style={{
    marginTop: '8px',
    color: '#888',
    fontSize: '13px',
  }}
>
  Order Date & Time: {formatDateTime(order.created_at)}
</div>

<div
  style={{
    marginTop: '6px',
    color: '#777',
    fontSize: '12px',
  }}
>
  Last Updated: {formatDateTime(order.updated_at)}
</div>
          {order.status === 'Pending Payment' && (
  <button
    type="button"
    onClick={() => {
  alert('PAY NOW clicked')

  const service = services.find(
    (s) => s.id === order.service_id
  )

  if (!service) {
    alert('Service information not found.')
    return
  }

  setSelectedService(service)
  setPaymentOrder(order)

  alert('Payment Order Set: ' + order.id)

  setTransactionReference('')
}}
    style={{
      width: '100%',
      marginTop: '15px',
      padding: '13px',
      border: 'none',
      borderRadius: '10px',
      background: '#d4af37',
      color: '#000',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '14px',
    }}
  >
    💳 PAY NOW — ₹{order.amount}
  </button>
)}
{/* ORDER TRACKING */}
<div
  style={{
    marginTop: '20px',
    padding: '18px',
    borderRadius: '12px',
    background: '#101010',
    border: '1px solid #333',
  }}
>
  <div
    style={{
      color: '#d4af37',
      fontWeight: 'bold',
      marginBottom: '15px',
    }}
  >
    ORDER TRACKING
  </div>

  {[
    'Pending Payment',
    'Payment Submitted',
    'Payment Verified',
    'Processing',
    'Completed',
  ].map((step, index) => {
    const steps = [
      'Pending Payment',
      'Payment Submitted',
      'Payment Verified',
      'Processing',
      'Completed',
    ]

    const currentIndex = steps.indexOf(order.status)
    const isCompleted = index <= currentIndex

    return (
      <div
        key={step}
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: index === steps.length - 1 ? '0' : '12px',
        }}
      >
        <div
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: isCompleted ? '#d4af37' : '#333',
            color: isCompleted ? '#000' : '#777',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            marginRight: '12px',
          }}
        >
          {isCompleted ? '✓' : index + 1}
        </div>

        <div
          style={{
            color: isCompleted ? '#fff' : '#777',
            fontWeight: isCompleted ? 'bold' : 'normal',
          }}
        >
          {step}
        </div>
      </div>
    )
  })}
</div>
          <div style={{ marginTop: '8px', color: '#999' }}>
            Phone: {order.customer_phone}
          </div>
        </div>
      ))}
    </div>
  )}
</section>
      {/* SERVICES */}
      <section 
      className="dashboard-services-mobile"
      style={styles.section}>
        <div 
        className="dashboard-section-heading-mobile"
        style={styles.sectionHeading}>
          <div>
            <p style={styles.smallGold}>
              OUR SERVICES
            </p>

            <h2 
            className="dashboard-section-title-mobile"
            style={styles.sectionTitle}>
              Choose a Service
            </h2>
          </div>

          <span style={styles.serviceCount}>
            {services.length} Services
          </span>
        </div>

        <div 
        className="dashboard-service-grid-mobile"
        style={styles.serviceGrid}>
          {services.map((service) => (
            <div
              key={service.id}
              style={styles.serviceCard}
            >
              <div style={styles.serviceIcon}>
                {getServiceIcon(service.name)}
              </div>

              <h3 style={styles.serviceTitle}>
                {service.name}
              </h3>

              <p style={styles.serviceDescription}>
                {service.description}
              </p>

              <div style={styles.cardBottom}>
                <span style={styles.price}>
                  {service.price
                    ? `₹${service.price}`
                    : 'Contact us'}
                </span>

                <button
                  style={styles.orderButton}
                  onClick={() => setSelectedService(service)}
                >
                  Apply →
                </button>
              </div>
            </div>
          ))}
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
        {selectedService.name === 'Xerox' && (
  <div style={{ marginBottom: '20px' }}>
    <label style={styles.label}>Number of Pages</label>

    <input
      type="number"
      min="1"
      value={quantity}
      onChange={(e) =>
        setQuantity(Math.max(1, Number(e.target.value)))
      }
      style={styles.input}
    />
  </div>
)}

{selectedService.name === 'Passport Size Photo' && (
  <div style={{ marginBottom: '20px' }}>
    <label style={styles.label}>Photo Quantity</label>

    <select
      value={photoCount}
      onChange={(e) => setPhotoCount(Number(e.target.value))}
      style={styles.input}
    >
      <option value={3}>3 Photos — ₹20</option>
      <option value={6}>6 Photos — ₹35</option>
      <option value={9}>9 Photos — ₹50</option>
      <option value={12}>12 Photos — ₹65</option>
    </select>
  </div>
)}

{selectedService.name === 'Printing' && (
  <div style={{ marginBottom: '20px' }}>
    <label style={styles.label}>Number of Pages</label>

    <input
      type="number"
      min="1"
      value={printingCount}
      onChange={(e) =>
        setPrintingCount(Math.max(1, Number(e.target.value)))
      }
      style={styles.input}
    />
  </div>
)}
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
    UPI ID: gopi742301@okaxis
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
          gopi742301@okaxis
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
  <div style={{
    fontSize: '12px',
    fontWeight: '600',
    opacity: 0.75,
    marginBottom: '5px',
    letterSpacing: '0.3px'
  }}>
    PAYMENT WITH PHONE NUMBER
  </div>

  <div style={{
    fontSize: '17px',
    fontWeight: '700',
    letterSpacing: '0.5px'
  }}>
    9609047478
  </div>
</div>
      {/* GOOGLE PAY */}
      <a
        href={`upi://pay?pa=gopi742301@okaxis&pn=GOPI%20ONLINE&am=${paymentOrder.amount}&cu=INR`}
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