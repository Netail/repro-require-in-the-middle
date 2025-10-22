export const register = async () => {
    if (
        process.env.NODE_ENV === 'production' &&
        process.env.NEXT_RUNTIME === 'nodejs'
    ) {
        const { startInstrumentation } = await import('./instrumentation-node');
        startInstrumentation();
    }
};
