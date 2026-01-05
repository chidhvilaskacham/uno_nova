import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting UNO Nova Development Environment...');

const run = (name, command, args, cwd) => {
    const child = spawn(command, args, {
        stdio: 'inherit',
        shell: true,
        cwd: cwd ? path.join(__dirname, cwd) : __dirname
    });

    child.on('error', (err) => {
        console.error(`[${name}] Failed to start:`, err);
    });

    child.on('close', (code) => {
        console.log(`[${name}] exited with code ${code}`);
    });
};

// Start Server
run('SERVER', 'npm', ['run', 'dev'], 'server');

// Start Client
setTimeout(() => {
    run('CLIENT', 'npm', ['run', 'dev'], 'client');
}, 1000);
