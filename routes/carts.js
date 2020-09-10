const express = require('express');
const cartsRepo = require('../repositories/carts');
const productsRepo = require('../repositories/products');
const cartShowTemplate = require('../views/carts/show');

const router = express.Router();

// Receive a post req to add item to the cart
router.post('/cart/products', async (req, res) => {
  // Figure if that cookie session has a cart or not
  let cart;
  if (!req.session.cartId) {
    // Cart not found, so create one and store id sess to req.session.cartId
    cart = await cartsRepo.create({ items: [] });

    req.session.cartId = cart.id;
  } else {
    // Cart found, search in repository
    cart = await cartsRepo.getOne(req.session.cartId);
  }
  // Add new product or increment quantity for an existing product to items arr
  const existingItem = cart.items.find(
    (item) => item.id === req.body.productId
  );
  if (existingItem) {
    // increment
    existingItem.quantity++;
  } else {
    // add new product
    cart.items.push({ id: req.body.productId, quantity: 1 });
  }
  await cartsRepo.update(cart.id, {
    items: cart.items,
  });

  res.redirect('/cart');
});

// Receive GET request to show all items in cart
router.get('/cart', async (req, res) => {
  if (!req.session.cartId) {
    return res.redirect('/');
  }

  const cart = await cartsRepo.getOne(req.session.cartId);

  for (let item of cart.items) {
    const product = await productsRepo.getOne(item.id);

    item.product = product;
  }

  res.send(cartShowTemplate({ items: cart.items }));
});

// Receive a post req to delete an item from cart
router.post('/cart/products/delete', async (req, res) => {
  const { itemId } = req.body;
  const cart = await cartsRepo.getOne(req.session.cartId);

  const items = cart.items.filter((item) => item.id !== itemId);

  await cartsRepo.update(req.session.cartId, { items: items });

  res.redirect('/cart');
});

module.exports = router;
