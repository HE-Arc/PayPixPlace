
$.getScript('https://checkout.stripe.com/checkout.js', function()
{
    for (let i in purchaseOptions)
    {
        purchaseOptions[i].handler = StripeCheckout.configure({
            key: 'pk_test_TYooMQauvdEDq54NiTphI7jx',
            image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
            locale: 'auto',
            token: function(token) {
              // You can access the token ID with `token.id`.
              // Get the token ID to your server-side code for use.
              $.ajax({
                type: "POST",
                url: "/pix/purchase/" + purchaseOptions[i].name,
                data: { csrfmiddlewaretoken: window.CSRF_TOKEN, stripeToken: token.id },
                dataType: "json",
                success: function (data) {
                    // TODO notify the user that the payment was ok
                }
            });
            }
          });
    }
      
      purchaseOptions.forEach(purchaseOption=>
      {
          document.getElementById(purchaseOption.name).addEventListener('click', function(e) {
              // Open Checkout with further options:
              purchaseOption.handler.open({
                name: 'Paypixplace',
                description: 'PIX',
                zipCode: true,
                billingAddress: false,
                amount: purchaseOption.amount,
                currency: "CHF",
                locale: true,
              });
              e.preventDefault();
            });
            
            // Close Checkout on page navigation:
            window.addEventListener('popstate', function() {
                purchaseOption.handler.close();
            });
      });
});
