# AFA-BANK

This is an api for a lite mobile wallet, which is powered by paystack. This is an ongoing project so things  might change the next time you visit this page.

## How to use 
This is nodejs project powered by express, so knowledge of javascript is required. If node is not installed download here.

Then follow the step below

1. Go to the your terminal or command prompt

2. Type ```npm install ``` in your terminal or command prompt. 

Doing the above will download all the needed package for the project

For the API to work properly a user has to be created and authenticated before the following function can be carried out on the API

* Depositing funds in a wallet
* Transfer fund from a wallet to another

## How to create a user
You need to be a user to be able to use this API.

| Verb | User Routes  | Actions |
| ---- | ------------ | --------- |
| POST | /api/v1/signup| Create a user|
| POST | /api/v1/login| Authenticate a user|

##### Request Body

    { 
        "firstName": string, 
        "lastName": string,
        "userName": string, 
        "password": string, 
        "phoneNumber": string, 
        "email": string
    }

##### Response Body on Success (201)

    {
        status: 'success',
        data: { 
            message: 'User Created'
        }
    }

##### Response Body on Failure (404)
   {
       "status": "error",
        "error": "User already exists"
   }

##### Response Body on Failure (500)
   {
       "status": "error",
        "error": "Something unexpected happened"
   }

## How to Make a Deposit

This enables user to deposit funds into their wallet. This is done by the user inputting their card details. This is possible through the Paystack platform. This transaction is secured by Paystack.

| Verb | User Routes  | Actions |
| ---- | ------------ | --------- |
| POST | /api/v1/charge| Deposit funds into wallet|

##### Request Body

    {
	"card": {
          "number": "4084084084084081",
          "cvv": "408",
          "expiry_year": "2044",
          "expiry_month": "1"
        },
        "email": string,
        "amount": "20000"
    }

The ```email``` will be used to send a receipt of the transaction it is also ```required```

The ```amount``` is also required

The ```number``` in the ```card``` json will be used as the card number. The card number ```4084084084084081``` is a test card provide by Paystack 

The ```expiry_year``` and ```expiry_month``` can be anytime in the future.

##### Response Body on Failure (200)
    {
      status: 'success',
      data: {
        "success": true,
        "message": "Credit Successful"
      }
    }

##### Response Body on Failure (404)
    {
       "status": "error",
       "data": {
           "success": false",
           "error": "Account does not exist"
       }
    }

##### Response Body on Failure (500)
    {
       "status": "error",
       "data": {
           "success": false",
           "error": "Something unexpected happen"
       }
    }

## How to make transfer (internal)

| Verb | User Routes  | Actions |
| ---- | ------------ | --------- |
| POST | /api/v1/transfer| Transfer from an account to another account|

##### Request Body

{
    "amount": 20,
    "receiverEmail": "comfort@comfort.com"
}

##### Response Body on Failure (200)
    {
      status: 'success',
      data: {
        "success": true,
        "message": "Transfer completed"
      }
    }

##### Response Body on Failure (404)
    {
       "status": "error",
       "data": {
           "success": false",
           "error": "Account does not exist"
       }
    }

##### Response Body on Failure (404)
    {
       "status": "error",
       "data": {
           "success": false",
           "error": "Insufficient fund"
       }
    }

##### Response Body on Failure (500)
    {
       "status": "error",
       "data": {
           "success": false",
           "error": "Something unexpected happen"
       }
    }
