
import { FIRESTORE_URL } from "./firebase-config.js";

// 1. CREATE USER
export async function addUser(user) {

    const response = await fetch(
        `${FIRESTORE_URL}/users`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fields: {
                    name: {
                        stringValue: user.name
                    },
                    email: {
                        stringValue: user.email
                    },
                    phone: {
                        stringValue: user.phone
                    },
                    address: {
                        stringValue: user.address
                    }
                }
            })
        }
    );

    if (!response.ok) {
        throw new Error("Failed to add user");
    }

    return await response.json();
}


// 2. READ ALL USERS
export async function getUsers() {

    const response = await fetch(
        `${FIRESTORE_URL}/users`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch users");
    }

    const data = await response.json();

    return data.documents || [];
}


// 3. UPDATE USER
export async function updateUser(userId, user) {

    const response = await fetch(
        `${FIRESTORE_URL}/users/${userId}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fields: {
                    name: {
                        stringValue: user.name
                    },
                    email: {
                        stringValue: user.email
                    },
                    phone: {
                        stringValue: user.phone
                    },
                    address: {
                        stringValue: user.address
                    }
                }
            })
        }
    );

    if (!response.ok) {
        throw new Error("Failed to update user");
    }

    return await response.json();
}


// 4. DELETE USER
export async function deleteUser(userId) {

    const response = await fetch(
        `${FIRESTORE_URL}/users/${userId}`,
        {
            method: "DELETE"
        }
    );

    if (!response.ok) {
        throw new Error("Failed to delete user");
    }

    return true;
}
