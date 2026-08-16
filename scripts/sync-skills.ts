import { spawn } from 'node:child_process';
import { cp, mkdtemp, rename, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repository =
  process.env.ASCENDANT_AGENTS_REPOSITORY ??
  'https://github.com/thaletto/ascendant-agents.git';
const ref = process.env.ASCENDANT_AGENTS_REF ?? 'main';
const sourcePath = 'plugins/agent/ascendant/skills';
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const destination = join(projectRoot, 'content', 'skills');
const staging = `${destination}.sync-${process.pid}`;

async function run(command: string[]): Promise<void> {
  const [executable, ...args] = command;
  if (executable === undefined) {
    throw new Error('Cannot run an empty command');
  }

  const child = spawn(executable, args, {
    cwd: projectRoot,
    stdio: 'inherit',
  });
  const exitCode = await new Promise<number | null>((resolveExit, reject) => {
    child.once('error', reject);
    child.once('exit', resolveExit);
  });

  if (exitCode !== 0) {
    throw new Error(`Command failed with exit code ${exitCode}: ${command.join(' ')}`);
  }
}

const checkout = await mkdtemp(join(tmpdir(), 'ascendant-agents-'));

try {
  await run([
    'git',
    'clone',
    '--depth',
    '1',
    '--filter=blob:none',
    '--sparse',
    '--branch',
    ref,
    repository,
    checkout,
  ]);
  await run(['git', '-C', checkout, 'sparse-checkout', 'set', sourcePath]);

  const source = join(checkout, sourcePath);
  const sourceStats = await stat(source);
  if (!sourceStats.isDirectory()) {
    throw new Error(`GitHub source is not a directory: ${sourcePath}`);
  }

  await rm(staging, { recursive: true, force: true });
  await cp(source, staging, { recursive: true });
  await rm(destination, { recursive: true, force: true });
  await rename(staging, destination);

  console.log(`Synced ${sourcePath} from ${repository}#${ref} to content/skills`);
} finally {
  await rm(staging, { recursive: true, force: true });
  await rm(checkout, { recursive: true, force: true });
}
