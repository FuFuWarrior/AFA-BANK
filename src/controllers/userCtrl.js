const bcrypt = require('bcryptjs');
const pool = require('../models/db');
// John's password is cytro

class UserCtrl{
    
    /**
     * @static
     * @params {Object} req
     * @params {Object} res
     * @returns Appropriate JSON Response with Status and Data
     * @memberof UserCtrl
     */

    static async signUp(req, res) {
        try{

            // Destructure the json property from the response
            const{ firstName, lastName, userName, password, phoneNumber, email} = req.body;             
        
            // check if the user already exist using in the email
            const resultBack = await pool.query('SELECT EMAIL FROM USERS WHERE EMAIL=$1 ;', [email]);

            if (resultBack.rowCount > 0){
                return res.status(404).json({
                     status: 'error',
                     message: 'User already exists'
                 });
            }

            // Generate the salt
            let salt = await bcrypt.genSalt(10);
           
            // Generate the hast with the salt
            const hash = await bcrypt.hash(password, salt);

            if (hash){
                if ( resultBack.rowCount === 0){
        
                    const userQuery =  `INSERT INTO USERS(first_name, last_name, user_name, password, phone_number, email) VALUES($1, $2, $3, $4, $5, $6) RETURNING user_id`;
                    
                    const accountQuery = `INSERT INTO ACCOUNTS(account_holder, account_type, current_balance) VALUES($1, $2, $3)`;

                    const values = [firstName, lastName, userName, hash, phoneNumber, email];

                    const userResult = await pool.query(userQuery, values);                                   
                    // console.log(userResult.rows[0].user_id);
                    console.log(userResult);
                    
                    const userId = userResult.rows[0].user_id;
                    if (userResult.rowCount > 0 ){
                        
                        await pool.query(accountQuery, [userId, 'BASIC', 0]);

                        res.status(201).json({
                            status: 'success',
                            data: { 
                                message: 'User Created'
                            }
                        });                      
                    }
                }
            }else{
                res.status(500).json({
                    status: 'error',
                    error,
                    message: 'Something Went Wrong'
                });
            }
        }catch(error){
            res.status(500).json({
                status: 'error',
                error,
                message: 'Something Unexpected Happened'
            });
        }
    }

    static async logIn(req,res){
        try {
            const {email, password} = req.body;
        
            // Check if email exists in the DB
            let result = await pool.query(`SELECT user_id, email, password, user_name FROM users WHERE email=$1`, [email]);

            const dbPasswordHash = result.rows[0].password;

            const compare = await bcrypt.compare(password, dbPasswordHash);

            if (result.rowCount > 0) {
                if (compare) {
                    return res.status(200).json({
                        status: 'success',
                        data: {
                            message: 'You have successfully logged in'
                        }
                    })
                }
            }

            return res.status.json({
                status: 'error',
                message: 'User Not Found'
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Something Unexpected Happened'
            })
        }
    }
}

module.exports = UserCtrl;