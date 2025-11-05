# Production & Development Plan - Part 3
## Sprint 5-6: On-Country Infrastructure & Launch

**Continuation of:** PRODUCTION-DEVELOPMENT-PLAN-PART2.md
**Date:** November 5, 2025

---

## Sprint 5: On-Country Infrastructure (Days 57-70)

### Option A: Cloud Staging First (Recommended for MVP)

**Note:** For the 90-day MVP, we recommend starting with cloud infrastructure (Vercel + Supabase) and planning on-country deployment for later. This allows faster launch and testing before hardware investment.

**Task 5A.1: Production Cloud Deployment**

```bash
# 1. Deploy to Vercel Production
cd web-platform
vercel --prod

# 2. Configure custom domain
vercel domains add palmisland.org.au

# 3. Set up SSL
# (Automatic with Vercel)

# 4. Configure CDN and caching
# Edit vercel.json
```

Create `web-platform/vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
    {
      "source": "/images/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

### Option B: On-Country Server Setup (Future Phase)

**Task 5B.1: Server Hardware Setup**

```bash
# This is a comprehensive guide for when hardware is procured
# Can be done in parallel with MVP development

# SERVER SETUP CHECKLIST
# ═════════════════════

# 1. Hardware Procurement (Week 1-2)
# ───────────────────────────────────
- [ ] Order server hardware (Dell PowerEdge R450 or similar)
- [ ] Order NAS units (2x Synology DS1621+)
- [ ] Order UPS (APC Smart-UPS 2200VA)
- [ ] Order network equipment (switch, WiFi APs, cables)
- [ ] Order rack and accessories

# 2. Site Preparation (Week 3)
# ────────────────────────────
- [ ] Prepare server room (clean, secure)
- [ ] Install electrical circuits
- [ ] Install cooling/ventilation
- [ ] Install rack
- [ ] Run network cabling

# 3. Hardware Installation (Week 4)
# ──────────────────────────────────
- [ ] Rack mount server
- [ ] Install NAS units
- [ ] Install UPS
- [ ] Install switch and network equipment
- [ ] Connect and cable everything
- [ ] Test power and network
```

**Task 5B.2: Ubuntu Server Installation**

```bash
# Install Ubuntu Server 22.04 LTS on primary server

# 1. Download Ubuntu Server
wget https://releases.ubuntu.com/22.04/ubuntu-22.04.3-live-server-amd64.iso

# 2. Create bootable USB
# (Use Rufus on Windows or dd on Linux)

# 3. Boot and install
# - Choose "Install Ubuntu Server"
# - Hostname: palmisland-server-01
# - Username: picc-admin
# - Install OpenSSH server: YES
# - Install Docker: YES (from options)

# 4. After installation, update system
sudo apt update && sudo apt upgrade -y

# 5. Install required packages
sudo apt install -y \
  docker.io \
  docker-compose \
  postgresql-client \
  nginx \
  certbot \
  python3-certbot-nginx \
  htop \
  tmux \
  vim \
  git \
  ufw \
  fail2ban

# 6. Configure firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# 7. Enable Docker
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker picc-admin

# 8. Set up Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

**Task 5B.3: Deploy Self-Hosted Supabase**

Create `/opt/palm-island/docker-compose.yml`:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: supabase/postgres:15.1.0.117
    container_name: palm-island-db
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_PORT: 5432
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Supabase Studio
  studio:
    image: supabase/studio:20231123-64a766a
    container_name: palm-island-studio
    environment:
      SUPABASE_URL: http://kong:8000
      STUDIO_PG_META_URL: http://meta:8080
      SUPABASE_ANON_KEY: ${ANON_KEY}
      SUPABASE_SERVICE_KEY: ${SERVICE_ROLE_KEY}
    ports:
      - "3001:3000"
    depends_on:
      - postgres
    restart: unless-stopped

  # Kong API Gateway
  kong:
    image: kong:2.8.1
    container_name: palm-island-kong
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: /var/lib/kong/kong.yml
      KONG_DNS_ORDER: LAST,A,CNAME
      KONG_PLUGINS: request-transformer,cors,key-auth,acl
    volumes:
      - ./kong.yml:/var/lib/kong/kong.yml:ro
    ports:
      - "8000:8000"
      - "8443:8443"
    restart: unless-stopped

  # GoTrue (Auth)
  auth:
    image: supabase/gotrue:v2.99.0
    container_name: palm-island-auth
    environment:
      GOTRUE_API_HOST: 0.0.0.0
      GOTRUE_API_PORT: 9999
      GOTRUE_DB_DRIVER: postgres
      GOTRUE_DB_DATABASE_URL: postgres://postgres:${DB_PASSWORD}@postgres:5432/postgres
      GOTRUE_SITE_URL: ${SITE_URL}
      GOTRUE_URI_ALLOW_LIST: ${ADDITIONAL_REDIRECT_URLS}
      GOTRUE_DISABLE_SIGNUP: false
      GOTRUE_JWT_SECRET: ${JWT_SECRET}
      GOTRUE_JWT_EXP: 3600
      GOTRUE_JWT_DEFAULT_GROUP_NAME: authenticated
    depends_on:
      - postgres
    restart: unless-stopped

  # PostgREST
  rest:
    image: postgrest/postgrest:v11.2.0
    container_name: palm-island-rest
    environment:
      PGRST_DB_URI: postgres://postgres:${DB_PASSWORD}@postgres:5432/postgres
      PGRST_DB_SCHEMAS: public,storage
      PGRST_DB_ANON_ROLE: anon
      PGRST_JWT_SECRET: ${JWT_SECRET}
      PGRST_DB_USE_LEGACY_GUCS: "false"
    depends_on:
      - postgres
    restart: unless-stopped

  # Realtime
  realtime:
    image: supabase/realtime:v2.25.35
    container_name: palm-island-realtime
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: postgres
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: postgres
      DB_SSL: "false"
      PORT: 4000
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres
    restart: unless-stopped

  # Storage
  storage:
    image: supabase/storage-api:v0.43.11
    container_name: palm-island-storage
    environment:
      ANON_KEY: ${ANON_KEY}
      SERVICE_KEY: ${SERVICE_ROLE_KEY}
      POSTGREST_URL: http://rest:3000
      PGRST_JWT_SECRET: ${JWT_SECRET}
      DATABASE_URL: postgres://postgres:${DB_PASSWORD}@postgres:5432/postgres
      FILE_SIZE_LIMIT: 52428800
      STORAGE_BACKEND: file
      FILE_STORAGE_BACKEND_PATH: /var/lib/storage
      TENANT_ID: stub
      REGION: local
      GLOBAL_S3_BUCKET: stub
    volumes:
      - storage-data:/var/lib/storage
    depends_on:
      - postgres
      - rest
    restart: unless-stopped

  # MinIO (S3-compatible object storage)
  minio:
    image: minio/minio:latest
    container_name: palm-island-minio
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    volumes:
      - minio-data:/data
    ports:
      - "9000:9000"
      - "9001:9001"
    command: server /data --console-address ":9001"
    restart: unless-stopped

  # Redis (Caching)
  redis:
    image: redis:7-alpine
    container_name: palm-island-redis
    volumes:
      - redis-data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped

  # Next.js Application
  web:
    build:
      context: ./web-platform
      dockerfile: Dockerfile
    container_name: palm-island-web
    environment:
      NEXT_PUBLIC_SUPABASE_URL: http://kong:8000
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${ANON_KEY}
      SUPABASE_SERVICE_ROLE_KEY: ${SERVICE_ROLE_KEY}
      DATABASE_URL: postgres://postgres:${DB_PASSWORD}@postgres:5432/postgres
      REDIS_URL: redis://redis:6379
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
      - kong
    restart: unless-stopped

volumes:
  postgres-data:
  storage-data:
  minio-data:
  redis-data:
```

Create `.env` file:

```bash
# Generate secure keys:
# openssl rand -base64 32

DB_PASSWORD=your-secure-db-password
JWT_SECRET=your-jwt-secret-at-least-32-chars
ANON_KEY=your-anon-key
SERVICE_ROLE_KEY=your-service-role-key

SITE_URL=https://palmisland.org.au
ADDITIONAL_REDIRECT_URLS=

MINIO_ROOT_USER=minio-admin
MINIO_ROOT_PASSWORD=your-minio-password
```

**Task 5B.4: Start Services**

```bash
# Navigate to deployment directory
cd /opt/palm-island

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f web

# Test database connection
docker-compose exec postgres psql -U postgres -d postgres

# Apply migrations
docker-compose exec web npm run db:migrate
```

**Task 5B.5: Configure Nginx Reverse Proxy**

Create `/etc/nginx/sites-available/palmisland`:

```nginx
server {
    listen 80;
    server_name palmisland.org.au www.palmisland.org.au;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name palmisland.org.au www.palmisland.org.au;

    # SSL Configuration (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/palmisland.org.au/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/palmisland.org.au/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Next.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Supabase API
    location /api/supabase/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Storage
    location /storage/ {
        proxy_pass http://localhost:9000/;
        proxy_set_header Host $host;
    }

    # Logs
    access_log /var/log/nginx/palmisland_access.log;
    error_log /var/log/nginx/palmisland_error.log;
}
```

Enable site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/palmisland /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d palmisland.org.au -d www.palmisland.org.au
```

**Task 5B.6: Configure Backups**

Create `/opt/palm-island/backup.sh`:

```bash
#!/bin/bash

# Palm Island Platform Backup Script
# Run daily via cron

BACKUP_DIR="/mnt/backup"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR/database
mkdir -p $BACKUP_DIR/storage
mkdir -p $BACKUP_DIR/logs

# Backup PostgreSQL database
echo "Backing up database..."
docker-compose exec -T postgres pg_dump -U postgres postgres | gzip > $BACKUP_DIR/database/palmisland_$DATE.sql.gz

# Backup storage files
echo "Backing up storage..."
tar -czf $BACKUP_DIR/storage/storage_$DATE.tar.gz /opt/palm-island/storage-data

# Backup logs
echo "Backing up logs..."
tar -czf $BACKUP_DIR/logs/logs_$DATE.tar.gz /var/log/nginx /opt/palm-island/logs

# Sync to backup NAS
echo "Syncing to backup NAS..."
rsync -avz --delete $BACKUP_DIR/ /mnt/backup-nas/palm-island/

# Sync to cloud (encrypted)
echo "Syncing to cloud backup..."
rclone sync $BACKUP_DIR/ b2:palm-island-backups --b2-hard-delete

# Clean up old backups
echo "Cleaning old backups..."
find $BACKUP_DIR/database -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR/storage -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR/logs -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $DATE"
```

Make executable and add to cron:

```bash
chmod +x /opt/palm-island/backup.sh

# Add to crontab (run daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/palm-island/backup.sh >> /var/log/palm-island-backup.log 2>&1") | crontab -
```

**Task 5B.7: Monitoring Setup**

Create `/opt/palm-island/monitoring/docker-compose.monitoring.yml`:

```yaml
version: '3.8'

services:
  # Prometheus (Metrics)
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    restart: unless-stopped

  # Grafana (Visualization)
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_SERVER_ROOT_URL=https://palmisland.org.au/grafana
    volumes:
      - grafana-data:/var/lib/grafana
    ports:
      - "3002:3000"
    depends_on:
      - prometheus
    restart: unless-stopped

  # Node Exporter (System metrics)
  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    ports:
      - "9100:9100"
    restart: unless-stopped

  # cAdvisor (Container metrics)
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    container_name: cadvisor
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    ports:
      - "8080:8080"
    restart: unless-stopped

  # Uptime Kuma (Uptime monitoring)
  uptime-kuma:
    image: louislam/uptime-kuma:1
    container_name: uptime-kuma
    volumes:
      - uptime-kuma-data:/app/data
    ports:
      - "3003:3001"
    restart: unless-stopped

volumes:
  prometheus-data:
  grafana-data:
  uptime-kuma-data:
```

Start monitoring:

```bash
cd /opt/palm-island/monitoring
docker-compose -f docker-compose.monitoring.yml up -d
```

---

## Sprint 6: Testing, Launch & Training (Days 71-90)

### Week 11: Comprehensive Testing

#### Day 71-73: Functional Testing

**Task 6.1: End-to-End Test Suite**

Create `web-platform/tests/e2e/stories.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Story Submission Flow', () => {
  test('User can submit a story', async ({ page }) => {
    // Navigate to submission page
    await page.goto('/stories/submit')

    // Fill in story form
    await page.fill('[name="title"]', 'Test Story from E2E Test')
    await page.fill('[name="summary"]', 'This is a test story summary')
    await page.fill('[name="content"]', 'This is the full story content...')

    // Select category
    await page.check('[name="category"][value="community"]')

    // Submit
    await page.click('button[type="submit"]')

    // Check for success
    await expect(page.locator('text=Story submitted')).toBeVisible()
  })

  test('User can view published stories', async ({ page }) => {
    await page.goto('/stories')

    // Check stories are visible
    await expect(page.locator('.story-card')).toHaveCount({ min: 1 })
  })

  test('User can search stories', async ({ page }) => {
    await page.goto('/stories')

    // Search
    await page.fill('[placeholder="Search stories..."]', 'healing')
    await page.press('[placeholder="Search stories..."]', 'Enter')

    // Check results
    await page.waitForURL('**/stories?search=healing')
    await expect(page.locator('.story-card')).toHaveCount({ min: 1 })
  })
})

test.describe('Annual Report Generation', () => {
  test('Can generate annual report', async ({ page }) => {
    await page.goto('/reports/annual/2024')

    // Check report loads
    await expect(page.locator('h1')).toContainText('Annual Report 2024')

    // Check sections exist
    await expect(page.locator('text=Executive Summary')).toBeVisible()
    await expect(page.locator('text=Service Delivery')).toBeVisible()
  })

  test('Can switch report templates', async ({ page }) => {
    await page.goto('/reports/annual/2024?template=community')

    await expect(page.locator('h1')).toContainText('Our Year Together')
  })
})
```

Run tests:

```bash
# Install Playwright
npm install -D @playwright/test

# Run tests
npx playwright test

# Run with UI
npx playwright test --ui
```

#### Day 74-76: Performance Testing

**Task 6.2: Load Testing**

Create `web-platform/tests/load/stories.js` (using k6):

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users
    { duration: '5m', target: 10 }, // Stay at 10 users
    { duration: '2m', target: 50 }, // Ramp up to 50 users
    { duration: '5m', target: 50 }, // Stay at 50 users
    { duration: '2m', target: 0 },  // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.01'],    // Error rate should be below 1%
  },
};

export default function () {
  // Test homepage
  let res = http.get('https://palmisland.org.au/');
  check(res, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads in <2s': (r) => r.timings.duration < 2000,
  });
  sleep(1);

  // Test stories page
  res = http.get('https://palmisland.org.au/stories');
  check(res, {
    'stories page status is 200': (r) => r.status === 200,
    'stories page loads in <2s': (r) => r.timings.duration < 2000,
  });
  sleep(1);

  // Test search
  res = http.get('https://palmisland.org.au/stories?search=healing');
  check(res, {
    'search status is 200': (r) => r.status === 200,
  });
  sleep(2);
}
```

Run load test:

```bash
# Install k6
# (See https://k6.io/docs/get-started/installation/)

# Run load test
k6 run tests/load/stories.js

# Run with Grafana dashboard
k6 run --out influxdb=http://localhost:8086/k6 tests/load/stories.js
```

#### Day 77-78: Security Testing

**Task 6.3: Security Audit**

```bash
# 1. Run OWASP ZAP scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://palmisland.org.au

# 2. Check for vulnerabilities in dependencies
npm audit

# 3. Check for secrets in code
npm install -g gitleaks
gitleaks detect --source .

# 4. SSL/TLS test
curl -I https://palmisland.org.au | grep -i strict

# 5. Security headers check
curl -I https://palmisland.org.au
```

**Security Checklist:**

```markdown
- [ ] HTTPS enforced (no HTTP access)
- [ ] Security headers set (CSP, HSTS, X-Frame-Options, etc.)
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection (input sanitization)
- [ ] CSRF protection (tokens)
- [ ] Rate limiting enabled
- [ ] Authentication secure (password hashing, secure sessions)
- [ ] File upload validation
- [ ] API authentication and authorization
- [ ] Data encryption at rest
- [ ] Regular backups tested
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies up to date
- [ ] No secrets in code
```

### Week 12: Launch Preparation

#### Day 79-83: User Training

**Task 6.4: Create Training Materials**

Create training video scripts and materials:

1. **For Community Members (15 minutes)**
   - How to sign in
   - How to submit a story
   - How to add photos
   - Privacy settings explained
   - Finding and viewing stories

2. **For PICC Staff (30 minutes)**
   - Everything above, plus:
   - Approving stories
   - Managing content
   - Using the admin dashboard
   - Running reports
   - Understanding analytics

3. **For IT Staff (2 hours)**
   - System architecture overview
   - Monitoring and maintenance
   - Backup and recovery
   - Troubleshooting common issues
   - Updating the platform

**Task 6.5: Conduct Training Sessions**

```markdown
Training Schedule:

Week 12:
- Monday: PICC Leadership (1 hour)
- Tuesday: IT Staff (2 hours)
- Wednesday: Service Managers (1.5 hours)
- Thursday: Frontline Staff (2 sessions × 1 hour)
- Friday: Community Drop-in (open, 3 hours)

Week 13:
- Monday-Friday: Open office hours for questions
```

#### Day 84-86: Soft Launch

**Task 6.6: Soft Launch Checklist**

```markdown
Pre-Launch Checklist:
- [ ] All tests passing
- [ ] Production environment configured
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Backups running and tested
- [ ] Monitoring active
- [ ] Support email set up (support@palmisland.org.au)
- [ ] Staff trained
- [ ] Documentation published
- [ ] Announcement prepared

Launch Day:
- [ ] Final smoke test on production
- [ ] Enable domain DNS
- [ ] Send announcement email to staff
- [ ] Post on social media (soft launch)
- [ ] Monitor error logs closely
- [ ] Be available for support

Week 1 Post-Launch:
- [ ] Daily check-ins with users
- [ ] Monitor usage analytics
- [ ] Fix critical issues immediately
- [ ] Gather feedback
- [ ] Adjust based on real-world use
```

**Task 6.7: Soft Launch Announcement**

Email template:

```
Subject: Palm Island Story Server is Now Live! 🎉

Dear PICC Staff and Community,

We're excited to announce the soft launch of the Palm Island Story Server!

What is it?
The Story Server is our new platform for collecting, preserving, and sharing
community stories. It's built for us, by us, with complete community control.

How to access:
Visit: https://palmisland.org.au
Sign in with your email

What you can do:
✓ Share your own stories
✓ Upload photos and memories
✓ View community stories
✓ Explore by category, place, and time

This is a SOFT LAUNCH – we're starting with staff and early adopters to gather
feedback before opening to the wider community.

Need help?
- Email: support@palmisland.org.au
- Drop by PICC office during open hours
- Check out the video tutorials at palmisland.org.au/help

We want to hear from you! Your feedback will help us make this platform even
better for our community.

Ngali gutta, ngali yumba (Our stories, our strength),
PICC Team
```

#### Day 87-90: Full Launch & Celebration

**Task 6.8: Community Launch Event**

```markdown
Launch Event Plan:

Date: Day 90 (Friday)
Time: 3pm - 6pm
Location: PICC Community Hall

Agenda:
3:00pm - Welcome and acknowledgment of country
3:15pm - Platform demonstration (live on screen)
3:30pm - First community story submission (live)
3:45pm - Q&A
4:00pm - Open exploration (devices available)
4:00pm - Food and refreshments
5:30pm - Closing remarks
6:00pm - Finish

Setup:
- [ ] 5-10 tablets/laptops set up for demos
- [ ] Large screen/projector for presentation
- [ ] WiFi tested and working
- [ ] QR codes for easy access
- [ ] Printed quick-start guides
- [ ] Photo area for event documentation
- [ ] Refreshments arranged

Promotion:
- [ ] Posters around community (2 weeks before)
- [ ] Social media posts (1 week before)
- [ ] Email invitation to all PICC staff
- [ ] Announcement at community meetings
- [ ] Local radio announcement (if available)
```

**Task 6.9: Post-Launch Monitoring**

```bash
# Set up alerts for critical metrics
# Configure in Grafana or Uptime Kuma

# Daily check (first 2 weeks):
# 1. Check error logs
docker-compose logs --tail=100 web | grep ERROR

# 2. Check system resources
docker stats

# 3. Check backup status
ls -lah /mnt/backup/database/ | head -5

# 4. Check uptime
uptime

# 5. Check recent signups
# Query database for new users

# 6. Check story submissions
# Query database for new stories

# 7. Review support tickets
# Check support@palmisland.org.au
```

---

## Final Deliverables Checklist

### MVP Complete (90 Days)

**Infrastructure:**
```
✅ Supabase configured and deployed
✅ Web platform live on production
✅ SSL certificate installed
✅ Domain configured
✅ CDN and caching enabled
✅ Monitoring active
✅ Backups running
```

**Core Features:**
```
✅ User authentication (email/password + magic link)
✅ Story submission form
✅ Photo upload
✅ Story viewing and browsing
✅ Search functionality
✅ Filtering by category
✅ Story detail pages
✅ User profiles
```

**Annual Report System:**
```
✅ Data aggregation
✅ Report generation (3 templates)
✅ Interactive web view
✅ PDF export capability
✅ JSON data export
```

**Quality Assurance:**
```
✅ E2E tests written and passing
✅ Load testing completed
✅ Security audit conducted
✅ Accessibility testing done
✅ Mobile responsive
```

**Training & Documentation:**
```
✅ User guides created
✅ Video tutorials recorded
✅ Staff training completed
✅ Technical documentation published
✅ Support process established
```

**Launch:**
```
✅ Soft launch to staff
✅ Feedback gathered and addressed
✅ Full community launch event
✅ Ongoing support established
```

---

## Success Metrics (First 30 Days)

Track these metrics to measure initial success:

```
User Adoption:
- Registered users: Target 50+
- Active users (weekly): Target 30+
- Stories submitted: Target 20+
- Photos uploaded: Target 100+

Technical Performance:
- Uptime: >99%
- Page load time: <3s (95th percentile)
- Error rate: <1%
- Search success rate: >85%

Engagement:
- Average session duration: >3 minutes
- Stories per user: >1.5
- Return visitor rate: >40%
- Support tickets: <5/week

Business Impact:
- Annual report generated: ✓
- Staff satisfaction: >80%
- Community feedback: Positive
- Media coverage: 1+ article
```

---

## Post-MVP Roadmap

### Months 4-6: Enhancement Phase
- Semantic search with AI embeddings
- Story relationships and recommendations
- Collections system
- Advanced analytics
- Map and timeline views

### Months 7-12: Growth Phase
- On-country server migration (if not done)
- Mobile app development
- Multi-organization support
- Advanced AI features
- Regional expansion planning

### Year 2+: Scale Phase
- Multi-organization deployment
- Advanced AI and ML
- Policy advocacy launch
- Revenue generation from licensing
- Continuous improvement based on feedback

---

## Support & Maintenance

### Daily Tasks (Automated)
- Backups run automatically
- Monitoring checks system health
- Alerts sent if issues detected

### Weekly Tasks (15 minutes)
- Review error logs
- Check backup integrity
- Review usage analytics
- Address support tickets
- Update documentation as needed

### Monthly Tasks (1 hour)
- Security updates
- Dependency updates
- Performance review
- User feedback review
- Team meeting

### Quarterly Tasks (1 day)
- Major feature releases
- Comprehensive testing
- Disaster recovery drill
- Security audit
- Strategic planning

---

## Conclusion

This production and development plan provides a **clear, actionable roadmap** to build and launch the Palm Island Community Platform in 90 days. The plan is:

✅ **Practical** - Step-by-step instructions with actual code
✅ **Flexible** - Can adapt to budget and timeline constraints
✅ **Comprehensive** - Covers infrastructure, development, testing, and launch
✅ **Sustainable** - Includes monitoring, backups, and maintenance plans

**Key Success Factors:**
1. Strong team communication and collaboration
2. Iterative development with continuous feedback
3. Focus on MVP features first, enhance later
4. Comprehensive testing before launch
5. Proper training and support for users
6. Ongoing monitoring and improvement

**Ready to Build!** 🚀

This plan can be started immediately with:
1. Supabase account setup (Day 1)
2. Development environment configuration (Day 1)
3. Team onboarding (Week 1)
4. Sprint 1 kickoff (Week 1)

---

**Document Status:** Part 3 Complete - Full Production Plan Finished!
**Files:**
- PRODUCTION-DEVELOPMENT-PLAN.md (Sprint 1)
- PRODUCTION-DEVELOPMENT-PLAN-PART2.md (Sprints 2-4)
- PRODUCTION-DEVELOPMENT-PLAN-PART3.md (Sprints 5-6)
