# App Store Connect

Status: scaffolded; production signing requires 6 GitHub Secrets and one
private "certificates" repository. Without those secrets, current iOS
builds produce an unsigned `Mattermost-unsigned.ipa` suitable for local
sideloading only.

## What's already in place
- Team ID `PXAXE9BR4C` baked into `ios/Mattermost.xcodeproj/project.pbxproj`.
- Bundle prefix `com.tin.mobile` (main app, NotificationService, MattermostShare).
- App Group `group.com.tin.mobile` in entitlements and Info.plist.
- Display name `TIN Connect` in all four Info.plist files plus `app.json`.
- `INTUNE_ENABLED: 'false'` so `prepare-ios-build` skips the intune submodule.
- Fastlane defaults (`Fastfile`, `.env.ios.*`) updated to `com.tin.mobile` /
  `group.com.tin.mobile` / `iCloud.com.tin.mobile`.

## Apple Developer Portal one-time setup
1. Register three App IDs:
   - `com.tin.mobile`
   - `com.tin.mobile.NotificationService`
   - `com.tin.mobile.MattermostShare`
2. Register one App Group:
   - `group.com.tin.mobile`
3. Register three Certificates:
   - Apple Distribution (main app)
   - Apple Distribution (NotificationService)
   - Apple Distribution (MattermostShare)
4. Generate three App Store Connect provisioning profiles that match the
   three App IDs.
5. In App Store Connect (https://appstoreconnect.apple.com), create the
   app record "TIN Connect" with bundle ID `com.tin.mobile` and primary
   language English.

## GitHub Secrets to set on `tindevelopers/mattermost-mobile`
Settings → Secrets and variables → Actions → New repository secret.

| Secret name                           | Source                                                     |
| ------------------------------------- | ---------------------------------------------------------- |
| `MATCH_REPO`                          | Private cert repo URL (e.g. `git@github.com:tindevelopers/certs.git`). |
| `MATCH_PASSWORD`                      | Passphrase set when running `fastlane match init`.         |
| `MATCH_TYPE`                          | Set to `appstore`.                                          |
| `MATCH_DEPLOY_KEY`                    | SSH key with read access to `MATCH_REPO`.                  |
| `APP_STORE_CONNECT_API_KEY_ID`        | From App Store Connect → Users and Access → Integrations.  |
| `APP_STORE_CONNECT_API_ISSUER_ID`     | Same source.                                               |
| `APP_STORE_CONNECT_API_KEY_FILE`      | Base64 of the `.p8` file: `base64 -i AuthKey_XXX.p8 \| pbcopy`. |

## Local steps to bootstrap the certs repo
Run on a Mac with `fastlane` installed (`gem install fastlane`):

```bash
mkdir mattermost-certificates && cd mattermost-certificates
git init && git checkout -b main
bundle exec fastlane match init
bundle exec fastlane match appstore \
  --app_identifier com.tin.mobile \
  --git_url git@github.com:tindevelopers/certs.git --readonly false
bundle exec fastlane match appstore \
  --app_identifier com.tin.mobile.NotificationService \
  --git_url git@github.com:tindevelopers/certs.git --readonly false
bundle exec fastlane match appstore \
  --app_identifier com.tin.mobile.MattermostShare \
  --git_url git@github.com:tindevelopers/certs.git --readonly false
```

Push the encrypted cert repo to GitHub.

## Switching CI to a signed build + TestFlight upload
Once the seven secrets are set, edit `.github/workflows/github-release.yml`:

1. Replace `bundle exec fastlane ios unsigned` with `bundle exec fastlane ios submit`.
   `submit` runs the existing `submit_to_testflight(ipa_path)` lane defined in
   `fastlane/Fastfile`.
2. The unsigned iOS job (`build-ios-unsigned`) is fine to leave enabled as a
   smoke test of the Xcode + signing setup before triggering a signed tab.

## First-time App Review
- Pick a version: 2.41.0 (rc.3 → 2.41.0 final when signed).
- Add screenshots for 6.7" / 6.1" iPhone and 12.9" iPad to App Store Connect.
- Fill the App Privacy questionnaire.
- Submit for review; Apple's first review usually takes 24–48 hours.
