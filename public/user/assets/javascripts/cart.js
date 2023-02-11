






// cat management ------------

function addToCart(productID) {
    $.ajax({
        url: '/addproducttocart/' + productID,
        method: 'get',
        success: (response) => {
            if (response == 'login first') {
                Swal.fire({
                    title: 'Error!',
                    text: 'Do you want to continue? Login First',
                    icon: 'error',
                    confirmButtonText: '<a href="/login">LOGIN</a>',
                    confirmButtonTextColor: '021a34',
                    confirmButtonColor: "#021a34",
                })
                // window.location.href='/signup'
            } else {
                if (response.status == true) {
                    if (response.newProductStatus == true) {
                        let count = $('#cart-count').html();
                        count = parseInt(count) + 1
                        $('#cart-count').html(count);
                        window.location.href = '/cart'
                    } else {
                        window.location.href = '/cart'
                    }
                }
            }
        }
    })
}

const changeQuantity = (CartID, productID, count) => {
    let quantity = document.getElementById(productID).innerHTML;
    quantity = parseInt(quantity)
    if (count == -1 && quantity <= 1) {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: '/changeproductquantitiy',
                    data: {
                        cartID: CartID,
                        productID: productID,
                        count: count,
                        quantity: quantity
                    },
                    method: 'post',
                    success: (response) => {
                        if (response == false) {
                            Swal.fire({
                                title: 'Done',
                                confirmButtonText: 'Ok',
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    location.reload()
                                }
                            })
                        }
                        else {
                            document.getElementById(productID).innerHTML = quantity + count;
                        }
                    }
                })
            }
        })
    } else {
        $.ajax({
            url: '/changeproductquantitiy',
            data: {
                cartID: CartID,
                productID: productID,
                count: count,
                quantity: quantity
            },
            method: 'post',
            success: (response) => {
                if (response == false) {
                    location.reload()
                } else if (response == null) {
                    Swal.fire({
                        title: 'Out Of Stock',
                        showConfirmButton: false,
                        timer: 900
                    })
                }
                else {
                    document.getElementById('total' + productID).innerHTML = response.grandTotal;
                    document.getElementById(productID).innerHTML = quantity + count;

                    document.getElementById("discount").innerHTML = response.discount;
                    document.getElementById("subTotal").innerHTML = response.subTotal;
                    document.getElementById("grandTotal").innerHTML = response.grandTotal;
                }
            }
        })
    }



}

const removeCartProductsBtn = (cartID, productID) => {
    const data = [cartID, productID];

    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/deletecartproducts/',
                data: {
                    cartID, productID
                },
                method: 'get',
                success: (response) => {
                    if (response == true) {
                        Swal.fire({
                            title: 'Done',
                            confirmButtonText: 'Ok',
                        }).then((result) => {
                            if (result.isConfirmed) {
                                location.reload()
                            }
                        })
                    }
                }
            })
        }
    })


}



// checkout management --------

const addressSelection = (addressIndex) => {
    const orderID = document.getElementById('orderid').innerHTML;
    $.ajax({
        url: '/selectaddressforordersdetails',
        data: {
            orderID,
            addressIndex
        },
        method: 'post',
        success: (response) => {
            $('#test').val(response.addressName + "  " + response.Address + "  " + response.PIN + "   " + response.Street + "  " + response.City + "  " + response.District)
        }
    })
}

const addNewAddress = async () => {
    const orderID = document.getElementById('orderid').innerHTML;
    Swal.fire({
        title: 'ADD NEW ADDRESS',
        html:
            '<input id="swal-input1" class="swal2-input" placeholder="NAME">' +
            '<input id="swal-input2" class="swal2-input" placeholder="ADDRESS">' +
            '<input id="swal-input3" class="swal2-input" placeholder="PIN">' +
            '<input id="swal-input4" class="swal2-input" placeholder="STREET">' +
            '<input id="swal-input5" class="swal2-input" placeholder="CITY">' +
            '<input id="swal-input6" class="swal2-input" placeholder="DISTRICT">',
        focusConfirm: false,
        preConfirm: () => {
            const newAddressObj = {
                addressName: document.getElementById('swal-input1').value,
                Address: document.getElementById('swal-input2').value,
                PIN: document.getElementById('swal-input3').value,
                Street: document.getElementById('swal-input4').value,
                City: document.getElementById('swal-input5').value,
                District: document.getElementById('swal-input6').value,
            }

            if (!newAddressObj.addressName || !newAddressObj.Address || !newAddressObj.PIN || !newAddressObj.Street || !newAddressObj.City || !newAddressObj.District) {
                Swal.showValidationMessage(`Please Fill the Form`)
            } else {
                $.ajax({
                    url: '/addnewaddressfromcheckout',
                    data: {
                        newAddressObj, orderID
                    },
                    method: 'post',
                    success: (response) => {
                        // document.getElementById('addressBody').style.display = 'none'
                        $('#test').val(response.addressName + "  " + response.Address + "  " + response.PIN + "   " + response.Street + "  " + response.City + "  " + response.District)
                        Swal.fire({
                            icon: 'success!',
                            title: 'address saved',
                            showConfirmButton: false,
                            timer: 900
                        })
                    }
                })
            }
        }
    })

}

$('#chckout_Form').submit((e) => {
    const orderID = document.getElementById('orderid').innerHTML;
    let data = $('#chckout_Form').serialize()
    if (!data) { Swal.fire('Select Payment Method') }
    else {
        $.ajax({
            url: '/checkout',
            data: {
                data,
                orderID
            },
            method: 'post',
            success: (response) => {
                if (response == false) {
                    Swal.fire('Select address')
                } else {
                    window.location.replace('/faliedorder')
                }
            }
        })
    }
    e.preventDefault();
})



// coupon management

const applayCoupon = (userID) => {
    const orderID = document.getElementById('orderid').innerHTML;
    Swal.fire({
        title: 'Apply Coupon',
        html:
            '<input id="swal-input2" class="swal2-input"  placeholder="Code">',
        focusConfirm: false,
        preConfirm: () => {
            const couponCode = document.getElementById('swal-input2').value;
            if (!couponCode) {
                Swal.showValidationMessage(`Please Fill the Form`)
            } else {
                $.ajax({
                    url: '/usercouponapply',
                    data: { couponCode, orderID },
                    method: 'post',
                    success: (status) => {
                        if (status == false) {
                            Swal.fire({
                                icon: 'error',
                                text: 'Enter Valid Coupon Code!',
                            })
                        } else if (status == null) {
                            Swal.fire({
                                icon: 'error',
                                text: 'Minimum Purchase amount is 6000!',
                            })
                        }
                        else {
                            let grandTotal = document.getElementById('grandTotal').innerHTML;
                            let subTotal = document.getElementById('subtotal').innerHTML;
                            let discount = document.getElementById('discount').innerHTML;
                            grandTotal -= status.status // status is coupon discount price
                            couponDiscount = subTotal - grandTotal;
                            document.getElementById('grandTotal').innerHTML = grandTotal;
                            document.getElementById('discount').innerHTML = couponDiscount;
                            document.getElementById('cpnaplybtn').style.display = 'none'
                            $('#couponStatusDiv').html(` <div id="couponApplied"><small>you will save<strong> ₹ ' ${status.status} '</strong> through this purchase by using the coupon!</small> </div><button onclick="removeCoupon(${status.code})">Remove</button>`)
                        }
                    }
                })

            }
        }
    })

}

const removeCoupon = (couponCode) => {
    const data = couponCode.split(',');
    orderID = data[1];
    couponCode = data[0];
    $.ajax({
        url: '/removecopon',
        data: {
            couponCode: couponCode,
            orderID: orderID
        },
        method: 'post',
        success: (response) => {
            window.location.reload();
        }
    })
}


// wishlist AJAX -------

const addToWishList = (productID) => {
    $.ajax({
        url: '/addtowishlist/' + productID,
        method: 'get',
        success: (response) => {
            if (response == 'login first') {
                Swal.fire({
                    title: 'Error!',
                    text: 'Do you want to continue? Login First',
                    icon: 'error',
                    confirmButtonText: '<a href="/login">LOGIN</a>',
                    confirmButtonTextColor: '021a34',
                    confirmButtonColor: "#021a34",
                })
            } else {
                if (response == true) {
                    let count = $('#wish-list-count').html();
                    count++;
                    $('#wish-list-count').html(count);
                    window.location.href = '/wishlist'
                } else {
                    window.location.href = '/wishlist'
                }
            }
        }
    })
}

const removeFromWishLIst = (productID) => {
    $.ajax({
        url: '/removewishlistproduct/' + productID,
        method: 'get',
        success: (response) => {
            if (response == 'login first') {
                Swal.fire({
                    title: 'Error!',
                    text: 'Do you want to continue? Login First',
                    icon: 'error',
                    confirmButtonText: '<a href="/login">LOGIN</a>',
                    confirmButtonTextColor: '021a34',
                    confirmButtonColor: "#021a34",
                })
            } else {
                window.location.reload();
            }
        }
    })
}

const cancelOrder = (orderID) => {

    $.ajax({
        url: '/cancelOrder',
        method: 'post',
        data: {
            orderID
        },
        success: (response) => {
            location.reload();
        }
    })

    // Swal.fire({
    //     title: 'Are you sure?',
    //     text: "This order will be cancelled?",
    //     icon: 'warning',
    //     showCancelButton: true,
    //     confirmButtonColor: '#3085d6',
    //     cancelButtonColor: '#d33',
    //     confirmButtonText: 'Proceed'
    // }).then((result) => {
    //     if (result.isConfirmed) {

    //         // Swal.fire(
    //         //     'cancelled!',
    //         //     'Your order has been cancelled.',
    //         //     'success'
    //         // )
    //     }
    // })
}





// Online payment AJAX

let amount = Number($('#grandTotal').html())
amount = amount * 0.0122
amount = Math.round(amount).toFixed(2)
paypal.Buttons({

    style: {
        color: 'blue',

    },

    // Sets up the transaction when a payment button is clicked
    createOrder: (data, actions) => {
        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: amount // Can also reference a variable or function
                }
            }]
        });
    },
    // Finalize the transaction after payer approval
    onApprove: (Data, actions) => {
        return actions.order.capture().then(function (orderData) {
            // Successful capture! For dev/demo purposes:
            console.log('Capture result', orderData, JSON.stringify(orderData, null, 2));
            const transaction = orderData.purchase_units[0].payments.captures[0];
            if (transaction.status == 'COMPLETED') {
                transactionID = transaction.id
                let orderID = $('#orderid').html()
                $.ajax({
                    url: '/checkoutwithpaypal',
                    method: 'post',
                    data: {
                        orderID: orderID,
                        transactionID: transactionID
                    },
                    success: (response) => {
                        if (response == false) {
                            window.location.replace('/faliedorder')
                        } else {
                            window.location.replace('/successorder')
                        }
                    }
                })

            } else {
                alert('Payment Faild Try again')
            }
        });
    }
}).render('#paypal-button-container');




