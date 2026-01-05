/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('user_profiles').del();
  await knex('player_stats').del();
  await knex('users').del();

  const [user1, user2] = await knex('users').insert([
    {
      username: 'AliceUno',
      email: 'alice@example.com',
      passwordHash: 'hashed_password_123',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'
    },
    {
      username: 'BobNova',
      email: 'bob@example.com',
      passwordHash: 'hashed_password_456',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob'
    }
  ]).returning('*');

  await knex('user_profiles').insert([
    {
      userId: user1.userId,
      displayName: 'Alice the Great',
      bio: 'Loves playing UNO with friends.',
      avatarUrl: user1.avatar
    },
    {
      userId: user2.userId,
      displayName: 'Bob the Builder',
      bio: 'Building the best UNO strategies.',
      avatarUrl: user2.avatar
    }
  ]);

  await knex('player_stats').insert([
    {
      userId: user1.userId,
      totalGamesPlayed: 10,
      totalWins: 7,
      totalLosses: 3,
      winRate: 0.7,
      averageGameDuration: 300
    },
    {
      userId: user2.userId,
      totalGamesPlayed: 8,
      totalWins: 4,
      totalLosses: 4,
      winRate: 0.5,
      averageGameDuration: 350
    }
  ]);
};
