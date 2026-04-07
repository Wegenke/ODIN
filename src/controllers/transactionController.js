const transactionService = require('../services/transactionsService')

const getMyTransactions = async (req,res) => {
  try{
    const {id} = req.user
    const transactions = await transactionService.getMyTransactions(id,req.query)
    return res.status(200).json(transactions)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const getTransactionsByChild = async (req,res) => {
  try{
    const {household_id} = req.user
    const transactions = await transactionService.getTransactionsByChild(req.params.id, household_id,req.query)
    return res.status(200).json(transactions)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

const getHouseholdTransactions = async (req,res) => {
  try{
    const {household_id} = req.user
    const transactions = await transactionService.getHouseholdTransactions(household_id,req.query)
    return res.status(200).json(transactions)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
  return res.status(500).json({message:"Server error"})
  }
}

module.exports = {getMyTransactions, getTransactionsByChild, getHouseholdTransactions}