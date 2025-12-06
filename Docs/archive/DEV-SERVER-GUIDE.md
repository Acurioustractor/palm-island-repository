# Dev Server - Simple Launch Guide

Stop fucking around with multiple servers and port conflicts. Use these scripts.

## 🚀 Quick Start (One Command)

```bash
./start-dev.sh
```

That's it. The script will:
1. ✅ Kill any existing servers on ports 3000/3001
2. ✅ Start fresh server on port 3000
3. ✅ Wait for it to be ready
4. ✅ Test all routes (media, gallery, collections, smart-folders)
5. ✅ Show you where to access it
6. ✅ Keep running (Ctrl+C to stop)

## 📍 Access Your App

After starting, visit:
- **Main Hub:** http://localhost:3000/picc/media
- **Gallery:** http://localhost:3000/picc/media/gallery
- **Collections:** http://localhost:3000/picc/media/collections
- **Smart Folders:** http://localhost:3000/picc/media/smart-folders

Or run:
```bash
./open-media.sh
```

## 🛑 Stop Server

```bash
./stop-dev.sh
```

Or just `Ctrl+C` in the terminal running start-dev.sh

## 📝 Watch Logs

```bash
tail -f /tmp/palm-island-dev.log
```

## 🐛 If Something's Wrong

### 404 Error?
```bash
./stop-dev.sh
./start-dev.sh
```

### Port Already in Use?
```bash
./stop-dev.sh
```

### Can't Connect?
```bash
# Check if server is running
lsof -i:3000

# Check logs
tail -50 /tmp/palm-island-dev.log

# Restart
./stop-dev.sh && ./start-dev.sh
```

## 📋 All Available Scripts

| Script | Purpose |
|--------|---------|
| `./start-dev.sh` | **Start dev server** (use this) |
| `./stop-dev.sh` | Stop all dev servers |
| `./open-media.sh` | Open media library in browser |
| `./verify-collections.sh` | Test database tables |
| `./test-collections-system.sh` | Full system test |

## 🎯 Typical Workflow

1. **Start server:**
   ```bash
   ./start-dev.sh
   ```

2. **Open in browser:**
   - Manually: http://localhost:3000/picc/media
   - Or run: `./open-media.sh`

3. **Work on code:**
   - Edit files
   - Browser auto-refreshes

4. **Stop when done:**
   - Press `Ctrl+C`
   - Or run: `./stop-dev.sh`

## ⚡ Pro Tips

- **Always use `./start-dev.sh`** - it handles everything
- **Don't run `npm run dev` directly** - use the script
- **Server takes ~5-10 seconds to start** - script waits automatically
- **Logs saved to /tmp/palm-island-dev.log** - check if issues
- **Port 3000 is hardcoded** - no more guessing which port

## 🚨 Emergency Reset

If everything is fucked:

```bash
# 1. Kill everything
./stop-dev.sh

# 2. Kill manually if needed
lsof -ti:3000 -ti:3001 | xargs kill -9

# 3. Wait 2 seconds
sleep 2

# 4. Start fresh
./start-dev.sh
```

## ✅ Success Checklist

After running `./start-dev.sh`, you should see:

```
✅ Ports 3000 and 3001 cleared
✅ Environment configured
✅ Server is ready!
✅ /picc/media (HTTP 200)
✅ /picc/media/gallery (HTTP 200)
✅ /picc/media/collections (HTTP 200)
✅ /picc/media/smart-folders (HTTP 200)
✅ /picc/media/upload (HTTP 200)
✅ Dev Server Running Successfully!
```

If you see all those checkmarks, you're good to go.

## 🎉 That's It

No more confusion. One script to start. One script to stop. Done.
