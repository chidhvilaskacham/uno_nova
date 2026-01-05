/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('sessions', (table) => {
        table.uuid('sessionId').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('userId').references('userId').inTable('users').onDelete('CASCADE');
        table.string('refreshToken').notNullable().unique();
        table.string('deviceInfo');
        table.timestamp('expiresAt').notNullable();
        table.timestamps(true, true);

        table.index(['userId']);
        table.index(['refreshToken']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('sessions');
};
