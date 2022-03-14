describe('Login Ctrl', function(){
    it( 'it should log in', function(){
        // ! Check if there is an afterEach
        beforeEach(() => {
            cy.request('post', 'http://localhost:3000' , {
                firstName: 'Adeolu', 
                lastName: 'owokade', 
                userName: 'adeolu', 
                password:'adeolu', 
                phoneNumber: '0458903', 
                email: 'adeolu@adeolu.com'
            }).then(function(response){
                expect(response.body).to.have.property('status', 'success')
                expect(response.status).to.be.equal(201)
            })
          })

        cy.request('post', 'http://localhost:3000', {
            email: 'adeolu@adeolu.com',
            password: 'adeolu'
        }).then(function(response){
            expect(response.body).to.have.property('satus', 'success')
            expect(response.status).to.equal(200)
        })
    })

    it('it should log in', function(){
        beforeEach(function(){
            cy.request('post', 'http://localhost:3000', {
                firstName: 'Adeolu',
                lastName: 'owokade', 
                userName: 'adeolu', 
                password:'adeolu', 
                phoneNumber: '0458903', 
                email: 'adeolu@adeolu.com'
            }).then(function(response){
                expect(response.body).to.have.property('status', 'success')
                expect(response.status).to.be.equal(201)
            })
        })

        cy.request('post', 'http://localhost:3000', {
            email: 'adeolu@adeolu.com',
            password:'adeol'
        }).then(function(response){
            expect(response.body).to.have.not.property('status', 'success')
            expect(response.status).to.be.not.equal(200)
            expect(reponse.body).to.have.not.property('status', 'error')
            expect(response.status).to.be.equal(500)
        })
    })
});