/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('user_profiles', (table) => {
        table.uuid('userId').primary().references('userId').inTable('users').onDelete('CASCADE');
        table.string('displayName');
        table.text('bio');
        table.string('avatarUrl');
        table.string('preferredTheme').defaultTo('dark');
        table.timestamp('joinedDate').defaultTo(knex.fn.now());
        table.jsonb('friendsList').defaultTo('[]');
        table.jsonb('blockedList').defaultTo('[]');
        table.timestamps(true, true);

        table.index(['userId']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('user_profiles');
};
