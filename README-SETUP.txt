SHOPEASE FRONTEND ADD-ON
========================

Files:
- login.html / login.css / auth.js: Firebase email-password login and customer registration.
- admin.html / admin.css / admin.js: admin dashboard; product/category CRUD, customer listing, order status updates.
- shop.html / shop.css / shop.js: product catalogue, customer cart, and basic order placement.

SETUP
1. Extract these files into the same E-Commerce folder as your existing firebase-config.js.
2. Keep your existing firebase-config.js unchanged. It must export firebaseConfig, AUTH_URL, and FIRESTORE_URL.
3. In Firebase Console, enable Authentication > Sign-in method > Email/Password.
4. Ensure Firestore Database is created and the required collections can be accessed under appropriate Firestore Security Rules.
5. Run the project through a local web server (for example VS Code Live Server). Do not open the HTML files directly with file://.
6. Open login.html.
7. Register a customer account. New registrations create a Firebase Authentication account and a userProfiles/{uid} profile with role "user".
8. To create an administrator, register the intended admin account first. In Firebase Console > Authentication, locate its UID. In Firestore, open userProfiles/{uid} and change role from "user" to "admin". Sign out and sign in again.
9. Customers can then sign in and browse products, add items to cart, and place orders.

COLLECTIONS USED
- products: existing product documents
- categories: existing category documents
- users: existing customer contact records (admin read-only in this sample)
- cart: userId, productId, productName, price, quantity
- orders: userId, customerName, productId, productName, quantity, totalPrice, status, orderDate
- userProfiles: uid, name, email, role

IMPORTANT
- Existing sample users inserted by seed-data.js are not Firebase Authentication accounts. They cannot sign in until they register through Firebase Authentication.
- This is a frontend learning/demo implementation. Browser-side role checks are not a security boundary. Apply restrictive Firestore Security Rules before real deployment. Do not allow users to write their own role field or read other users' private records.
- Your existing category-api.js, cart-api.js, order-api.js and user-api.js use REST requests without a Firebase ID token. These new pages use authenticated requests directly for the operations they perform.
- A user's cart is filtered by Firebase Auth UID. The user page creates cart and order documents using the collection field names already used in your project.
- The admin dashboard displays customer records from the existing `users` collection; it does not create Firebase Authentication accounts for those records.
