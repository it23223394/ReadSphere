const crypto = require('crypto');

// Generate a secure random JWT secret
const jwtSecret = crypto.randomBytes(64).toString('hex');

console.log('\n=================================');
console.log('🔐 JWT Secret for Deployment');
console.log('=================================\n');
console.log('Copy this value for JWT_SECRET environment variable:\n');
console.log(jwtSecret);
console.log('\n=================================\n');
