
import { firebaseConfig, FIRESTORE_URL } from "./firebase-config.js";

const PRODUCTS_URL = `${FIRESTORE_URL}/products`;

const key = `key=${firebaseConfig.apiKey}`;

// Convert JavaScript values into Firestore format
const toFirestoreValue = (v) => {

    if (v === null || v === undefined)
        return { nullValue: null };

    if (typeof v === "string")
        return { stringValue: v };

    if (typeof v === "boolean")
        return { booleanValue: v };

    if (typeof v === "number") {
        return Number.isInteger(v)
            ? { integerValue: String(v) }
            : { doubleValue: v };
    }

    if (Array.isArray(v)) {
        return {
            arrayValue: {
                values: v.map(toFirestoreValue)
            }
        };
    }

    if (typeof v === "object") {
        return {
            mapValue: {
                fields: toFirestoreFields(v)
            }
        };
    }

    throw new Error("Unsupported Firestore value");
};

// Convert object into Firestore fields
const toFirestoreFields = (obj) =>
    Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [
            k,
            toFirestoreValue(v)
        ])
    );

// Convert Firestore values into JavaScript values
const fromFirestoreValue = (v) => {

    if ("stringValue" in v) return v.stringValue;

    if ("integerValue" in v) return Number(v.integerValue);

    if ("doubleValue" in v) return v.doubleValue;

    if ("booleanValue" in v) return v.booleanValue;

    if ("nullValue" in v) return null;

    if ("timestampValue" in v) return v.timestampValue;

    if ("arrayValue" in v)
        return (v.arrayValue.values || []).map(fromFirestoreValue);

    if ("mapValue" in v)
        return fromFirestoreFields(v.mapValue.fields || {});

    return null;
};

// Convert Firestore fields into JavaScript object
const fromFirestoreFields = (fields) =>
    Object.fromEntries(
        Object.entries(fields).map(([k, v]) => [
            k,
            fromFirestoreValue(v)
        ])
    );

// Convert Firestore document into normal JavaScript object
const parseDoc = (doc) => ({
    id: doc.name.split("/").pop(),
    ...fromFirestoreFields(doc.fields || {})
});

// Build HTTP request
const buildRequest = (method, body, idToken) => ({
    method,

    headers: {
        "Content-Type": "application/json",
        ...(idToken && {
            Authorization: `Bearer ${idToken}`
        })
    },

    ...(body && {
        body: JSON.stringify(body)
    })
});

// Handle API responses
const handle = async (res) => {

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(
            data?.error?.message || `Request failed (${res.status})`
        );
    }

    return data;
};

/* ================= CRUD OPERATIONS ================= */

// CREATE PRODUCT
export async function addProduct(product, idToken) {

    const res = await fetch(
        `${PRODUCTS_URL}?${key}`,
        buildRequest(
            "POST",
            { fields: toFirestoreFields(product) },
            idToken
        )
    );

    return parseDoc(await handle(res));
}


// READ ALL PRODUCTS
export async function getProducts(idToken) {

    let products = [];
    let pageToken = "";

    do {

        const url =
            `${PRODUCTS_URL}?pageSize=100&${key}` +
            (pageToken
                ? `&pageToken=${encodeURIComponent(pageToken)}`
                : "");

        const data = await handle(
            await fetch(url, buildRequest("GET", null, idToken))
        );

        products = products.concat(
            (data.documents || []).map(parseDoc)
        );

        pageToken = data.nextPageToken || "";

    } while (pageToken);

    return products;
}


// READ ONE PRODUCT
export async function getProduct(id, idToken) {

    const res = await fetch(
        `${PRODUCTS_URL}/${encodeURIComponent(id)}?${key}`,
        buildRequest("GET", null, idToken)
    );

    return parseDoc(await handle(res));
}


// UPDATE PRODUCT
export async function updateProduct(id, updates, idToken) {

    if (!Object.keys(updates).length) {
        throw new Error("No fields provided for update");
    }

    const mask = Object.keys(updates)
        .map(
            (f) => `updateMask.fieldPaths=${encodeURIComponent(f)}`
        )
        .join("&");

    const res = await fetch(
        `${PRODUCTS_URL}/${encodeURIComponent(id)}?${mask}&${key}`,
        buildRequest(
            "PATCH",
            { fields: toFirestoreFields(updates) },
            idToken
        )
    );

    return parseDoc(await handle(res));
}


// DELETE PRODUCT
export async function deleteProduct(id, idToken) {

    const res = await fetch(
        `${PRODUCTS_URL}/${encodeURIComponent(id)}?${key}`,
        buildRequest("DELETE", null, idToken)
    );

    await handle(res);

    return true;
}
