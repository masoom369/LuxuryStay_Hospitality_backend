// Dummy Data Script for MongoDB Shell
// Run this in mongo shell: mongo < dummydata.js

use hotel_management;

// Clear existing data (optional, uncomment if needed)
db.users.drop();
db.hotels.drop();
db.rooms.drop();
db.reservations.drop();
db.billings.drop();
db.additionalservices.drop();
db.feedbacks.drop();
db.housekeepings.drop();
db.maintenances.drop();
db.notifications.drop();
db.systemconfigs.drop();

// Sample Hotels
db.hotels.insertMany([
  {
    _id: ObjectId("507f1f77bcf86cd799439011"),
    name: "LuxuryStay Downtown",
    description: "A premier hotel located in the heart of New York City, offering unparalleled luxury and convenience.",
    images: ["luxurystay_downtown_1.jpg", "luxurystay_downtown_2.jpg", "luxurystay_downtown_3.jpg"],
    location: {
      address: "123 Main St",
      city: "New York",
      state: "NY",
      country: "USA",
      zipCode: "10001",
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    contact: {
      phone: "+1-212-555-0123",
      email: "info@luxurystaydowntown.com",
      emergencyContact: "+1-212-555-0199"
    },
    amenities: ["pool", "spa", "gym", "restaurant", "wifi"],
    isActive: true
  },
  {
    _id: ObjectId("507f1f77bcf86cd799439012"),
    name: "LuxuryStay Beach Resort",
    description: "Experience tropical paradise at our beachfront resort in Miami, with stunning ocean views and world-class amenities.",
    images: ["luxurystay_beach_1.jpg", "luxurystay_beach_2.jpg", "luxurystay_beach_3.jpg"],
    location: {
      address: "456 Ocean Ave",
      city: "Miami",
      state: "FL",
      country: "USA",
      zipCode: "33101",
      coordinates: { lat: 25.7617, lng: -80.1918 }
    },
    contact: {
      phone: "+1-305-555-0456",
      email: "info@luxurystaybeach.com",
      emergencyContact: "+1-305-555-0499"
    },
    amenities: ["pool", "spa", "restaurant", "bar", "parking"],
    isActive: true
  }
]);

// Sample Users
db.users.insertMany([
  // Admin
  {
    _id: ObjectId("507f1f77bcf86cd799439013"),
    email: "admin@luxurystay.com",
    username: "admin",
    password: "$2b$10$PKGHcfy02knyqecY03Ui4eVhF1XJKfFBekEwUvw5jaFfYTrB1GUIm", // Use bcrypt hash for 'password123'
    role: "admin",
    isActive: true
  },
  // Manager for Downtown
  {
    _id: ObjectId("507f1f77bcf86cd799439014"),
    email: "manager1@luxurystay.com",
    username: "manager1",
    password: "$2b$10$PKGHcfy02knyqecY03Ui4eVhF1XJKfFBekEwUvw5jaFfYTrB1GUIm",
    role: "manager",
    assignments: [{ hotel: ObjectId("507f1f77bcf86cd799439011") }],
    isActive: true
  },
  // Receptionist for Downtown
  {
    _id: ObjectId("507f1f77bcf86cd799439015"),
    email: "receptionist1@luxurystay.com",
    username: "receptionist1",
    password: "$2b$10$PKGHcfy02knyqecY03Ui4eVhF1XJKfFBekEwUvw5jaFfYTrB1GUIm",
    role: "receptionist",
    assignments: [{ hotel: ObjectId("507f1f77bcf86cd799439011") }],
    isActive: true
  },
  // Housekeeping for Downtown
  {
    _id: ObjectId("507f1f77bcf86cd799439016"),
    email: "housekeeping1@luxurystay.com",
    username: "housekeeping1",
    password: "$2b$10$PKGHcfy02knyqecY03Ui4eVhF1XJKfFBekEwUvw5jaFfYTrB1GUIm",
    role: "housekeeping",
    assignments: [{ hotel: ObjectId("507f1f77bcf86cd799439011") }],
    isActive: true
  },
  // Guest 1
  {
    _id: ObjectId("507f1f77bcf86cd799439017"),
    email: "guest1@example.com",
    username: "guest1",
    password: "$2b$10$PKGHcfy02knyqecY03Ui4eVhF1XJKfFBekEwUvw5jaFfYTrB1GUIm",
    role: "guest",
    address: {
      street: "789 Guest St",
      city: "New York",
      state: "NY",
      country: "USA",
      zipCode: "10002"
    },
    idType: "passport",
    idNumber: "P123456789",
    preferences: {
      roomType: "deluxe",
      bedType: "king",
      smokingAllowed: false
    },
    loyaltyPoints: 100,
    totalStays: 5,
    isActive: true
  },
  // Guest 2
  {
    _id: ObjectId("507f1f77bcf86cd799439018"),
    email: "guest2@example.com",
    username: "guest2",
    password: "$2b$10$PKGHcfy02knyqecY03Ui4eVhF1XJKfFBekEwUvw5jaFfYTrB1GUIm",
    role: "guest",
    address: {
      street: "101 Tourist Ave",
      city: "Miami",
      state: "FL",
      country: "USA",
      zipCode: "33102"
    },
    idType: "license",
    idNumber: "DL987654321",
    preferences: {
      roomType: "suite",
      bedType: "queen",
      smokingAllowed: true
    },
    loyaltyPoints: 50,
    totalStays: 2,
    isActive: true
  }
]);

// Sample Rooms
db.rooms.insertMany([
  {
    _id: ObjectId("507f1f77bcf86cd799439019"),
    roomNumber: "101",
    roomType: "single",
    hotel: ObjectId("507f1f77bcf86cd799439011"),
    floor: 1,
    status: "available",
    basePrice: 100,
    amenities: ["wifi", "tv", "ac"],
    bedType: "single",
    maxOccupancy: 1,
    smokingAllowed: false,
    description: "Cozy single room",
    images: ["room101.jpg"],
    isActive: true
  },
  {
    _id: ObjectId("507f1f77bcf86cd799439020"),
    roomNumber: "201",
    roomType: "deluxe",
    hotel: ObjectId("507f1f77bcf86cd799439011"),
    floor: 2,
    status: "occupied",
    basePrice: 200,
    amenities: ["wifi", "tv", "ac", "minibar", "balcony"],
    bedType: "king",
    maxOccupancy: 2,
    smokingAllowed: false,
    description: "Spacious deluxe room",
    images: ["room201.jpg"],
    isActive: true
  },
  {
    _id: ObjectId("507f1f77bcf86cd799439021"),
    roomNumber: "102",
    roomType: "suite",
    hotel: ObjectId("507f1f77bcf86cd799439012"),
    floor: 1,
    status: "available",
    basePrice: 300,
    amenities: ["wifi", "tv", "ac", "minibar", "balcony", "kitchen"],
    bedType: "king",
    maxOccupancy: 4,
    smokingAllowed: true,
    description: "Luxurious suite with ocean view",
    images: ["room102.jpg"],
    isActive: true
  }
]);

// Sample Reservations
db.reservations.insertMany([
  {
    _id: ObjectId("507f1f77bcf86cd799439022"),
    guest: ObjectId("507f1f77bcf86cd799439017"),
    room: ObjectId("507f1f77bcf86cd799439020"), // Room 201
    checkInDate: new Date("2023-10-01"),
    checkOutDate: new Date("2023-10-05"),
    numberOfGuests: 2,
    status: "confirmed",
    totalAmount: 800,
    advancePayment: 200,
    paymentStatus: "partial",
    specialRequests: "Late check-in",
    bookingSource: "online",
    createdBy: ObjectId("507f1f77bcf86cd799439015") // Receptionist
  },
  {
    _id: ObjectId("507f1f77bcf86cd799439023"),
    guest: ObjectId("507f1f77bcf86cd799439018"),
    room: ObjectId("507f1f77bcf86cd799439021"), // Room 102
    checkInDate: new Date("2023-10-10"),
    checkOutDate: new Date("2023-10-15"),
    numberOfGuests: 3,
    status: "pending",
    totalAmount: 1500,
    advancePayment: 0,
    paymentStatus: "pending",
    specialRequests: "Extra towels",
    bookingSource: "phone",
    createdBy: ObjectId("507f1f77bcf86cd799439015")
  }
]);

// Sample Billings
db.billings.insertMany([
  {
    _id: ObjectId("507f1f77bcf86cd799439024"),
    invoiceNumber: "INV001",
    reservation: ObjectId("507f1f77bcf86cd799439022"),
    guest: ObjectId("507f1f77bcf86cd799439017"),
    items: [
      { description: "Room charge", category: "room", quantity: 4, unitPrice: 200, totalPrice: 800 }
    ],
    subtotal: 800,
    tax: 80,
    discount: 0,
    totalAmount: 880,
    paymentMethod: "credit_card",
    paymentStatus: "partial",
    paidAmount: 200,
    balanceAmount: 680,
    generatedBy: ObjectId("507f1f77bcf86cd799439015")
  }
]);

// Sample Additional Services
db.additionalservices.insertMany([
  {
    _id: ObjectId("507f1f77bcf86cd799439025"),
    reservation: ObjectId("507f1f77bcf86cd799439022"),
    guest: ObjectId("507f1f77bcf86cd799439017"),
    serviceType: "room_service",
    description: "Dinner delivery",
    requestedTime: new Date("2023-10-02T19:00:00Z"),
    status: "completed",
    cost: 50,
    assignedTo: ObjectId("507f1f77bcf86cd799439016"), // Housekeeping
    notes: "Delivered on time"
  }
]);

// Sample Feedbacks
db.feedbacks.insertMany([
  {
    _id: ObjectId("507f1f77bcf86cd799439026"),
    guest: ObjectId("507f1f77bcf86cd799439017"),
    reservation: ObjectId("507f1f77bcf86cd799439022"),
    rating: 5,
    categories: {
      cleanliness: 5,
      staff: 5,
      facilities: 4,
      valueForMoney: 5,
      location: 5
    },
    comment: "Excellent stay!",
    isAnonymous: false,
    status: "published"
  }
]);

// Sample Housekeeping
db.housekeepings.insertMany([
  {
    _id: ObjectId("507f1f77bcf86cd799439027"),
    room: ObjectId("507f1f77bcf86cd799439020"), // Room 201
    assignedTo: ObjectId("507f1f77bcf86cd799439016"),
    taskType: "checkout_cleaning",
    priority: "high",
    status: "completed",
    scheduledTime: new Date("2023-10-05T10:00:00Z"),
    startTime: new Date("2023-10-05T10:00:00Z"),
    completionTime: new Date("2023-10-05T11:00:00Z"),
    notes: "Room cleaned thoroughly",
    createdBy: ObjectId("507f1f77bcf86cd799439014") // Manager
  }
]);

// Add a maintenance user first
db.users.insertOne({
  _id: ObjectId("507f1f77bcf86cd799439028"),
  email: "maintenance1@luxurystay.com",
  username: "maintenance1",
  password: "$2b$10$PKGHcfy02knyqecY03Ui4eVhF1XJKfFBekEwUvw5jaFfYTrB1GUIm",
  role: "maintenance",
  assignments: [{ hotel: ObjectId("507f1f77bcf86cd799439011") }],
  isActive: true
});

// Sample Maintenance
db.maintenances.insertMany([
  {
    _id: ObjectId("507f1f77bcf86cd799439029"),
    ticketNumber: "MAINT001",
    room: ObjectId("507f1f77bcf86cd799439019"), // Room 101
    issueType: "plumbing",
    description: "Leaky faucet",
    priority: "medium",
    status: "completed",
    reportedBy: ObjectId("507f1f77bcf86cd799439017"),
    assignedTo: ObjectId("507f1f77bcf86cd799439028"), // Maintenance user
    estimatedCost: 50,
    actualCost: 45,
    notes: "Fixed successfully"
  }
]);

// Sample Notifications
db.notifications.insertMany([
  {
    _id: ObjectId("507f1f77bcf86cd799439030"),
    recipient: ObjectId("507f1f77bcf86cd799439017"),
    type: "booking",
    title: "Reservation Confirmed",
    message: "Your reservation has been confirmed.",
    priority: "medium",
    isRead: false,
    hotel: ObjectId("507f1f77bcf86cd799439011")
  }
]);

// Sample System Configs
db.systemconfigs.insertMany([
  {
    key: "tax_rate",
    value: 0.1,
    category: "tax",
    description: "Default tax rate",
    hotel: null // Global
  },
  {
    key: "checkin_time",
    value: "15:00",
    category: "policy",
    description: "Default check-in time",
    hotel: ObjectId("507f1f77bcf86cd799439011")
  }
]);

print("Dummy data inserted successfully!");
