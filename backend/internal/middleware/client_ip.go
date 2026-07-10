package middleware

import (
	"net"
	"net/http"
	"strings"
)

var trustProxy bool

// ConfigureClientIP sets whether X-Forwarded-For is honored (set from config at startup).
func ConfigureClientIP(trust bool) {
	trustProxy = trust
}

// ClientIP returns a client identifier for rate limiting. When trustProxy is true
// (TRUST_PROXY in env — set via ConfigureClientIP), the leftmost X-Forwarded-For
// hop is used; otherwise the remote address is used.
func ClientIP(r *http.Request) string {
	if trustProxy {
		if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
			parts := strings.Split(xff, ",")
			if ip := strings.TrimSpace(parts[0]); ip != "" {
				return ip
			}
		}
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}
