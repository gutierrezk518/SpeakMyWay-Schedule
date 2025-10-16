# SpeakMyWay Security Configuration Checklist

## 🚨 CRITICAL - Do These TODAY

### 1. Enable Row Level Security (RLS) in Supabase

**Why:** Without RLS, any logged-in user can access or modify ALL data in your database.

**How to do it:**

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project (`bwkihbqcehrkvriiurfi`)
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Open the file `supabase-security-setup.sql` from this project
6. **Copy the ENTIRE contents** and paste into the SQL editor
7. Click **Run** (or press Ctrl+Enter)
8. You should see "Success. No rows returned" - that's good!

**Verification:**
```sql
-- Run this query to verify RLS is enabled:
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('schedule_vocabulary_cards', 'schedulecategories');

-- Both tables should show rowsecurity = true
```

---

## ⚠️ IMPORTANT - Do These This Week

### 2. Configure Supabase Authentication Settings

**Step 2a: Set Redirect URLs**

1. Go to **Authentication** → **URL Configuration**
2. Under **Redirect URLs**, add these URLs (one per line):
   ```
   https://schedule.speakmyway.com
   https://schedule.speakmyway.com/auth/callback
   http://localhost:3000
   http://localhost:3000/auth/callback
   ```
3. Set **Site URL** to: `https://schedule.speakmyway.com`
4. Click **Save**

**Step 2b: Enable Security Features**

1. Go to **Authentication** → **Settings**
2. Scroll to **Security and Protection**
3. Enable these settings:
   - ✅ **Enable email confirmations** (you already have this)
   - ✅ **Secure email change** (requires re-authentication)
   - ✅ **Secure password change** (requires current password)
4. Under **Password Settings**:
   - Minimum password length: `8`
   - Require uppercase: `Yes`
   - Require lowercase: `Yes`
   - Require numbers: `Yes`
5. Click **Save**

**Step 2c: Configure Session Settings**

1. Still in **Authentication** → **Settings**
2. Scroll to **Sessions**
3. Set **JWT expiry limit**: `3600` seconds (1 hour)
4. Enable **Refresh token rotation**
5. Click **Save**

---

### 3. Enable Rate Limiting (If Available)

1. Go to **Settings** → **API**
2. Look for **Rate Limiting** section
3. If available, enable with:
   - Requests per minute: `100`
   - Requests per hour: `1000`

Note: This might be a Pro feature. If not available, that's okay for MVP.

---

## 💡 RECOMMENDED - Do When You Have Time

### 4. Review Privacy & Legal Pages

**Privacy Policy:**
- You have a route for `/privacy-policy` but the page needs content
- Required if you're collecting user data (which you are)
- You can use a template from [TermsFeed](https://www.termsfeed.com/privacy-policy-generator/)

**Things to include:**
- What data you collect (email, schedules, favorites)
- How you store it (browser localStorage + Supabase)
- How long you keep it
- User rights (access, deletion)
- Contact information

**Terms of Service:**
- Consider adding a `/terms` page
- Outline acceptable use policy
- Liability limitations
- User responsibilities

---

### 5. Setup Admin Access (Future)

When you need to manage activity cards and categories:

**Option 1: Supabase Dashboard (Recommended for now)**
- Use the Table Editor in Supabase Dashboard
- You can add/edit/delete cards manually

**Option 2: Admin Panel (Future enhancement)**
- Create an `/admin` route in your app
- Add a check for admin users (e.g., specific email addresses)
- Build CRUD interface for managing cards/categories

---

## 📊 Security Status Summary

### ✅ Already Secure

- [x] Code is free from SQL injection vulnerabilities
- [x] No XSS (Cross-Site Scripting) vulnerabilities
- [x] Environment variables properly protected (.env in .gitignore)
- [x] Strong password requirements enforced
- [x] Email verification required for signup
- [x] HTTPS enabled on production (schedule.speakmyway.com)
- [x] Supabase handles JWT tokens securely
- [x] User data in localStorage (can't be accessed by other users)
- [x] Security headers added to Vercel deployment

### ⚠️ Needs Attention

- [ ] **Row Level Security (RLS)** - CRITICAL! Follow Step 1 above
- [ ] Redirect URLs configured in Supabase (Step 2a)
- [ ] Security features enabled in Supabase Auth (Step 2b)
- [ ] Privacy Policy content added
- [ ] Terms of Service created

### 💡 Nice to Have (Future)

- [ ] Content Security Policy (CSP) headers
- [ ] Rate limiting enabled
- [ ] Admin panel for content management
- [ ] Automated security monitoring
- [ ] GDPR compliance review

---

## 🔐 Security Best Practices Going Forward

### For Future Features:

**When adding user-generated content:**
1. Always sanitize user input
2. Add RLS policies for user-specific data
3. Use `auth.uid()` to ensure users only access their own data
4. Test with multiple user accounts

**When adding new database tables:**
1. Enable RLS immediately: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
2. Create policies before adding data
3. Default to restrictive policies, then open up as needed

**Regular maintenance:**
1. Review Supabase logs monthly for suspicious activity
2. Update dependencies regularly (`npm audit`)
3. Check for Supabase security announcements
4. Monitor user reports of security issues

---

## 🆘 If You Discover a Security Issue

1. **Don't panic** - most issues can be fixed quickly
2. **Don't publish details publicly** - fix it first
3. **Priorities:**
   - User data exposure: Fix immediately
   - Authentication bypass: Fix immediately
   - XSS/injection: Fix within 24 hours
   - Minor issues: Fix in next deployment

---

## 📞 Support & Resources

**Supabase Resources:**
- [RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [Community Discord](https://discord.supabase.com)

**General Security:**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web.dev Security](https://web.dev/secure/)

**Legal Templates:**
- [TermsFeed](https://www.termsfeed.com)
- [Privacy Policy Generator](https://www.freeprivacypolicy.com)

---

## ✅ Checklist Summary

Print this out or copy to a checklist app:

**Today (Critical):**
- [ ] Run `supabase-security-setup.sql` in Supabase SQL Editor
- [ ] Verify RLS is enabled on both tables

**This Week (Important):**
- [ ] Add redirect URLs to Supabase
- [ ] Enable Supabase security features
- [ ] Configure session settings

**This Month (Recommended):**
- [ ] Add Privacy Policy content
- [ ] Create Terms of Service
- [ ] Review and test security with multiple accounts

**Ongoing:**
- [ ] Monitor for security updates
- [ ] Review user access patterns
- [ ] Keep dependencies updated

---

## 🎉 You Did It!

Once you complete the critical items (RLS setup), your app will be **significantly more secure**. The rest can be done gradually as you have time.

Good luck! 🚀
