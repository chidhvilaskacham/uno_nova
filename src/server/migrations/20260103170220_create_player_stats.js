/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('player_stats', (table) => {
        table.uuid('userId').primary().references('userId').inTable('users').onDelete('CASCADE');
        table.integer('totalGamesPlayed').defaultTo(0);
        table.integer('totalWins').defaultTo(0);
        table.integer('totalLosses').defaultTo(0);
        table.float('winRate').defaultTo(0);
        table.integer('averageGameDuration').defaultTo(0);
        table.integer('cardsPlayed').defaultTo(0);
        table.integer('specialCardsUsed').defaultTo(0);
        table.timestamp('lastPlayedAt');
        table.integer('currentStreak').defaultTo(0);
        table.timestamps(true, true);

        table.index(['userId']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('player_stats');
};
