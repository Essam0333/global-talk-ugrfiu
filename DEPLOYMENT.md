
# GlobalTalk Deployment Guide

Complete guide for deploying and distributing the GlobalTalk multilingual chat application for testing and production.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Build Configuration](#build-configuration)
- [Development Builds](#development-builds)
- [Preview Builds (Testing)](#preview-builds-testing)
- [Production Builds](#production-builds)
- [Over-the-Air Updates](#over-the-air-updates)
- [Distribution](#distribution)
- [Testing Infrastructure](#testing-infrastructure)
- [Monitoring & Analytics](#monitoring--analytics)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Accounts

1. **Expo Account**
   - Sign up at https://expo.dev
   - Create an organization for your project
   - Note your username for configuration

2. **Apple Developer Account** (for iOS)
   - Required for TestFlight and App Store
   - Cost: $99/year
   - Sign up at https://developer.apple.com

3. **Google Play Console** (for Android)
   - Required for Play Store distribution
   - One-time fee: $25
   - Sign up at https://play.google.com/console

### Required Tools

Install the following tools globally:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Verify installation
eas --version
```

## Environment Setup

### 1. Configure Expo Project

Update `app.json` with your project details:

```json
{
  "expo": {
    "name": "GlobalTalk",
    "slug": "globaltalk",
    "owner": "your-expo-username",
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

### 2. Initialize EAS

```bash
# Initialize EAS in your project
eas init

# Configure your project
eas build:configure
```

This will:
- Create or update `eas.json`
- Link your project to EAS
- Generate a project ID

### 3. Environment Variables

Create environment-specific configurations in `constants/Config.ts`:

- **Development**: Local testing with development servers
- **Preview**: Internal testing with staging servers
- **Production**: Live app with production servers

## Build Configuration

The `eas.json` file defines three build profiles:

### Development Profile
```json
{
  "development": {
    "developmentClient": true,
    "distribution": "internal",
    "channel": "development"
  }
}
```

- Includes developer tools
- Faster builds
- For internal team testing

### Preview Profile
```json
{
  "preview": {
    "distribution": "internal",
    "android": {
      "buildType": "apk"
    },
    "channel": "preview"
  }
}
```

- Production-like builds
- APK for easy Android distribution
- For beta testers

### Production Profile
```json
{
  "production": {
    "distribution": "store",
    "autoIncrement": true,
    "channel": "production"
  }
}
```

- Optimized for app stores
- Auto-increments version numbers
- For public release

## Development Builds

### Android Development Build

```bash
# Build for Android
npm run build:dev:android

# Or directly with EAS
eas build -p android --profile development
```

### iOS Development Build

```bash
# Build for iOS simulator
npm run build:dev:ios

# Or directly with EAS
eas build -p ios --profile development
```

### Installing Development Builds

**Android:**
1. Download APK from EAS build page
2. Enable "Install from Unknown Sources"
3. Install APK on device

**iOS:**
1. Download from EAS build page
2. Install on simulator or register device UDID
3. Install via Xcode or Apple Configurator

## Preview Builds (Testing)

### Build for Internal Testing

```bash
# Build for both platforms
npm run build:all:preview

# Or individually
npm run build:preview:android
npm run build:preview:ios
```

### Distribution to Testers

#### Method 1: Direct APK Distribution (Android)

1. Build completes on EAS
2. Get download link from EAS dashboard
3. Share link with testers via:
   - Email
   - Slack
   - Internal distribution platform

#### Method 2: TestFlight (iOS)

```bash
# Submit to TestFlight
eas submit -p ios --latest
```

1. Build uploads to App Store Connect
2. Add testers in App Store Connect
3. Testers receive TestFlight invitation
4. Install via TestFlight app

#### Method 3: Internal Distribution Groups

Create tester groups in EAS:

```bash
# Add testers to internal distribution
eas device:create
```

### Testing Checklist

Share this with testers (also available in-app at `/testing-guide`):

- [ ] Installation successful
- [ ] Account creation works
- [ ] Language selection functions
- [ ] Message sending/receiving
- [ ] Translation accuracy
- [ ] Media sharing (photos, videos)
- [ ] Voice messages
- [ ] Group chats
- [ ] Notifications
- [ ] Contact management
- [ ] Profile settings
- [ ] App performance
- [ ] No crashes or freezes

## Production Builds

### Build for App Stores

```bash
# Build for both platforms
npm run build:all:prod

# Or individually
npm run build:prod:android
npm run build:prod:ios
```

### Submit to App Stores

#### Google Play Store

```bash
# Submit to Play Store
npm run submit:android

# Or with EAS
eas submit -p android --latest
```

Requirements:
- Service account key JSON file
- App listing created in Play Console
- Privacy policy URL
- App screenshots and descriptions

#### Apple App Store

```bash
# Submit to App Store
npm run submit:ios

# Or with EAS
eas submit -p ios --latest
```

Requirements:
- App Store Connect app created
- App Store listing complete
- Privacy policy URL
- App screenshots and descriptions
- App review information

## Over-the-Air Updates

### Publishing Updates

Updates allow you to push JavaScript/asset changes without rebuilding:

```bash
# Publish to preview channel
npm run update:preview -- "Fixed translation bug"

# Publish to production channel
npm run update:prod -- "Added new languages"

# Or with EAS directly
eas update --branch preview --message "Your update message"
```

### Update Behavior

The app checks for updates:
- On app launch (configurable in `app.json`)
- Manually via "Check for Updates" in settings
- Automatically in background

### Update Manager Features

The app includes a built-in update manager (`utils/updateManager.ts`):

- **Automatic checking**: Checks on app start
- **User prompts**: Notifies users of available updates
- **Force updates**: Can require critical updates
- **Dismissible updates**: Users can postpone non-critical updates
- **Update tracking**: Tracks which updates users have dismissed

### Testing Updates

1. Build and install a preview build
2. Make code changes
3. Publish an update
4. Restart the app
5. Update should download and apply

## Distribution

### QR Code Distribution (Development)

```bash
# Start development server
npm run dev

# Share QR code with team
# Scan with Expo Go app
```

### Internal Distribution Links

After building, EAS provides:
- Direct download links
- QR codes for easy installation
- Build details and logs

### Beta Testing Programs

#### Android Beta Testing

1. Upload to Play Console
2. Create closed/open testing track
3. Add testers via email or link
4. Testers opt-in via Play Store

#### iOS Beta Testing

1. Submit to TestFlight
2. Create internal/external testing groups
3. Add testers (up to 10,000 external)
4. Testers install via TestFlight app

## Testing Infrastructure

### In-App Testing Features

The app includes several testing features:

1. **Testing Guide** (`/testing-guide`)
   - Installation instructions
   - Feature testing checklist
   - Bug reporting template
   - Contact information

2. **Feedback System**
   - In-app feedback form
   - Bug reporting
   - Feature requests
   - Automatic device info collection

3. **Version Information**
   - App version display
   - Build number
   - Environment indicator
   - Update channel info

4. **Update Management**
   - Check for updates button
   - Update notifications
   - Version changelog

### Analytics & Monitoring

The app includes analytics utilities (`utils/analytics.ts`):

- **Event Tracking**: User actions and screen views
- **Crash Reporting**: Automatic error reporting
- **Performance Monitoring**: Track app performance
- **Session Tracking**: User session analytics

### Crash Reporting

Crashes are automatically reported with:
- Error stack traces
- Device information
- App version
- User context
- Session ID

## Monitoring & Analytics

### Build Monitoring

Monitor builds in EAS dashboard:
- Build status and logs
- Build artifacts
- Distribution metrics
- Update statistics

### User Analytics

Track key metrics:
- Daily/Monthly active users
- Feature usage
- Translation accuracy
- Message volume
- Crash rates
- Performance metrics

### Feedback Collection

Collect feedback through:
- In-app feedback form
- App store reviews
- Beta tester reports
- Analytics data

## Troubleshooting

### Common Build Issues

**Issue: Build fails with "Invalid credentials"**
```bash
# Re-authenticate
eas logout
eas login
```

**Issue: iOS build fails with provisioning profile error**
```bash
# Clear credentials and rebuild
eas credentials
# Select "Remove credentials"
# Rebuild
```

**Issue: Android build fails with Gradle error**
- Check `android/build.gradle` configuration
- Verify all dependencies are compatible
- Clear build cache and retry

### Common Update Issues

**Issue: Updates not downloading**
- Check internet connection
- Verify update channel matches build
- Check `app.json` update configuration

**Issue: App crashes after update**
- Ensure native dependencies haven't changed
- Verify update is compatible with build
- Roll back update if needed

### Getting Help

- **Expo Forums**: https://forums.expo.dev
- **Expo Discord**: https://chat.expo.dev
- **EAS Documentation**: https://docs.expo.dev/eas
- **GitHub Issues**: Create issues in your repository

## Best Practices

### Version Management

- Use semantic versioning (MAJOR.MINOR.PATCH)
- Increment version for each release
- Tag releases in git
- Maintain changelog

### Testing Strategy

1. **Alpha Testing**: Internal team (development builds)
2. **Beta Testing**: Trusted users (preview builds)
3. **Production**: Public release (production builds)

### Update Strategy

- Use OTA updates for bug fixes and minor changes
- Require new builds for native dependency changes
- Test updates thoroughly before publishing
- Have rollback plan ready

### Security

- Never commit credentials to git
- Use environment variables for secrets
- Enable two-factor authentication
- Regularly rotate API keys
- Review app permissions

## Deployment Checklist

### Pre-Launch

- [ ] All features tested and working
- [ ] No critical bugs
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] App store listings complete
- [ ] Screenshots and videos ready
- [ ] App icons and splash screens set
- [ ] Analytics configured
- [ ] Crash reporting enabled
- [ ] Backend services deployed
- [ ] Database configured
- [ ] API endpoints secured

### Launch

- [ ] Build production version
- [ ] Submit to app stores
- [ ] Prepare marketing materials
- [ ] Set up support channels
- [ ] Monitor initial feedback
- [ ] Be ready for hotfixes

### Post-Launch

- [ ] Monitor crash reports
- [ ] Track user feedback
- [ ] Analyze usage metrics
- [ ] Plan updates and improvements
- [ ] Respond to reviews
- [ ] Maintain documentation

## Support

For issues or questions:
- Email: support@globaltalk.app
- Documentation: Check this guide
- Community: Expo forums and Discord

---

**Last Updated**: January 2025
**Version**: 1.0.0
