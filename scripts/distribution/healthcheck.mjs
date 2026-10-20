try {
  const port = process.env.ATLAS_PORT ?? '8081';
  const response = await fetch(`http://127.0.0.1:${port}/healthz`, {
    signal: AbortSignal.timeout(4000),
    redirect: 'error',
  });
  if (!response.ok || (await response.text()) !== 'ok\n') process.exitCode = 1;
} catch {
  process.exitCode = 1;
}
