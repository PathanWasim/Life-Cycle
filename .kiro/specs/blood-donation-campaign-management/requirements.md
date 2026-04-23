# Requirements Document

## Introduction

The Blood Donation Campaign Management feature extends the LifeChain blood supply management system to enable hospitals to organize and manage blood donation campaigns at specific locations and times. This feature allows donors to discover, register for, and participate in campaigns, while providing administrators with tools to manage post-campaign blood distribution. Additionally, donors gain visibility into regional blood availability to understand community needs.

This feature addresses the need for proactive blood collection through organized campaigns, streamlines the donation process at campaign venues, and improves transparency around blood availability across regions.

## Glossary

- **Campaign_System**: The blood donation campaign management subsystem
- **Campaign**: A scheduled blood donation event at a specific location and time
- **Campaign_Creator**: A verified hospital user creating a campaign
- **Campaign_Participant**: A donor who has registered for a campaign
- **Campaign_Status**: The lifecycle state of a campaign (Draft, Active, Completed, Cancelled)
- **Donation_Record**: A blood unit collected during a campaign
- **Transfer_Request**: A request from a hospital to receive blood collected during a campaign
- **Regional_Inventory**: Blood units available in a specific geographic area (city/pincode)
- **Eligibility_Check**: Validation of donor criteria (age 18-60, weight ≥50kg, 56-day rule)
- **Campaign_Venue**: The physical location where a campaign takes place
- **Target_Quantity**: The number of blood units a campaign aims to collect
- **Blood_Distribution**: The process of allocating collected blood to hospitals post-campaign

## Requirements

### Requirement 1: Campaign Creation by Hospitals

**User Story:** As a verified hospital, I want to create blood donation campaigns with specific details, so that I can organize community blood drives and collect blood efficiently.

#### Acceptance Criteria

1. THE Campaign_System SHALL allow only verified hospitals to create campaigns
2. WHEN a Campaign_Creator creates a campaign, THE Campaign_System SHALL require location (address/venue), date, time, blood groups needed, and target quantity
3. WHEN a campaign is created, THE Campaign_System SHALL set the initial Campaign_Status to "Draft"
4. THE Campaign_System SHALL generate a unique campaign identifier for each campaign
5. WHEN a Campaign_Creator saves a campaign, THE Campaign_System SHALL store the campaign in the database with the creating hospital's identifier
6. THE Campaign_System SHALL validate that the campaign date is in the future
7. THE Campaign_System SHALL validate that target quantity is a positive integer
8. THE Campaign_System SHALL allow campaigns to specify one or more blood groups from the set (A+, A-, B+, B-, AB+, AB-, O+, O-)

### Requirement 2: Campaign Status Management

**User Story:** As a hospital, I want to manage campaign lifecycle states, so that I can control when campaigns are visible to donors and track their progress.

#### Acceptance Criteria

1. THE Campaign_System SHALL support four Campaign_Status values: "Draft", "Active", "Completed", "Cancelled"
2. WHEN a Campaign_Creator changes status from "Draft" to "Active", THE Campaign_System SHALL make the campaign visible to donors
3. WHILE a campaign has Campaign_Status "Draft", THE Campaign_System SHALL hide the campaign from donor views
4. WHEN a campaign date and time have passed, THE Campaign_System SHALL allow the Campaign_Creator to change Campaign_Status to "Completed"
5. THE Campaign_System SHALL allow the Campaign_Creator to change Campaign_Status to "Cancelled" at any time before completion
6. WHEN Campaign_Status changes to "Cancelled", THE Campaign_System SHALL notify all registered Campaign_Participants via email
7. THE Campaign_System SHALL prevent status changes from "Completed" or "Cancelled" to any other status

### Requirement 3: Automatic Campaign Invitation System

**User Story:** As a hospital creating a campaign, I want the system to automatically invite eligible donors in the campaign location, so that I can proactively reach potential donors without manual outreach.

#### Acceptance Criteria

1. WHEN a Campaign_Creator changes Campaign_Status from "Draft" to "Active", THE Campaign_System SHALL automatically find eligible donors in the campaign location
2. THE Campaign_System SHALL filter donors by matching blood group with campaign needs
3. THE Campaign_System SHALL filter donors by matching location (donor's city OR pincode matches campaign location)
4. WHEN filtering donors, THE Campaign_System SHALL perform an Eligibility_Check for each donor (age 18-60, weight ≥50kg, 56-day rule)
5. THE Campaign_System SHALL send invitation emails to all eligible donors matching blood group, location, and eligibility criteria
6. THE Campaign_System SHALL include campaign details in the invitation email: venue, date, time, blood groups needed, target quantity, and hospital contact information
7. THE Campaign_System SHALL include a registration link in the invitation email
8. THE Campaign_System SHALL allow donors to ignore the invitation without any action required
9. THE Campaign_System SHALL allow donors to register for the campaign by clicking the registration link
10. THE Campaign_System SHALL record which donors received invitations for each campaign
11. THE Campaign_System SHALL display the number of invitations sent when a campaign becomes active

### Requirement 4: Campaign Discovery by Donors

**User Story:** As a donor, I want to view active blood donation campaigns in my area, so that I can find convenient opportunities to donate blood.

#### Acceptance Criteria

1. THE Campaign_System SHALL display all campaigns with Campaign_Status "Active" to donors
2. WHEN a donor views campaigns, THE Campaign_System SHALL filter campaigns by matching the donor's city OR pincode with the campaign location
3. THE Campaign_System SHALL display campaign details including venue, date, time, blood groups needed, and target quantity
4. THE Campaign_System SHALL show the creating hospital's name and location for each campaign
5. THE Campaign_System SHALL display the number of donors already registered for each campaign
6. THE Campaign_System SHALL sort campaigns by date with nearest campaigns first
7. THE Campaign_System SHALL allow donors to view campaigns without requiring registration

### Requirement 5: Campaign Registration by Donors

**User Story:** As a donor, I want to register for blood donation campaigns, so that I can commit to donating at a specific event and help organizers plan.

#### Acceptance Criteria

1. WHEN a donor attempts to register for a campaign, THE Campaign_System SHALL perform an Eligibility_Check
2. IF the Eligibility_Check fails (age not 18-60, weight <50kg, or <56 days since last donation), THEN THE Campaign_System SHALL reject the registration and display the specific reason
3. WHEN a donor passes the Eligibility_Check, THE Campaign_System SHALL allow registration for the campaign
4. THE Campaign_System SHALL prevent a donor from registering for the same campaign multiple times
5. WHEN a donor registers successfully, THE Campaign_System SHALL add the donor to the campaign's participant list
6. WHEN a donor registers successfully, THE Campaign_System SHALL send a confirmation email with campaign details
7. THE Campaign_System SHALL allow donors to view all campaigns they have registered for
8. THE Campaign_System SHALL allow donors to cancel their registration before the campaign date

### Requirement 6: Campaign Attendance Tracking and Donation Recording

**User Story:** As a hospital managing a campaign, I want to track participant attendance and verify donations, so that I can manage the campaign effectively and follow up with absent donors.

#### Acceptance Criteria

1. WHEN a hospital views their campaign, THE Campaign_System SHALL display a list of all registered Campaign_Participants
2. THE Campaign_System SHALL display attendance status for each participant: "Registered", "Marked Done by Donor", "Verified by Hospital", "Absent"
3. WHEN a campaign date arrives, THE Campaign_System SHALL allow registered Campaign_Participants to mark their donation as "done"
4. THE Campaign_System SHALL display a "Mark as Done" action only for campaigns the donor is registered for and that are happening today
5. WHEN a donor marks donation as "done", THE Campaign_System SHALL update their attendance status to "Marked Done by Donor"
6. THE Campaign_System SHALL prevent donors from marking the same campaign donation as "done" multiple times
7. WHEN a hospital views participants with status "Marked Done by Donor", THE Campaign_System SHALL allow the hospital to verify the donation
8. WHEN a hospital verifies a donation, THE Campaign_System SHALL create a blood unit following the standard donation recording process
9. WHEN a hospital verifies a donation, THE Campaign_System SHALL update the participant's attendance status to "Verified by Hospital"
10. WHEN a hospital verifies a donation, THE Campaign_System SHALL record the donation with the campaign identifier, blood group, and collection date
11. WHEN a hospital verifies a donation, THE Campaign_System SHALL record a blockchain milestone for the donation
12. THE Campaign_System SHALL update the donor's lastDonationDate when the hospital verifies the donation
13. WHEN a campaign date has passed, THE Campaign_System SHALL allow the hospital to mark registered participants who did not show up as "Absent"
14. WHEN a participant is marked as "Absent", THE Campaign_System SHALL display their contact information to the hospital for follow-up
15. THE Campaign_System SHALL provide the hospital with full visibility and control over campaign participation tracking

### Requirement 7: Post-Campaign Blood Distribution

**User Story:** As an administrator, I want to review collected blood from campaigns and decide which hospitals should receive it, so that blood is distributed based on need and capacity.

#### Acceptance Criteria

1. WHEN a campaign reaches Campaign_Status "Completed", THE Campaign_System SHALL make the campaign available for admin review
2. THE Campaign_System SHALL display all blood units collected during the campaign with their blood groups and collection dates
3. THE Campaign_System SHALL allow the admin to view Transfer_Requests from hospitals for campaign blood
4. WHEN a hospital submits a Transfer_Request, THE Campaign_System SHALL require the hospital identifier, requested blood groups, and requested quantity
5. THE Campaign_System SHALL allow the admin to approve or reject each Transfer_Request
6. WHEN the admin approves a Transfer_Request, THE Campaign_System SHALL transfer the specified blood units to the requesting hospital
7. WHEN blood units are transferred, THE Campaign_System SHALL record a blockchain milestone for each transfer
8. WHEN blood units are transferred, THE Campaign_System SHALL update the currentHospitalID to the receiving hospital
9. THE Campaign_System SHALL prevent transferring more blood units than were collected in the campaign
10. THE Campaign_System SHALL send email notifications to hospitals when their Transfer_Requests are approved or rejected

### Requirement 8: Public Regional Blood Availability

**User Story:** As any user (including unauthenticated visitors), I want to view available blood units in a specific region, so that I can find blood in emergencies and contact hospitals directly.

#### Acceptance Criteria

1. THE Campaign_System SHALL allow unauthenticated users to access Regional_Inventory without requiring login
2. THE Campaign_System SHALL allow users to search Regional_Inventory by city OR pincode
3. WHEN a user searches by location, THE Campaign_System SHALL display blood units with status "Collected" or "Stored" in hospitals matching the specified city OR pincode
4. THE Campaign_System SHALL display blood group, quantity, hospital name, and hospital contact information for each available blood unit
5. THE Campaign_System SHALL allow users to filter Regional_Inventory by blood group
6. THE Campaign_System SHALL display the total count of available units for each blood group in the searched region
7. THE Campaign_System SHALL update Regional_Inventory in real-time as blood units are collected, transferred, or used
8. THE Campaign_System SHALL NOT display expired blood units (>42 days since collection) in Regional_Inventory
9. THE Campaign_System SHALL display hospital phone number and email address to enable emergency contact
10. THE Campaign_System SHALL allow users to expand the search radius to include nearby cities or pincodes

### Requirement 9: Campaign Analytics and Reporting

**User Story:** As a hospital, I want to view analytics for my campaigns, so that I can measure success and improve future campaigns.

#### Acceptance Criteria

1. THE Campaign_System SHALL display the number of registered donors for each campaign
2. THE Campaign_System SHALL display the number of donors who marked donation as "done" for each campaign
3. THE Campaign_System SHALL display the number of verified donations for each campaign
4. WHEN a campaign is completed, THE Campaign_System SHALL calculate the collection rate (verified donations / registered donors)
5. THE Campaign_System SHALL display the total blood units collected by blood group for each campaign
6. THE Campaign_System SHALL compare target quantity with actual collected quantity
7. THE Campaign_System SHALL allow hospitals to view historical campaign data for analysis

### Requirement 10: Campaign Notification System

**User Story:** As a donor, I want to receive timely notifications about campaigns, so that I don't miss important updates or reminders.

#### Acceptance Criteria

1. WHEN a campaign becomes active, THE Campaign_System SHALL send invitation emails to all eligible donors in the campaign location
2. WHEN a donor registers for a campaign, THE Campaign_System SHALL send a confirmation email with campaign details
3. WHEN a campaign is 24 hours away, THE Campaign_System SHALL send a reminder email to all registered Campaign_Participants
4. WHEN a campaign is cancelled, THE Campaign_System SHALL send a cancellation email to all registered Campaign_Participants
5. WHEN a campaign date or time changes, THE Campaign_System SHALL send an update email to all registered Campaign_Participants
6. WHEN a donor's donation is verified by the hospital, THE Campaign_System SHALL send a thank-you email with the blood unit identifier
7. THE Campaign_System SHALL include campaign venue, date, time, and hospital contact information in all notification emails
8. THE Campaign_System SHALL include a registration link in invitation emails

### Requirement 11: Campaign Search and Filtering

**User Story:** As a donor, I want to search and filter campaigns, so that I can find campaigns that match my preferences and availability.

#### Acceptance Criteria

1. THE Campaign_System SHALL allow donors to filter campaigns by date range
2. THE Campaign_System SHALL allow donors to filter campaigns by blood group
3. THE Campaign_System SHALL allow donors to filter campaigns by city or pincode
4. THE Campaign_System SHALL allow donors to search campaigns by venue name or hospital name
5. WHEN multiple filters are applied, THE Campaign_System SHALL display campaigns matching all filter criteria
6. THE Campaign_System SHALL display a count of campaigns matching the current filter criteria
7. THE Campaign_System SHALL allow donors to clear all filters and view all active campaigns
