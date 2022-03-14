/**
 * Test cards can be found here: https://paystack.com/docs/payments/test-payments
 * Only PIN and OTP validation are implemented.
 * You can also use the card that requires no validation
 */

 const axios = require('axios').default;
 const { creditAccount } = require('../utils/transactions');
 const pool = require('../models/db');
 require('dotenv').config();
 

 
//  const PAYSTACK_CHARGE_URL = 'https://api.paystack.co/charge';
 

 // This determines if the charge was successful
 function processInitialCardCharge(chargeResult) {
   if (chargeResult.data.status === 'success') {
     return {
       success: true,
       message: chargeResult.data.status,
       data: {
         shouldCreditAccount: true,
         reference: chargeResult.data.reference,
       },
     };
   }
 
   return {
     success: false,
     message: chargeResult.data.status,
     data: {
       shouldCreditAccount: false,
       reference: chargeResult.data.reference,
     },
   };
 }

// This is the the function to charge the card
 async function chargeCard({
    accountId, pan, expiry_month, expiry_year, cvv, email, amount,
  }) {
    try {
      // console.log(accountId, pan, expiry_month, expiry_year, cvv, email, amount);
      const charge = await axios.post(process.env.PAYSTACK_CHARGE_URL, {
        card: {
          number: pan,
          cvv,
          expiry_year,
          expiry_month,
        },
        email,
        amount,
      }, {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      });
      
      const nextAction = processInitialCardCharge(charge.data);

      let message = nextAction.success ? nextAction.message : nextAction.error;
      
      const values = [nextAction.data.reference, accountId, (Number(amount) / 100), message];
      // console.log(values)

      await pool.query(`INSERT INTO CARD_TRANSACTIONS(external_reference, account_id, amount, last_response)
      VALUES($1, $2, $3, $4)`, values);
      
      

      if (!nextAction.success) {
        return {
          success: nextAction.success,
          error: nextAction.error,
        };
      }

      const client = await pool.connect();
    
      try {
    
        if (nextAction.data.shouldCreditAccount) {
          const creditResult = await creditAccount({
            amount,
            account_id: accountId,
            purpose: 'DEPOSIT',
            metadata: {
              external_reference: nextAction.data.reference,
            },
            client
          });

         

          if (!creditResult.success) {

            await client.query('ROLLBACK');

            return {
              success: false,
              error: creditResult.error,
            };
          }

          await client.query('COMMIT');

          return {
            success: true,
            message: 'Charge successful',
          };
        }
        return nextAction;
      } catch (error) {

        await client.query('ROLLBACK');

        return {
          success: false,
          error,
        };
      } finally {
        client.release();
       }
    } catch (error) {
      if (error.response) {
        // response from axios
        return error;
      }
      return error;
      // return 'something happened'
    } 
  }

exports.charge = async (req, res) => {
  // const {pan, expiry_month, expiry_year, cvv, email, amount}  = req.body;
  let result = await chargeCard({accountId: 1, ...req.body});
  // console.log(req.body, 'request body');

  if (result.success){
    res.status(200).json({
      status: 'success',
      data: result
    });
  }else if (result.success === false){
    res.status(404).json({
      status: 'error',
      data: result
    });
  }else if (result.response){
    // when there a response from axios

    // ! Using the an interger instead of a string in the pan field will return
    /**
     * "data": {
        "stack": "TypeError: req.body.card.number.replace is not a function\n    at Object.index (/usr/local/paystack-api/api/controllers/ChargeController.js:78:54)\n    at wrapper (/usr/local/paystack-api/node_modules/@sailshq/lodash/lib/index.js:3282:19)\n    at routeTargetFnWrapper (/usr/local/paystack-api/node_modules/sails/lib/router/bind.js:181:5)\n    at callbacks (/usr/local/paystack-api/node_modules/@sailshq/express/lib/router/index.js:164:37)\n    at param (/usr/local/paystack-api/node_modules/@sailshq/express/lib/router/index.js:138:11)\n    at pass (/usr/local/paystack-api/node_modules/@sailshq/express/lib/router/index.js:145:5)\n    at nextRoute (/usr/local/paystack-api/node_modules/@sailshq/express/lib/router/index.js:100:7)\n    at callbacks (/usr/local/paystack-api/node_modules/@sailshq/express/lib/router/index.js:167:11)\n    at module.exports (/usr/local/paystack-api/api/policies/triggersFraudAlert.js:13:20)\n    at routeTargetFnWrapper (/usr/local/paystack-api/node_modules/sails/lib/router/bind.js:181:5)\n    at callbacks (/usr/local/paystack-api/node_modules/@sailshq/express/lib/router/index.js:164:37)\n    at param (/usr/local/paystack-api/node_modules/@sailshq/express/lib/router/index.js:138:11)\n    at pass (/usr/local/paystack-api/node_modules/@sailshq/express/lib/router/index.js:145:5)\n    at nextRoute (/usr/local/paystack-api/node_modules/@sailshq/express/lib/router/index.js:100:7)\n    at callbacks (/usr/local/paystack-api/node_modules/@sailshq/express/lib/router/index.js:167:11)\n    at module.exports (/usr/local/paystack-api/api/policies/isTransactionAuthorizationChargeable.js:14:20)\n    at routeTargetFnWrapper (/usr/local/paystack-api/node_modules/sails/lib/router/bind.js:181:5)\n    at callbacks (/usr/local/paystack-api/node_modules/@sailshq/express/lib/router/index.js:164:37)\n    at param (/usr/local/paystack-api/node_modules/@sailshq/express/lib/router/index.js:138:11)\n    at pass (/usr/local/paystack-api/node_modules/@sailshq/express/lib/router/index.js:145:5)\n    at nextRoute (/usr/local/paystack-api/node_modules/@sailshq/express/lib/router/index.js:100:7)\n    at callbacks (/usr/local/paystack-api/node_modules/@sailshq/express/lib/router/index.js:167:11)\n    at module.exports (/usr/local/paystack-api/api/policies/canManageCharges.js:33:16)\n    at <anonymous>",
        "message": "req.body.card.number.replace is not a function"
    }
     */
    // ? Using a string that is an alphabet will return
    /** 
     * "data": {
        "status": false,
        "message": "Charge attempted",
        "data": {
            "reference": "l6zzn0p1dehgxaw",
            "status": "failed",
            "message": "Transaction declined. Please use the test card."
        }
    }
    */
    res.status(404).json({
      data: result.response.data
    });
  }else{
    res.status(500).json({
      data: result
    });
  }
}

  // chargeCard({
  //   accountId: 1, pan: 4084084084084081 , expiry_month: '2', expiry_year: '2034', cvv: '408', email: 'akpuwarrior@gmail.com', amount: '30000'
  // }).then(res => console.log(res)).catch(err => console.log(err))


  