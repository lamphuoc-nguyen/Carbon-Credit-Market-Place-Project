---
# Fill in the fields below to create a basic custom agent for your repository.
# The Copilot CLI can be used for local testing: https://gh.io/customagents/cli
# To make this agent available, merge this file into the default repository branch.
# For format details, see: https://gh.io/customagents/config

name:
description:
---

# My Agent

Original prompt
Verified credit tab issues in CVA Adding location to user with Vietnam provinces Enabling seller location selection in listings Error checking for missing information CVA viewing journey data in credit request transfer

TITLE: CVA Verified Credit Tab and Location Features Implementation

USER INTENT: Fix verified credit tab functionality in CVA and implement location features for users and sellers, plus improve error handling and journey data visibility.

TASK DESCRIPTION: The user needs to address multiple issues and features:

Fix the verified credit tab in CVA where users cannot get verified credit
Add location functionality to users with Vietnam province options
Enable seller location selection in listings
Implement error checking for missing information
Update CVA to view journey data in credit request transfers
EXISTING:

CVA (Credit Verification Application) system exists with a verified credit tab
Listing functionality exists for sellers
Credit request transfer system is in place
PENDING:

Debug and fix verified credit retrieval in CVA verified credit tab
Implement user location feature with Vietnam provinces dropdown/selection
Add location selection capability for sellers in listing creation/management
Implement missing information validation and error checking
Add journey data visibility for CVA in credit request transfer process
CODE STATE:

CVA verified credit tab - not functioning properly (needs debugging)
User management system - requires location field addition
Listing system - needs seller location selection feature
Credit request transfer system - requires journey data integration for CVA view
RELEVANT CODE/DOCUMENTATION SNIPPETS:

No specific code snippets provided in the conversation
Vietnam provinces data will need to be integrated for location selection
CVA interface requires modification for verified credit tab and journey data viewing
OTHER NOTES:

The work is being tracked in a pull request
Multiple features need to be implemented across different parts of the system (CVA, user management, listings, credit transfers)
Focus on Vietnam-specific location data suggests this is for a Vietnamese market application
Error handling improvements needed for better user experience
