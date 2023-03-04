window.onload = cartCout();
function cartCout() {
  $.ajax({
    type: "get",
    url: "/count",
    data: {},
    dataType: "json",
    encode: true,
  }).done(function (data) {
    $("#CartLength").html(data.cart.length);
    $("#wishlist").html(data.wishlist.length);
  });
}

function wishlist(id) {
  $.ajax({
    type: "post",
    url: "/addToWishlist/"+id,
    data: {
      id,
    },
    dataType: "json",
    encode: true,
  }).done(function (data) {
     cartCout();
    if (data == "LOGIN FIRST") {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Login first!",
        footer: '<a class="text-decoration-none" href="/login">Go to login</a>',
      });
    } else if (data == "alreadyexit") {
      Swal.fire({
        icon: "warning",
        title: "Already added",
        footer:
          '<a class="text-decoration-none" href="/wishlist">check whishlist</a>',
      });
    } else if (data.key == "added") {
      Swal.fire({
        icon: "success",
        title: "Successfully added",
        text: "Good job!",
        footer:
          '<a class="text-decoration-none" href="/wishlist">GO TO Wishlist</a>',
      });
    }
  });
}