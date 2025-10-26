# E2E Test Mapping and Details

Note: File and test names below refer to specs under `cypress/e2e/*.cy.js` as implemented previously.

## 1) Signup as a student
- File + it(): `cypress/e2e/auth.cy.js` → `it('signs up a new user and redirects to /')` DONE D
- TEST SCENARIO: Signup (happy)
- TEST CASE: Create new student with valid data
- PRE-CONDITION: Email not previously registered; signup auto-logs-in (no email confirmation)
- TEST STEPS: visit /signup → enter name/email/password/confirm → (optionally choose Student role) → click Sign Up
- TEST DATA: name=Test User <timestamp> (random), email=newuser+<timestamp>@test.com (random), password=Password123!
- EXPECTED RESULT: Redirect to /
- POST-CONDITION: New user session active
- ACTUAL RESULT: Observed redirect to /

Rainy (duplicate):
- File + it(): `cypress/e2e/auth.cy.js` → `it('prevents duplicate email signup and stays on page')` DONE D
- TEST SCENARIO: Signup (duplicate email)
- TEST CASE: Use existing email
- PRE-CONDITION: Email `m.ay.albilaly@gmail.com` already exists
- TEST STEPS: /signup → fill name/existing email/password/confirm → click Sign Up
- TEST DATA: name=Duplicate User, email=`m.ay.albilaly@gmail.com`, password=Password123!
- EXPECTED RESULT: Error shown; remain on /signup
- POST-CONDITION: No new user created
- ACTUAL RESULT: Remained on /signup

## 2) Log in as a student
- File + it(): `cypress/e2e/auth.cy.js` → `it('logs in as normal user and lands on /')` DONE D
- TEST SCENARIO: Login (happy)
- TEST CASE: Valid student credentials
- PRE-CONDITION: User exists: `ayman@ayman.com` / `Ayman123`
- TEST STEPS: /login → enter email/password → click Login
- TEST DATA: `ayman@ayman.com`, `Ayman123`
- EXPECTED RESULT: Redirect to /
- POST-CONDITION: Session active
- ACTUAL RESULT: Redirected to /

Rainy (invalid creds):
- File + it(): `cypress/e2e/auth.cy.js` → `it('handles wrong credentials gracefully')`  DONE X D
- TEST SCENARIO: Login (invalid credentials)
- TEST CASE: Wrong email/password
- PRE-CONDITION: None
- TEST STEPS: /login → enter wrong creds → click Login
- TEST DATA: `wrong@example.com`, `WrongPass123`
- EXPECTED RESULT: Stay on /login with error
- POST-CONDITION: No session
- ACTUAL RESULT: Stayed on /login

## 3) Log in as an admin (access dashboard)
- File + it(): `cypress/e2e/auth.cy.js` → `it('logs in as admin and lands on /admin')` DONE D
- TEST SCENARIO: Admin login (happy)
- TEST CASE: Valid admin credentials
- PRE-CONDITION: Admin has `is_admin=true` (`admin1@admin.admin` / `adminADMIN`)
- TEST STEPS: /login → enter admin creds → click Login
- TEST DATA: `admin1@admin.admin`, `adminADMIN`
- EXPECTED RESULT: Redirect to /admin
- POST-CONDITION: Admin session active
- ACTUAL RESULT: Redirected to /admin

Rainy (non-admin trying /admin):
- File + it(): `cypress/e2e/admin.cy.js` → `it('blocks normal user from /admin and redirects away')` DONE D
- TEST SCENARIO: Admin access control
- TEST CASE: Normal user tries to access /admin
- PRE-CONDITION: Non-admin student exists
- TEST STEPS: login as user → visit /admin
- TEST DATA: `ayman@ayman.com`, `Ayman123`
- EXPECTED RESULT: Redirect away (pathname != /admin)
- POST-CONDITION: Not on /admin
- ACTUAL RESULT: Not on /admin

## 4) Manage user (only deleting)
- File + it(): `cypress/e2e/admin.cy.js` → `it('opens delete dialog if delete button is available (conditional)')`                           DONEX     D                                      
- TEST SCENARIO: Manage users (delete path)
- TEST CASE: Open delete confirm dialog and cancel (non-destructive)
- PRE-CONDITION: Admin on /admin; at least one deletable row present
- TEST STEPS: login as admin → /admin → click delete button → verify dialog → click Cancel
- TEST DATA: N/A
- EXPECTED RESULT: Dialog shows and closes; no deletion
- POST-CONDITION: Table unchanged
- ACTUAL RESULT: Dialog observed/canceled (or test logs if no button present)

## 5) Edit profile as a student
- File + it(): `cypress/e2e/profile.cy.js` → `it('edits name and saves successfully')` DONE D
- TEST SCENARIO: Profile edit (happy)
- TEST CASE: Change name and save
- PRE-CONDITION: Student exists and can login
- TEST STEPS: login → open Profile via navbar → Edit Profile → change Name → Save Changes
- TEST DATA: new name = `E2E User <timestamp>` (random)
- EXPECTED RESULT: New name visible in view mode
- POST-CONDITION: Profile updated
- ACTUAL RESULT: New name visible

Rainy (invalid email):
- File + it(): `cypress/e2e/profile.cy.js` → `it('shows validation when email is invalid and stays in edit mode')` DONE D
- TEST SCENARIO: Profile edit (invalid data)
- TEST CASE: Invalid email prevents save and remains in edit mode
- PRE-CONDITION: Student exists and can login
- TEST STEPS: login → /profile → Edit Profile → set invalid email → Save Changes
- TEST DATA: `invalid-email`
- EXPECTED RESULT: Stay in edit mode (Save/Cancel visible)
- POST-CONDITION: No update applied
- ACTUAL RESULT: Still in edit mode

## 6) View profile as a student
- File + it(): `cypress/e2e/profile.cy.js` → `it('shows profile info for logged-in user')` DONE D 10
- TEST SCENARIO: Profile view (happy)
- TEST CASE: See personal info and email on /profile
- PRE-CONDITION: Student exists and can login
- TEST STEPS: login → click Profile (navbar) → assert “Personal Information” and “Email Address” visible
- TEST DATA: `ayman@ayman.com`, `Ayman123`
- EXPECTED RESULT: Info visible
- POST-CONDITION: On /profile
- ACTUAL RESULT: Info visible

Rainy (unauthenticated):
- File + it(): `cypress/e2e/profile.cy.js` → `it('redirects unauthenticated user to /login')` DONE D11
- TEST SCENARIO: Profile view (unauthenticated)
- TEST CASE: Visit /profile without session
- PRE-CONDITION: No active session
- TEST STEPS: visit /profile
- TEST DATA: N/A
- EXPECTED RESULT: Redirect to /login
- POST-CONDITION: Unauthenticated state
- ACTUAL RESULT: Redirected to /login

## 7) Logout as a student
- File + it(): `cypress/e2e/navbar.cy.js` → `it('shows Profile and Logout when logged in, and logout works')` DONE D12
- TEST SCENARIO: Logout (happy)
- TEST CASE: Click Logout from navbar
- PRE-CONDITION: Student exists and can login
- TEST STEPS: login → click Logout
- TEST DATA: `ayman@ayman.com`, `Ayman123`
- EXPECTED RESULT: Redirect to login page
- POST-CONDITION: Session cleared
- ACTUAL RESULT: Redirected to /login

## 8) Reset password as a student
- File + it(): `cypress/e2e/reset_password.cy.js` → `it('sends reset link for valid email')` DONE D13
- TEST SCENARIO: Forgot password (happy)
- TEST CASE: Send reset link for valid email
- PRE-CONDITION: User exists; Supabase can send email
- TEST STEPS: /forgot-password → enter email → Send Reset Link
- TEST DATA: `  `
- EXPECTED RESULT: Success message “Password reset link sent”
- POST-CONDITION: On /forgot-password (sent state)
- ACTUAL RESULT: Success message visible

Rainy (invalid email):
- File + it(): `cypress/e2e/reset_password.cy.js` → `it('shows validation for invalid email')` DONE X D14
- TEST SCENARIO: Forgot password (invalid email)
- TEST CASE: Invalid email format
- PRE-CONDITION: App reachable
- TEST STEPS: /forgot-password → enter invalid email → submit
- TEST DATA: `invalid-email`
- EXPECTED RESULT: Remain on page; validation/error shown
- POST-CONDITION: No email sent
- ACTUAL RESULT: Remained on page

---

Execution note: After running, record pass/fail status for each “ACTUAL RESULT”.

