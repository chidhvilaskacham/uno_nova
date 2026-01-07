// Update with your config settings.
require('dotenv').config({ path: '../.env' });

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
    development: {
        client: 'postgresql',
        connection: process.env.DATABASE_URL || {
            host: process.env.DB_HOST || '127.0.0.1',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || 'uno_nova',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres'
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: './migrations'
        },
        seeds: {
            directory: './seeds'
        }
    },

    production: {
        client: 'postgresql',
        connection: process.env.DATABASE_URL,
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: './migrations'
        },
        seeds: {
            directory: './seeds'
        }
    }
};
