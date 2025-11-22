
# GlobalTalk Deployment Setup

This document provides a complete overview of the deployment infrastructure for the GlobalTalk application.

## 🚀 Quick Start

### For Developers

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for testing
npm run build:preview:android
npm run build:preview:ios
```

### For Testers

See [TESTING_QUICK_START.md](./TESTING_QUICK_START.md) for installation and testing instructions.

### For DevOps

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment documentation.

## 📁 Project Structure

```
globaltalk/
├── app/                          # Application screens
│   ├── (tabs)/                   # Tab navigation screens
│   ├── chat/                     # Chat screens
│   ├── testing-guide.tsx         # In-app testing guide
│   └── _layout.tsx               # Root layout with UpdateChecker
├── components/                   # Reusable components
│   ├── UpdateChecker.tsx         # OTA update manager UI
│   ├── FeedbackModal.tsx         # Feedback collection UI
│   └── VersionInfo.tsx           # Version display component
├── constants/                    # Configuration
│   └── Config.ts                 # Environment configuration
├── utils/                        # Utilities
│   ├── updateManager.ts          # Update management logic
│   ├── analytics.ts              # Analytics and crash reporting
│   └── feedbackManager.ts        # Feedback collection logic
├── eas.json                      # EAS Build configuration
├── app.json                      # Expo configuration
├── package.json                  # Dependencies and scripts
├── DEPLOYMENT.md                 # Complete deployment guide
├── TESTING_QUICK_START.md        # Quick start for testers
└── .env.example                  # Environment variables template
```

## 🛠️ Available Scripts

### Development

```bash
npm run dev          # Start development server with tunnel
npm run android      # Start on Android device/emulator
npm run ios          # Start on iOS device/simulator
npm run web          # Start web version
```

### Building

```bash
# Development builds (with dev tools)
npm run build:dev:android
npm run build:dev:ios

# Preview builds (for testing)
npm run build:preview:android
npm run build:preview:ios
npm run build:all:preview

# Production builds (for app stores)
npm run build:prod:android
npm run build:prod:ios
npm run build:all:prod
```

### Updates (OTA)

```bash
# Publish updates without rebuilding
npm run update:preview -- "Your update message"
npm run update:prod -- "Your update message"
```

### Submission

```bash
# Submit to app stores
npm run submit:android
npm run submit:ios
```

### Deployment

```bash
# Build and distribute for internal testing
npm run deploy:internal
```

## 🏗️ Build Profiles

### Development
- **Purpose**: Internal development and debugging
- **Features**: Dev tools, fast refresh, debugging enabled
- **Distribution**: Internal only
- **Build Type**: Development client

### Preview
- **Purpose**: Beta testing and QA
- **Features**: Production-like, optimized, no dev tools
- **Distribution**: Internal testers, TestFlight, APK links
- **Build Type**: APK (Android), Ad-hoc (iOS)

### Production
- **Purpose**: Public release
- **Features**: Fully optimized, analytics enabled
- **Distribution**: App stores
- **Build Type**: App Bundle (Android), App Store (iOS)

## 🔄 Update Strategy

### Over-the-Air (OTA) Updates

OTA updates allow you to push changes without rebuilding:

**What can be updated:**
- JavaScript code changes
- React components
- Assets (images, fonts)
- Configuration changes

**What requires a new build:**
- Native code changes
- New native dependencies
- Permission changes
- App configuration changes

### Update Channels

- **development**: Automatic updates for dev builds
- **preview**: Updates for beta testers
- **production**: Updates for production users

### Update Behavior

The app checks for updates:
1. On app launch (configurable)
2. Manually via "Check for Updates" button
3. Automatically in background (if configured)

Users are prompted to:
- Update immediately
- Update later (dismissible)
- Update now (forced for critical updates)

## 📊 Monitoring & Analytics

### Built-in Features

1. **Analytics Service** (`utils/analytics.ts`)
   - Event tracking
   - Screen view tracking
   - User action tracking
   - Performance monitoring

2. **Crash Reporting** (`utils/analytics.ts`)
   - Automatic crash detection
   - Error stack traces
   - Device information
   - User context

3. **Feedback System** (`utils/feedbackManager.ts`)
   - In-app feedback form
   - Bug reporting
   - Feature requests
   - Device info collection

### Monitoring Dashboards

- **EAS Dashboard**: Build status, updates, distribution
- **Analytics Dashboard**: User metrics, events, crashes
- **App Store Connect**: iOS metrics, reviews, crashes
- **Google Play Console**: Android metrics, reviews, crashes

## 🧪 Testing Infrastructure

### In-App Testing Tools

1. **Testing Guide** (`/testing-guide`)
   - Complete testing instructions
   - Feature checklist
   - Bug reporting template
   - Contact information

2. **Feedback Modal**
   - Accessible from Profile screen
   - Bug reports, feature requests, general feedback
   - Automatic device info collection

3. **Version Info**
   - App version and build number
   - Environment indicator
   - Update channel
   - Update ID

4. **Update Checker**
   - Manual update check
   - Automatic update notifications
   - Force update capability
   - Update dismissal tracking

### Testing Workflow

1. **Build**: Create preview build
2. **Distribute**: Share with testers via link/TestFlight
3. **Test**: Testers use app and report issues
4. **Fix**: Make changes and publish OTA update
5. **Verify**: Testers verify fixes
6. **Repeat**: Continue until ready for production

## 🔐 Security

### Credentials Management

- Never commit credentials to git
- Use EAS Secrets for sensitive data
- Rotate API keys regularly
- Enable 2FA on all accounts

### App Security

- Enable code obfuscation in production
- Use HTTPS for all API calls
- Implement certificate pinning
- Validate all user inputs
- Use secure storage for sensitive data

## 📱 Platform-Specific Notes

### Android

- **Build Type**: APK for testing, AAB for production
- **Distribution**: Direct APK links, Google Play
- **Updates**: Instant via OTA
- **Permissions**: Declared in app.json

### iOS

- **Build Type**: Simulator for dev, Ad-hoc for testing, App Store for production
- **Distribution**: TestFlight, App Store
- **Updates**: Instant via OTA (after app review for first release)
- **Permissions**: Declared in app.json (Info.plist)

## 🌍 Environment Configuration

### Development
- Local API servers
- Debug logging enabled
- Analytics disabled
- Crash reporting disabled

### Preview
- Staging API servers
- Debug logging enabled
- Analytics enabled
- Crash reporting enabled

### Production
- Production API servers
- Debug logging disabled
- Analytics enabled
- Crash reporting enabled
- Performance monitoring enabled

## 📝 Version Management

### Versioning Scheme

We use semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Version Increment

- Automatic for production builds (`autoIncrement: true`)
- Manual for preview builds
- Not required for OTA updates

### Changelog

Maintain a changelog for each release:
- New features
- Bug fixes
- Improvements
- Breaking changes

## 🆘 Troubleshooting

### Build Issues

**Problem**: Build fails with credentials error
```bash
# Solution: Re-authenticate
eas logout
eas login
eas build:configure
```

**Problem**: Build fails with dependency error
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules
npm install
```

### Update Issues

**Problem**: Updates not applying
- Check update channel matches build profile
- Verify internet connection
- Check app.json update configuration
- Restart app completely

**Problem**: App crashes after update
- Roll back update immediately
- Check for native dependency changes
- Verify update compatibility
- Build new version if needed

### Distribution Issues

**Problem**: Testers can't install APK
- Verify "Unknown Sources" is enabled
- Check APK is not corrupted
- Ensure device meets minimum requirements

**Problem**: TestFlight invitation not received
- Check email address is correct
- Look in spam folder
- Resend invitation from App Store Connect

## 📞 Support

### For Developers
- Check [DEPLOYMENT.md](./DEPLOYMENT.md)
- Review EAS documentation
- Ask in Expo forums/Discord

### For Testers
- Check [TESTING_QUICK_START.md](./TESTING_QUICK_START.md)
- Use in-app Testing Guide
- Email support@globaltalk.app

### For Users
- Check in-app help
- Email support@globaltalk.app
- Visit website (when available)

## 🎯 Next Steps

### Before First Build

1. ✅ Configure `app.json` with your details
2. ✅ Set up Expo account and organization
3. ✅ Run `eas init` to link project
4. ✅ Configure environment variables
5. ✅ Test locally first

### Before Beta Testing

1. ✅ Create preview build
2. ✅ Test internally
3. ✅ Prepare testing documentation
4. ✅ Set up feedback collection
5. ✅ Invite beta testers

### Before Production

1. ✅ Complete beta testing
2. ✅ Fix all critical bugs
3. ✅ Prepare app store listings
4. ✅ Create marketing materials
5. ✅ Set up support channels
6. ✅ Configure analytics
7. ✅ Build production version
8. ✅ Submit to app stores

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Update Documentation](https://docs.expo.dev/eas-update/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [React Native Documentation](https://reactnative.dev)

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Maintainer**: GlobalTalk Team
