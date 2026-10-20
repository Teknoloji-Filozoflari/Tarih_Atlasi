import { writePilot } from './build.mjs';
try {
  const built = await writePilot();
  process.stdout.write(
    `Pilot prepared: ${built.catalog.records.length} records; ${built.manifest.omissions.completePolityPolygons} source area records and ${built.manifest.omissions.polityParts} Cliopatria parts. Discovery: 10 requested people, 7 added events, 6 separate modern cities, 5 opt-in approximate person relations (4 birth/death snapshots + one residence). Van Gogh geography remains withheld; cultures remain absent. Incomplete worldwide coverage.\n`,
  );
} catch (error) {
  process.stderr.write(
    `${JSON.stringify({ status: 'rejected', issues: error.issues ?? [{ message: error.message }] })}\n`,
  );
  process.exitCode = 1;
}
