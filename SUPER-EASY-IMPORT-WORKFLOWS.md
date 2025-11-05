# 🚀 Super Easy Import Workflows
## Making Content Upload Accessible to EVERYONE

**Design Philosophy**: "If an Elder can't do it in 3 clicks, it's too complicated"

---

## 🎯 The Challenge

**Current problems with most platforms:**
- ❌ Complex multi-step forms
- ❌ Technical jargon ("metadata", "taxonomy", "slug")
- ❌ Require typing long text
- ❌ Need to understand file formats
- ❌ No help available
- ❌ Easy to make mistakes, hard to fix

**What we need for Palm Island:**
- ✅ One-click upload from phone
- ✅ Voice recording > automatic transcription
- ✅ Visual, not text-heavy
- ✅ In-person assistance always available
- ✅ Can't break anything
- ✅ Easy to fix mistakes

---

## 🎤 Method 1: Voice Story Recording (EASIEST)

**Best for**: Elders, oral storytellers, anyone who prefers speaking to typing

### **User Experience:**

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│              🎤 RECORD YOUR STORY                             │
│                                                               │
│     ┌─────────────────────────────────────────────┐         │
│     │                                               │         │
│     │                                               │         │
│     │          [  LARGE RED BUTTON  ]              │         │
│     │           "TAP TO START"                     │         │
│     │                                               │         │
│     │                                               │         │
│     └─────────────────────────────────────────────┘         │
│                                                               │
│     Instructions in plain language:                          │
│     "Tap the button and tell your story.                     │
│      We'll write it down for you."                           │
│                                                               │
│                                                               │
│     [🎧 Hear example story]                                  │
│     [👤 Need help? Talk to staff]                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### **Workflow:**

```typescript
// Step 1: User taps button
<button className="
  w-full h-64
  bg-gradient-to-br from-red-500 to-red-600
  rounded-3xl shadow-2xl
  flex flex-col items-center justify-center
  hover:from-red-600 hover:to-red-700
  transition-all duration-300
  active:scale-95
">
  <span className="text-8xl mb-4">🎤</span>
  <span className="text-white text-3xl font-bold">TAP TO START</span>
</button>

// Step 2: Recording starts
<div className="recording-active animate-pulse">
  <div className="text-center">
    <span className="text-6xl">🔴</span>
    <p className="text-2xl mt-4">Recording...</p>
    <p className="text-xl text-gray-600 mt-2">
      {formatTime(recordingDuration)}
    </p>
  </div>

  <button className="mt-8 px-8 py-4 bg-gray-800 text-white rounded-xl text-2xl">
    ⏹️ STOP
  </button>
</div>

// Step 3: Playback
<div className="playback-review">
  <p className="text-2xl mb-4">✅ Recording complete!</p>

  <AudioPlayer src={recordingUrl} />

  <div className="flex gap-4 mt-6">
    <button className="flex-1 py-4 bg-green-600 text-white rounded-xl text-xl">
      ✅ Sounds good!
    </button>
    <button className="flex-1 py-4 bg-gray-400 text-white rounded-xl text-xl">
      🔄 Record again
    </button>
  </div>
</div>

// Step 4: AI transcribes in background
// User sees:
<div className="processing">
  <div className="animate-spin text-6xl mb-4">⚙️</div>
  <p className="text-xl">Writing down your story...</p>
  <p className="text-gray-600">This takes about 1 minute</p>
</div>

// Step 5: Review & publish
<div className="review">
  <p className="text-2xl mb-4">Here's what you said:</p>

  <div className="bg-gray-50 p-6 rounded-lg">
    <p className="text-lg leading-relaxed">
      {transcribedText}
    </p>
  </div>

  <button className="mt-6 w-full py-4 bg-ocean-600 text-white rounded-xl text-xl">
    📖 Share this story
  </button>
</div>
```

### **Technical Implementation:**

```typescript
// Voice Recording Component
export function VoiceRecorder() {
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'review'>('idle')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [transcript, setTranscript] = useState('')
  const mediaRecorder = useRef<MediaRecorder | null>(null)

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream)

      const chunks: Blob[] = []
      mediaRecorder.current.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setAudioBlob(blob)
        setStatus('processing')
        transcribeAudio(blob)
      }

      mediaRecorder.current.start()
      setStatus('recording')
    } catch (error) {
      console.error('Microphone access denied:', error)
      alert('Please allow microphone access to record your story')
    }
  }

  async function transcribeAudio(blob: Blob) {
    const formData = new FormData()
    formData.append('audio', blob)

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      setTranscript(data.transcript)
      setStatus('review')
    } catch (error) {
      console.error('Transcription failed:', error)
      setStatus('idle')
      alert('Something went wrong. Please try again or ask staff for help.')
    }
  }

  async function publishStory() {
    // Auto-fill as much as possible
    const story = {
      title: generateTitleFromTranscript(transcript),
      content: transcript,
      storyteller_id: getCurrentUserId(),
      audio_url: await uploadAudio(audioBlob!),
      category: await suggestCategory(transcript),  // AI suggests
      access_level: 'community',  // Default safe choice
      status: 'published'
    }

    await createStory(story)
    router.push('/stories')
  }

  return (
    <div className="voice-recorder">
      {status === 'idle' && (
        <StartRecordingButton onClick={startRecording} />
      )}

      {status === 'recording' && (
        <RecordingInProgress onStop={() => mediaRecorder.current?.stop()} />
      )}

      {status === 'processing' && (
        <ProcessingIndicator />
      )}

      {status === 'review' && (
        <ReviewAndPublish
          transcript={transcript}
          audioUrl={URL.createObjectURL(audioBlob!)}
          onPublish={publishStory}
          onRerecord={() => setStatus('idle')}
        />
      )}
    </div>
  )
}
```

---

## 📸 Method 2: Photo Upload (AT PICC PHOTO KIOSK)

**Best for**: In-person at PICC, with staff assistance

### **User Experience:**

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│           📸 PICC PHOTO KIOSK                                │
│           Professional Photos for Your Stories                │
│                                                               │
│     ┌─────────────────────────────────────────────┐         │
│     │                                               │         │
│     │         [ LIVE CAMERA PREVIEW ]              │         │
│     │                                               │         │
│     │         "Stand here and smile!"              │         │
│     │                                               │         │
│     └─────────────────────────────────────────────┘         │
│                                                               │
│     ┌───────────────────────────────────────┐               │
│     │  [  TAKE PHOTO  ]                     │               │
│     │   (Big button, easy to press)         │               │
│     └───────────────────────────────────────┘               │
│                                                               │
│     Previous photos: [○] [○] [○]                             │
│                                                               │
│     Staff: "Looking good! Want to take another one?"         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### **Photo Kiosk Features:**

```typescript
interface PhotoKioskFeatures {
  // Hardware
  professional_camera: 'DSLR or mirrorless',
  studio_lighting: '3-point lighting setup',
  backdrop: 'Cultural patterns or plain',

  // Software
  live_preview: 'See yourself before photo',
  countdown_timer: '3, 2, 1...',
  instant_review: 'Like it? Keep it or retake',

  // Assistance
  staff_present: 'Always available',
  pose_guidance: 'Helpful suggestions',
  family_photos: 'Can do group shots',

  // AI Features (background)
  auto_enhance: 'Brightness, contrast',
  face_detection: 'Center subject automatically',
  suggested_tags: 'AI suggests people, places'
}
```

### **Workflow:**

```typescript
// Photo Kiosk Component
export function PhotoKiosk() {
  const [preview, setPreview] = useState<string | null>(null)
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Start camera
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      })
  }, [])

  function capturePhoto() {
    const canvas = document.createElement('canvas')
    const video = videoRef.current!
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0)

    const photoUrl = canvas.toDataURL('image/jpeg', 0.95)
    setPreview(photoUrl)
  }

  async function keepPhoto() {
    if (!preview) return

    // Upload to Supabase Storage
    const blob = await (await fetch(preview)).blob()
    const filename = `photo-${Date.now()}.jpg`

    const { data, error } = await supabase.storage
      .from('story-media')
      .upload(`kiosk/${filename}`, blob)

    if (!error) {
      setCapturedPhotos([...capturedPhotos, data.path])
      setPreview(null)

      // Show success message
      toast.success('Photo saved! Take another or attach to a story.')
    }
  }

  return (
    <div className="photo-kiosk h-screen flex flex-col">
      {/* Live Preview or Captured Photo */}
      <div className="flex-1 bg-black relative">
        {preview ? (
          <img src={preview} alt="Captured" className="w-full h-full object-contain" />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover mirror"
          />
        )}

        {/* Countdown overlay */}
        {/* AI guide overlay (centering guide) */}
      </div>

      {/* Controls */}
      <div className="bg-white p-8">
        {preview ? (
          <div className="flex gap-4">
            <button
              onClick={() => setPreview(null)}
              className="flex-1 py-6 bg-gray-400 text-white rounded-2xl text-2xl"
            >
              🔄 Take Again
            </button>
            <button
              onClick={keepPhoto}
              className="flex-1 py-6 bg-green-600 text-white rounded-2xl text-2xl"
            >
              ✅ Keep It!
            </button>
          </div>
        ) : (
          <button
            onClick={capturePhoto}
            className="w-full py-8 bg-ocean-600 text-white rounded-2xl text-3xl font-bold"
          >
            📸 TAKE PHOTO
          </button>
        )}

        {/* Previously captured */}
        {capturedPhotos.length > 0 && (
          <div className="mt-6">
            <p className="text-lg mb-3">Your photos today:</p>
            <div className="flex gap-3 overflow-x-auto">
              {capturedPhotos.map((photo, i) => (
                <img
                  key={i}
                  src={getPublicUrl(photo)}
                  alt={`Photo ${i + 1}`}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## 📱 Method 3: Phone Upload (FROM ANYWHERE)

**Best for**: Community members with smartphones

### **User Experience:**

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│         📱 Share a Story or Photo                            │
│                                                               │
│     ┌───────────────────────────────────────┐               │
│     │                                        │               │
│     │  [ TAP TO SELECT PHOTO ]              │               │
│     │  [ OR TAKE NEW PHOTO ]                │               │
│     │                                        │               │
│     └───────────────────────────────────────┘               │
│                                                               │
│     OR                                                        │
│                                                               │
│     ┌───────────────────────────────────────┐               │
│     │                                        │               │
│     │  [ 🎤 RECORD VOICE ]                  │               │
│     │  "Tell us what this photo is about"   │               │
│     │                                        │               │
│     └───────────────────────────────────────┘               │
│                                                               │
│     OR                                                        │
│                                                               │
│     ┌───────────────────────────────────────┐               │
│     │                                        │               │
│     │  [ ✍️ TYPE A CAPTION ]                │               │
│     │  "Family gathering at Butler Bay..."   │               │
│     │                                        │               │
│     └───────────────────────────────────────┘               │
│                                                               │
│     [✨ SHARE ]                                              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### **Implementation:**

```typescript
// Mobile Upload Component
export function MobileUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Compress image before upload (save bandwidth)
    const compressed = await compressImage(selectedFile, {
      maxWidth: 1920,
      maxHeight: 1920,
      quality: 0.8
    })

    setFile(compressed)

    // Auto-generate caption with AI
    const aiCaption = await generateCaption(compressed)
    setCaption(aiCaption)
  }

  async function uploadStory() {
    if (!file) return

    setUploading(true)

    try {
      // Upload to Supabase Storage
      const filename = `${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('story-media')
        .upload(`user-uploads/${filename}`, file)

      if (uploadError) throw uploadError

      // Create story
      const { data: story, error: storyError } = await supabase
        .from('stories')
        .insert({
          storyteller_id: session.user.id,
          title: caption.slice(0, 100),  // First 100 chars
          content: caption,
          featured_image: uploadData.path,
          status: 'published',
          access_level: 'community'
        })
        .single()

      if (storyError) throw storyError

      // Success!
      toast.success('Story shared! 🎉')
      router.push(`/stories/${story.id}`)
    } catch (error) {
      console.error(error)
      toast.error('Something went wrong. Please try again or ask staff for help.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mobile-upload p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Share a Story or Photo</h1>

      {/* File Upload */}
      {!file ? (
        <label className="block">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="border-4 border-dashed border-ocean-300 rounded-2xl p-12 text-center cursor-pointer hover:bg-ocean-50 transition">
            <span className="text-6xl mb-4 block">📸</span>
            <p className="text-2xl font-semibold text-ocean-900">Tap to Select Photo</p>
            <p className="text-ocean-700 mt-2">or take a new photo</p>
          </div>
        </label>
      ) : (
        <div className="space-y-6">
          {/* Preview */}
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <img
              src={URL.createObjectURL(file)}
              alt="Upload preview"
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => setFile(null)}
              className="absolute top-4 right-4 p-3 bg-red-600 text-white rounded-full"
            >
              ✕
            </button>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-lg font-semibold mb-2">
              What's happening in this photo?
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Tell us about this photo..."
              className="w-full h-32 p-4 border-2 border-gray-300 rounded-lg text-lg resize-none"
            />
            <p className="text-sm text-gray-600 mt-2">
              💡 Our AI suggested this caption. You can change it!
            </p>
          </div>

          {/* Voice Caption Option */}
          <button className="w-full py-4 bg-gray-100 rounded-lg flex items-center justify-center gap-3">
            <span className="text-2xl">🎤</span>
            <span className="text-lg">Or record a voice caption</span>
          </button>

          {/* Upload Button */}
          <button
            onClick={uploadStory}
            disabled={uploading}
            className="w-full py-6 bg-ocean-600 text-white rounded-xl text-2xl font-bold disabled:bg-gray-400"
          >
            {uploading ? '⏳ Uploading...' : '✨ SHARE'}
          </button>
        </div>
      )}
    </div>
  )
}
```

---

## 🏢 Method 4: Staff-Assisted Upload (IN-PERSON AT PICC)

**Best for**: Elders who prefer not to use technology, complex stories

### **Workflow:**

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│         STAFF UPLOAD STATION                                  │
│         (PICC Reception or Service Desks)                     │
│                                                               │
│     1. Community member arrives with story                    │
│        - Photo on phone                                       │
│        - Written story                                        │
│        - Or just wants to tell story                          │
│                                                               │
│     2. Staff opens "Quick Upload" tool                        │
│        - Large, simple interface                              │
│        - Step-by-step wizard                                  │
│        - Can't skip important steps                           │
│                                                               │
│     3. Staff helps community member:                          │
│        ✅ Transfer photo from phone                           │
│        ✅ Type story as they tell it                          │
│        ✅ Choose who can see it                               │
│        ✅ Review before publishing                            │
│                                                               │
│     4. Story published immediately!                           │
│        - Email confirmation sent                              │
│        - Shown on community TV                                │
│        - Added to website                                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### **Staff Interface:**

```typescript
// Staff Upload Wizard
export function StaffUploadWizard() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    storyteller: null as Profile | null,
    media: [] as File[],
    story_text: '',
    access_level: 'community',
    service: null as OrganizationService | null
  })

  return (
    <div className="staff-wizard max-w-4xl mx-auto p-8">
      {/* Progress */}
      <div className="flex justify-between mb-8">
        {[1, 2, 3, 4, 5].map(n => (
          <div
            key={n}
            className={`
              flex-1 h-2 rounded
              ${n <= step ? 'bg-ocean-600' : 'bg-gray-200'}
            `}
          />
        ))}
      </div>

      {/* Steps */}
      {step === 1 && (
        <StepOne_SelectStoryteller
          onNext={(storyteller) => {
            setFormData({ ...formData, storyteller })
            setStep(2)
          }}
        />
      )}

      {step === 2 && (
        <StepTwo_UploadMedia
          onNext={(media) => {
            setFormData({ ...formData, media })
            setStep(3)
          }}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <StepThree_WriteStory
          storyteller={formData.storyteller!}
          onNext={(story_text) => {
            setFormData({ ...formData, story_text })
            setStep(4)
          }}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && (
        <StepFour_ChoosePrivacy
          onNext={(access_level, service) => {
            setFormData({ ...formData, access_level, service })
            setStep(5)
          }}
          onBack={() => setStep(3)}
        />
      )}

      {step === 5 && (
        <StepFive_ReviewAndPublish
          formData={formData}
          onBack={() => setStep(4)}
        />
      )}
    </div>
  )
}

// Step 1: Select Storyteller
function StepOne_SelectStoryteller({ onNext }: { onNext: (profile: Profile) => void }) {
  const [search, setSearch] = useState('')
  const { data: profiles } = useQuery('profiles', () =>
    supabase.from('profiles').select('*').order('full_name')
  )

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">
        👤 Who is telling this story?
      </h2>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Type name to search..."
        className="w-full p-4 text-xl border-2 rounded-lg mb-6"
        autoFocus
      />

      {/* Profile List */}
      <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {profiles
          ?.filter(p => p.full_name.toLowerCase().includes(search.toLowerCase()))
          .map(profile => (
            <button
              key={profile.id}
              onClick={() => onNext(profile)}
              className="p-4 border-2 rounded-lg hover:border-ocean-600 hover:bg-ocean-50 transition text-left"
            >
              <p className="font-semibold text-lg">{profile.full_name}</p>
              <p className="text-sm text-gray-600">{profile.community_role}</p>
            </button>
          ))}
      </div>

      {/* New Storyteller */}
      <button className="mt-6 w-full py-4 bg-green-600 text-white rounded-lg text-xl">
        ➕ Add New Storyteller
      </button>
    </div>
  )
}

// Step 2: Upload Media
function StepTwo_UploadMedia({
  onNext,
  onBack
}: {
  onNext: (files: File[]) => void
  onBack: () => void
}) {
  const [files, setFiles] = useState<File[]>([])

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    setFiles([...files, ...droppedFiles])
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">
        📸 Add Photos or Videos
      </h2>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-4 border-dashed border-ocean-300 rounded-2xl p-12 text-center"
      >
        <span className="text-8xl mb-4 block">📁</span>
        <p className="text-2xl font-semibold mb-2">
          Drag photos here
        </p>
        <p className="text-gray-600 mb-4">
          or click to browse
        </p>

        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={(e) => {
            const selected = Array.from(e.target.files || [])
            setFiles([...files, ...selected])
          }}
          className="hidden"
          id="file-input"
        />
        <label
          htmlFor="file-input"
          className="inline-block px-6 py-3 bg-ocean-600 text-white rounded-lg cursor-pointer"
        >
          Choose Files
        </label>
      </div>

      {/* Preview */}
      {files.length > 0 && (
        <div className="mt-6 grid grid-cols-4 gap-4">
          {files.map((file, i) => (
            <div key={i} className="relative">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-full aspect-square object-cover rounded-lg"
              />
              <button
                onClick={() => setFiles(files.filter((_, index) => index !== i))}
                className="absolute -top-2 -right-2 p-2 bg-red-600 text-white rounded-full"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={onBack}
          className="flex-1 py-4 bg-gray-400 text-white rounded-lg text-xl"
        >
          ← Back
        </button>
        <button
          onClick={() => onNext(files)}
          className="flex-1 py-4 bg-ocean-600 text-white rounded-lg text-xl"
        >
          Next →
        </button>
      </div>
    </div>
  )
}

// Step 3: Write Story
function StepThree_WriteStory({
  storyteller,
  onNext,
  onBack
}: {
  storyteller: Profile
  onNext: (text: string) => void
  onBack: () => void
}) {
  const [text, setText] = useState('')
  const [recording, setRecording] = useState(false)

  async function transcribeVoice() {
    setRecording(true)
    // Voice recording logic
    const transcript = await recordAndTranscribe()
    setText(transcript)
    setRecording(false)
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-2">
        ✍️ {storyteller.preferred_name}'s Story
      </h2>
      <p className="text-gray-600 mb-6">
        Type the story, or record {storyteller.preferred_name} telling it
      </p>

      {/* Voice Recording */}
      <button
        onClick={transcribeVoice}
        disabled={recording}
        className="w-full py-4 bg-red-600 text-white rounded-lg text-xl mb-4"
      >
        {recording ? '🔴 Recording...' : '🎤 Record Voice'}
      </button>

      {/* Text Area */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start typing the story here..."
        className="w-full h-64 p-4 border-2 rounded-lg text-lg resize-none"
      />

      <p className="text-sm text-gray-600 mt-2">
        {text.split(' ').filter(w => w).length} words
      </p>

      {/* Navigation */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={onBack}
          className="flex-1 py-4 bg-gray-400 text-white rounded-lg text-xl"
        >
          ← Back
        </button>
        <button
          onClick={() => onNext(text)}
          disabled={!text.trim()}
          className="flex-1 py-4 bg-ocean-600 text-white rounded-lg text-xl disabled:bg-gray-300"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
```

---

## 📊 Method 5: Bulk Import (FROM AIRTABLE/EXCEL)

**Best for**: Migrating existing data, annual reports

### **CSV/Excel Upload:**

```typescript
export function BulkImport() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const uploadedFile = e.target.files?.[0]
    if (!uploadedFile) return

    setFile(uploadedFile)

    // Parse CSV/Excel
    const data = await parseSpreadsheet(uploadedFile)
    setPreview(data.slice(0, 10))  // Show first 10 rows

    // Auto-detect columns
    const detectedMapping = autoDetectColumns(data[0])
    setMapping(detectedMapping)
  }

  async function importData() {
    if (!file) return

    const data = await parseSpreadsheet(file)

    // Transform to our schema
    const stories = data.map(row => ({
      title: row[mapping.title],
      content: row[mapping.content],
      storyteller_name: row[mapping.storyteller],
      category: row[mapping.category],
      // ... etc
    }))

    // Bulk insert
    const { data: inserted, error } = await supabase
      .from('stories')
      .insert(stories)

    if (!error) {
      toast.success(`✅ Imported ${inserted.length} stories!`)
    }
  }

  return (
    <div className="bulk-import p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        📊 Bulk Import Stories
      </h1>

      {/* File Upload */}
      <label className="block mb-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50">
          <span className="text-6xl mb-4 block">📁</span>
          <p className="text-xl font-semibold">
            Upload CSV or Excel file
          </p>
          <p className="text-gray-600 mt-2">
            Supports .csv, .xlsx, .xls
          </p>
        </div>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
        />
      </label>

      {/* Preview & Mapping */}
      {preview.length > 0 && (
        <div className="space-y-6">
          {/* Column Mapping */}
          <div>
            <h3 className="text-xl font-semibold mb-4">
              Map Your Columns
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(preview[0]).map(column => (
                <div key={column}>
                  <label className="block text-sm font-medium mb-1">
                    {column} →
                  </label>
                  <select
                    value={mapping[column] || ''}
                    onChange={(e) => setMapping({ ...mapping, [column]: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Skip this column</option>
                    <option value="title">Story Title</option>
                    <option value="content">Story Content</option>
                    <option value="storyteller">Storyteller Name</option>
                    <option value="category">Category</option>
                    <option value="date">Date</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Preview Table */}
          <div>
            <h3 className="text-xl font-semibold mb-4">
              Preview (first 10 rows)
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(preview[0]).map(column => (
                      <th key={column} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {preview.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((cell: any, j) => (
                        <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {String(cell).slice(0, 50)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Import Button */}
          <button
            onClick={importData}
            className="w-full py-4 bg-green-600 text-white rounded-lg text-xl font-bold"
          >
            ✅ Import All Stories
          </button>
        </div>
      )}
    </div>
  )
}
```

---

## 🎯 Import Best Practices

### **1. Progressive Disclosure**

Show only what's needed at each step:

```typescript
// ❌ BAD: All fields at once
<form>
  <input name="title" />
  <input name="content" />
  <input name="category" />
  <input name="tags" />
  <input name="access_level" />
  <input name="service" />
  <input name="location" />
  {/* 20 more fields... */}
</form>

// ✅ GOOD: One step at a time
<WizardStep1>Tell us about your story (title only)</WizardStep1>
<WizardStep2>Add your story (text/voice/upload)</WizardStep2>
<WizardStep3>Who can see it? (simple choice)</WizardStep3>
<WizardStep4>Review & publish</WizardStep4>
```

### **2. Smart Defaults**

Pre-fill everything possible:

```typescript
const smartDefaults = {
  storyteller_id: currentUser.id,  // Auto-fill
  organization_id: currentUser.organization_id,  // From profile
  access_level: 'community',  // Safe default
  category: await suggestCategory(content),  // AI suggests
  location: 'Palm Island',  // Most common
  language: 'en',  // Detect from browser
  created_at: new Date(),  // Auto
  status: 'published'  // Immediate visibility
}
```

### **3. AI Assistance**

Help users with AI (but keep human in control):

```typescript
const aiAssistance = {
  // Generate title from content
  title: await generateTitle(content),

  // Suggest category
  category: await suggestCategory(content),

  // Extract people/places
  tags: await extractEntities(content),

  // Generate summary
  summary: await summarize(content),

  // Detect language
  language: await detectLanguage(content),

  // Suggest related stories
  related: await findSimilar(content)
}

// User can accept, edit, or reject all suggestions
```

### **4. Error Prevention**

Make it impossible to fail:

```typescript
// Required fields
<RequiredField
  label="Story Title"
  error="Please give your story a title"
  disabled={!canProceed}
/>

// File size limits
if (file.size > 50_000_000) {  // 50MB
  toast.error('File too large. Please choose a smaller file.')
  return
}

// Confirmation before destructive actions
<ConfirmDialog
  title="Delete this story?"
  message="This cannot be undone. Are you sure?"
  onConfirm={deleteStory}
/>
```

---

## 🎨 Visual Design for Import UIs

```typescript
const importUIDesign = {
  // Buttons
  button_size: 'Large (min 48x48px)',
  button_labels: 'Clear action verbs',
  button_feedback: 'Visual state changes',

  // Progress
  progress_bar: 'Always visible',
  current_step: 'Highlighted',
  completed_steps: 'Checkmarks',

  // Instructions
  plain_language: true,
  one_instruction_at_a_time: true,
  examples_shown: true,

  // Feedback
  success_messages: 'Immediate, celebratory',
  error_messages: 'Specific, helpful',
  loading_states: 'Clear what's happening'
}
```

---

This import system makes content upload **ridiculously easy** for everyone from Elders to youth to PICC staff!

Next: **Privacy-First Sharing System**! 🔒
