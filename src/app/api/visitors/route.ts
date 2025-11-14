import { NextResponse } from 'next/server';
import redis from '@/util/redis';

export async function GET() {
  try {
    const visitorCount = await redis.incr('visitor-count');

    return NextResponse.json({
      success: true,
      message: 'Route is working', 
      tests: {
        getValue: visitorCount,
      },
    });
  } catch (error) {
    console.error('Redis error:', error);
  }
}