import { config } from "./src/config.js";

async function testBackend() {
  const res = await fetch("http://localhost:4100/api/app/v1/auth/send-otp", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '+1234567890' })
  });
  console.log(res.status, await res.text());
}

testBackend();
