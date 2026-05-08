const bcrypt = require('bcrypt')
const knex = require('../db')

const getProfiles = async () => {
  const unseenNotifs = knex('notifications')
    .select('user_id')
    .count('* as count')
    .whereNull('seen_at')
    .groupBy('user_id')
    .as('n')

  const unseenAdjusts = knex('point_adjustments')
    .select('child_id')
    .count('* as count')
    .where('seen', false)
    .groupBy('child_id')
    .as('a')

  return await knex('users')
    .leftJoin(unseenNotifs, 'n.user_id', 'users.id')
    .leftJoin(unseenAdjusts, 'a.child_id', 'users.id')
    .where(q => q.whereNot({ 'users.status': 'inactive' }).orWhereNull('users.status'))
    .select(
      'users.id',
      'users.name',
      'users.nick_name',
      'users.avatar',
      'users.role',
      knex.raw('COALESCE(n.count, 0)::int as unseen_notifications'),
      knex.raw('COALESCE(a.count, 0)::int as unseen_adjustments')
    )
    .orderBy('users.id')
}

const login = async (user_id, pin) => {
    const user = await knex('users')
      .where({id:user_id})
      .first()
    if(!user)throw Object.assign(new Error('No matching user.'), {status: 401})

    const isMatch = await bcrypt.compare(pin, user.pin_hash)
    if (!isMatch) throw Object.assign(new Error('Invalid PIN for user'), {status: 401})

    const {pin_hash, ...safeUser} = user
    return safeUser
}


module.exports = {getProfiles, login}
