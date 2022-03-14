// Look for library to automate name e.g faker.js, chance.js


describe( 'Sign Up', function(){
    let email = 'adeolu@adeolu'
    it( 'Should sign up', function(){
        const requestBody = {
            firstName: 'Adeolu', 
            lastName: 'owokade', 
            userName: 'adeolu', 
            password:'adeolu', 
            phoneNumber: '0458903', 
            email
        }

        cy.request( 'post', 'https://127.0.0.1:3000', requestBody)
        .then(function(response){
            expect(response.body).to.have.property('status', 'success')
            expect(response.status).to.be.equal(201)
        })
    })
    this.afterEach( function(){
        // deletes the entry in the database using email
    })

    it( 'Should not sign up', function(){
        //Omiting the first name shoulb creat a database error, because firstName has a not null constraint
        const requestBody = { 
            lastName: 'owokade', 
            userName: 'adeolu', 
            password:'adeolu', 
            phoneNumber: '0458903', 
            email
        }

        cy.request( 'post', 'https://127.0.0.1:3000', requestBody)
        .then(function(response){
            expect(response.body).to.have.property('status', 'error')
            expect(response.status).to.be.equal(500)
        })

        this.afterEach(function(){
            // 
        })
    })
})