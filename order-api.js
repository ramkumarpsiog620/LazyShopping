
import { FIRESTORE_URL } from "./firebase-config.js";

// 1. CREATE ORDER
export async function createOrder(order) {

    const response = await fetch(
        `${FIRESTORE_URL}/orders`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fields: {
                    userId: {
                        stringValue: order.userId
                    },
                    customerName: {
                        stringValue: order.customerName
                    },
                    productId: {
                        stringValue: order.productId
                    },
                    productName: {
                        stringValue: order.productName
                    },
                    quantity: {
                        integerValue: String(order.quantity)
                    },
                    totalPrice: {
                        doubleValue: Number(order.totalPrice)
                    },
                    status: {
                        stringValue: order.status || "Pending"
                    },
                    orderDate: {
                        timestampValue: new Date().toISOString()
                    }
                }
            })
        }
    );

    if (!response.ok) {
        throw new Error("Failed to create order");
    }

    return await response.json();
}


// 2. READ ALL ORDERS
export async function getOrders() {

    const response = await fetch(
        `${FIRESTORE_URL}/orders`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch orders");
    }

    const data = await response.json();

    return data.documents || [];
}


// 3. UPDATE ORDER STATUS
export async function updateOrder(orderId, status) {

    const response = await fetch(
        `${FIRESTORE_URL}/orders/${orderId}?updateMask.fieldPaths=status`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fields: {
                    status: {
                        stringValue: status
                    }
                }
            })
        }
    );

    if (!response.ok) {
        throw new Error("Failed to update order");
    }

    return await response.json();
}


// 4. DELETE ORDER
export async function deleteOrder(orderId) {

    const response = await fetch(
        `${FIRESTORE_URL}/orders/${orderId}`,
        {
            method: "DELETE"
        }
    );

    if (!response.ok) {
        throw new Error("Failed to delete order");
    }

    return true;
}
