import "../styles/index.scss";

/**
 *
 * @param {Object} product
 * @param {Key} index
 * @returns Product Markup
 */

let products = {};
let productsMain = {};
let page = 1;
let limit;
let totalProducts;
var element = document.querySelector(".products-grid");
var cartElement = document.querySelector(".cart");

function isObjEmpty(obj) {
  return Object.keys(obj).length === 0;
}

/**
 *
 * @returns Products and total numbers of products.
 * Reason: Either we set the total value manually or get quantity of all products in one request.
 */
const mainProductsFetch = async () => {
  const data = (await fetch(`http://localhost:5000/products`)).json();
  const products = await data;
  totalProducts = products.length;
  return { products, totalProducts };
};
productsMain = await mainProductsFetch();

const fetchProducts = async (page = 1, limit = 6) => {
  // Fetch product data from the specified URL
  const data = (
    await fetch(`http://localhost:5000/products?_page=${page}&_limit=${limit}`)
  ).json();
  //const jsonData = await data.json();

  return data;
};

/**
 * Initialize first fetch to get first 6 products
 */
products = await fetchProducts();

const Products = async (page = 1, limit = 6) => {
  //console.log(page);
  var productsMain;
  if (page == 1) {
    productsMain = products;
  } else {
    productsMain = await fetchProducts(page, limit);
  }

  const jsonData = await productsMain;
  const arrayData = jsonData
    .map((data, index) => {
      return productMarkup(data, index);
    })
    .join("");

  element.innerHTML += arrayData;
};

Products();

/**
 *
 * @param {Array} product - Array object of each product
 * @param {Number} index - Array Key
 * @returns
 */
let productMarkup = (product) => {
  return `<div class="product id-${product.id}">
            <div class="product-item-details">
              <img class="product-thumbnail" src="${product.thumbnail}"/>
              <div class="product-item-info">
                <h2 class="product-title">${product.title}</h2>
                <p class="product-price">$${product.price}</p>
              </div>
            </div>
            <button class="add-to-cart" value="${product.id}">Add to cart</button>
          </div>`;
};

/**
 * Add event listener to add to cart button
 */
document.addEventListener("click", function (e) {
  const target = e.target.closest(".add-to-cart"); // Or any other selector.

  if (target) {
    const product = target.getAttribute("value");
    var pobject = product;
    addToCart(pobject);
  }
});

let cart = JSON.parse(localStorage.getItem("CART")) || [];
setTimeout(() => {
  updateCart();
});

/**
 * Add to cart logic
 * @param {Number} product_id
 */
const addToCart = (product_id) => {
  const id = parseInt(product_id);
  const item = productsMain.products.find((product) => product.id === id);

  if (cart.some((item) => item.id === id)) {
    updateQuantity("add", item.id);
  } else {
    cart.push({
      ...item,
      quantity: 1,
    });
  }

  console.table("Added to cart", cart);

  updateCart();
};
//console.log("products", products);

const updateCart = () => {
  renderCartItems();

  // Save cart to local storage
  localStorage.setItem("CART", JSON.stringify(cart));

  if (isObjEmpty(cart)) {
    cartElement.innerHTML = "No items added.";
  }
};

const renderCartItems = () => {
  cartElement.innerHTML = ""; // Clear cart element
  cart.forEach((item) => {
    cartElement.innerHTML += `
        <div class="cart-item">
          <div class="cart-item-details">
            <img src="${item.thumbnail}" />
            <div class="cart-item-info">
              <h5>${item.title}</h5>
              <p>$${item.price}</p>
              <p>${item.quantity}</p>
            </div>
            </div>
          <button class="remove-from-cart" value="${item.id}">Remove</button>
        </div>
      `;
  });
};

/**
 * Add event listener to remove from cart button
 */
document.addEventListener("click", function (e) {
  const target = e.target.closest(".remove-from-cart"); // Or any other selector.

  if (target) {
    const item = target.getAttribute("value");
    var pobject = item;
    //console.log(target.getAttribute("value"));
    removeItemFromCart(parseInt(pobject));
    //pobject = "";
  }
});

const updateQuantity = (action, id) => {
  cart = cart.map((item) => {
    let quantity = item.quantity;

    if (item.id === id) {
      if (action === "add") {
        quantity++;
      } else {
        quantity--;
      }
    }

    return { ...item, quantity };
  });

  updateCart();
};

// Remove Product from Cart
const removeItemFromCart = (id) => {
  cart = cart.filter((item) => item.id !== id);

  updateCart();
};

/**
 * Modal
 */
const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const openModalBtn = document.querySelector(".cart-open");
const closeModalBtn = document.querySelector(".cart-close");

// Close modal function
const closeModal = function () {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
};

// Close the modal when the close button and overlay is clicked
closeModalBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);

// Close modal when the Esc key is pressed
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) {
    closeModal();
  }
});

// Open modal function
const openModal = function () {
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
};

// Open modal event
openModalBtn.addEventListener("click", openModal);

// loadEdit();
setTimeout(() => {
  var loadMore = document.getElementById("loadMore");
  var emptySpace = document.getElementById("emptySpace");
  loadMore.style.display = "block";
  emptySpace.style.display = "none";

  let page = 2;
  limit = 6;
  loadMore.addEventListener("click", function () {
    totalProducts = totalProducts - limit;
    console.log(totalProducts);
    if (totalProducts === limit) {
      loadMore.style.display = "none";
      emptySpace.style.display = "block";
    }
    Products(page++);
  });
});
