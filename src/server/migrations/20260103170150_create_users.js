/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('users', (table) => {
        table.uuid('userId').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('username').notNullable().unique();
        table.string('email').notNullable().unique();
        table.string('passwordHash').notNullable();
        table.string('avatar');
        table.string('accountStatus').defaultTo('active');
        table.timestamps(true, true);

        table.index(['userId', 'createdAt']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('users');
};
