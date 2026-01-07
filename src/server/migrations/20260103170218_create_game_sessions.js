/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('game_sessions', (table) => {
        table.uuid('sessionId').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('gameType').notNullable(); // 1v1, multiplayer, botGame
        table.timestamp('startTime').defaultTo(knex.fn.now());
        table.timestamp('endTime');
        table.integer('duration'); // in seconds
        table.string('roomCode').index();
        table.jsonb('players'); // Array of playerIds and metadata
        table.string('winner');
        table.jsonb('finalScores');
        table.timestamps(true, true);

        table.index(['sessionId', 'createdAt']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('game_sessions');
};
