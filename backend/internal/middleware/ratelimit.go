package middleware

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

const (
	rateLimitMax    = 100
	rateLimitWindow = 60 // seconds
)

func RateLimit(rdb *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		key := fmt.Sprintf("ratelimit:%s", ip)
		ctx := c.Request.Context()

		count, err := rdb.Incr(ctx, key).Result()
		if err != nil {
			// If Redis fails, allow the request
			c.Next()
			return
		}

		if count == 1 {
			rdb.Expire(ctx, key, time.Duration(rateLimitWindow)*time.Second)
		}

		remaining := rateLimitMax - int(count)
		if remaining < 0 {
			remaining = 0
		}

		c.Header("X-RateLimit-Limit", strconv.Itoa(rateLimitMax))
		c.Header("X-RateLimit-Remaining", strconv.Itoa(remaining))

		if count > rateLimitMax {
			ttl, _ := rdb.TTL(ctx, key).Result()
			retryAfter := int(ttl.Seconds())
			if retryAfter <= 0 {
				retryAfter = rateLimitWindow
			}

			c.Header("Retry-After", strconv.Itoa(retryAfter))
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "rate limit exceeded",
			})
			return
		}

		c.Next()
	}
}
