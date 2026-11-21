
import { FIRESTORE_URL } from "./firebase-config.js";

// 1. ADD PRODUCT TO CART
export async function addToCart(cartItem) {

    const response = await fetch(
        `${FIRESTORE_URL}/cart`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fields: {
                    userId: {
                        stringValue: cartItem.userId
                    },
                    productId: {
                        stringValue: cartItem.productId
                    },
                    productName: {
                        stringValue: cartItem.productName
                    },
                    price: {
                        doubleValue: Number(cartItem.price)
                    },
                    quantity: {
                        integerValue: String(cartItem.quantity)
                    }
                }
            })
        }
    );

    if (!response.ok) {
        throw new Error("Failed to add item to cart");
    }

    return await response.json();
}


// 2. VIEW CART ITEMS
export async function getCart(userId) {

    const response = await fetch(
        `${FIRESTORE_URL}/cart`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch cart");
    }

    const data = await response.json();

    const cartItems = data.documents || [];

    // Return only the selected user's cart items
    return cartItems.filter(item =>
        item.fields.userId.stringValue === userId
    );
}


// 3. UPDATE CART QUANTITY
export async function updateCart(cartId, quantity) {

    const response = await fetch(
        `${FIRESTORE_URL}/cart/${cartId}?updateMask.fieldPaths=quantity`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fields: {
                    quantity: {
                        integerValue: String(quantity)
                    }
                }
            })
        }
    );

    if (!response.ok) {
        throw new Error("Failed to update cart");
    }

    return await response.json();
}


// 4. REMOVE ITEM FROM CART
export async function removeFromCart(cartId) {

    const response = await fetch(
        `${FIRESTORE_URL}/cart/${cartId}`,
        {
            method: "DELETE"
        }
    );

    if (!response.ok) {
        throw new Error("Failed to remove cart item");
    }

    return true;
}
