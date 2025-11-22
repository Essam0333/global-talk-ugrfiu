
# GlobalTalk - Quick Start Deployment Guide

Get your app live for testing in 30 minutes or less!

## Prerequisites (5 minutes)

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Create Expo Account**
   - Go to https://expo.dev
   - Sign up for free account
   - Remember your username

3. **Login to EAS**
   ```bash
   eas login
   ```

## Step 1: Configure Project (5 minutes)

1. **Update app.json**
   
   Replace these values in `app.json`:
   ```json
   {
     "expo": {
       "owner": "your-expo-username",
       "extra": {
         "eas": {
           "projectId": "will-be-generated"
         }
       }
     }
   }
   ```

2. **Initialize EAS**
   ```bash
   eas init
   ```
   
   This will:
   - Link your project to EAS
   - Generate a project ID
   - Update your `app.json` automatically

## Step 2: Build for Testing (15 minutes)

### Android APK (Easiest for testing)

```bash
npm run build:preview:android
```

This will:
- Build an APK file
- Upload to EAS servers
- Provide a download link

**Wait time**: ~10-15 minutes

### iOS (Optional - requires Apple Developer account)

```bash
npm run build:preview:ios
```

**Note**: For iOS testing without Apple Developer account, use Expo Go:
```bash
npm run dev
```
Then scan QR code with Expo Go app.

## Step 3: Distribute to Testers (5 minutes)

### Android

1. **Get Download Link**
   - Build completes on EAS
   - Copy the download link from terminal or EAS dashboard
   - Link looks like: `https://expo.dev/artifacts/...`

2. **Share with Testers**
   - Send link via email/Slack/WhatsApp
   - Testers download APK
   - Testers enable "Install from Unknown Sources"
   - Testers install and test

### iOS (TestFlight)

1. **Submit to TestFlight**
   ```bash
   eas submit -p ios --latest
   ```

2. **Add Testers**
   - Go to App Store Connect
   - Add tester emails
   - Testers receive invitation
   - Testers install via TestFlight app

## Step 4: Collect Feedback (Ongoing)

Your app includes built-in testing tools:

1. **Testing Guide**
   - Available in app at Profile → Testing Guide
   - Shows testers what to test
   - Includes bug report template

2. **Feedback Form**
   - Available in app at Profile → Send Feedback
   - Collects bug reports and feature requests
   - Includes device info automatically

3. **Version Info**
   - Shows app version and build number
   - Helps identify which version testers are using

## Step 5: Push Updates (5 minutes)

When you fix bugs or add features:

```bash
# Make your code changes
# Then publish update:
npm run update:preview -- "Fixed translation bug"
```

**Testers get updates**:
- Automatically on next app launch
- Or manually via "Check for Updates" in Profile

**Important**: OTA updates only work for JavaScript/asset changes. Native changes require new build.

## Common Issues & Solutions

### Issue: Build fails with "Invalid credentials"

**Solution**:
```bash
eas logout
eas login
eas build:configure
```

### Issue: Can't install APK on Android

**Solution**:
- Enable "Install from Unknown Sources" in Android settings
- Location varies by device (Settings → Security or Settings → Apps)

### Issue: iOS build requires Apple Developer account

**Solution**:
- Use Expo Go for testing (free)
- Or sign up for Apple Developer ($99/year)

### Issue: Updates not appearing

**Solution**:
- Completely close and restart app
- Check internet connection
- Verify update channel matches build profile

## Testing Checklist

Share this with your testers:

- [ ] Install app successfully
- [ ] Create account
- [ ] Send messages
- [ ] Test translation
- [ ] Share photos/videos
- [ ] Test voice messages
- [ ] Try group chats
- [ ] Check notifications
- [ ] Test on different devices
- [ ] Report any bugs via in-app feedback

## Next Steps

### For More Testers

1. Build more APKs and share links
2. Set up TestFlight for iOS
3. Create tester groups in EAS

### For Production

1. Complete beta testing
2. Fix all critical bugs
3. Prepare app store listings
4. Build production version
5. Submit to app stores

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete production deployment guide.

## Quick Reference

### Build Commands
```bash
# Android APK for testing
npm run build:preview:android

# iOS for TestFlight
npm run build:preview:ios

# Both platforms
npm run build:all:preview
```

### Update Commands
```bash
# Push update to testers
npm run update:preview -- "Your message"
```

### Check Build Status
```bash
# View in terminal
eas build:list

# Or visit dashboard
https://expo.dev
```

## Support

### In-App Help
- Profile → Testing Guide
- Profile → Send Feedback

### Documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete guide
- [TESTING_QUICK_START.md](./TESTING_QUICK_START.md) - For testers

### Get Help
- Expo Forums: https://forums.expo.dev
- Expo Discord: https://chat.expo.dev
- Email: support@globaltalk.app

---

**Estimated Total Time**: 30 minutes
**Difficulty**: Easy
**Cost**: Free (for testing)

Good luck with your deployment! 🚀
