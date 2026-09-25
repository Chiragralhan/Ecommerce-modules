import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import http from 'http';
import app from '../server.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

let mongoServer;
let server;
let baseUrl;

// Simple test runner helpers
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`  FAIL: ${message}`);
    failed++;
    throw new Error(message);
  } else {
    console.log(`  PASS: ${message}`);
    passed++;
  }
}

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => null);
  return { status: response.status, body: data };
}

async function runTests() {
  console.log('\n--- Starting ERP E-Commerce Automated Tests ---\n');

  try {
    // 1. Setup in-memory MongoDB
    console.log('[Setup] Starting in-memory MongoDB...');
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(uri);

    // 2. Start HTTP server on random free port
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
    console.log(`[Setup] Server running at ${baseUrl}\n`);

    // ----------------------------------------------------
    // TEST SUITE 1: Product Management & Validation
    // ----------------------------------------------------
    console.log('--- Test Suite 1: Product Management & Validations ---');

    // Test 1.1: Health check
    const healthRes = await request('/api/health');
    assert(healthRes.status === 200 && healthRes.body.status === 'online', 'Health endpoint responds 200 online');

    // Test 1.2: Reject negative price or stock
    const badProductRes = await request('/api/products', {
      method: 'POST',
      body: {
        productName: 'Defective Item',
        category: 'Electronics',
        price: -50,
        stockQuantity: 10,
      },
    });
    assert(badProductRes.status === 400, 'Rejects negative product price with 400 Bad Request');

    const badStockRes = await request('/api/products', {
      method: 'POST',
      body: {
        productName: 'Defective Item 2',
        category: 'Electronics',
        price: 100,
        stockQuantity: -5,
      },
    });
    assert(badStockRes.status === 400, 'Rejects negative product stock with 400 Bad Request');

    // Test 1.3: Create valid products
    const prod1Res = await request('/api/products', {
      method: 'POST',
      body: {
        productName: 'Mechanical Gaming Keyboard',
        category: 'Electronics',
        description: 'RGB mechanical keyboard with blue switches',
        price: 89.99,
        stockQuantity: 20,
        reorderLevel: 5,
      },
    });
    assert(prod1Res.status === 201, 'Creates Product 1 successfully with 201 Created');
    const prod1 = prod1Res.body.data;
    assert(prod1.stockStatus === 'In Stock', 'Product 1 stockStatus is "In Stock" (20 > 5)');

    const prod2Res = await request('/api/products', {
      method: 'POST',
      body: {
        productName: 'Ergonomic Office Chair',
        category: 'Furniture',
        description: 'Mesh high-back chair',
        price: 199.5,
        stockQuantity: 4,
        reorderLevel: 5,
      },
    });
    assert(prod2Res.status === 201, 'Creates Product 2 with low stock');
    const prod2 = prod2Res.body.data;
    assert(prod2.stockStatus === 'Low Stock', 'Product 2 stockStatus is "Low Stock" (4 <= 5)');

    const prod3Res = await request('/api/products', {
      method: 'POST',
      body: {
        productName: 'Wireless Mouse',
        category: 'Electronics',
        description: 'Quiet click wireless mouse',
        price: 29.99,
        stockQuantity: 0,
        reorderLevel: 5,
      },
    });
    assert(prod3Res.status === 201, 'Creates Product 3 with 0 stock');
    const prod3 = prod3Res.body.data;
    assert(prod3.stockStatus === 'Out of Stock', 'Product 3 stockStatus is "Out of Stock" (0)');

    // Test 1.4: Search and Filter Products
    const searchRes = await request('/api/products?q=Keyboard');
    assert(searchRes.status === 200 && searchRes.body.count === 1, 'Searches product by name keyword');

    const catFilterRes = await request('/api/products?category=Electronics');
    assert(catFilterRes.status === 200 && catFilterRes.body.count === 2, 'Filters products by category');

    const sortRes = await request('/api/products?sortBy=price&order=asc');
    assert(
      sortRes.status === 200 && sortRes.body.data[0].price <= sortRes.body.data[1].price,
      'Sorts products by price ascending'
    );

    // Test 1.5: Update Product
    const updateRes = await request(`/api/products/${prod1._id}`, {
      method: 'PUT',
      body: { price: 79.99, stockQuantity: 25 },
    });
    assert(
      updateRes.status === 200 && updateRes.body.data.price === 79.99 && updateRes.body.data.stockQuantity === 25,
      'Updates product price and stock quantity correctly'
    );

    // ----------------------------------------------------
    // TEST SUITE 2: Order Management & Inventory Integration
    // ----------------------------------------------------
    console.log('\n--- Test Suite 2: Order Management & Inventory Integration ---');

    // Test 2.1: Order creation fails if ordered quantity > available stock
    const excessiveOrderRes = await request('/api/orders', {
      method: 'POST',
      body: {
        customerName: 'Alice Johnson',
        customerEmail: 'alice@example.com',
        customerPhone: '123-456-7890',
        items: [{ product: prod1._id, quantity: 100 }], // Available is 25
      },
    });
    assert(excessiveOrderRes.status === 400, 'Rejects order when requested quantity exceeds available stock');

    // Verify stock was NOT reduced
    const verifyProd1Res = await request(`/api/products/${prod1._id}`);
    assert(verifyProd1Res.body.data.stockQuantity === 25, 'Inventory was NOT reduced on rejected order');

    // Test 2.2: Order creation succeeds and reduces stock accurately
    const validOrderRes = await request('/api/orders', {
      method: 'POST',
      body: {
        customerName: 'Bob Smith',
        customerEmail: 'bob@example.com',
        customerPhone: '987-654-3210',
        items: [
          { product: prod1._id, quantity: 5 }, // 5 * 79.99 = 399.95
          { product: prod2._id, quantity: 2 }, // 2 * 199.50 = 399.00
        ],
      },
    });

    assert(validOrderRes.status === 201, 'Creates order successfully with 201 Created');
    const createdOrder = validOrderRes.body.data;
    assert(createdOrder.orderStatus === 'Pending', 'Default order status is "Pending"');
    assert(
      Math.abs(createdOrder.totalAmount - 798.95) < 0.01,
      `Calculated total amount correctly (expected 798.95, got ${createdOrder.totalAmount})`
    );

    // Verify stock reduction in database
    const postOrderProd1 = await request(`/api/products/${prod1._id}`);
    assert(
      postOrderProd1.body.data.stockQuantity === 20,
      `Reduced Product 1 stock by 5 (25 -> 20, actual: ${postOrderProd1.body.data.stockQuantity})`
    );

    const postOrderProd2 = await request(`/api/products/${prod2._id}`);
    assert(
      postOrderProd2.body.data.stockQuantity === 2,
      `Reduced Product 2 stock by 2 (4 -> 2, actual: ${postOrderProd2.body.data.stockQuantity})`
    );

    // Test 2.3: Order Status Progression
    const statusUpdateRes = await request(`/api/orders/${createdOrder._id}/status`, {
      method: 'PATCH',
      body: { status: 'Confirmed' },
    });
    assert(statusUpdateRes.status === 200 && statusUpdateRes.body.data.orderStatus === 'Confirmed', 'Updates order status to "Confirmed"');

    // Test 2.4: Order Cancellation & Inventory Restoration
    const cancelRes = await request(`/api/orders/${createdOrder._id}/cancel`, {
      method: 'POST',
    });
    assert(cancelRes.status === 200, 'Cancels order successfully');
    assert(cancelRes.body.data.orderStatus === 'Cancelled', 'Order status marked as "Cancelled"');

    // Verify inventory restored back to original counts!
    const restoredProd1 = await request(`/api/products/${prod1._id}`);
    assert(
      restoredProd1.body.data.stockQuantity === 25,
      `Restored Product 1 stock back to 25 (actual: ${restoredProd1.body.data.stockQuantity})`
    );

    const restoredProd2 = await request(`/api/products/${prod2._id}`);
    assert(
      restoredProd2.body.data.stockQuantity === 4,
      `Restored Product 2 stock back to 4 (actual: ${restoredProd2.body.data.stockQuantity})`
    );

    // Test 2.5: Prevent duplicate cancellation
    const duplicateCancelRes = await request(`/api/orders/${createdOrder._id}/cancel`, {
      method: 'POST',
    });
    assert(duplicateCancelRes.status === 400, 'Rejects duplicate cancellation of already cancelled order');

    // Test 2.6: Dashboard metrics
    const metricsRes = await request('/api/orders/metrics');
    assert(metricsRes.status === 200, 'Metrics endpoint responds 200 OK');
    assert(metricsRes.body.data.inventory.totalProducts === 3, 'Metrics accurately counts total products');
    assert(metricsRes.body.data.orders.totalOrders === 1, 'Metrics accurately counts total orders');

    console.log(`\n========================================`);
    console.log(`TESTS FINISHED: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Test execution failed with error:', error);
    process.exit(1);
  } finally {
    if (server) server.close();
    if (mongoose.connection) await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
