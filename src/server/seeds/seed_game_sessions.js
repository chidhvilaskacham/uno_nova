/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('game_sessions').del();

  await knex('game_sessions').insert([
    {
      gameType: 'multiplayer',
      startTime: new Date(Date.now() - 3600000), // 1 hour ago
      endTime: new Date(Date.now() - 3000000), // 50 mins ago
      duration: 600,
      roomCode: 'UNOABC',
      players: JSON.stringify([{ id: 'user1', name: 'Alice' }, { id: 'user2', name: 'Bob' }]),
      winner: 'user1',
      finalScores: JSON.stringify({ user1: 50, user2: 30 })
    },
    {
      gameType: 'botGame',
      startTime: new Date(Date.now() - 7200000), // 2 hours ago
      endTime: new Date(Date.now() - 6600000), // 1 hour 50 mins ago
      duration: 600,
      roomCode: 'BOT123',
      players: JSON.stringify([{ id: 'user1', name: 'Alice' }, { id: 'bot1', name: 'CPU' }]),
      winner: 'bot1',
      finalScores: JSON.stringify({ user1: 20, bot1: 40 })
    }
  ]);
};
