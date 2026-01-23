
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const ADMIN_EMAIL = "admin@college.edu"
const ADMIN_PASSWORD = "StrongPassword123";

const NEW_ADMIN_EMAIL = `apoorvmittal125@gmail.com`;
const NEW_ADMIN_NAME = 'New Admin';
const NEW_ADMIN_PASSWORD = 'password123';

async function run() {
  try {
    console.log('1. Login as Admin...');
    // Assuming we have a bootstrap admin or user needs to provide creds.
    // Spec says /admin/create existed, so maybe there's a pre-existing admin.
    // I will try to login. If fails, I might need to Create One first via some backdoor or existing flow?
    // But /admin/create required admin token. So there must be an admin.
    // I'll assume standard credentials or ask user. 
    // For now, I'll placeholders.
    
    // Attempt login
    let adminToken;
    try {
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD 
        });
        adminToken = loginRes.data.token;
        console.log('   Admin logged in.');
    } catch (e) {
        console.log('   Login failed, trying register first (if allowed) or assuming manual token needed.');
        // If I can't login, I can't test.
        console.error('   Please provide valid admin credentials in script.');
        return;
    }

    console.log('2. Send Invite...');
    const inviteRes = await axios.post(`${API_URL}/admin/invite`, {
      email: NEW_ADMIN_EMAIL
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('   Invite sent:', inviteRes.data);

    // 3. Get Token (Simulating email link click)
    // In real world, we'd check email. Here, we can cheat if we have DB access, 
    // OR we can just check if the service returned the token in logs?
    // But implementation: `sendAdminInvite` -> `createInvite` -> sends email. Returns "Invitation sent successfully".
    // Does NOT return token.
    // So verification script cannot automate acceptance purely via API unless we mock email service or query DB.
    
    console.log('3. Manual Step: Check logs for token or DB.');
    console.log(`   Email sent to ${NEW_ADMIN_EMAIL}.`);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

run();
