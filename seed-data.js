
import { addProduct } from "./products-api.js";
import { addCategory } from "./category-api.js";
import { addUser } from "./user-api.js";
import { addToCart } from "./cart-api.js";
import { createOrder } from "./order-api.js";

// ----------------------------------
// 1. SAMPLE CATEGORIES - 30 RECORDS
// ----------------------------------

const categoryNames = [
    "Electronics", "Clothing", "Footwear", "Home Appliances",
    "Books", "Furniture", "Sports", "Beauty",
    "Groceries", "Jewellery", "Watches", "Bags",
    "Toys", "Gaming", "Mobiles", "Laptops",
    "Kitchen", "Decor", "Fitness", "Stationery",
    "Accessories", "Cameras", "Audio", "Lighting",
    "Travel", "Baby Products", "Pet Supplies", "Automotive",
    "Garden", "Personal Care"
];

const categories = [];

for (let i = 0; i < 30; i++) {
    categories.push({
        name: categoryNames[i],
        description: `Quality ${categoryNames[i]} products`
    });
}


// ----------------------------------
// 2. SAMPLE PRODUCTS - 30 RECORDS
// ----------------------------------

const productNames = [
    "Samsung Galaxy S25", "iPhone 16", "Dell Inspiron Laptop",
    "HP Pavilion Laptop", "Nike Running Shoes",
    "Adidas Sneakers", "Cotton Checked Shirt",
    "Denim Jeans", "Wooden Dining Table",
    "Office Chair", "Bluetooth Headphones",
    "Wireless Mouse", "Mechanical Keyboard",
    "Smart Watch", "Canon Camera",
    "LED Television", "Refrigerator",
    "Washing Machine", "Microwave Oven",
    "Air Conditioner", "Travel Backpack",
    "Leather Wallet", "Sunglasses",
    "Wrist Watch", "Yoga Mat",
    "Football", "Novel Book",
    "Desk Lamp", "Water Bottle",
    "Coffee Maker"
];

const productCategories = [
    "Electronics", "Mobiles", "Laptops",
    "Laptops", "Footwear", "Footwear",
    "Clothing", "Clothing", "Furniture",
    "Furniture", "Audio", "Accessories",
    "Accessories", "Watches", "Cameras",
    "Electronics", "Home Appliances",
    "Home Appliances", "Kitchen", "Home Appliances",
    "Travel", "Accessories", "Accessories",
    "Watches", "Fitness", "Sports",
    "Books", "Lighting", "Kitchen", "Kitchen"
];

const products = productNames.map((name, i) => ({
    name: name,
    description: `High quality ${name} with excellent features`,
    price: 500 + (i * 750),
    category: productCategories[i],
    stock: 5 + i,
    image: `https://placehold.co/300x200?text=${encodeURIComponent(name)}`
}));


// ----------------------------------
// 3. SAMPLE USERS - 30 RECORDS
// ----------------------------------

const userNames = [
    "Arun Kumar", "Priya Sharma", "Rahul Verma",
    "Sneha Reddy", "Karthik Raj", "Ananya Das",
    "Vikram Singh", "Meena Patel", "Rohit Gupta",
    "Divya Nair", "Sanjay Kumar", "Pooja Shah",
    "Amit Joshi", "Kavya Rao", "Nikhil Menon",
    "Riya Kapoor", "Aditya Mishra", "Neha Iyer",
    "Varun Das", "Swathi Krishnan", "Manoj Kumar",
    "Aishwarya Sen", "Deepak Sharma", "Lakshmi Devi",
    "Ramesh Babu", "Anjali Mehta", "Suresh Reddy",
    "Ishita Roy", "Gaurav Jain", "Keerthi S"
];

const cities = [
    "Chennai", "Bangalore", "Hyderabad", "Mumbai",
    "Delhi", "Pune", "Kochi", "Coimbatore",
    "Kolkata", "Jaipur"
];

const users = userNames.map((name, i) => ({
    name: name,
    email: `customer${i + 1}@example.com`,
    phone: String(9000000000 + i),
    address: `${100 + i}, Main Road, ${cities[i % cities.length]}`
}));


// ----------------------------------
// 4. INSERT ALL 30 CATEGORIES
// ----------------------------------

const categoryResults = [];

async function seedCategories() {
    console.log("Adding categories...");

    for (const category of categories) {
        const result = await addCategory(category);
        categoryResults.push(result);
    }

    console.log("30 categories inserted!");
}


// ----------------------------------
// 5. INSERT ALL 30 PRODUCTS
// ----------------------------------

const productResults = [];

async function seedProducts() {
    console.log("Adding products...");

    for (const product of products) {
        const result = await addProduct(product);
        productResults.push(result);
    }

    console.log("30 products inserted!");
}


// ----------------------------------
// 6. INSERT ALL 30 USERS
// ----------------------------------

const userResults = [];

async function seedUsers() {
    console.log("Adding users...");

    for (const user of users) {
        const result = await addUser(user);
        userResults.push(result);
    }

    console.log("30 users inserted!");
}


// ----------------------------------
// 7. INSERT ALL 30 CART RECORDS
// ----------------------------------

async function seedCart() {
    console.log("Adding cart records...");

    for (let i = 0; i < 30; i++) {

        const userId = userResults[i].name.split("/").pop();
        const productId = productResults[i].name.split("/").pop();

        await addToCart({
            userId: userId,
            productId: productId,
            productName: productNames[i],
            price: products[i].price,
            quantity: (i % 3) + 1
        });
    }

    console.log("30 cart records inserted!");
}


// ----------------------------------
// 8. INSERT ALL 30 ORDERS
// ----------------------------------

async function seedOrders() {
    console.log("Adding orders...");

    const statuses = [
        "Pending", "Processing", "Shipped",
        "Delivered", "Cancelled"
    ];

    for (let i = 0; i < 30; i++) {

        const userId = userResults[i].name.split("/").pop();
        const productId = productResults[i].name.split("/").pop();
        const quantity = (i % 3) + 1;

        await createOrder({
            userId: userId,
            customerName: userNames[i],
            productId: productId,
            productName: productNames[i],
            quantity: quantity,
            totalPrice: products[i].price * quantity,
            status: statuses[i % statuses.length]
        });
    }

    console.log("30 orders inserted!");
}


// ----------------------------------
// 9. RUN ALL SEED OPERATIONS
// ----------------------------------

async function seedDatabase() {

    try {
        console.log("Starting database seeding...");

        await seedCategories();
        await seedProducts();
        await seedUsers();
        await seedCart();
        await seedOrders();

        console.log("SUCCESS! All 150 records inserted.");

        alert("Successfully inserted 150 sample records!");

    } catch (error) {
        console.error("Seeding failed:", error);
        alert("Seeding failed: " + error.message);
    }
}

seedDatabase();
