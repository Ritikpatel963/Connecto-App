import { config } from "./src/config.js";

async function runTests() {
  const { supabaseUrl, supabaseAnonKey } = config;
  console.log("========================================");
  console.log("   TESTING RLS POLICIES (BATCH 1)       ");
  console.log("========================================");

  async function testRequest(name, method, endpoint, payload, expectFail) {
    const res = await fetch(`${supabaseUrl}/rest/v1/${endpoint}`, {
      method,
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`, // PostgREST accepts API keys here if no JWT
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: payload ? JSON.stringify(payload) : undefined
    });
    
    const status = res.status;
    const text = await res.text();
    
    // An insert is considered blocked if status >= 400 or (status == 201 and data is [])
    let isBlocked = status >= 400 || (status === 201 && text === '[]');
    let passed = expectFail ? isBlocked : (status >= 200 && status < 300);

    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name}`);
    if (!passed) {
      if (expectFail && !isBlocked) {
        console.log(`   ❌ VULNERABILITY: Malicious insert succeeded! Expected RLS to block this. (Got status ${status})`);
      } else {
        console.log(`   ❌ ERROR: Expected read to succeed, but got status ${status}.`);
      }
    }
  }

  console.log("\n1. Table: packages");
  await testRequest('Anon Read (Should Succeed)', 'GET', 'packages?select=*', null, false);
  await testRequest('Anon Insert (Should be BLOCKED)', 'POST', 'packages', { name: 'Malicious Package', price: 0 }, true);

  console.log("\n2. Table: coin_packages");
  await testRequest('Anon Read (Should Succeed)', 'GET', 'coin_packages?select=*', null, false);
  // We use a valid payload so it doesn't fail postgres constraints before hitting RLS
  await testRequest('Anon Insert (Should be BLOCKED)', 'POST', 'coin_packages', { name: 'Free Coins', coins: 9999, price: 0, is_active: true }, true);

  console.log("\n3. Table: settings");
  await testRequest('Anon Read (Should Succeed)', 'GET', 'settings?select=*', null, false);
  await testRequest('Anon Insert (Should be BLOCKED)', 'POST', 'settings', { key: 'hacked', value: 'yes' }, true);

  console.log("========================================");
}

runTests();
