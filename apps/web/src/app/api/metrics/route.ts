import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      performance: {
        uptime: process.uptime(),
        memory: {
          rss: process.memoryUsage().rss,
          heapTotal: process.memoryUsage().heapTotal,
          heapUsed: process.memoryUsage().heapUsed,
          external: process.memoryUsage().external,
          arrayBuffers: process.memoryUsage().arrayBuffers
        },
        cpu: process.cpuUsage(),
        loadAverage: process.platform === 'linux' ? (await import('os')).loadavg() : null
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        nodeEnv: process.env.NODE_ENV
      },
      requests: {
        // This would be populated by middleware in a real app
        total: 0,
        active: 0,
        errors: 0
      }
    };

    return NextResponse.json(metrics, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to collect metrics' },
      { status: 500 }
    );
  }
}
