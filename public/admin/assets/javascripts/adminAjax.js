// category AJAX -------
const removeCategory = (ID) => {

    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {

            confirmButton: 'btn btn-danger',
            cancelButton: 'btn btn-success'
        },
        buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
        title: 'Are you sure?',
        text: "The category will be deleted!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/admin/deletecategory/' + ID,
                method: 'get',
                success: (response) => {
                    if (response == true) {
                        window.location.reload();
                    }
                }
            })
        } else if (
            /* Read more about handling dismissals below */
            result.dismiss === Swal.DismissReason.cancel
        ) {
            swalWithBootstrapButtons.fire(
                'Cancelled',
                'Your imaginary file is safe :)',
                'error'
            )
        }
    })

    //
}

const addCategory = () => {
    Swal.fire({
        title: 'New Category',
        html:
            '<input id="swal-input1" class="swal2-input">',
        focusConfirm: false,
        preConfirm: () => {
            const category = document.getElementById('swal-input1').value
            if (!category) {
                Swal.showValidationMessage(`Please Fill the Form`)
            } else {

                $.ajax({
                    url: '/admin/addcategory',
                    data: {
                        category
                    },
                    method: 'post',
                    success: (response) => {
                        if (response == false) {
                            Swal.fire({
                                title: 'Category Already Exist',
                                showConfirmButton: false,
                                timer: 900
                            })
                        }
                        else {
                            window.location.reload();
                        }
                    }
                })
            }
        }
    })

}

const addSubCategory = (categoryName) => {

    Swal.fire({
        title: 'New Category',
        html:
            '<input id="swal-input1" class="swal2-input" placeholder="...">',
        focusConfirm: false,
        preConfirm: () => {
            const subcategoryname = document.getElementById('swal-input1').value
            if (!subcategoryname) {
                Swal.showValidationMessage(`Please Fill the Form`)
            } else {
                $.ajax({
                    url: '/admin/addsubcategories',
                    data: {
                        categoryName,
                        subcategoryname
                    },
                    method: 'post',
                    success: (response) => {
                        if (response == true) {
                            window.location.reload();
                        } else {

                        }

                    }
                })
            }
        }
    })


}


// Products AJAX-------------
const removeProducts = (productId) => {
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-success',
            cancelButton: 'btn btn-danger'
        },
        buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
        title: 'Are you sure?',
        text: "The Product is going to delete",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/admin/remove/' + productId,
                method: 'get',
                success: (response) => {
                    if (response) {
                        location.reload()
                    }
                }
            })








            // swalWithBootstrapButtons.fire(
            //     'Deleted!',
            //     'Your file has been deleted.',
            //     'success'
            // )
        } else if (
            result.dismiss === Swal.DismissReason.cancel
        ) {
            swalWithBootstrapButtons.fire(
                'Cancelled',
                'Your imaginary file is safe :)',
                'error'
            )
        }
    })
}


// Coupon AJAX -----------
const addCoupon = () => {
    Swal.fire({
        title: 'New Coupon',
        html:
            '<input id="swal-input1" class="swal2-input"  placeholder="name">' +
            '<input id="swal-input2" class="swal2-input"  placeholder="Code">' +
            '<input id="swal-input3" class="swal2-input" type="number"  placeholder="Discount" required>' +
            '<input id="swal-input4" class="swal2-input"  type= "date" placeholder="choose date------">',
        focusConfirm: false,
        preConfirm: () => {
            const couponName = document.getElementById('swal-input1').value;
            const couponCode = document.getElementById('swal-input2').value;
            const couponDiscount = document.getElementById('swal-input3').value;
            const couponDate = document.getElementById('swal-input4').value;

            if (!couponCode || !couponName || !couponDiscount || !couponDate) {
                Swal.showValidationMessage(`Please Fill the Form`)
            } else {
                $.ajax({
                    url: '/admin/addnewcoupon',
                    data: {
                        couponName,
                        couponCode,
                        couponDiscount,
                        couponDate,
                    },
                    method: 'post',
                    success: (response) => {
                        Window.location.reload();
                    }
                })

            }
        }
    })


}


// banner AJAX ----------
const addTag = (productID) => {
    Swal.fire({
        title: 'Add Tags',
        html:
            '<input id="swal-input1" class="swal2-input" placeholder="...">',
        focusConfirm: false,
        preConfirm: () => {
            const tag = document.getElementById('swal-input1').value
            if (!tag) {
                Swal.showValidationMessage(`Please Fill the Form`)
            } else {
                $.ajax({
                    url: '/admin/addproducttag',
                    data: {
                        tag: tag,
                        productID: productID
                    },
                    method: 'post',
                    success: (response) => {
                        Swal.fire({
                            title: 'Done',
                            allowOutsideClick: false,
                            confirmButtonText: 'Ok',
                        })

                    }
                })
            }
        }
    })
}

const removeBanner = (ID) => {
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {

            confirmButton: 'btn btn-danger',
            cancelButton: 'btn btn-success'
        },
        buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
        title: 'Are you sure?',
        text: "The category will be deleted!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/admin/removebannerproducts/' + ID,
                method: 'get',
                success: (response) => {
                    if (response == true) {
                        Swal.fire({
                            title: 'Done',
                            allowOutsideClick: false,
                            confirmButtonText: 'Ok',
                        }).then((result) => {
                            if (result.isConfirmed) {
                                location.reload()
                            }
                        })
                    }
                }
            })
        } else if (
            /* Read more about handling dismissals below */
            result.dismiss === Swal.DismissReason.cancel
        ) {
            swalWithBootstrapButtons.fire(
                'Cancelled',
                'Your imaginary file is safe :)',
                'error'
            )
        }
    })

    //
}


const printReport = (printSalesReport) => {
    window.print()
}




const pending = $('#pending').html()
const deliveried = $('#deliveried').html()
const cancelled = $('#cancelled').html();

const sale = $('#sales').html();
const Todaysale = $('#todaySales').html();

 
 



var ctx5 = $("#pie-chart").get(0).getContext("2d");
var myChart5 = new Chart(ctx5, {
    type: "pie",
    data: {
        labels: ["Deliveried", "Pending", "Cancelled"],
        datasets: [{
            backgroundColor: [
                "rgba(0, 255, 0,.4)",
                "rgba(255,255,0,.4)",
                "rgba(255,0,0 , .4)",
            ],
            data: [deliveried, pending, cancelled]
        }]
    },
    options: {
        responsive: true
    }
});




var ctx6 = $("#doughnut-chart").get(0).getContext("2d");
var myChart6 = new Chart(ctx6, {
    type: "doughnut",
    data: {
        labels: ['Total Sales','Today sales'],
        datasets: [{
            backgroundColor: [
                "rgba(0, 255, 0,.4)",
                "rgba(0, 0, 255,.4)",

            ],
            data: [sale,Todaysale]
        }]
    },
    options: {
        responsive: true
    }
});


 // data  table
