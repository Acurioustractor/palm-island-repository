# Palm Island Authentication Implementation Guide
## Bringing Low-Literacy Authentication Research to Life

**Document Date**: November 5, 2025
**Status**: Ready for Implementation
**Related Research**: `LOW-LITERACY-AUTHENTICATION-RESEARCH.md`

---

## Quick Summary: What We're Implementing

After extensive research into authentication patterns used by 50+ million people in low-literacy communities (M-Pesa, GCash, Indian banking apps, healthcare platforms), we're implementing a **multi-tiered authentication system** for Palm Island.

**Key Principle**: No single method works for everyone. Offer choices.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│ Palm Island Authentication System                        │
├─────────────────────────────────────────────────────────┤
│                                                           │
│ TIER 1: Phone + PIN (Primary, Works on ANY phone)       │
│ ├─ Registration: In-person at PICC office               │
│ ├─ Login: Enter phone number + 4-digit PIN              │
│ ├─ Cost: Free (Supabase included)                       │
│ └─ Accessibility: 100% of community                     │
│                                                           │
│ TIER 2: Voice OTP (Backup, Phone call)                  │
│ ├─ Request: User calls PICC or uses app                 │
│ ├─ Receive: System calls back with code                 │
│ ├─ Cost: $5-10/month                                    │
│ └─ Accessibility: Elders, non-readers                   │
│                                                           │
│ TIER 3: SMS Magic Link (Backup, Occasional use)         │
│ ├─ Request: User provides phone number                  │
│ ├─ Receive: SMS with clickable link                     │
│ ├─ Cost: ~$1-5/month                                    │
│ └─ Accessibility: Smartphone users                      │
│                                                           │
│ TIER 4: Biometric (Optional, Smartphone)                │
│ ├─ Methods: Face ID, Fingerprint                        │
│ ├─ Cost: Free (built-in to phone)                       │
│ └─ Accessibility: Modern smartphone users               │
│                                                           │
│ EMERGENCY: In-Person Assistance                         │
│ ├─ Location: PICC office                                │
│ ├─ Staff: Trained in assisted auth                      │
│ ├─ Cost: Staff time (minimal)                           │
│ └─ Accessibility: 100% (no barriers)                    │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## Phase 1: MVP (Ready to Deploy Now)

### What We're Building in Phase 1

```
✅ Phone + 4-Digit PIN (Primary)
✅ SMS Magic Link (Backup)
✅ In-Person Assistance (Manual, staff-supported)
✅ Registration Workflow (PICC office)
✅ Admin Dashboard (Staff tools)
```

### Database Schema

Add these tables to Supabase:

```sql
-- Phone-based authentication
CREATE TABLE phone_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id),
  phone_number TEXT NOT NULL UNIQUE,
  pin_hash TEXT NOT NULL, -- bcrypt hashed
  status TEXT DEFAULT 'active', -- active, suspended, deleted
  failed_attempts INT DEFAULT 0,
  locked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Login attempts (audit trail)
CREATE TABLE auth_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  method TEXT NOT NULL, -- 'pin', 'voice', 'sms', 'biometric'
  success BOOLEAN NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  ip_address TEXT,
  device_info TEXT
);

-- Magic link tokens (SMS/Email)
CREATE TABLE magic_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  token TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL, -- 'sms', 'email'
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Voice OTP
CREATE TABLE voice_otp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  attempts INT DEFAULT 0,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sessions (who's logged in)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  token TEXT NOT NULL UNIQUE,
  login_method TEXT NOT NULL, -- 'pin', 'voice', 'sms', 'biometric', 'assisted'
  authenticated_by UUID REFERENCES profiles(id), -- For assisted auth
  expires_at TIMESTAMP NOT NULL,
  last_activity TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Audit log (for compliance & debugging)
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  assisted_by UUID REFERENCES profiles(id),
  details JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints to Create

```typescript
// POST /api/auth/register-phone-pin
// Register new user: phone + PIN

// POST /api/auth/login-phone-pin
// Login with phone + PIN

// POST /api/auth/request-sms-link
// Request SMS magic link

// POST /api/auth/verify-magic-link
// Verify magic link token

// POST /api/auth/request-voice-otp
// Request voice OTP call

// POST /api/auth/verify-voice-otp
// Verify voice OTP code

// POST /api/auth/logout
// End session

// GET /api/auth/me
// Get current user info

// POST /api/auth/assisted-login
// Staff-assisted login (with verification)
```

### Frontend Components to Build

```
/web-platform/app/auth/
├── page.tsx (Auth method selector)
├── register/
│   ├── page.tsx (Registration flow)
│   └── verify.tsx (Phone verification)
├── login/
│   ├── page.tsx (Login method selector)
│   ├── phone-pin/page.tsx (PIN entry)
│   ├── sms/page.tsx (Magic link verification)
│   └── voice/page.tsx (Voice code entry)
└── callback/
    └── page.tsx (Magic link redirect)
```

---

## Phase 2: Enhanced Access (Month 2-3)

### Add Voice OTP

The **most important addition for accessibility**.

When to add: After Phase 1 is stable and working

```
Voice OTP Implementation:
1. User calls dedicated PICC phone line
2. System recognizes person (voice + phone number lookup)
3. System speaks: "Your code is X"
4. User repeats code
5. Automatic login via magic link sent to phone
```

**Cost**: ~$5-10/month (Twilio)

### Add Biometric Authentication

When to add: When majority of users have smartphones

```
Biometric Implementation:
1. Smartphone users can enable Face ID or Fingerprint
2. Instead of PIN, use biometric
3. Fast and secure (government-grade)
4. Optional (not required)
```

**Cost**: Free (built into phones)

---

## Implementation Checklist

### Week 1: Database Setup
- [ ] Create Supabase tables
- [ ] Set up Row Level Security (RLS) policies
- [ ] Create API keys
- [ ] Test database connection

### Week 2-3: Backend Development
- [ ] Implement Phone + PIN authentication
- [ ] Implement SMS magic link
- [ ] Create audit logging
- [ ] Write unit tests

### Week 3-4: Frontend Development
- [ ] Build auth method selector UI
- [ ] Build phone + PIN entry form
- [ ] Build SMS link verification flow
- [ ] Build loading states and error messages

### Week 4: Testing & Hardening
- [ ] Security review
- [ ] Accessibility testing
- [ ] User testing with community members
- [ ] Fix issues discovered

### Week 5: Deployment & Training
- [ ] Deploy to production
- [ ] Train PICC staff
- [ ] Train community members
- [ ] Monitor for issues

---

## Key Implementation Details

### Phone + PIN (Phase 1 - Ready to Use)

**User Flow:**

```
Unregistered User:
1. PICC staff creates account (name, phone)
2. Person comes to PICC office
3. Staff creates 4-digit PIN (person chooses or staff assigns)
4. Write PIN on paper (person keeps copy)
5. Test together: "Let's try logging in"
6. Success! Person knows their PIN

Registered User:
1. Open app/website
2. "How do you want to log in?"
3. Tap "Phone + PIN"
4. Enter phone number (optional - pre-filled if remembered)
5. Tap next
6. Enter 4-digit PIN
7. "Welcome, [Name]!"
```

**Code Implementation** (Already provided in research document):

Use the `palm-island-auth.ts` functions from the full research document:
- `registerPhonePin()`
- `authenticatePhonePin()`

**UI Components:**

```typescript
// PhoneNumberEntry.tsx
export function PhoneNumberEntry() {
  const [phone, setPhone] = useState('')
  
  return (
    <div className="max-w-sm mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Your Phone Number</h2>
      <p className="text-gray-600 mb-6">
        Enter the phone number you registered with PICC
      </p>
      
      <div className="space-y-4">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="0412 345 678"
          className="w-full px-4 py-3 border-2 rounded text-lg"
        />
        
        <button 
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg"
        >
          Next
        </button>
      </div>
      
      <p className="text-center text-sm text-gray-500 mt-6">
        Need help? Visit PICC office or ask family member
      </p>
    </div>
  )
}

// PINEntry.tsx
export function PINEntry({ onSuccess }) {
  const [pin, setPin] = useState('')
  const [attempts, setAttempts] = useState(0)
  
  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
    setPin(value)
  }
  
  const handleSubmit = async () => {
    if (pin.length !== 4) {
      alert('PIN must be 4 digits')
      return
    }
    
    // Call authenticate API
    const result = await authenticatePhonePin(phone, pin)
    
    if (result.success) {
      onSuccess(result.session)
    } else {
      setAttempts(attempts + 1)
      if (attempts >= 2) {
        alert('Too many attempts. Visit PICC office for help.')
      } else {
        alert(`Wrong PIN. Try again (${3 - attempts} attempts left)`)
      }
      setPin('')
    }
  }
  
  return (
    <div className="max-w-sm mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Your PIN</h2>
      <p className="text-gray-600 mb-6">
        Enter your 4-digit PIN (like an ATM PIN)
      </p>
      
      <div className="space-y-4">
        {/* PIN Display (shows dots instead of numbers) */}
        <div className="flex gap-2 justify-center mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-12 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center text-2xl font-bold"
            >
              {pin[i] ? '•' : ''}
            </div>
          ))}
        </div>
        
        {/* Number pad */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => pin.length < 4 && setPin(pin + num)}
              className="py-3 text-xl font-bold border-2 rounded hover:bg-gray-100"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => setPin(pin.slice(0, -1))}
            className="py-3 text-xl font-bold border-2 rounded hover:bg-gray-100"
          >
            ← Back
          </button>
          <button
            onClick={() => pin.length < 4 && setPin(pin + '0')}
            className="py-3 text-xl font-bold border-2 rounded hover:bg-gray-100"
          >
            0
          </button>
          <button
            onClick={() => setPin('')}
            className="py-3 text-xl font-bold border-2 rounded hover:bg-red-100"
          >
            Clear
          </button>
        </div>
        
        <button 
          onClick={handleSubmit}
          disabled={pin.length !== 4}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg disabled:opacity-50"
        >
          Sign In
        </button>
      </div>
      
      <p className="text-center text-sm text-gray-500 mt-6">
        Forgot PIN? Visit PICC office
      </p>
    </div>
  )
}
```

### SMS Magic Link (Phase 1 - Backup)

**User Flow:**

```
1. "How do you want to log in?"
2. Tap "SMS Link"
3. Enter phone number
4. "SMS sent! Check your messages"
5. Person opens SMS
6. Taps link (auto-redirects to login page)
7. "Welcome!"
```

**Cost**: ~$0.01-0.03 per SMS

**Implementation** (from research document):
- `sendSmsMagicLink()`

### In-Person Assistance (Phase 1)

**When to Use:**
- Person never registered
- Forgot phone number
- Lost PIN
- No smartphone
- Needs help from family

**PICC Staff Process:**

```
1. Person comes to office
2. Staff verifies identity (ID, community member status)
3. If first time: Create account (register phone + PIN)
4. If registered: Verify phone number in system
5. Staff logs person in (assisted auth)
6. Person can now use account
7. Log the action in audit trail
```

**Implementation** (from research document):
- `assistedLogin()`

---

## Security Best Practices

### PIN Security

```
✅ DO:
- Hash PINs with bcrypt (cost factor 12)
- Lock account after 3 failed attempts
- Require in-person registration
- Keep audit trail
- Expire sessions after 1 hour inactivity

❌ DON'T:
- Send PIN via SMS (insecure)
- Store PIN in plain text
- Use simple PINs (1111, 1234)
- Allow unlimited attempts
- Share PIN with other staff
```

### Data Protection

```
✅ Use Row Level Security (RLS) in Supabase
✅ Only show users their own data
✅ Encrypt sensitive fields
✅ Log all access attempts
✅ Regular security audits
```

### Accessibility

```
✅ Test with actual community members
✅ Support multiple languages
✅ Large text and high contrast
✅ Audio feedback (success/error sounds)
✅ No time pressure (long timeouts)
✅ Always offer help option
```

---

## Community Training Plan

### For PICC Staff (2 hours)

**Topics:**
1. How Phone + PIN works (30 min)
2. Registering new users (30 min)
3. Helping people who forgot PIN (30 min)
4. Security and privacy (30 min)

**Materials:**
- Staff training guide
- Quick reference card
- Video demonstration
- Practice scenarios

### For Community Members (15 minutes each)

**Topics:**
1. Choose authentication method (5 min)
2. Register or log in (10 min)

**Materials:**
- Visual instruction posters
- One-page quick guide
- Video tutorial
- Family member can help

---

## Monitoring & Support

### Week 1 Metrics

```
✅ Registration success rate (target: >90%)
✅ Login success rate (target: >95%)
✅ Average login time (target: <2 min)
✅ Support requests (target: <10/week)
✅ User satisfaction (target: >80%)
```

### Ongoing Monitoring

```
Daily:
- Check error logs
- Monitor failed login attempts
- Verify backup systems working

Weekly:
- Analyze usage patterns
- Review support tickets
- Check system performance

Monthly:
- Security audit
- Update documentation
- Plan improvements
```

### Support Channels

```
Email: support@palmisland.org.au
Phone: [PICC office number]
In-Person: Visit PICC office
Online: Help page with FAQs and videos
```

---

## Timeline & Budget

### Phase 1 (Weeks 1-5)

**Timeline:**
- Week 1: Database setup
- Week 2-3: Backend development
- Week 3-4: Frontend development
- Week 4: Testing
- Week 5: Deployment + training

**Budget:**
- Development: ~$10,000-15,000 (if outsourced)
- Hosting: Included in Supabase
- SMS: ~$1-5/month
- Training: ~$500 (materials)
- **Total: ~$10,500-15,500**

### Phase 2 (Weeks 7-10)

**Add Voice OTP:**
- Development: ~$5,000
- Twilio: ~$5-10/month
- **Total: ~$5,000**

**Add Biometric:**
- Development: ~$3,000
- Cost: Free (built-in)
- **Total: ~$3,000**

---

## FAQ

### "What if someone forgets their PIN?"

They visit PICC office. Staff verifies identity and:
- Resets PIN (new one created)
- OR logs them in directly (assisted auth)

No harm done, takes 5 minutes.

### "Is 4-digit PIN secure enough?"

Yes, when combined with:
- Device-level security (phone)
- Locked account after 3 failed attempts
- No brute force capability (requires phone registration)
- Works as well as M-Pesa (50+ million users)

### "What about people without phones?"

They register with:
- Landline number, OR
- Family member's phone, OR
- Community center phone

Multiple registration options ensure nobody is excluded.

### "Can someone else use my account?"

No because:
- PIN is private (like ATM PIN)
- Registered to specific phone
- If someone steals phone, account is protected by PIN
- Account lockout after failed attempts

### "What if the internet is down?"

Phone + PIN works offline:
- App stores credentials locally
- Authenticates against device
- Syncs when internet returns

Magic links and voice OTP require internet (acceptable for backup options).

### "How do we handle people with disabilities?"

Multiple options ensure accessibility:
- Voice OTP for blind/low-vision users
- Large text/high contrast for vision impaired
- Audio feedback for deaf/hard-of-hearing
- Physical PIN card for those who can't remember

Always have staff assistance available.

---

## Next Steps

### Immediate (This Week)

1. **Get approval** from PICC leadership
2. **Create database schema** (copy SQL from this guide)
3. **Start backend development** (Phone + PIN APIs)

### Short-term (This Month)

4. Build frontend components
5. Test with sample users
6. Train PICC staff
7. Deploy to production

### Medium-term (Next Month)

8. Monitor usage and fix issues
9. Gather feedback from community
10. Plan Phase 2 additions

---

## Success Metrics

**After 1 Month:**
- 50+ community members registered
- 90%+ login success rate
- <10 support requests/week
- >80% user satisfaction

**After 3 Months:**
- 200+ community members registered
- 95%+ login success rate
- <5 support requests/week
- >85% user satisfaction

**After 6 Months:**
- 50%+ of community registered
- Voice OTP successfully deployed
- Biometric auth available
- Recognized as accessible, community-friendly platform

---

## References

- Full research: `LOW-LITERACY-AUTHENTICATION-RESEARCH.md`
- Supabase docs: https://supabase.com/docs
- Indigenous data sovereignty: `INDIGENOUS-DATA-SOVEREIGNTY-INTEGRATION.md`
- Cultural protocols: `documentation/cultural-protocols.md`

---

**Document Status**: Ready for Implementation
**Last Updated**: November 5, 2025
**Next Review**: After Phase 1 Completion

For questions or clarifications, contact the development team.
