import { execa } from 'execa';
import { z } from 'zod';
import chalk from 'chalk';
import ora from 'ora';
import { getPort } from 'get-port-please';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Zod-validated configuration
const ConfigSchema = z.object({
    SERVER_PORT: z.number().default(5000),
    CLIENT_PORT: z.number().default(5173),
    BASE_DIR: z.string().default(__dirname),
});

async function startMissionControl() {
    const spinner = ora('Initializing Mission Control...').start();

    try {
        // 2. Dynamic Port Detection
        const serverPort = await getPort({ port: 5000, portRange: [5000, 6000] });
        const clientPort = await getPort({ port: 5173, portRange: [5173, 6173] });

        const config = ConfigSchema.parse({
            SERVER_PORT: serverPort,
            CLIENT_PORT: clientPort,
        });

        spinner.succeed(chalk.green('Mission Control Initialized'));

        console.log('\n' + chalk.bold.cyan('--- UNO AAA MISSION CONTROL DASHBOARD ---'));
        console.log(chalk.gray('------------------------------------------'));
        console.log(`${chalk.yellow('Server Port:')}  ${chalk.white(config.SERVER_PORT)}`);
        console.log(`${chalk.yellow('Client Port:')}  ${chalk.white(config.CLIENT_PORT)}`);
        console.log(`${chalk.yellow('Client URL:')}   ${chalk.cyan(`http://localhost:${config.CLIENT_PORT}`)}`);
        console.log(chalk.gray('------------------------------------------\n'));

        const serverSpinner = ora('Launching Server...').start();
        const clientSpinner = ora('Launching Client...').start();

        // 3. Robust Process Management with execa
        const serverProcess = execa('npm', ['start'], {
            cwd: path.join(config.BASE_DIR, 'server'),
            env: { ...process.env, PORT: config.SERVER_PORT.toString() },
            all: true,
        });

        const clientProcess = execa('npm', ['run', 'dev', '--', '--port', config.CLIENT_PORT.toString()], {
            cwd: path.join(config.BASE_DIR, 'client'),
            all: true,
        });

        serverProcess.all.on('data', (data) => {
            if (data.toString().includes('Server running')) {
                serverSpinner.succeed(chalk.green('Server Operational'));
            }
        });

        clientProcess.all.on('data', (data) => {
            if (data.toString().includes('ready in') || data.toString().includes('Local:')) {
                clientSpinner.succeed(chalk.green('Client Operational'));
            }
        });

        // 4. Graceful Shutdown
        const shutdown = async () => {
            console.log('\n' + chalk.red.bold('--- SHUTDOWN SIGNAL RECEIVED ---'));
            const closeSpinner = ora('Closing all systems...').start();

            try {
                await Promise.allSettled([
                    serverProcess.kill('SIGTERM', { forceKillAfterTimeout: 2000 }),
                    clientProcess.kill('SIGTERM', { forceKillAfterTimeout: 2000 })
                ]);
                closeSpinner.succeed(chalk.green('Mission Control Offline. Stay safe, Commander.'));
                process.exit(0);
            } catch (err) {
                closeSpinner.fail(chalk.red('Shutdown encountered issues (processes likely already closed)'));
                process.exit(1);
            }
        };

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);

        // AI Performance Metrics Placeholder (Simulated)
        setInterval(() => {
            const cpuUsage = (Math.random() * 30 + 10).toFixed(1);
            const memUsage = (Math.random() * 200 + 400).toFixed(1);
            process.stdout.write(`\r${chalk.blue('AI Metrics:')} CPU ${chalk.green(cpuUsage + '%')} | RAM ${chalk.green(memUsage + 'MB')}   `);
        }, 2000);

    } catch (error) {
        spinner.fail(chalk.red('Mission Control Failure'));
        console.error(error);
        process.exit(1);
    }
}

startMissionControl();
