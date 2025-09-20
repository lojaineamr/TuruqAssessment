# Dynamic Delivery Slot Allocation System - Detailed Pseudocode

## Overview
This pseudocode outlines the backend logic for a customer-facing app that handles delivery slot booking with dynamic allocation, overbooking prevention, and alternative slot suggestions.


### DeliverySlot Structure
```
DeliverySlot {
    slotId: String (unique identifier)
    date: Date (delivery date)
    startTime: Time (slot start time)
    endTime: Time (slot end time)
    capacity: Integer (maximum number of orders)
    currentBookings: Integer (current number of bookings)
    isActive: Boolean (whether slot is available for booking)
    zone: String (delivery zone/area)
    price: Decimal (delivery cost for this slot)
    createdAt: DateTime
    updatedAt: DateTime
}
```

### BookingRequest Structure
```
BookingRequest {
    customerId: String
    orderId: String
    preferredSlotId: String
    alternativeSlotIds: Array<String> (optional)
    zone: String
    priority: Integer (1=normal, 2=premium, 3=urgent)
    requestTimestamp: DateTime
}
```

### BookingResult Structure
```
BookingResult {
    success: Boolean
    allocatedSlotId: String (if successful)
    message: String
    suggestedAlternatives: Array<DeliverySlot>
    bookingReference: String (if successful)
}
```

## Main Functions

### Function: processBookingRequest(bookingRequest)
```
function processBookingRequest(bookingRequest):
    # Input validation 
    if bookingRequest is null or invalid:
        return createErrorResult("Invalid booking request")
    
    if not validateCustomer(bookingRequest.customerId):
        return createErrorResult("Invalid customer")
    
    if not validateOrder(bookingRequest.orderId):
        return createErrorResult("Invalid order")
    
    # Check if order is already booked
    existingBooking = findExistingBooking(bookingRequest.orderId)
    if existingBooking exists:
        return createErrorResult("Order already has a delivery slot booked")
    
    # Attempt to book preferred slot
    preferredSlot = getSlotById(bookingRequest.preferredSlotId)
    
    if preferredSlot is null:
        return createErrorResult("Preferred slot not found")
    
    # Try to allocate preferred slot
    allocationResult = attemptSlotAllocation(preferredSlot, bookingRequest)
    
    if allocationResult.success:
        return allocationResult
    
    # If preferred slot fails, suggest alternatives
    alternativeSlots = findAlternativeSlots(bookingRequest)
    
    return BookingResult {
        success: false,
        allocatedSlotId: null,
        message: "Preferred slot unavailable",
        suggestedAlternatives: alternativeSlots,
        bookingReference: null
    }
```

### Function: attemptSlotAllocation(slot, bookingRequest)
```
function attemptSlotAllocation(slot, bookingRequest):
    # Begin database transaction for consistency
    startTransaction()
    
    try:
        # Re-fetch slot with exclusive lock to prevent race conditions and ensure consistency
        lockedSlot = getSlotWithLock(slot.slotId)
        
        # Check slot availability
        if not isSlotAvailable(lockedSlot):
            rollbackTransaction()
            return BookingResult {
                success: false,
                message: "Slot is no longer available"
            }
        
        # Check capacity
        if lockedSlot.currentBookings >= lockedSlot.capacity:
            rollbackTransaction()
            return BookingResult {
                success: false,
                message: "Slot is fully booked"
            }
        
        # Check zone compatibility
        if not isZoneCompatible(lockedSlot.zone, bookingRequest.zone):
            rollbackTransaction()
            return BookingResult {
                success: false,
                message: "Slot not available for your delivery zone"
            }
        
        # Create booking record
        bookingReference = generateUniqueBookingReference()
        
        booking = createBooking({
            bookingReference: bookingReference,
            customerId: bookingRequest.customerId,
            orderId: bookingRequest.orderId,
            slotId: lockedSlot.slotId,
            zone: bookingRequest.zone,
            priority: bookingRequest.priority,
            status: "CONFIRMED",
            bookedAt: getCurrentTimestamp()
        })
        
        # Update slot booking count
        updateSlotBookingCount(lockedSlot.slotId, lockedSlot.currentBookings + 1)
        
        # Send confirmation notification (async)
        scheduleNotification(bookingRequest.customerId, booking)
        
        # Commit transaction
        commitTransaction()
        
        return BookingResult {
            success: true,
            allocatedSlotId: lockedSlot.slotId,
            message: "Booking confirmed successfully",
            bookingReference: bookingReference
        }
        
    catch (Exception e):
        rollbackTransaction()
        
        console.error(`Error in Booking allocation failed: ${e.message}`)
        console.error(`Timestamp: ${getCurrentDateTime()}`)
        
        return BookingResult {
            success: false,
            message: "Booking failed due to system error"
        }
```

### Function: findAlternativeSlots(bookingRequest)
```
function findAlternativeSlots(bookingRequest):
    # Get the preferred slot details for context
    preferredSlot = getSlotById(bookingRequest.preferredSlotId)
    
    if preferredSlot is null:
        preferredDate = getCurrentDate()
        preferredZone = bookingRequest.zone
    else:
        preferredDate = preferredSlot.date
        preferredZone = preferredSlot.zone
    
    # Define search criteria for alternatives
    searchCriteria = {
        zone: preferredZone,
        isActive: true,
        date: {
            start: preferredDate,
            end: addDays(preferredDate, 7)  # Look up to 7 days ahead
        }
    }
    
    # Get available slots with capacity
    availableSlots = database.query(`
        SELECT * FROM DeliverySlots 
        WHERE zone = ? 
        AND isActive = true 
        AND date BETWEEN ? AND ? 
        AND currentBookings < capacity 
        ORDER BY 
            ABS(DATEDIFF(date, ?)) ASC,  # Prefer dates closer to preferred date
            priority DESC,                # Prefer higher priority slots
            startTime ASC                # Prefer earlier times
        LIMIT 5
    `, [preferredZone, searchCriteria.date.start, searchCriteria.date.end, preferredDate])
    
    # Apply filtering and scoring
    alternativeSlots = []
    
    for each slot in availableSlots:
        # Calculate availability percentage
        availabilityPercentage = ((slot.capacity - slot.currentBookings) / slot.capacity) * 100
        
        # Calculate time difference score
        timeDifference = calculateTimeDifference(preferredSlot, slot)
        timeScore = calculateTimeScore(timeDifference)
        
        # Calculate final score
        finalScore = (availabilityPercentage * 0.4) + (timeScore * 0.6)
        
        # Add to alternatives with metadata
        alternativeSlot = slot
        alternativeSlot.availabilityPercentage = availabilityPercentage
        alternativeSlot.score = finalScore
        alternativeSlot.timeDifferenceMinutes = timeDifference
        
        alternativeSlots.add(alternativeSlot)
    
    # Sort by score (descending) and return all
    sortedAlternatives = sortByScore(alternativeSlots, "DESC")
    return sortedAlternatives
```

### Function: isSlotAvailable(slot)
```
function isSlotAvailable(slot):
    if slot is null:
        return false
    
    if not slot.isActive:
        return false
    
    # Check if slot is in the past
    currentDateTime = getCurrentDateTime()
    slotDateTime = combineDateTime(slot.date, slot.startTime)
    
    if slotDateTime <= currentDateTime:
        return false
    
    # Check if slot is too far in the future (e.g., more than 30 days)
    maxFutureDate = addDays(currentDateTime, 30)
    if slotDateTime > maxFutureDate:
        return false
    
    # Check booking window (e.g., must book at least a day in advance)
    minimumBookingAdvance = addHours(currentDateTime, 24)
    if slotDateTime < minimumBookingAdvance:
        return false
    
    return true
```


### Function: processSlotCancellation(bookingReference)
```
function processSlotCancellation(bookingReference):
    startTransaction()
    
    try:
        # Find and validate booking
        booking = findBookingByReference(bookingReference)
        
        if booking is null:
            return createErrorResult("Booking not found")
        
        if booking.status == "CANCELLED":
            return createErrorResult("Booking already cancelled")
        
        # Check cancellation policy
        slot = getSlotById(booking.slotId)
        currentTime = getCurrentDateTime()
        slotTime = combineDateTime(slot.date, slot.startTime)
        
        if (slotTime - currentTime) < getCancellationMinimumTime():
            return createErrorResult("Cannot cancel - too close to delivery time")
        
        # Process cancellation
        updateBookingStatus(booking.id, "CANCELLED")
        decrementSlotBookingCount(booking.slotId)
        
        # Notify waiting customers if there's a waitlist
        notifyWaitlistCustomers(booking.slotId)
        
        # Process refund if applicable
        if isRefundEligible(booking):
            processRefund(booking)
        
        commitTransaction()
        
        return {
            success: true,
            message: "Booking cancelled successfully",
            refundProcessed: isRefundEligible(booking)
        }
        
    catch (Exception e):
        rollbackTransaction()
        
        console.error(`Error in Cancellation failed: ${e.message}`)
        console.error(`Timestamp: ${getCurrentDateTime()}`)
        
        return createErrorResult("Cancellation failed due to system error")
```

## Real-time Slot Updates Function

### Function: getAvailableSlots(zone, startDate, endDate)
```
function getAvailableSlots(zone, startDate, endDate):
    # This function provides real-time slot availability for the frontend
    
    # Get all slots in the specified range
    slots = database.query(`
        SELECT slotId, date, startTime, endTime, capacity, currentBookings, 
               price, (capacity - currentBookings) as availableSpots
        FROM DeliverySlots 
        WHERE zone = ? 
        AND date BETWEEN ? AND ? 
        AND isActive = true
        ORDER BY date ASC, startTime ASC
    `, [zone, startDate, endDate])
    
    availableSlots = []
    
    for each slot in slots:
        # Check real-time availability
        if isSlotAvailable(slot) and slot.availableSpots > 0:
            # Calculate demand indicator
            demandLevel = calculateDemandLevel(slot)
            
            # Add real-time metadata
            slotInfo = {
                slotId: slot.slotId,
                date: slot.date,
                startTime: slot.startTime,
                endTime: slot.endTime,
                availableSpots: slot.availableSpots,
                totalCapacity: slot.capacity,
                price: slot.price,
                demandLevel: demandLevel,  # "LOW", "MEDIUM", "HIGH"
                isPopular: demandLevel == "HIGH",
                estimatedFillTime: estimateSlotFillTime(slot)
            }
            
            availableSlots.add(slotInfo)
    
    return availableSlots
```

### helper Function: createErrorResult(message)
```
function createErrorResult(message):
    return BookingResult {
        success: false,
        allocatedSlotId: null,
        message: message,
        suggestedAlternatives: [],
        bookingReference: null
    }
``` 

### idea that could be included later on

make a function that handles situations when delivery slots are getting overwhelmed with bookings (high demand on a specific slot). The implementation could include:

- Additional slot creation:
Opens more delivery windows
- Priority queuing:
VIP customers get preference 
- Operations alerts:
Notifies staff about capacity issues

- Dynamic pricing:
Potentially increases prices during peak demand


## Usage Example

### Example: Customer selects a delivery slot
```
# Customer request comes from frontend
customerRequest = {
    customerId: "CUST12345",
    orderId: "ORD67890",
    preferredSlotId: "SLOT_2024_01_15_14_00",
    zone: "DOWNTOWN",
    priority: 1
}

# Process the booking request
result = processBookingRequest(customerRequest)

if result.success:
    # Send success response to frontend
    return {
        status: "SUCCESS",
        message: result.message,
        bookingReference: result.bookingReference,
        slotDetails: getSlotDetails(result.allocatedSlotId)
    }
else:
    # Send alternatives to frontend
    return {
        status: "SLOT_UNAVAILABLE", 
        message: result.message,
        alternatives: result.suggestedAlternatives
    }
```
