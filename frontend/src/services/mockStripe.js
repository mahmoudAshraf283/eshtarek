class MockStripe {
  static async createPaymentIntent(amount) {

    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      clientSecret: `mock_pi_${Math.random().toString(36).substr(2, 9)}`,
      amount: amount,
    };
  }

  static async confirmPayment(clientSecret) {

    await new Promise(resolve => setTimeout(resolve, 1500));
    

    if (Math.random() < 0.9) {
      return {
        status: 'succeeded',
        id: `mock_payment_${Math.random().toString(36).substr(2, 9)}`,
      };
    } else {
      throw new Error('Payment failed. Please try again.');
    }
  }
}

export default MockStripe;