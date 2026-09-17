package org.hdfclife.backend.resilience;

import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.ratelimiter.RateLimiterConfig;
import org.hdfclife.backend.exception.LoginRateLimitExceededException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class LoginRateLimiterService {

    private final int userLimit;
    private final int ipLimit;
    private final Duration refreshPeriod;

    private final ConcurrentMap<String, RateLimiter> userLimiters =new ConcurrentHashMap<>();

    private final ConcurrentMap<String, RateLimiter> ipLimiters = new ConcurrentHashMap<>();

    public LoginRateLimiterService(
            @Value("${login.rate-limit.user-limit}") int userLimit,
            @Value("${login.rate-limit.ip-limit}") int ipLimit,
            @Value("${login.rate-limit.refresh-period-seconds}") long refreshPeriodSeconds) {

        this.userLimit = userLimit;
        this.ipLimit = ipLimit;
        this.refreshPeriod = Duration.ofSeconds(refreshPeriodSeconds);
    }

    public void checkLoginAttempt(String username, String ipAddress) {

        RateLimiter userRateLimiter = userLimiters.computeIfAbsent(username, key -> createRateLimiter("user-" + key, userLimit));

        RateLimiter ipRateLimiter = ipLimiters.computeIfAbsent(ipAddress, key -> createRateLimiter("ip-" + key, ipLimit));

        if (!userRateLimiter.acquirePermission()) {
            throw new LoginRateLimitExceededException("Too many login attempts for this user");
        }

        if (!ipRateLimiter.acquirePermission()) {
            throw new LoginRateLimitExceededException("Too many login attempts from this IP address");
        }
    }

    private RateLimiter createRateLimiter(String name, int limit) {

        RateLimiterConfig config = RateLimiterConfig.custom()
                .limitRefreshPeriod(refreshPeriod)
                .limitForPeriod(limit)
                .timeoutDuration(Duration.ZERO)
                .build();

        return RateLimiter.of(name, config);
    }
}