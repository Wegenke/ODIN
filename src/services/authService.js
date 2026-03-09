const bcrypt = require('bcrypt')
const knex = require('../db')

const getProfiles = async () => {
  return await knex('users')
    .select('id','name','nick_name','avatar','role')
    .orderBy('id')
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
