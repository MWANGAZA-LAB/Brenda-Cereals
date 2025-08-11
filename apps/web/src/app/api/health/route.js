import { NextResponse } from 'next/server';
export async function GET() {
    const healthCheck = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        checks: {
            database: 'unknown',
            memory: {
                used: process.memoryUsage().heapUsed,
                total: process.memoryUsage().heapTotal,
                percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)
            },
            system: {
                platform: process.platform,
                nodeVersion: process.version,
                cpu: process.cpuUsage()
            }
        }
    };
    try {
        // Test database connection (if Prisma is configured)
        if (process.env.DATABASE_URL) {
            // For now, just check if DATABASE_URL exists without connecting
            healthCheck.checks.database = 'configured';
        }
        else {
            healthCheck.checks.database = 'not_configured';
        }
    }
    catch {
        healthCheck.status = 'degraded';
        healthCheck.checks.database = 'disconnected';
    }
    const status = healthCheck.status === 'healthy' ? 200 : 503;
    return NextResponse.json(healthCheck, {
        status,
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    });
}
