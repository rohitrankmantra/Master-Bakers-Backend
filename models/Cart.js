import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  uuid: {
    type: String,
    required: true,
    unique: true // ensures one cart per visitor
  },
  items: [
    {
      name: { type: String, required: true },      // Product name
      price: { type: Number, required: true },     // Product price
      quantity: { type: Number, required: true },  
       image: { type: String, required: true }  // Quantity in cart
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
