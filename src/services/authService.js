const bcrypt = require('bcrypt')
const knex = require('../db')

const getProfiles = async () => {
  return await knex('users')
    .select('id','name','avatar','role')
    .orderBy('id')
}

const login = async (user_id, pin) => {
  try{
    const user = await knex('users')
      .where({id:user_id})
      .first()
    if(!user){throw new Error('No matching user.')}

    const isMatch = await bcrypt.compare(pin, user.pin_hash)

    const {pin_hash, ...safeUser} = user

    return isMatch ? {success: true, safeUser} : {success:false, message:'Invalid PIN for user'}

  }catch(error){
    return {success:false, message:error.message}
  }
}


module.exports = {getProfiles, login}
