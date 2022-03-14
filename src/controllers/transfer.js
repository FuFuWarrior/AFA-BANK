const {v4} = require('uuid');
const pool = require('../models/db');
const { creditAccount, debitAccount } = require('../utils/transactions')

// check if sender accounts exists using a select for update lock
// retrieve the senders balance 
// check if the account_type is basic or premium
// basic limit is total transaction for the day is #20,000 in a single transfer 
// subtract minimum balance from it
// check if the money is more than the minimum amount for transfer
// check if the receiver accounts exists using a select for update lock
// subtract the balance from the amount sent
// update the sender account balance 
// create a debit transaction
// add the amount sent to the balance of the receiver
// update the receivers account balance
// create a credit transaction

async function transfer({amount, senderID, receiverEmail}) {
    // A minimum balance of 10 naira should be kept
    // console.log(amount, senderID, receiverEmail)
    const minimumBalance = 10;
    
    // let client = await pool.connect();

    try {
       
        //  Maybe use a select for update in the future
        const senderAccount = await pool.query('SELECT current_balance, account_type, account_id FROM accounts WHERE account_holder=$1', [senderID]);
        
        const receiverResult = await pool.query('SELECT user_id FROM USERS WHERE email=$1', [receiverEmail]);
       
        const receiverID = receiverResult.rows[0].user_id;
        

        if (receiverID){
            const receiverAccount = await pool.query('SELECT current_balance, account_id FROM ACCOUNTS WHERE account_holder=$1', [receiverID]);
            
            if (receiverAccount.rowCount > 0){
                
                if (senderAccount.rows[0].account_type === 'BASIC'){
                    // limit single transfer to 20000
                    
                    const transferLimitForBasicAccountType = 20000;
    
                    if (amount > transferLimitForBasicAccountType){
                        
                        return {
                            success: false,
                            message: 'Transfer over the limit for single transfer'
                        }
                    }
    
                   const senderDisposableBalance = Number(senderAccount.rows[0].current_balance) - minimumBalance;
                   
                   let senderNewBalance  = senderDisposableBalance - amount;
                   
                   if ( senderNewBalance <= 0 ){
                       return {
                           success: false,
                           message: 'Insufficient fund'
                       }
                   }

                    senderNewBalance = senderNewBalance + minimumBalance;
                    // senderNewBalance  = (senderDisposableBalance + minimumBalance) - amount;
    
                   const receiverNewBalance =  amount + Number(receiverAccount.rows[0].current_balance);
                  
                   const metadata = {
                    sender: senderID,
                    receiver: receiverID,
                    receiverNewBalance,
                    senderNewBalance,
                    senderOldBalance: senderAccount.rows[0].current_balance,
                    receiverOldBalance: receiverAccount.rows[0].current_balance,
                    transferType: 'Internal'
                }
        
                   const client = await pool.connect();
    
                   try {
                       const creditResult = await creditAccount({amount, account_id: senderID, purpose: 'TRANSFER', client, receiverID, metadata});
    
                       const debitResult = await debitAccount({amount, account_id: senderID, purpose: 'TRANSFER', client, receiverID, metadata});
                        
                        if (!creditResult.success || !debitResult.success){
                            await client.query('ROLLBACK');
     
                            return {
                                success: false,
                                error: creditResult.error
                            }
                        }
    
                        await client.query('COMMIT');
    
                        return {
                            success: true,
                            message: 'Credit Successful and Debit Successful'
                        }
                        // TODO: There should be a way to alert the sender and receiver via email first then think about notification in the app
                    }catch (error) {
    
                       await client.query('ROLLBACK');
    
                       return {
                        success: false,
                        error,
                      };
    
                   }finally{
                       client.release();
                   }
                }else{
                    return {
                        success: false,
                        message: 'Account type does not exist'
                    }
                }
            }else{
                return {
                    success: false,
                    message: 'Account does not exist'
                }
            }
        }else{
            return{
                success: false,
                message: 'User does not exist'
            }
        }
    } catch (error) {
        return error
    }
}

// transfer({amount: 200, senderID: 1, receiverEmail: 'comfort@comfort.com'}).then(console.log).catch(console.log)

exports.transfer =  async function(req, res){
    // const {amount, senderID, email : receiverEmail} = req.body;
    
    const result =  await transfer({senderID: 1, ...req.body})
    if (result.success) {
        res.status(200).json({
            data: {
                status: 'success',
                message : 'Transfer completed'
            }
        })
    }else if (!result.success){
        if (result.message === 'Insufficient fund'){
            res.status(404).json({
                data: {
                    status: 'error',
                    error: 'Insufficient fund'
                }
            });
        }else if (result.message = 'Account does not exist'){
            res.status(404).json({
                data: {
                    status: 'error',
                    error: 'Account does not exist',
                }
            });
        }
    }
    else{
        res.status(500).json({
            data:{
                status: 'error',
                error: 'Something unexpected happened'
            }
        })
    }
}
