'use server'
import redis from '@/util/redis'

export default async function incrementViews () {
    const count = await redis.get('visitor-count');

    return Number(count);
}