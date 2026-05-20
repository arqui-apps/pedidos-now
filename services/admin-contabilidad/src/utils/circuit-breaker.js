// Circuit breaker para proteger llamadas a servicios externos
// Estados: CLOSED (normal) → OPEN (bloqueado) → HALF_OPEN (probando)

class CircuitBreaker {
    constructor(options = {}) {
        this.failureThreshold = options.failureThreshold || 5; // Fallos antes de abrir
        this.resetTimeout = options.resetTimeout || 60000; // 60s para probar recuperación
        this.monitoringPeriod = options.monitoringPeriod || 10000; // 10s para resetear contador

        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
        this.failureCount = 0;
        this.successCount = 0;
        this.nextAttempt = Date.now();
        this.lastFailureTime = null;
    }

    async execute(fn) {
        if (this.state === 'OPEN') {
            if (Date.now() < this.nextAttempt) {
                throw new Error(`Circuit breaker OPEN. Retry after ${Math.ceil((this.nextAttempt - Date.now()) / 1000)}s`);
            }
            // Pasar a HALF_OPEN para probar
            this.state = 'HALF_OPEN';
        }

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    onSuccess() {
        this.failureCount = 0;

        if (this.state === 'HALF_OPEN') {
            this.state = 'CLOSED';
            this.successCount = 0;
            console.log('Circuit breaker: recuperado a CLOSED');
        }
    }

    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();

        if (this.failureCount >= this.failureThreshold) {
            this.state = 'OPEN';
            this.nextAttempt = Date.now() + this.resetTimeout;
            console.warn(`Circuit breaker: abierto (${this.failureCount} fallos). Reintentará en ${this.resetTimeout / 1000}s`);
        }
    }

    getState() {
        return {
            state: this.state,
            failureCount: this.failureCount,
            lastFailureTime: this.lastFailureTime
        };
    }
}

module.exports = CircuitBreaker;