
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
                    url: "/pix/purchase/" + purchaseOptions[i].id + "/",
                    data: { csrfmiddlewaretoken: window.CSRF_TOKEN, stripeToken: token.id },
                    dataType: "json",
                    success: function (data) {
                        // do your redirect
                        location.href="/"
                }
            });
            }
        });
    }
      
    purchaseOptions.forEach(purchaseOption=>
    {
        document.getElementById(purchaseOption.id).addEventListener('click', function(e) {
            // Open Checkout with further options:
            purchaseOption.handler.open({
                name: 'Pay Pix Place',
                description: purchaseOption.number + ' PIX + ' + purchaseOption.bonus + ' PIX bonus !',
                zipCode: true,
                image: '/static/paypixplaceapp/images/currencyPPPStripe.png',
                billingAddress: false,
                amount: purchaseOption.price,
                currency: "CHF",
                locale: "auto",
            });
            e.preventDefault();
        });
        
        // Close Checkout on page navigation:
        window.addEventListener('popstate', function() {
            purchaseOption.handler.close();
        });
    });
});
