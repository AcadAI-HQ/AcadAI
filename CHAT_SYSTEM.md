# AI Chat System Documentation

## Overview

The Acad AI platform now features an AI-powered chat system that allows users to interact with a learning assistant about their roadmaps. The chat uses Google Gemini AI to provide personalized advice, answer questions, and help customize learning paths.

## Features

- 💬 **Real-time Chat** - Interactive conversations with AI assistant
- 📝 **Chat History** - Persistent message history per roadmap domain
- 🤖 **Context-Aware** - AI understands user profile, skills, and roadmap content
- 🎯 **Domain-Specific** - Separate chat sessions for each learning domain
- 🔒 **Secure** - User-specific chat data with Firestore security rules
- 🎨 **Beautiful UI** - Clean dialog interface with message bubbles
- ⚡ **Fast Responses** - Powered by Gemini 2.0 Flash

## Architecture

### Data Flow

```
User → Chat Dialog → API Route → Gemini AI → Response
                ↓                              ↓
         Firestore (Save)            Firestore (Save)
```

### Firestore Structure

```
users/{userId}/
  └─ chats/{domain}/
      ├─ userId: string
      ├─ domain: string
      ├─ messages: Array<ChatMessage>
      ├─ createdAt: Timestamp
      ├─ updatedAt: Timestamp
      └─ context?: {
          userProfile?: Partial<UserProfile>
          roadmapVersion?: string
        }
```

## Components & Files

### 1. TypeScript Types ([src/types/index.ts](src/types/index.ts:93-115))

```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    roadmapModified?: boolean;
    suggestedChanges?: string[];
  };
}

interface ChatSession {
  userId: string;
  domain: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  context?: {
    userProfile?: Partial<UserProfile>;
    roadmapVersion?: string;
  };
}
```

### 2. Chat Service ([src/lib/chat-service.ts](src/lib/chat-service.ts))

Handles all Firestore operations for chat data:

```typescript
// Core Functions
getChatSession(userId, domain)          // Get or create chat session
saveChatSession(session)                // Save session to Firestore
addMessageToSession(userId, domain, msg) // Add message to session
getChatMessages(userId, domain, limit)   // Retrieve messages
clearChatHistory(userId, domain)        // Clear all messages
updateChatContext(userId, domain, ctx)  // Update session context
getUserChatDomains(userId)              // Get all domains with chats
hasChatHistory(userId, domain)          // Check if messages exist
```

### 3. API Route ([src/app/api/chat/route.ts](src/app/api/chat/route.ts))

**Endpoint**: `POST /api/chat`

**Request Body**:
```json
{
  "message": "What should I learn first in frontend development?",
  "userId": "user123",
  "domain": "frontend",
  "userProfile": {
    "userType": "student",
    "skills": ["HTML", "CSS"],
    "domainExperience": "beginner"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Based on your beginner level, I recommend starting with...",
  "timestamp": "2025-10-28T10:30:00Z"
}
```

**Features**:
- Validates request parameters
- Saves user message to Firestore
- Retrieves chat history for context
- Loads user's roadmap for context
- Builds comprehensive context for Gemini
- Generates AI response
- Saves AI response to Firestore
- Error handling with detailed messages

### 4. Chat Dialog Component ([src/components/chat/chat-dialog.tsx](src/components/chat/chat-dialog.tsx))

**Props**:
```typescript
interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  domain: string;
}
```

**Features**:
- Opens as full-screen modal dialog
- Loads chat history on open
- Auto-scrolls to latest messages
- Message input with keyboard shortcuts (Enter to send, Shift+Enter for new line)
- Optimistic UI updates
- Loading states and error handling
- Clear history button
- Beautiful message bubbles with timestamps
- User and AI avatars

**Usage in Roadmap Page**:
```typescript
const [chatOpen, setChatOpen] = useState(false);

<Button onClick={() => setChatOpen(true)}>
  <MessageCircle className="h-4 w-4" />
  AI Assistant
</Button>

<ChatDialog open={chatOpen} onOpenChange={setChatOpen} domain={domain} />
```

### 5. Integration in Roadmap Page ([src/app/roadmap/[domain]/page.tsx](src/app/roadmap/[domain]/page.tsx:126-129))

- AI Assistant button in top-right corner
- Opens chat dialog on click
- Domain automatically passed to chat

## Context Building

The AI assistant receives rich context including:

### System Context
```
- User Type (student/professional/learner)
- User Skills
- Experience Level
- Current Role (if professional)
- Years of Experience (if professional)
```

### Roadmap Context
```
- Domain name
- Roadmap overview
- List of learning steps/topics
- Number of total steps
```

### Chat History
```
- Last 10 messages for continuity
- Maintains conversation flow
```

## AI Capabilities

The Gemini AI assistant can:

1. **Answer Questions**
   - Explain roadmap topics
   - Clarify learning concepts
   - Provide additional resources

2. **Provide Advice**
   - Personalized learning strategies
   - Time management tips
   - Career guidance

3. **Suggest Modifications**
   - Adjust roadmap based on experience
   - Add/remove topics
   - Reorder learning steps

4. **Offer Encouragement**
   - Motivational messages
   - Progress recognition
   - Goal setting support

## Security

### Firestore Rules ([firestore.rules](firestore.rules:32-39))

```javascript
match /users/{userId}/chats/{domain} {
  // Users can only access their own chat sessions
  allow read: if isOwner(userId);
  allow create: if isOwner(userId);
  allow update: if isOwner(userId);
  allow delete: if isOwner(userId);
}
```

**Security Features**:
- User-specific access only
- No cross-user data leakage
- Authenticated access required
- CRUD operations for owners only

## Configuration

### Environment Variables

Required in `.env.local`:

```env
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
```

**Get API Key**:
1. Visit https://aistudio.google.com/apikey
2. Create new API key
3. Copy and paste into `.env.local`
4. Restart development server

### Gemini Model Configuration

Current settings in [src/app/api/chat/route.ts](src/app/api/chat/route.ts:48-53):

```typescript
model: 'gemini-2.0-flash-exp'

generationConfig: {
  maxOutputTokens: 1000,    // Max response length
  temperature: 0.7,          // Creativity (0-1)
  topP: 0.95,               // Diversity threshold
}
```

**Adjustments**:
- `temperature`: Lower (0.3) for factual, higher (0.9) for creative
- `maxOutputTokens`: Increase for longer responses
- `topP`: Adjust for response diversity

## Usage Guide

### For Users

1. **Open Chat**:
   - Navigate to any roadmap page
   - Click "AI Assistant" button in top-right

2. **Ask Questions**:
   - Type message in text area
   - Press Enter to send (Shift+Enter for new line)

3. **Review Responses**:
   - AI responses appear with robot icon
   - User messages appear with user icon
   - Timestamps shown for each message

4. **Clear History**:
   - Click "Clear History" button at bottom
   - Confirms deletion and clears all messages

### Example Conversations

**Question**: "What should I learn first?"
**AI**: "Based on your beginner level in frontend development, I recommend starting with HTML5 fundamentals. This includes semantic structure, forms, and accessibility basics..."

**Question**: "I already know React, can you adjust my roadmap?"
**AI**: "Since you're already familiar with React, I suggest focusing on advanced topics like performance optimization, custom hooks, and state management patterns..."

**Question**: "How long will this take?"
**AI**: "For a beginner dedicating 10-15 hours per week, this frontend roadmap typically takes 4-6 months. However, with your existing HTML/CSS skills, you could complete it in 3-4 months..."

## Development

### Adding New Features

#### 1. Message Metadata

Extend `ChatMessage` interface to track more data:

```typescript
interface ChatMessage {
  // ... existing fields
  metadata?: {
    roadmapModified?: boolean;
    suggestedChanges?: string[];
    resourceLinks?: string[];  // NEW
    confidenceScore?: number;   // NEW
  };
}
```

#### 2. Chat Commands

Add special commands like `/help`, `/roadmap`, `/resources`:

```typescript
// In chat-dialog.tsx
const handleSendMessage = async () => {
  if (inputMessage.startsWith('/')) {
    handleCommand(inputMessage);
    return;
  }
  // ... normal flow
};
```

#### 3. Voice Input

Add speech-to-text for voice messages:

```typescript
const startVoiceInput = () => {
  const recognition = new webkitSpeechRecognition();
  recognition.onresult = (event) => {
    setInputMessage(event.results[0][0].transcript);
  };
  recognition.start();
};
```

#### 4. Export Chat History

Allow users to download conversations:

```typescript
const exportChat = () => {
  const content = messages.map(m =>
    `[${m.role}] ${m.timestamp}: ${m.content}`
  ).join('\n\n');

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  // ... download logic
};
```

## Testing

### Manual Testing Checklist

- [ ] Open chat dialog from roadmap page
- [ ] Send a message and receive AI response
- [ ] Verify message appears in Firestore
- [ ] Close and reopen dialog - history persists
- [ ] Clear history - messages deleted
- [ ] Test with different domains - separate sessions
- [ ] Test keyboard shortcuts (Enter, Shift+Enter)
- [ ] Verify error handling (network failure, API error)
- [ ] Check loading states during API calls
- [ ] Verify auto-scroll to latest messages

### API Testing

```bash
# Test chat endpoint
curl -X POST http://localhost:9002/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What should I learn first?",
    "userId": "test-user-123",
    "domain": "frontend",
    "userProfile": {
      "userType": "student",
      "skills": ["HTML"],
      "domainExperience": "beginner"
    }
  }'
```

## Troubleshooting

### Issue: API returns "Gemini API key not configured"

**Solution**:
```bash
# Check .env.local has the key
grep GOOGLE_GEMINI_API_KEY .env.local

# Restart dev server
npm run dev
```

### Issue: Messages not persisting

**Check**:
1. Firestore rules are deployed
2. User is authenticated
3. Browser console for errors
4. Firestore console for data

### Issue: AI responses are slow

**Options**:
1. Use faster model: `gemini-2.0-flash-exp` (current)
2. Reduce `maxOutputTokens`
3. Simplify context building
4. Implement response streaming (future)

### Issue: Chat history not loading

**Debug**:
```typescript
// Add logging to chat-service.ts
console.log('Loading chat for:', userId, domain);
console.log('Messages found:', session.messages.length);
```

## Future Enhancements

### 1. Streaming Responses

```typescript
// Stream tokens as they're generated
const stream = await chat.sendMessageStream(message);
for await (const chunk of stream) {
  appendToLastMessage(chunk.text());
}
```

### 2. Roadmap Modification Actions

```typescript
// AI suggests changes, user approves
metadata: {
  suggestedChanges: ['Add TypeScript module', 'Reorder React basics'],
  action: 'modify_roadmap'
}

// User clicks "Apply Changes" button
const applyChanges = async () => {
  await updateUserRoadmap(userId, domain, modifiedRoadmap);
};
```

### 3. Multi-turn Conversations

```typescript
// Track conversation state
context: {
  conversationGoal: 'learn_react',
  currentTopic: 'hooks',
  progressPercentage: 45
}
```

### 4. Share Conversations

```typescript
// Generate shareable link
const shareChat = async () => {
  const shareId = await createPublicChatSnapshot(chatSession);
  return `https://acadai.com/shared/chat/${shareId}`;
};
```

### 5. Chat Analytics

Track:
- Most asked questions
- Average response time
- User satisfaction ratings
- Popular topics per domain

## Resources

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Firebase Firestore Docs](https://firebase.google.com/docs/firestore)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## Contributing

When improving the chat system:

1. Update TypeScript types in [src/types/index.ts](src/types/index.ts)
2. Add new service functions to [src/lib/chat-service.ts](src/lib/chat-service.ts)
3. Update API route logic in [src/app/api/chat/route.ts](src/app/api/chat/route.ts)
4. Enhance UI in [src/components/chat/chat-dialog.tsx](src/components/chat/chat-dialog.tsx)
5. Update Firestore rules if schema changes
6. Document changes in this file

## Changelog

### v1.0.0 (2025-10-28)

- Initial implementation of AI chat system
- Gemini 2.0 Flash integration
- Persistent chat history per domain
- Beautiful chat dialog UI
- Context-aware responses
- Firestore security rules
- User profile integration
- Roadmap context awareness
