/**
 * Test script untuk memverifikasi implementasi Bridge Agent menggunakan thirdweb SDK
 */

import { thirdwebClient } from '../app/lib/thirdweb-client';
import { performCrossChainSwap, executeConfirmedSwap, getChainById, NATIVE_TOKEN_ADDRESS } from '../app/lib/bridge-agent';
// @ts-ignore
import { Bridge } from 'thirdweb';

// Test configuration
const TEST_CONFIG = {
  fromChainId: 421614, // Arbitrum Sepolia
  toChainId: 84532,    // Base Sepolia
  amount: "0.01",
  testAddress: "0x742d35Cc6634C0532925a3b8D0b4E4f7E1D4D4f4"
};

async function testBridgeRoutes() {
  console.log('\n🧪 Test 1: Bridge.routes()');
  try {
    const routes = await Bridge.routes({
      client: thirdwebClient,
      originChainId: TEST_CONFIG.fromChainId,
      destinationChainId: TEST_CONFIG.toChainId,
    });
    
    console.log('✅ Bridge.routes() berhasil');
    console.log(`   Found ${routes?.length || 0} routes`);
    return true;
  } catch (error: any) {
    console.log('❌ Bridge.routes() gagal:', error.message);
    return false;
  }
}

async function testBridgeQuote() {
  console.log('\n🧪 Test 2: Bridge.Buy.quote()');
  try {
    const amountWei = BigInt(Math.floor(parseFloat(TEST_CONFIG.amount) * 10**18));
    const quote = await Bridge.Buy.quote({
      client: thirdwebClient,
      originChainId: TEST_CONFIG.fromChainId,
      destinationChainId: TEST_CONFIG.toChainId,
      originTokenAddress: NATIVE_TOKEN_ADDRESS,
      destinationTokenAddress: NATIVE_TOKEN_ADDRESS,
      amountWei: amountWei,
    });
    
    console.log('✅ Bridge.Buy.quote() berhasil');
    console.log(`   Quote received:`, quote ? 'Yes' : 'No');
    return true;
  } catch (error: any) {
    console.log('❌ Bridge.Buy.quote() gagal:', error.message);
    return false;
  }
}

async function testPerformCrossChainSwap() {
  console.log('\n🧪 Test 3: performCrossChainSwap()');
  try {
    const result = await performCrossChainSwap(
      TEST_CONFIG.fromChainId,
      TEST_CONFIG.toChainId,
      NATIVE_TOKEN_ADDRESS,
      NATIVE_TOKEN_ADDRESS,
      TEST_CONFIG.amount,
      TEST_CONFIG.testAddress
    );
    
    if (result.status === "pending_confirmation" && result.confirmationUrl) {
      console.log('✅ performCrossChainSwap() berhasil');
      console.log(`   Status: ${result.status}`);
      console.log(`   Confirmation URL: ${result.confirmationUrl}`);
      return true;
    } else {
      console.log('❌ performCrossChainSwap() gagal:', result.error);
      return false;
    }
  } catch (error: any) {
    console.log('❌ performCrossChainSwap() error:', error.message);
    return false;
  }
}

async function testGetChainById() {
  console.log('\n🧪 Test 4: getChainById()');
  try {
    const chain = getChainById(TEST_CONFIG.fromChainId);
    if (chain) {
      console.log('✅ getChainById() berhasil');
      console.log(`   Chain: ${chain.name} (ID: ${chain.id})`);
      return true;
    } else {
      console.log('❌ getChainById() gagal: Chain not found');
      return false;
    }
  } catch (error: any) {
    console.log('❌ getChainById() error:', error.message);
    return false;
  }
}

async function testThirdwebClient() {
  console.log('\n🧪 Test 5: thirdwebClient initialization');
  try {
    if (thirdwebClient) {
      console.log('✅ thirdwebClient initialized');
      return true;
    } else {
      console.log('❌ thirdwebClient not initialized');
      return false;
    }
  } catch (error: any) {
    console.log('❌ thirdwebClient error:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting NullBridge MCP Bridge Agent Tests...\n');
  console.log('Test Configuration:');
  console.log(`- From Chain: Arbitrum Sepolia (${TEST_CONFIG.fromChainId})`);
  console.log(`- To Chain: Base Sepolia (${TEST_CONFIG.toChainId})`);
  console.log(`- Amount: ${TEST_CONFIG.amount}`);
  console.log(`- Token: Native (ETH)`);
  
  const results = {
    routes: await testBridgeRoutes(),
    quote: await testBridgeQuote(),
    performSwap: await testPerformCrossChainSwap(),
    getChain: await testGetChainById(),
    client: await testThirdwebClient(),
  };
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Test Results: ${passed}/${total} passed`);
  console.log('='.repeat(50));
  
  if (passed === total) {
    console.log('✅ All tests passed!');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(console.error);

