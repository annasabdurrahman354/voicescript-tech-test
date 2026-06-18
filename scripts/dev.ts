import { spawn, exec } from 'child_process';

console.log('\n\x1b[36m%s\x1b[0m', '🚀 Starting Voicescript Workflow Manager in Development Mode...');
console.log('\x1b[32m%s\x1b[0m', '  - Frontend Dev Server (Hot-Reloading): http://localhost:5173');
console.log('\x1b[32m%s\x1b[0m', '  - Express Backend API Server:          http://localhost:3000');
console.log('\x1b[32m%s\x1b[0m', '  - Swagger Interactive API Docs:       http://localhost:3000/api/docs\n');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

// Start backend
const backend = spawn(npmCmd, ['run', 'dev:backend'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true,
});

// Start frontend
const frontend = spawn(npmCmd, ['run', 'dev:frontend'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true,
});

function logOutput(prefix: string, color: string, data: Buffer) {
  const lines = data.toString().trim().split('\n');
  for (const line of lines) {
    if (line.trim()) {
      console.log(`${color}${prefix}\x1b[0m ${line}`);
    }
  }
}

// Colors
const blue = '\x1b[34m';
const magenta = '\x1b[35m';

backend.stdout.on('data', (data) => logOutput('[Backend]', blue, data));
backend.stderr.on('data', (data) => logOutput('[Backend ERROR]', '\x1b[31m', data));

frontend.stdout.on('data', (data) => logOutput('[Frontend]', magenta, data));
frontend.stderr.on('data', (data) => logOutput('[Frontend ERROR]', '\x1b[31m', data));

function killProcess(child: any) {
  if (!child || !child.pid) return;
  if (isWindows) {
    exec(`taskkill /pid ${child.pid} /T /F`, () => {
      // Ignored
    });
  } else {
    child.kill('SIGTERM');
  }
}

let isCleaningUp = false;
function cleanup() {
  if (isCleaningUp) return;
  isCleaningUp = true;
  console.log('\n\x1b[33m%s\x1b[0m', '🛑 Stopping development servers...');
  killProcess(backend);
  killProcess(frontend);
  setTimeout(() => {
    process.exit(0);
  }, 500);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
