'use server'
import redis from '@/util/redis';

export default async function VisitorCounter() {
  const count = await redis.get('visitor-count'); // atomic increment
  return <p>Visitor count: {Number(count)}</p>;
}