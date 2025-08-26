# 🔐 FitCoach Plus Platform - E2E Test Credentials

## 📋 Test Environment Setup

This document contains complete testing credentials and setup instructions for end-to-end testing of the FitCoach Plus Platform. All tests use localStorage with optimized JSON for Supabase compatibility.

## 🔑 Test Login Credentials

### Admin Dashboard Access
- **Email**: `admin@fitcoach.com`
- **Password**: `admin123`
- **Role**: Administrator
- **Dashboard**: `/admin`
- **Features**: Complete platform management, user management, analytics

### Trainer Dashboard Access  
- **Email**: `trainer@fitcoach.com`
- **Password**: `trainer123`
- **Role**: Personal Trainer
- **Dashboard**: `/trainer`
- **Features**: Student management, session scheduling, plan creation

### Student Dashboard Access
- **Email**: `student@fitcoach.com`
- **Password**: `student123`
- **Role**: Student/Client
- **Dashboard**: `/student`
- **Features**: Personal profile, workout tracking, nutrition plans

## 🚀 Quick Setup Commands

### Browser Console Setup
Open browser console and run these commands for instant setup:

```javascript
// Enable localStorage testing mode
fitcoachLocalStorageDemo.enableLocalStorage();

// Quick login options
fitcoachLocalStorageDemo.loginAsAdmin();
fitcoachLocalStorageDemo.loginAsTrainer();
fitcoachLocalStorageDemo.loginAsStudent();

// Load test data variations
fitcoachLocalStorageDemo.testFullData();     // Complete dataset
fitcoachLocalStorageDemo.testMinimalData();  // Minimal dataset
fitcoachLocalStorageDemo.testEmptyData();    // Empty state testing

// Navigation helpers
fitcoachLocalStorageDemo.goToAdminDashboard();
fitcoachLocalStorageDemo.goToTrainerDashboard();
fitcoachLocalStorageDemo.goToStudentDashboard();
```

### Programmatic Setup (E2E Tests)
```javascript
// Enable localStorage mode for testing
await page.evaluate(() => {
  localStorage.setItem('fitcoach_use_localStorage', 'true');
  return window.fitcoachLocalStorageDemo?.enableLocalStorage();
});

// Login with specific role
await page.evaluate(async () => {
  await window.fitcoachLocalStorageDemo?.loginAsTrainer();
});
```

## 🧪 Test Data Overview

### User Profiles Available
- **Admin User**: João Silva (admin@fitcoach.com)
- **Trainer User**: Maria Santos (trainer@fitcoach.com)  
- **Student User**: Pedro Costa (student@fitcoach.com)

### Sample Data Included
- **Students**: 5 active students with complete profiles
- **Sessions**: 15 scheduled/completed training sessions
- **Payments**: Payment history with different statuses
- **Diet Plans**: AI-generated nutrition plans
- **Workout Plans**: Comprehensive exercise routines
- **Notifications**: System and user notifications

## 📊 localStorage Structure

### Authentication Data
```json
{
  "fitcoach_auth": {
    "user": { "id": "...", "email": "...", "created_at": "..." },
    "access_token": "mock_token_...",
    "expires_at": 1234567890
  }
}
```

### Platform Data
```json
{
  "fitcoach_data": {
    "users": [...],
    "profiles": [...],
    "trainer_profiles": [...],
    "student_profiles": [...],
    "sessions": [...],
    "payments": [...],
    "diet_plans": [...],
    "workout_plans": [...],
    "notifications": [...],
    "lastUpdated": "2024-01-15T10:30:00Z",
    "dataVersion": "1.0.0"
  }
}
```

## 🔄 E2E Test Flow Coverage

### 1. Landing Page Flow
- ✅ Hero section and navigation
- ✅ Feature tabs interaction
- ✅ Pricing plans display
- ✅ FAQ accordion functionality
- ✅ Login modal opening/closing
- ✅ Responsive design testing

### 2. Authentication Flow
- ✅ Login modal interaction
- ✅ Credential validation
- ✅ Role-based redirection
- ✅ Session persistence
- ✅ Logout functionality

### 3. Admin Dashboard Flow  
- ✅ Dashboard overview and metrics
- ✅ User management interface
- ✅ Trainer management
- ✅ System analytics
- ✅ Platform settings

### 4. Trainer Dashboard Flow
- ✅ Student management
- ✅ Session scheduling
- ✅ Plan creation (diet/workout)
- ✅ Payment tracking
- ✅ Performance analytics

### 5. Student Dashboard Flow
- ✅ Personal profile management
- ✅ Gender selection and menstrual cycle feature
- ✅ Workout plan viewing
- ✅ Nutrition plan tracking
- ✅ Session history

### 6. Subscription Flow
- ✅ Plan selection from landing page
- ✅ Account creation process
- ✅ Payment flow simulation
- ✅ Plan activation
- ✅ Dashboard access after subscription

## 🌸 Special Features Testing

### Menstrual Cycle Feature
- **Activation**: Set gender to "Feminino" in student profile
- **Toggle**: Enable menstrual cycle tracking
- **Adaptive Features**: 
  - Workout intensity adjustment by cycle phase
  - Nutrition adaptation (calories, macros)
  - Educational content per phase
  - Visual indicators and progress tracking

### Expected Behaviors per Phase:
- **🌙 Menstrual**: Light yoga, iron-rich nutrition (2,100 kcal)
- **🌱 Follicular**: Moderate intensity, energy building
- **🌸 Ovulation**: Peak performance, maximum intensity
- **🍂 Luteal**: Gradual reduction, sodium/sugar control

## 🔧 E2E Test Environment Setup

### Prerequisites
1. **localStorage mode enabled**: `fitcoach_use_localStorage = true`
2. **Test data loaded**: Full dataset with all user roles
3. **Demo credentials ready**: All login credentials available

### Test Execution Order
1. **Setup**: Enable localStorage mode and load test data
2. **Landing**: Test landing page functionality
3. **Authentication**: Test login flows for all roles
4. **Dashboards**: Test each dashboard type thoroughly
5. **Features**: Test special features (menstrual cycle tracking)
6. **Subscription**: Test complete subscription flow
7. **Cleanup**: Reset state for next test run

## 📈 Performance Testing Data

### Lighthouse Scores (Target)
- **Performance**: 100/100 ✅
- **Accessibility**: 96/100 ✅  
- **Best Practices**: 95/100 ✅
- **SEO**: 90/100 ✅

### Load Testing Scenarios
- **Concurrent Users**: 100+ simultaneous sessions
- **Data Volume**: 1000+ records per data type
- **Session Duration**: 30+ minute sessions
- **Feature Usage**: All features active simultaneously

## 🔍 Validation Checklist

### ✅ Authentication & Authorization
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (error handling)
- [ ] Role-based dashboard access
- [ ] Session persistence across page reloads
- [ ] Logout functionality

### ✅ Data Integrity
- [ ] localStorage data structure validation
- [ ] Supabase JSON compatibility
- [ ] Data export/import functionality
- [ ] Cross-role data access restrictions

### ✅ User Interface
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] WCAG AA accessibility compliance
- [ ] Color contrast validation (4.58:1 ratio)
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility

### ✅ Feature Functionality  
- [ ] Complete user workflow from landing to dashboard
- [ ] Subscription flow end-to-end
- [ ] Menstrual cycle feature activation and adaptation
- [ ] Data management and persistence
- [ ] Error handling and edge cases

## 🚀 Getting Started

### Quick Test Run
1. Open browser to `http://localhost:8030`
2. Open developer console
3. Run: `fitcoachLocalStorageDemo.enableLocalStorage()`
4. Run: `fitcoachLocalStorageDemo.loginAsTrainer()`
5. Navigate to trainer dashboard and test features

### Automated E2E Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run with UI for debugging  
npm run test:e2e:ui

# Run specific test suite
npx playwright test --grep "Dashboard"
```

## 📞 Support & Troubleshooting

### Common Issues
1. **localStorage not working**: Check if `fitcoach_use_localStorage` is set to `true`
2. **Login fails**: Ensure test data is loaded with `testFullData()`
3. **Dashboard empty**: Verify correct role and data availability
4. **Features not working**: Check console for errors and data structure

### Debug Commands
```javascript
// Check current status
fitcoachLocalStorageDemo.getStatus()

// View demo credentials  
fitcoachLocalStorageDemo.getDemoCredentials()

// Export current data for inspection
fitcoachLocalStorageDemo.exportData()

// Clear all data and restart
fitcoachLocalStorageDemo.clearAll()
```

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Environment**: Development/Testing  
**Compatibility**: Supabase Production Ready