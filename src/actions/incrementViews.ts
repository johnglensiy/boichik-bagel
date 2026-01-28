'use server'
import redis from '@/util/redis'

export default async function incrementViews () {
    const count = await redis.incr('visitor-count');

    return Number(count);
}