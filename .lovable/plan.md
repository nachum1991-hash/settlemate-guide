## Plan

Update the "Uploaded documents" bullet point in `src/pages/Privacy.tsx`, section "2. Data we collect", to the new copy provided by the user.

### Change
**File:** `src/pages/Privacy.tsx` (line 26)

**From:**
```
<li><strong>Uploaded documents:</strong> files you choose to upload (passport scans, admission letters, etc.). Stored in a private, encrypted bucket and accessible only to you.</li>
```

**To:**
```
<li><strong>Uploaded documents:</strong> Verification documents you submit during the student verification process — including acceptance letters and identification documents (such as passports or national ID cards). These are stored temporarily in a private, encrypted bucket, accessible only to SettleMate administrators for the purpose of verifying your student status. They are permanently and irreversibly deleted immediately upon approval or rejection of your verification request. No verification documents are retained after the decision is made.</li>
```

No other files are affected.