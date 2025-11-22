
# GlobalTalk Deployment Checklist

Use this checklist to ensure all steps are completed before deploying to production.

## Pre-Deployment Setup

### 1. Expo Account Configuration
- [ ] Create Expo account at https://expo.dev
- [ ] Create organization for the project
- [ ] Note your Expo username
- [ ] Run `eas login` to authenticate

### 2. Project Configuration
- [ ] Update `app.json` with your Expo username
- [ ] Run `eas init` to link project
- [ ] Update project ID in `app.json`
- [ ] Configure `eas.json` build profiles

### 3. Environment Variables
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in all required environment variables
- [ ] Set up Supabase project and get credentials
- [ ] Configure API endpoints for each environment

### 4. App Store Accounts (Optional for initial testing)
- [ ] Apple Developer Account ($99/year)
- [ ] Google Play Console ($25 one-time)
- [ ] Configure app store credentials in `eas.json`

## Development Build

### 5. Local Testing
- [ ] Test app locally with `npm run dev`
- [ ] Test on Android emulator/device
- [ ] Test on iOS simulator/device
- [ ] Verify all core features work
- [ ] Fix any critical bugs

### 6. Development Build
- [ ] Run `npm run build:dev:android` for Android
- [ ] Run `npm run build:dev:ios` for iOS
- [ ] Install and test development builds
- [ ] Verify hot reload and debugging work

## Preview Build (Beta Testing)

### 7. Beta Testing Preparation
- [ ] Create list of beta testers
- [ ] Prepare testing documentation
- [ ] Set up feedback collection system
- [ ] Create bug reporting template

### 8. Preview Build
- [ ] Run `npm run build:preview:android`
- [ ] Run `npm run build:preview:ios`
- [ ] Download builds from EAS dashboard
- [ ] Test builds thoroughly before distribution

### 9. Distribution to Testers
- [ ] Share APK download link with Android testers
- [ ] Submit iOS build to TestFlight
- [ ] Send invitation emails to testers
- [ ] Share testing guide and instructions

### 10. Beta Testing Phase
- [ ] Monitor tester feedback
- [ ] Track bug reports
- [ ] Collect feature requests
- [ ] Fix critical issues
- [ ] Publish OTA updates as needed

## Production Build

### 11. Pre-Production Checklist
- [ ] All critical bugs fixed
- [ ] Beta testing completed successfully
- [ ] App icons and splash screens finalized
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] App store listings prepared

### 12. App Store Listings

#### Android (Google Play)
- [ ] App title (max 50 characters)
- [ ] Short description (max 80 characters)
- [ ] Full description (max 4000 characters)
- [ ] Screenshots (at least 2, up to 8)
- [ ] Feature graphic (1024x500)
- [ ] App icon (512x512)
- [ ] Privacy policy URL
- [ ] Content rating questionnaire

#### iOS (App Store)
- [ ] App name (max 30 characters)
- [ ] Subtitle (max 30 characters)
- [ ] Description (max 4000 characters)
- [ ] Keywords (max 100 characters)
- [ ] Screenshots for all device sizes
- [ ] App preview videos (optional)
- [ ] App icon (1024x1024)
- [ ] Privacy policy URL
- [ ] Age rating

### 13. Production Build
- [ ] Update version number in `app.json`
- [ ] Run `npm run build:prod:android`
- [ ] Run `npm run build:prod:ios`
- [ ] Download and test production builds
- [ ] Verify all features work correctly

### 14. App Store Submission

#### Android
- [ ] Run `npm run submit:android`
- [ ] Or manually upload AAB to Play Console
- [ ] Fill in release notes
- [ ] Select release track (internal/alpha/beta/production)
- [ ] Submit for review

#### iOS
- [ ] Run `npm run submit:ios`
- [ ] Or manually upload via Xcode/Transporter
- [ ] Fill in "What's New" section
- [ ] Add app review information
- [ ] Submit for review

## Post-Launch

### 15. Monitoring
- [ ] Set up crash reporting
- [ ] Configure analytics
- [ ] Monitor app store reviews
- [ ] Track user feedback
- [ ] Monitor server performance

### 16. Support
- [ ] Set up support email
- [ ] Create FAQ documentation
- [ ] Prepare response templates
- [ ] Monitor social media mentions

### 17. Updates
- [ ] Plan regular update schedule
- [ ] Collect user feedback
- [ ] Prioritize bug fixes and features
- [ ] Test updates thoroughly
- [ ] Use OTA updates for minor changes
- [ ] Submit new builds for major changes

## Over-the-Air Updates

### 18. OTA Update Process
- [ ] Make code changes (JS/assets only)
- [ ] Test changes locally
- [ ] Run `npm run update:preview -- "Update message"`
- [ ] Test update on preview builds
- [ ] Run `npm run update:prod -- "Update message"`
- [ ] Monitor update adoption

### 19. Update Best Practices
- [ ] Write clear update messages
- [ ] Test updates before publishing
- [ ] Monitor for issues after publishing
- [ ] Have rollback plan ready
- [ ] Don't change native dependencies via OTA

## Security

### 20. Security Checklist
- [ ] Enable two-factor authentication on all accounts
- [ ] Never commit credentials to git
- [ ] Use environment variables for secrets
- [ ] Rotate API keys regularly
- [ ] Review app permissions
- [ ] Implement certificate pinning (if needed)
- [ ] Enable code obfuscation in production

## Performance

### 21. Performance Optimization
- [ ] Optimize images and assets
- [ ] Minimize bundle size
- [ ] Enable Hermes engine (Android)
- [ ] Test on low-end devices
- [ ] Monitor app startup time
- [ ] Optimize network requests
- [ ] Implement proper caching

## Compliance

### 22. Legal & Compliance
- [ ] Privacy policy complies with GDPR/CCPA
- [ ] Terms of service reviewed
- [ ] Age rating appropriate
- [ ] Content guidelines followed
- [ ] Accessibility features implemented
- [ ] Data retention policy defined

## Documentation

### 23. Documentation Updates
- [ ] Update README with latest info
- [ ] Document API changes
- [ ] Update testing guide
- [ ] Create release notes
- [ ] Update changelog
- [ ] Document known issues

## Team Communication

### 24. Team Coordination
- [ ] Notify team of deployment schedule
- [ ] Assign roles and responsibilities
- [ ] Set up communication channels
- [ ] Plan for emergency response
- [ ] Schedule post-launch review

## Rollback Plan

### 25. Emergency Procedures
- [ ] Document rollback procedure
- [ ] Keep previous version accessible
- [ ] Have emergency contacts ready
- [ ] Monitor for critical issues
- [ ] Be ready to pull app if needed

---

## Quick Reference Commands

### Build Commands
```bash
# Development
npm run build:dev:android
npm run build:dev:ios

# Preview (Testing)
npm run build:preview:android
npm run build:preview:ios
npm run build:all:preview

# Production
npm run build:prod:android
npm run build:prod:ios
npm run build:all:prod
```

### Update Commands
```bash
# Preview updates
npm run update:preview -- "Your update message"

# Production updates
npm run update:prod -- "Your update message"
```

### Submit Commands
```bash
# Submit to stores
npm run submit:android
npm run submit:ios
```

### Deployment Command
```bash
# Build and distribute for internal testing
npm run deploy:internal
```

---

## Notes

- Check off items as you complete them
- Don't skip steps, even if they seem minor
- Test thoroughly at each stage
- Keep this checklist updated
- Share with your team

**Last Updated**: January 2025
**Version**: 1.0.0
