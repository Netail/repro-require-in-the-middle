import { trace } from '@opentelemetry/api';
import {
    type NextFetchEvent,
    type NextMiddleware,
    type NextRequest,
    NextResponse,
} from 'next/server';

/**
 * Return healthiness of application on (<basePath?>/health - production only)
 */
const middleware: NextMiddleware = async (req, event) => {
    const isProductionBuild = process.env.NODE_ENV === 'production';

    if (isProductionBuild && req.nextUrl.pathname === '/health') {
        return NextResponse.json(
            {
                instance: 'repro-require-in-the-middle',
                version: '0.1.0',
            },
            {
                status: 200,
            },
        );
    }

    const response = NextResponse.next();

    if (isProductionBuild) {
        const current = trace.getActiveSpan();
        if (response && current) {
            response.headers.set(
                'server-timing',
                `traceparent;desc="00-${current.spanContext().traceId}-${current.spanContext().spanId}-01"`,
            );
        }
    }

    return response;
};

export default middleware;

export const config = {
    matcher: [
        /*
         * Match all request paths except (make sure to start _next paths with your assetPrefix):
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - prefetch requests
         */
        {
            source: '/((?!_next/static|_next/image).*)',
            missing: [
                { type: 'header', key: 'next-router-prefetch' },
                { type: 'header', key: 'purpose', value: 'prefetch' },
            ],
        },
    ],
};
