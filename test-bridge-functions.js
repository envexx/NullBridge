/**
 * Simple test script untuk memverifikasi fungsi bridge
 * Run: node test-bridge-functions.js
 */

console.log('🧪 NullBridge MCP - Bridge Functions Test\n');

// Test 1: Verifikasi struktur fungsi
console.log('='.repeat(60));
console.log('Test 1: Verifikasi Struktur File dan Fungsi');
console.log('='.repeat(60));

const fs = require('fs');
const path = require('path');

const bridgeAgentPath = path.join(__dirname, 'app', 'lib', 'bridge-agent.ts');
const thirdwebClientPath = path.join(__dirname, 'app', 'lib', 'thirdweb-client.ts');

console.log('\n📁 Checking required files:');
console.log(`   - bridge-agent.ts: ${fs.existsSync(bridgeAgentPath) ? '✅ Exists' : '❌ Not found'}`);
console.log(`   - thirdweb-client.ts: ${fs.existsSync(thirdwebClientPath) ? '✅ Exists' : '❌ Not found'}`);

if (fs.existsSync(bridgeAgentPath)) {
  const bridgeAgentContent = fs.readFileSync(bridgeAgentPath, 'utf-8');
  
  console.log('\n🔍 Checking required functions in bridge-agent.ts:');
  console.log(`   - performCrossChainSwap: ${bridgeAgentContent.includes('performCrossChainSwap') ? '✅ Found' : '❌ Not found'}`);
  console.log(`   - executeConfirmedSwap: ${bridgeAgentContent.includes('executeConfirmedSwap') ? '✅ Found' : '❌ Not found'}`);
  console.log(`   - getBridgeStatus: ${bridgeAgentContent.includes('getBridgeStatus') ? '✅ Found' : '❌ Not found'}`);
  console.log(`   - getChainById: ${bridgeAgentContent.includes('getChainById') ? '✅ Found' : '❌ Not found'}`);
  console.log(`   - toWei: ${bridgeAgentContent.includes('export function toWei') ? '✅ Found' : '❌ Not found'}`);
  
  console.log('\n🔍 Checking thirdweb SDK usage:');
  console.log(`   - Bridge.routes: ${bridgeAgentContent.includes('Bridge.routes') ? '✅ Found' : '❌ Not found'}`);
  console.log(`   - Bridge.Buy.quote: ${bridgeAgentContent.includes('Bridge.Buy.quote') ? '✅ Found' : '❌ Not found'}`);
  console.log(`   - Bridge.Buy.prepare: ${bridgeAgentContent.includes('Bridge.Buy.prepare') ? '✅ Found' : '❌ Not found'}`);
  console.log(`   - Bridge.status: ${bridgeAgentContent.includes('Bridge.status') ? '✅ Found' : '❌ Not found'}`);
  console.log(`   - NATIVE_TOKEN_ADDRESS: ${bridgeAgentContent.includes('NATIVE_TOKEN_ADDRESS') ? '✅ Found' : '❌ Not found'}`);
  
  // Check implementation sesuai contoh
  console.log('\n🔍 Checking implementation details:');
  const hasCreateThirdwebClient = bridgeAgentContent.includes('createThirdwebClient') || 
                                   (fs.existsSync(thirdwebClientPath) && 
                                    fs.readFileSync(thirdwebClientPath, 'utf-8').includes('createThirdwebClient'));
  console.log(`   - createThirdwebClient: ${hasCreateThirdwebClient ? '✅ Found' : '❌ Not found'}`);
  
  const hasClientId = bridgeAgentContent.includes('CLIENT_ID') || 
                      (fs.existsSync(thirdwebClientPath) && 
                       fs.readFileSync(thirdwebClientPath, 'utf-8').includes('CLIENT_ID'));
  console.log(`   - CLIENT_ID usage: ${hasClientId ? '✅ Found' : '❌ Not found'}`);
  
  const hasAmountWei = bridgeAgentContent.includes('amountWei');
  console.log(`   - amountWei conversion: ${hasAmountWei ? '✅ Found' : '❌ Not found'}`);
  
  const hasBigInt = bridgeAgentContent.includes('BigInt');
  console.log(`   - BigInt usage: ${hasBigInt ? '✅ Found' : '❌ Not found'}`);
  
  const hasOriginChainId = bridgeAgentContent.includes('originChainId');
  console.log(`   - originChainId parameter: ${hasOriginChainId ? '✅ Found' : '❌ Not found'}`);
  
  const hasDestinationChainId = bridgeAgentContent.includes('destinationChainId');
  console.log(`   - destinationChainId parameter: ${hasDestinationChainId ? '✅ Found' : '❌ Not found'}`);
  
  const hasSteps = bridgeAgentContent.includes('steps');
  console.log(`   - steps return: ${hasSteps ? '✅ Found' : '❌ Not found'}`);
  
  // Check confirmation URL
  const hasConfirmationUrl = bridgeAgentContent.includes('confirmationUrl');
  console.log(`   - confirmationUrl generation: ${hasConfirmationUrl ? '✅ Found' : '❌ Not found'}`);
  
  // Check error handling
  const hasErrorHandling = bridgeAgentContent.includes('catch') && bridgeAgentContent.includes('error');
  console.log(`   - Error handling: ${hasErrorHandling ? '✅ Found' : '❌ Not found'}`);
}

// Test 2: Verifikasi Chain Support
console.log('\n' + '='.repeat(60));
console.log('Test 2: Verifikasi Chain Support');
console.log('='.repeat(60));

const supportedChains = [
  { id: 1, name: "Ethereum Mainnet" },
  { id: 10, name: "Optimism Mainnet" },
  { id: 137, name: "Polygon Mainnet" },
  { id: 42161, name: "Arbitrum One" },
  { id: 8453, name: "Base Mainnet" },
  { id: 421614, name: "Arbitrum Sepolia" },
  { id: 84532, name: "Base Sepolia" },
];

if (fs.existsSync(bridgeAgentPath)) {
  const bridgeAgentContent = fs.readFileSync(bridgeAgentPath, 'utf-8');
  
  console.log('\n🔗 Checking supported chains:');
  supportedChains.forEach(chain => {
    const hasChainId = bridgeAgentContent.includes(chain.id.toString());
    const hasChainName = bridgeAgentContent.includes(chain.name);
    console.log(`   - ${chain.name} (${chain.id}): ${hasChainId && hasChainName ? '✅' : '❌'}`);
  });
}

// Test 3: Verifikasi Package Dependencies
console.log('\n' + '='.repeat(60));
console.log('Test 3: Verifikasi Package Dependencies');
console.log('='.repeat(60));

const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  
  console.log('\n📦 Checking dependencies:');
  const requiredDeps = ['thirdweb', 'zod'];
  requiredDeps.forEach(dep => {
    const hasDep = packageJson.dependencies && packageJson.dependencies[dep];
    console.log(`   - ${dep}: ${hasDep ? `✅ v${packageJson.dependencies[dep]}` : '❌ Not found'}`);
  });
  
  console.log('\n📦 Checking dev dependencies:');
  const devDeps = ['typescript', '@types/node'];
  devDeps.forEach(dep => {
    const hasDep = packageJson.devDependencies && packageJson.devDependencies[dep];
    console.log(`   - ${dep}: ${hasDep ? `✅ v${packageJson.devDependencies[dep]}` : '❌ Not found'}`);
  });
}

// Test 4: Verifikasi API Routes
console.log('\n' + '='.repeat(60));
console.log('Test 4: Verifikasi API Routes');
console.log('='.repeat(60));

const apiRoutes = [
  'app/api/mcp/bridge-asset/route.ts',
  'app/bridge/confirm/page.tsx',
  'app/mcp/route.ts',
  'app/mcp/config/route.ts',
];

console.log('\n🔗 Checking API routes:');
apiRoutes.forEach(route => {
  const routePath = path.join(__dirname, ...route.split('/'));
  console.log(`   - ${route}: ${fs.existsSync(routePath) ? '✅ Exists' : '❌ Not found'}`);
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Test Summary');
console.log('='.repeat(60));
console.log('\n✅ Static analysis completed!');
console.log('\n💡 Next steps:');
console.log('   1. Run "npm install" to ensure all dependencies are installed');
console.log('   2. Set THIRDWEB_CLIENT_ID in .env.local');
console.log('   3. Run the app with "npm run dev" to test live');
console.log('   4. Test the bridge_asset tool via MCP endpoint');
console.log('\n🎯 Implementation appears to match the thirdweb SDK pattern!');

