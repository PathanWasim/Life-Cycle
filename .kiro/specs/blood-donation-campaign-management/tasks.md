# Implementation Plan: Blood Donation Campaign Management

## Overview

This implementation plan breaks down the blood donation campaign management feature into discrete coding tasks. Each task builds incrementally on previous work, following the existing LifeChain architecture patterns. The implementation includes database models, API endpoints, business logic, email templates, and frontend components.

## Tasks

- [x] 1. Set up database models and schema
  - [x] 1.1 Create Campaign model with validation
    - Create `backend/models/Campaign.js` with complete schema
    - Include campaign status enum, venue structure, and blood group validation
    - Add pre-save hooks for campaignID generation
    - Add methods for status transitions and eligibility checks
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_
  
  - [x] 1.2 Create CampaignParticipant model
    - Create `backend/models/CampaignParticipant.js` with attendance tracking
    - Include registration source tracking and verification fields
    - Add compound unique index for campaignID + donorID
    - Add methods for attendance status updates
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_
  
  - [x] 1.3 Update BloodUnit model for campaign integration
    - Add campaignID and campaignDonation fields to existing BloodUnit model
    - Update indexes to include campaign-related fields
    - Ensure backward compatibility with existing blood units
    - _Requirements: 6.9, 6.10, 6.11, 6.12_

- [x] 2. Implement core campaign management APIs
  - [x] 2.1 Create campaign CRUD endpoints
    - Implement POST `/api/hospital/campaigns` for campaign creation
    - Implement GET `/api/hospital/campaigns` with filtering and pagination
    - Implement PATCH `/api/hospital/campaigns/:id` for updates
    - Implement DELETE `/api/hospital/campaigns/:id` for deletion
    - Add role-based access control (verified hospitals only)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_
  
  - [x] 2.2 Implement campaign status management
    - Create PATCH `/api/hospital/campaigns/:id/status` endpoint
    - Implement status transition validation (Draft→Active→Completed/Cancelled)
    - Add automatic invitation triggering when status changes to Active
    - Prevent invalid status transitions
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  
  - [ ]* 2.3 Write unit tests for campaign CRUD operations
    - Test campaign creation with valid and invalid data
    - Test status transitions and validation rules
    - Test access control and permissions
    - _Requirements: 1.1, 2.1_

- [x] 3. Implement automatic invitation system
  - [x] 3.1 Create donor discovery and filtering logic
    - Implement function to find eligible donors by location and blood group
    - Add eligibility validation (age, weight, 56-day rule)
    - Create location matching logic (city OR pincode)
    - Filter donors by campaign blood group requirements
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 3.2 Implement invitation email system
    - Create campaign invitation email template
    - Implement batch email sending with rate limiting
    - Add invitation tracking (which donors were notified)
    - Include registration link in invitation emails
    - Update campaign with invitation statistics
    - _Requirements: 3.6, 3.7, 3.8, 3.9, 3.10, 3.11_
  
  - [ ]* 3.3 Write unit tests for invitation system
    - Test donor filtering logic with various scenarios
    - Test email template generation and sending
    - Test invitation tracking and statistics
    - _Requirements: 3.1, 3.6_

- [x] 4. Implement campaign discovery and registration
  - [x] 4.1 Create public campaign discovery API
    - Implement GET `/api/campaigns/active` for campaign browsing
    - Add filtering by location, blood group, and date range
    - Include pagination and sorting (nearest campaigns first)
    - Show campaign details and registration counts
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_
  
  - [x] 4.2 Implement campaign registration system
    - Create POST `/api/campaigns/:id/register` endpoint
    - Add comprehensive eligibility validation
    - Prevent duplicate registrations
    - Send confirmation email upon successful registration
    - Track registration source (invitation vs discovery)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_
  
  - [x] 4.3 Create donor campaign management endpoints
    - Implement GET `/api/donor/campaigns` for registered campaigns
    - Create POST `/api/campaigns/:id/mark-done` for attendance marking
    - Add campaign cancellation functionality
    - Include campaign status and attendance tracking
    - _Requirements: 5.7, 6.3, 6.4, 6.5, 6.6_
  
  - [ ]* 4.4 Write integration tests for registration flow
    - Test complete registration workflow
    - Test eligibility validation edge cases
    - Test email confirmation sending
    - _Requirements: 5.1, 5.5_

- [x] 5. Checkpoint - Test campaign creation and registration
  - Ensure all tests pass, verify campaign creation, invitation sending, and donor registration work end-to-end

- [x] 6. Implement attendance tracking and donation verification
  - [x] 6.1 Create participant management API
    - Implement GET `/api/hospital/campaigns/:id/participants` endpoint
    - Show participant list with attendance status
    - Add filtering by attendance status
    - Include donor contact information for follow-up
    - _Requirements: 6.1, 6.2, 6.14, 6.15_
  
  - [x] 6.2 Implement donation verification system
    - Create POST `/api/hospital/campaigns/:id/verify-donation` endpoint
    - Integrate with existing blood unit creation process
    - Link verified donations to campaign and participant records
    - Update participant attendance status to "Verified by Hospital"
    - Record blockchain milestone for campaign donations
    - _Requirements: 6.7, 6.8, 6.9, 6.10, 6.11, 6.12_
  
  - [x] 6.3 Add absence marking functionality
    - Create PATCH `/api/hospital/campaigns/:id/participants/:donorId/absent` endpoint
    - Allow hospitals to mark no-show participants as "Absent"
    - Provide contact information for follow-up
    - Update campaign statistics
    - _Requirements: 6.13, 6.14_
  
  - [ ]* 6.4 Write unit tests for verification system
    - Test donation verification with blockchain integration
    - Test attendance status transitions
    - Test campaign statistics updates
    - _Requirements: 6.8, 6.9_

- [x] 7. Implement public blood availability feature
  - [x] 7.1 Create regional blood search API
    - Implement GET `/api/public/blood-availability` endpoint (no auth required)
    - Add location-based filtering (city OR pincode)
    - Include blood group filtering
    - Aggregate blood units by hospital and blood group
    - Exclude expired blood units (>42 days)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_
  
  - [x] 7.2 Add hospital contact information display
    - Include hospital phone and email in availability results
    - Show total available units per blood group
    - Add real-time inventory updates
    - Implement search radius expansion for nearby locations
    - _Requirements: 8.9, 8.10_
  
  - [ ]* 7.3 Write unit tests for public blood search
    - Test location-based filtering logic
    - Test blood group aggregation
    - Test expired unit exclusion
    - _Requirements: 8.3, 8.8_

- [x] 8. Implement campaign analytics and reporting
  - [x] 8.1 Add campaign statistics tracking
    - Update campaign model with analytics fields
    - Track registration count, attendance rate, and collection rate
    - Calculate target vs actual collection comparison
    - Add real-time statistics updates
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_
  
  - [x] 8.2 Create campaign analytics API
    - Implement GET `/api/hospital/campaigns/:id/analytics` endpoint
    - Show detailed campaign performance metrics
    - Include historical campaign data for hospitals
    - Add blood group breakdown for collections
    - _Requirements: 9.7_
  
  - [ ]* 8.3 Write unit tests for analytics system
    - Test statistics calculation accuracy
    - Test real-time updates
    - Test historical data aggregation
    - _Requirements: 9.4, 9.5_

- [x] 9. Implement notification system
  - [x] 9.1 Create email templates for all campaign notifications
    - Design campaign invitation email template
    - Create registration confirmation email template
    - Add 24-hour reminder email template
    - Create cancellation notification template
    - Add donation verification thank-you email
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.6, 10.7, 10.8_
  
  - [x] 9.2 Implement scheduled reminder system
    - Create job scheduler for 24-hour campaign reminders
    - Add campaign update notifications
    - Implement cancellation email broadcasting
    - Add thank-you email after donation verification
    - _Requirements: 10.3, 10.5, 10.6_
  
  - [ ]* 9.3 Write unit tests for notification system
    - Test email template generation
    - Test scheduled reminder functionality
    - Test notification triggering logic
    - _Requirements: 10.1, 10.3_

- [x] 10. Implement search and filtering features
  - [x] 10.1 Add advanced campaign filtering
    - Implement date range filtering for campaigns
    - Add blood group filtering for donors
    - Create location-based filtering (city/pincode)
    - Add venue name and hospital name search
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  
  - [x] 10.2 Create campaign search functionality
    - Implement text search across campaign titles and descriptions
    - Add multi-criteria filtering support
    - Include result count display
    - Add filter clearing functionality
    - _Requirements: 11.5, 11.6, 11.7_
  
  - [ ]* 10.3 Write unit tests for search and filtering
    - Test various filter combinations
    - Test search query processing
    - Test result accuracy and performance
    - _Requirements: 11.5, 11.6_

- [x] 11. Create frontend components for hospitals
  - [x] 11.1 Build campaign management dashboard
    - Create `frontend/src/pages/CampaignDashboard.jsx`
    - Display campaign list with status indicators
    - Add campaign creation button and quick stats
    - Implement filtering and search functionality
    - Include campaign status management controls
    - _Requirements: 1.1, 2.1, 9.1_
  
  - [x] 11.2 Create campaign creation form
    - Build `frontend/src/components/CreateCampaign.jsx`
    - Add form validation for all required fields
    - Include date/time pickers and venue information
    - Add blood group multi-select component
    - Implement save as draft and activate options
    - _Requirements: 1.1, 1.2, 1.6, 1.7, 1.8_
  
  - [x] 11.3 Build campaign details and participant management
    - Create `frontend/src/pages/CampaignDetails.jsx`
    - Display campaign information and participant list
    - Add attendance status indicators and verification buttons
    - Include campaign analytics and statistics
    - Implement participant filtering and search
    - _Requirements: 6.1, 6.2, 6.7, 6.8, 9.1_

- [x] 12. Create frontend components for donors
  - [x] 12.1 Build campaign discovery interface
    - Create `frontend/src/pages/CampaignDiscovery.jsx`
    - Display active campaigns with filtering options
    - Add location-based campaign suggestions
    - Include registration buttons and campaign details
    - Implement search and filter controls
    - _Requirements: 4.1, 4.2, 4.3, 11.1, 11.2, 11.3_
  
  - [x] 12.2 Create donor campaign management
    - Build `frontend/src/pages/MyRegistrations.jsx`
    - Show registered campaigns with attendance status
    - Add "Mark as Done" functionality for campaign day
    - Include campaign details and hospital contact info
    - Display registration history and statistics
    - _Requirements: 5.7, 6.3, 6.4, 6.5_
  
  - [x] 12.3 Build campaign registration components
    - Create `frontend/src/components/CampaignCard.jsx`
    - Display campaign information in card format
    - Add registration/cancellation buttons
    - Show eligibility status and requirements
    - Include venue directions and contact information
    - _Requirements: 4.4, 4.5, 5.1, 5.8_

- [x] 13. Create public blood search interface
  - [x] 13.1 Build public blood availability search
    - Create `frontend/src/pages/PublicBloodSearch.jsx`
    - Add location search (city/pincode) without authentication
    - Include blood group filtering and availability display
    - Show hospital contact information for emergencies
    - Add search radius expansion options
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.9, 8.10_
  
  - [x] 13.2 Create emergency contact components
    - Build hospital contact cards with phone/email
    - Add click-to-call and email functionality
    - Display real-time availability updates
    - Include emergency usage instructions
    - _Requirements: 8.9, 8.10_

- [x] 14. Implement API integration and state management
  - [x] 14.1 Create campaign API service layer
    - Build `frontend/src/services/campaignService.js`
    - Implement all campaign-related API calls
    - Add error handling and response formatting
    - Include authentication token management
    - Add request caching for performance
    - _Requirements: All API endpoints_
  
  - [x] 14.2 Add campaign state management
    - Create Redux/Context state for campaign data
    - Implement real-time updates for campaign status
    - Add optimistic updates for better UX
    - Include error state management
    - _Requirements: All frontend components_

- [x] 15. Checkpoint - Test complete campaign workflow
  - Ensure all tests pass, verify end-to-end campaign creation, invitation, registration, and verification workflow

- [ ] 16. Add database indexes and performance optimization
  - [x] 16.1 Create database indexes for performance
    - Add indexes for campaign queries (location, status, date)
    - Create compound indexes for participant lookups
    - Add indexes for public blood availability queries
    - Optimize existing BloodUnit indexes for campaign integration
    - _Requirements: Performance optimization_
  
  - [x] 16.2 Implement caching strategy
    - Add Redis caching for public blood availability
    - Cache active campaigns list with 2-minute TTL
    - Implement campaign details caching
    - Add hospital verification status caching
    - _Requirements: Performance optimization_

- [ ] 17. Add comprehensive error handling and validation
  - [x] 17.1 Implement robust API error handling
    - Add comprehensive input validation for all endpoints
    - Implement proper HTTP status codes and error messages
    - Add rate limiting for campaign operations
    - Include request logging and monitoring
    - _Requirements: Security and reliability_
  
  - [x] 17.2 Add frontend error handling
    - Implement error boundaries for campaign components
    - Add user-friendly error messages
    - Include retry mechanisms for failed requests
    - Add loading states and progress indicators
    - _Requirements: User experience_

- [ ] 18. Integration testing and final verification
  - [x] 18.1 Create end-to-end integration tests
    - Test complete campaign lifecycle from creation to completion
    - Verify invitation system with email delivery
    - Test registration and verification workflow
    - Validate public blood search functionality
    - _Requirements: All requirements_
  
  - [ ]* 18.2 Write comprehensive test suite
    - Add API endpoint tests for all campaign functionality
    - Create frontend component tests
    - Add database integration tests
    - Include performance and load testing
    - _Requirements: All requirements_
  
  - [x] 18.3 Perform security audit and validation
    - Verify access control for all endpoints
    - Test input validation and sanitization
    - Validate rate limiting and abuse prevention
    - Check for SQL injection and XSS vulnerabilities
    - _Requirements: Security requirements_

- [x] 19. Final checkpoint - Complete system verification
  - Ensure all tests pass, verify complete campaign management system works end-to-end with all features functional

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and early issue detection
- The implementation follows existing LifeChain patterns and architecture
- All campaign functionality integrates seamlessly with existing blood management system
- Email system leverages existing SMTP configuration and templates
- Blockchain integration uses existing smart contract and retry mechanisms
- Frontend components follow existing design patterns and styling
- Database changes maintain backward compatibility with existing data