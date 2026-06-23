import { drizzle } from 'drizzle-orm/mysql2';
import { products } from '../drizzle/schema.ts';

const db = drizzle(process.env.DATABASE_URL);

const sampleProducts = [
  {
    name: 'Quantum Headphones',
    description: 'Premium wireless headphones with active noise cancellation and 40-hour battery life.',
    price: '299.99',
    category: 'Electronics',
    imageUrl: 'https://via.placeholder.com/500x500?text=Quantum+Headphones',
    stock: 25,
  },
  {
    name: 'Neon Smartwatch',
    description: 'Advanced fitness tracking with AMOLED display and 7-day battery.',
    price: '199.99',
    category: 'Wearables',
    imageUrl: 'https://via.placeholder.com/500x500?text=Neon+Smartwatch',
    stock: 40,
  },
  {
    name: 'Luxe Sunglasses',
    description: 'Premium polarized sunglasses with UV protection and titanium frame.',
    price: '249.99',
    category: 'Accessories',
    imageUrl: 'https://via.placeholder.com/500x500?text=Luxe+Sunglasses',
    stock: 50,
  },
  {
    name: 'Crystal Phone Case',
    description: 'Ultra-protective phone case with crystal-clear design and premium materials.',
    price: '49.99',
    category: 'Accessories',
    imageUrl: 'https://via.placeholder.com/500x500?text=Crystal+Phone+Case',
    stock: 100,
  },
  {
    name: 'Sonic Portable Speaker',
    description: '360-degree sound with deep bass and waterproof design.',
    price: '149.99',
    category: 'Electronics',
    imageUrl: 'https://via.placeholder.com/500x500?text=Sonic+Speaker',
    stock: 35,
  },
  {
    name: 'Prismatic Backpack',
    description: 'Sleek laptop backpack with iridescent design and multiple compartments.',
    price: '89.99',
    category: 'Accessories',
    imageUrl: 'https://via.placeholder.com/500x500?text=Prismatic+Backpack',
    stock: 60,
  },
  {
    name: 'Aurora Wireless Charger',
    description: 'Fast wireless charging pad with ambient lighting effects.',
    price: '79.99',
    category: 'Electronics',
    imageUrl: 'https://via.placeholder.com/500x500?text=Aurora+Charger',
    stock: 45,
  },
  {
    name: 'Stellar Camera Lens',
    description: 'Professional-grade camera lens with advanced optics.',
    price: '599.99',
    category: 'Electronics',
    imageUrl: 'https://via.placeholder.com/500x500?text=Stellar+Lens',
    stock: 15,
  },
];

async function seed() {
  try {
    console.log('🌱 Starting seed...');
    
    // Clear existing products
    await db.delete(products);
    console.log('✓ Cleared existing products');
    
    // Insert sample products
    await db.insert(products).values(sampleProducts);
    console.log(`✓ Inserted ${sampleProducts.length} sample products`);
    
    console.log('✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
