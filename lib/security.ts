/**
 * 安全性工具函數
 */

// 簡單的內存速率限制器（生產環境建議使用 Redis）
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

/**
 * 速率限制檢查
 * @param identifier - 識別符（如 IP 地址）
 * @param maxRequests - 最大請求數
 * @param windowMs - 時間窗口（毫秒）
 * @returns 是否允許請求
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 60000 // 1 分鐘
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  // 清理過期記錄
  if (record && now > record.resetTime) {
    rateLimitMap.delete(identifier)
  }

  const currentRecord = rateLimitMap.get(identifier)

  if (!currentRecord) {
    // 新記錄
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    })
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    }
  }

  if (currentRecord.count >= maxRequests) {
    // 超過限制
    return {
      allowed: false,
      remaining: 0,
      resetTime: currentRecord.resetTime,
    }
  }

  // 增加計數
  currentRecord.count++
  return {
    allowed: true,
    remaining: maxRequests - currentRecord.count,
    resetTime: currentRecord.resetTime,
  }
}

/**
 * 檢查 Honeypot 欄位
 * @param honeypotValue - Honeypot 欄位的值
 * @returns 是否為機器人（true = 是機器人）
 */
export function isBot(honeypotValue: string | undefined | null): boolean {
  // 如果 honeypot 欄位有值，則可能是機器人
  return Boolean(honeypotValue && honeypotValue.trim().length > 0)
}

/**
 * 從請求中獲取客戶端 IP
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

/**
 * 清理舊的速率限制記錄（可選：定期調用）
 */
export function cleanupRateLimits(): void {
  const now = Date.now()
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}
