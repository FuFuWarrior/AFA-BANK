const { v4 } = require('uuid');
const pool = require('../models/db');

//! f30bac66-ea2c-4a36-9564-8a452f4be624 (sample UUID)

async function creditAccount({ amount, account_id, purpose, metadata, client, reference = v4() }) {
  
  await client.query('BEGIN');
  
  if ( purpose === 'DEPOSIT' ) {

    const account = await client.query('SELECT account_id , current_balance FROM ACCOUNTS WHERE account_id=$1', [account_id]);

    if (account.rowCount === 0){
      return {
        success: false,
        error: 'Account does not exist',
      };
    }

    // INCREMENT THE AMOUNT FIELD IN THE DATABASE USING SQL
    // const amount = Number(amount) / 100;
    const newBalance = Number(account.rows[0].current_balance) + Number(amount) / 100;
    
    await client.query('LOCK TABLE transactions in ROW EXCLUSIVE MODE');

    const query = `INSERT INTO TRANSACTIONS(transaction_type, transaction_purpose, amount,
      account_holder, reference, balance_before, balance_after, metadata) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`

    const balanceBefore = Number(account.rows[0].current_balance);

    const values = ['CREDIT', purpose, (Number(amount) / 100), account_id, reference, balanceBefore, newBalance, metadata];

    await client.query(query, values);

    await client.query(`UPDATE ACCOUNTS SET current_balance=$1 WHERE account_id=$2`, [newBalance, account_id]);

    return {
      success: true,
      message: 'Credit Successful'
    }

  }else if (purpose === 'TRANSFER'){

    const account = await client.query('SELECT account_id , current_balance FROM ACCOUNTS WHERE account_id=$1', [account_id]);

    if (account.rowCount === 0){
      return {
        success: false,
        error: 'Account does not exist',
      };
    }
    
    const creditQuery = `INSERT INTO TRANSACTIONS(transaction_type, transaction_purpose, amount, 
      account_holder, reference, balance_before, balance_after, metadata) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`

    // const debitQuery = `INSERT INTO TRANSACTIONS(transaction_type, transaction_purpose, amount, 
    //       account_id, reference, balance_before, balance_after, metadata) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`
  
    // const debitValues = ['DEBIT', purpose, amount, account_id, reference, Number(metadata.senderOldBalance), metadata.senderNewBalance, metadata];
    
    const creditValues = ['CREDIT', purpose, amount, account_id, reference, Number(metadata.receiverOldBalance), metadata.receiverNewBalance, metadata];
    
    await client.query('LOCK TABLE transactions in ROW EXCLUSIVE MODE');
    
    await client.query(creditQuery, creditValues);

    // await client.query(debitQuery, debitValues);

    // await client.query('UPDATE ACCOUNT SET current_balance=$1, WHERE account_id=$1', [senderNewBalance, senderID]);

    await client.query('UPDATE ACCOUNTS SET current_balance=$1 WHERE account_holder=$2', [Number(metadata.receiverNewBalance), metadata.receiver]);

    await client.query('COMMIT');

    return{
        success: true,
        message: 'successful'
    }

  }else if ( purpose === 'REVERSAL' ){
    return
  }
   
}

async function debitAccount({amount, account_id, purpose, metadata, client, reference = v4()}) {

  await client.query('BEGIN')
  if ( purpose === 'DEPOSIT'){
    
    const account = await client.query('SELECT account_id , current_balance FROM ACCOUNTS WHERE account_id=$1', [account_id]);

    if (account.rowCount === 0){
      return {
        success: false,
        error: 'Account does not exist',
      };
    }
  
    // INCREMENT THE AMOUNT FIELD IN THE DATABASE USING SQL
    const balanceBefore = Number(account.rows[0].current_balance);
  
    const newBalance = balanceBefore - Number(amount) / 100;

    await client.query('LOCK TABLE transactions in ROW EXCLUSIVE MODE');
    
    let query = `INSERT INTO TRANSACTIONS(transaction_type, transaction_purpose, amount, 
      account_holder, reference, balance_before, balance_after, metadata) VALUES($1, $2, $3, $4, $5, $6, $7, $8)`;
  
    const values = ['DEBIT', purpose, Number(amount) / 100, account_id, reference, balanceBefore, newBalance, metadata]; 
  
    await client.query(query, values);

    await client.query(`UPDATE ACCOUNTS SET current_balance=$1 WHERE account_id=$2`, [newBalance, account_id]);

    await client.query('COMMIT');
  
    return {
      success: true,
      message: 'Debit Successful'
    }

  }else if( purpose === 'TRANSFER'){

    const account = await client.query('SELECT account_id , current_balance FROM ACCOUNTS WHERE account_id=$1', [account_id]);

    if (account.rowCount === 0){
      return {
        success: false,
        error: 'Account does not exist',
      };
    }
  
    const debitQuery = `INSERT INTO TRANSACTIONS(transaction_type, transaction_purpose, amount, 
          account_holder, reference, balance_before, balance_after, metadata) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`
  
    const debitValues = ['DEBIT', purpose, amount, account_id, reference, Number(metadata.senderOldBalance), Number(metadata.senderNewBalance), metadata];
  
    await client.query('LOCK TABLE transactions in ROW EXCLUSIVE MODE');

    await client.query(debitQuery, debitValues);

    await client.query('UPDATE ACCOUNTS SET current_balance=$1 WHERE account_id=$2', [Number(metadata.senderNewBalance), account_id]);

    await client.query('COMMIT');

    return {
      success: true,
      message: 'Debit Successful'
    }
  }
 
}

module.exports = {creditAccount, debitAccount};