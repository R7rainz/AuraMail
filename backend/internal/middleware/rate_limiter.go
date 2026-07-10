package middleware

import (
	"net/http"
	"sync"
	"time"
)

type client struct {
	requests    int
	windowStart time.Time
}

type RateLimiter struct {
	mu       sync.Mutex
	clients  map[string]*client
	maxReqs  int
	window   time.Duration
	stopChan chan struct{}
}

var (
	defaultLimiter *RateLimiter
	limiterOnce    sync.Once
)

func GetDefaultLimiter() *RateLimiter {
	limiterOnce.Do(func() {
		defaultLimiter = NewRateLimiter(100, time.Minute)
	})
	return defaultLimiter
}

func NewRateLimiter(maxReqs int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		clients:  make(map[string]*client),
		maxReqs:  maxReqs,
		window:   window,
		stopChan: make(chan struct{}),
	}

	go rl.cleanup()
	return rl
}

func (rl *RateLimiter) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			now := time.Now()

			rl.mu.Lock()
			staleIPs := make([]string, 0)
			for ip, c := range rl.clients {
				if now.Sub(c.windowStart) > rl.window*2 {
					staleIPs = append(staleIPs, ip)
				}
			}
			rl.mu.Unlock()

			if len(staleIPs) > 0 {
				rl.mu.Lock()
				for _, ip := range staleIPs {
					delete(rl.clients, ip)
				}
				rl.mu.Unlock()
			}
		case <-rl.stopChan:
			return
		}
	}
}

// close the stop channel
func (rl *RateLimiter) Stop() {
	close(rl.stopChan)
}

func (rl *RateLimiter) Allow(ip string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock() // if anything wrong happens in this function we make sure that the mutex is unlocked

	c, exists := rl.clients[ip]
	if !exists {
		rl.clients[ip] = &client{
			requests:    1,
			windowStart: time.Now(),
		}
		return true
	}

	if time.Since(c.windowStart) > rl.window {
		c.requests = 1
		c.windowStart = time.Now()
	}

	// checking if they exceeded the limit
	if c.requests >= rl.maxReqs {
		return false
	}
	c.requests++
	return true
}

func RateLimitMiddleware(next http.Handler) http.Handler {
	limiter := GetDefaultLimiter()

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := ClientIP(r)

		if !limiter.Allow(ip) {
			w.Header().Set("Content-Type", "application/json")
			w.Header().Set("Retry-After", "60") // tell the browser to try after 60 seconds
			w.WriteHeader(http.StatusTooManyRequests)
			w.Write([]byte(`{"error": "rate_limit_exceeded", "message" : "Too many request, please try again later"}`))

			// return immediately so all the requests stops
			return
		}
		// let them through
		next.ServeHTTP(w, r)
	})
}

