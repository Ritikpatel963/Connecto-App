async function runTests() {
  const API = 'http://localhost:4100/api';
  const results = [];
  
  async function test(name, endpoint, payload, headers, expectedStatus) {
    try {
      const res = await fetch(API + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(payload)
      });
      const data = await res.text();
      const passed = res.status === expectedStatus;
      results.push({ name, endpoint, status: res.status, expected: expectedStatus, passed, data: data.substring(0, 150) });
      return res.status;
    } catch (e) {
      results.push({ name, endpoint, error: e.message });
      return null;
    }
  }

  // 1. send-otp
  await test('send-otp (no phone)', '/app/v1/auth/send-otp', {}, {}, 400);
  await test('send-otp (huge payload)', '/app/v1/auth/send-otp', { phone: '9'.repeat(10000) }, {}, 400); 

  // 2. razorpay
  await test('razorpay (no amount)', '/app/v1/payments/razorpay/order', {}, {}, 400);
  await test('razorpay (string amount)', '/app/v1/payments/razorpay/order', { amount: 'huge_string' }, {}, 400); 

  // 3. recharge (auth check)
  await test('recharge (no auth)', '/app/v1/wallet/recharge', { amount: 100, paymentMethod: 'test' }, {}, 401);
  await test('recharge (invalid auth)', '/app/v1/wallet/recharge', { amount: 100, paymentMethod: 'test' }, { Authorization: 'Bearer FAKE_TOKEN' }, 401);
  await test('recharge (invalid amount)', '/app/v1/wallet/recharge', { amount: -500, paymentMethod: 'test' }, { Authorization: 'Bearer FAKE_TOKEN' }, 401);

  // 4. Rate Limiting Test on send-otp (Limit is 5 per min)
  for (let i = 0; i < 6; i++) {
    const status = await test(`rate-limit (req ${i+1})`, '/app/v1/auth/send-otp', { phone: '1234567890' }, {}, i < 5 ? 500 : 429);
  }

  console.log(JSON.stringify(results, null, 2));
}

runTests();
