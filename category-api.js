
import { FIRESTORE_URL } from "./firebase-config.js";

// 1. CREATE CATEGORY
export async function addCategory(category) {

    const response = await fetch(
        `${FIRESTORE_URL}/categories`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fields: {
                    name: {
                        stringValue: category.name
                    },
                    description: {
                        stringValue: category.description
                    }
                }
            })
        }
    );

    if (!response.ok) {
        throw new Error("Failed to add category");
    }

    return await response.json();
}


// 2. READ ALL CATEGORIES
export async function getCategories() {

    const response = await fetch(
        `${FIRESTORE_URL}/categories`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch categories");
    }

    const data = await response.json();

    return data.documents || [];
}


// 3. UPDATE CATEGORY
export async function updateCategory(categoryId, category) {

    const response = await fetch(
        `${FIRESTORE_URL}/categories/${categoryId}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fields: {
                    name: {
                        stringValue: category.name
                    },
                    description: {
                        stringValue: category.description
                    }
                }
            })
        }
    );

    if (!response.ok) {
        throw new Error("Failed to update category");
    }

    return await response.json();
}


// 4. DELETE CATEGORY
export async function deleteCategory(categoryId) {

    const response = await fetch(
        `${FIRESTORE_URL}/categories/${categoryId}`,
        {
            method: "DELETE"
        }
    );

    if (!response.ok) {
        throw new Error("Failed to delete category");
    }

    return true;
}
