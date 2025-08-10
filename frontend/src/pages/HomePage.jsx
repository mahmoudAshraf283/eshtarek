import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Row, Col, Alert, Badge, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/api';
import MockStripe from '../services/mockStripe';

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const navigate = useNavigate();
// Check if the user is authenticated and fetch subscription plans
  useEffect(() => {
    checkUserStatus();
    fetchSubscriptionPlans();
  }, []);
// Function to check user status and load their information
  const checkUserStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        setUser({
          username: payload.username,
          role: payload.role,
          tenantName: payload.tenant_name,
          subscription: payload.subscription,
        });

        if (payload.role === 'admin') {
          window.location.href = 'http://localhost:8000/admin/';
          return;
        }
      }

      setLoading(false);
    } catch (error) {
      setError('Failed to load user information');
      setLoading(false);
    }
  };
// Function to fetch available subscription plans
  const fetchSubscriptionPlans = async () => {
    try {
      const response = await authAPI.getSubscriptionPlans();
      setPlans(response.data);
    } catch (error) {
      setError('Failed to load subscription plans');
    }
  };
// Function to handle subscription plan selection and payment
  const handleSubscribe = async (plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };
// Function to handle payment processing
  const handlePayment = async () => {
    try {
      setProcessing(true);
      setError('');


      const paymentIntent = await MockStripe.createPaymentIntent(selectedPlan.price * 100);
      

      const payment = await MockStripe.confirmPayment(paymentIntent.clientSecret);
      

      const response = await authAPI.createSubscription({
        plan: selectedPlan.id,
        payment_id: payment.id,
      });
      

      if (response.data.access && response.data.refresh) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
      }
      
      await checkUserStatus();
      setError('Successfully subscribed to plan!');
      setShowPaymentModal(false);
      
    } catch (error) {

      const errorMessage = error.response?.data?.error || 'Payment failed. Please try again.';
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

// Modal component for payment processing
  const PaymentModal = () => (
    <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Complete Payment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert 
            variant={error.includes('Successfully') ? 'success' : 'danger'}
            className="mb-3"
          >
            {error}
          </Alert>
        )}
        
        <div className="mb-4">
          <h5>Order Summary</h5>
          <p><strong>Plan:</strong> {selectedPlan?.name}</p>
          <p><strong>Price:</strong> ${selectedPlan?.price}/month</p>
          {user?.subscription && (
            <Alert variant="info">
              You will be switched from {user.subscription.plan_name} to {selectedPlan?.name} plan.
              {user?.subscription?.plan?.max_users > selectedPlan?.max_users && (
                <div className="mt-2">
                  <strong>Note:</strong> This is a downgrade that reduces your user limit 
                  from {user.subscription.plan.max_users} to {selectedPlan.max_users} users.
                </div>
              )}
            </Alert>
          )}
        </div>
        <div className="border p-3 rounded mb-3">
          <h6>Payment Details</h6>
          <div className="mb-3">
            <label>Card Number</label>
            <input 
              type="text" 
              className="form-control" 
              value="4242 4242 4242 4242" 
              disabled 
            />
            <small className="text-muted">This is a mock payment system</small>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handlePayment}
          disabled={processing}
        >
          {processing ? 'Processing...' : `Pay $${selectedPlan?.price}`}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  if (loading) {
    return (
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow mb-4">
            <Card.Header className="bg-primary text-white">
              <h2 className="mb-0">Welcome, {user?.username}!</h2>
            </Card.Header>
            <Card.Body className="p-4">
              {error && <Alert variant={error.includes('Successfully') ? 'success' : 'danger'}>{error}</Alert>}
              
              <div className="mb-4">
                <h4>Account Information</h4>
                <p><strong>Tenant Name:</strong> {user?.tenantName || 'Not assigned'}</p>
                <p><strong>Role:</strong> {user?.role}</p>
                <p>
                  <strong>Current Plan: </strong>
                  {user?.subscription ? (
                    <>
                      <Badge bg="success">
                        {user.subscription.plan_name} Plan
                      </Badge>
                      <ul className="mt-2">
                        {user.subscription.features?.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <Badge bg="warning">No active subscription</Badge>
                  )}
                </p>
                {user?.subscription && (
                  <p>
                    <strong>Subscription Expires:</strong>{' '}
                    {new Date(user.subscription.end_date).toLocaleDateString()}
                  </p>
                )}
              </div>

              {user?.role === 'tenant_owner' && (
                <>
                  <h4 className="mt-4">Subscription Plans</h4>
                  <p className="text-muted">
                    {user?.subscription ? 'Change your subscription plan:' : 'Choose a subscription plan:'}
                  </p>
                  <Row xs={1} md={3} className="g-4 mt-2">
                    {plans.map((plan) => (
                      <Col key={plan.id}>
                        <Card className={`h-100 ${user?.subscription?.plan_id === plan.id ? 'border-success' : ''}`}>
                          <Card.Header className={`text-center ${user?.subscription?.plan_id === plan.id ? 'bg-success text-white' : ''}`}>
                            <h5 className="mb-0">{plan.name}</h5>
                          </Card.Header>
                          <Card.Body>
                            <div className="text-center mb-3">
                              <h3 className="text-primary">${plan.price}</h3>
                              <p className="text-muted">per month</p>
                            </div>
                            <ul className="list-unstyled">
                              {plan.features?.split(',').map((feature, index) => (
                                <li key={index}>✓ {feature.trim()}</li>
                              ))}
                            </ul>
                            <Button
                              variant={user?.subscription?.plan_id === plan.id ? 'success' : 'outline-primary'}
                              className="w-100 mt-3"
                              onClick={() => handleSubscribe(plan)}
                              disabled={user?.subscription?.plan_id === plan.id}
                            >
                              {user?.subscription?.plan_id === plan.id ? 'Current Plan' : 'Switch to This Plan'}
                            </Button>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <PaymentModal />
    </Container>
  );
};

export default HomePage;