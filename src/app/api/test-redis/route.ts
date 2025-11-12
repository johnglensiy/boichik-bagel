import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function GET() {
  try {
    // Test 1: Set a value
    await redis.set('test-key', 'Hello from Redis!');
    
    // Test 2: Get the value
    const value = await redis.get('test-key');
    
    // Test 3: Increment a counter
    const count = await redis.incr('test-counter');
    
    return NextResponse.json({
      success: true,
      message: 'Redis is working!',
      tests: {
        setValue: 'test-key',
        getValue: value,
        counterValue: count,
      },
    });
  } catch (error) {
    console.error('Redis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
