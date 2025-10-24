# Backend Logic Errors and Issues TODO

## Overview
After reviewing all backend controllers and models, several logic errors, inconsistencies, and potential issues were identified. This TODO lists the problems found and tasks to fix them.

## Errors and Issues Found

### 1. bookingController.js
- [ ] **Availability Check Logic in `createBooking`**: The `$or` query for checking overlapping bookings may not correctly detect all overlaps. The conditions `{ checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }` and others might miss edge cases. Review and fix the overlap detection logic.
- [ ] **Invoice Creation in `checkOutBooking`**: When creating an invoice, it assumes `booking.totalAmount` and hardcodes items. Ensure `totalAmount` is calculated properly and items are dynamically generated based on booking details.

### 3. userController.js
- [ ] **Role Validation in `createUser`**: Unlike `createStaff`, `createUser` does not validate the role against allowed values ('admin', 'manager', etc.). Add validation to prevent invalid roles.
### 4. roomController.js
- [ ] **Availability Query in `getAvailableRooms`**: Similar to bookingController, the `$or` logic for booked rooms might be incorrect. Verify the overlap check matches the booking logic.

### 5. contactUsController.js
- [ ] **Status Enum Consistency**: `respondToMessage` sets status to 'responded', but model allows 'pending', 'responded'. Ensure all statuses are handled correctly.

### 6. feedbackController.js
- [ ] **Misleading Function Name**: `deactivateFeedback` uses `findByIdAndDelete`, which permanently deletes. Rename or change to soft delete if deactivation is intended.

### 7. housekeepingTaskController.js
- [ ] **Duplicate Functions**: `createTask` and `assignTask` are identical. Remove duplication.
- [ ] **Cross-Module Logic**: `reportMaintenanceIssue` creates a MaintenanceRequest, but it's in housekeeping controller. Consider moving to maintenanceRequestController for better organization.

### 8. invoiceController.js
- [ ] **Placeholder Implementations**: `sendInvoiceEmail` and `printInvoice` are placeholders. Implement actual email sending and PDF generation.

### 9. maintenanceRequestController.js
- [ ] **Duplicate Functions**: `createMaintenanceRequest` and `createRequest` are identical. Remove duplication.
- [ ] **Notification Field Mismatch**: Code uses `user: request.reportedBy._id`, but Notification model has `recipient`. Update to use correct field.

### 10. notificationController.js
- [ ] **Duplicate Export**: `createNotification` is exported twice. Remove duplicate.
- [ ] **Field Mismatch**: Some code uses 'user' instead of 'recipient' as per model. Standardize to 'recipient'.

### 11. serviceRequestController.js
- [ ] **Duplicate Export**: `updateServiceRequest` is exported twice. Remove duplicate.

### 12. reportingController.js
- [ ] **Calculation Validation**: In `getOccupancyRates`, `getRevenueReports`, etc., add validation for date ranges and ensure calculations handle edge cases (e.g., no bookings).

### Models
- [ ] **Enum Consistency**: Check all models for consistent enum values across controllers (e.g., status fields).
- [ ] **Validation**: Ensure required fields and validations are enforced properly in schemas.

## Dependent Files to Edit
- All controller files listed above.
- Models: Booking.js, User.js, Room.js, Hotel.js, Invoice.js, Feedback.js, ContactUs.js, HousekeepingTask.js, MaintenanceRequest.js, Notification.js, ServiceCatalog.js, ServiceRequest.js.

## Followup Steps
- [ ] After fixes, run tests on affected endpoints.
- [ ] Update routes if any function names change.
- [ ] Ensure database migrations if model changes are needed.
