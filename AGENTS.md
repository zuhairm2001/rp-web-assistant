# AI Agents Configuration

## Backend Chat Agent System

### WebSocket Integration
- **Endpoint**: `/ws` (WebSocket endpoint)
- **Framework**: Elysia.js with WebSocket support
- **File**: `backend/src/websocket/index.ts`

### Chat Agent Architecture

#### Core Components

1. **Chat Agent** (`backend/src/websocket/ai/chatAgent.ts`)
   - **Function**: `chatAgent(message: string)`
   - **Model**: GPT-5 (via AI Gateway)
   - **Features**:
     - Streaming text responses
     - Tool integration with step tracking
     - 10-step limit per conversation
     - Tool usage logging

2. **Language Models** (`backend/src/websocket/ai/llms.ts`)
   - **Gateway**: AI-SDK Gateway integration
   - **Available Models**:
     - `deepseek`: DeepSeek V3.1
     - `gpt5`: GPT-5 (primary)
     - `qwen`: Qwen 235B Instruct
     - `gpt4o`: GPT-4o-mini
     - `gptoss`: GPT-OSS 120B

3. **Tools System** (`backend/src/websocket/ai/tools.ts`)
   - **Current Tools**:
     - `getWooCommerceProducts`: Product lookup with URL generation
     - `getWeather`: Weather information retrieval
   - **Planned Tools**:
     - Calendar booking integration (cal.com)
     - Human handoff with contact collection
     - Vector RAG for service documents

### Usage Patterns

#### WebSocket Message Flow
```
Client → WebSocket → chatAgent() → AI Model → Tool Calls → Response Stream → Client
```

#### Tool Execution
- Tools are executed automatically based on user queries
- Results are logged for debugging
- Step-by-step tool usage is tracked

### Configuration

#### Environment Variables Required
```bash
GATEWAY_API_KEY=your_gateway_api_key
```

#### System Prompt
```
You are a helpful assistant. Use the available tools to answer questions.
Only respond to questions using information from tool calls.
If no relevant information is found in the tool calls, respond "Sorry, I don't know."
```

### API Structure

#### WebSocket Events
- **Connection**: `ws://localhost:3001/ws`
- **Message Format**: JSON with Zod validation
- **Schema**: 
```typescript
const WebSocketMessageSchema = z.object({
  type: z.string(),
  content: z.string(),
});
```
- **Response**: Streaming text chunks

#### Integration Points
- **Products**: WooCommerce integration via tools
- **Services**: Vector RAG system (planned)
- **Calendar**: Booking system (planned)
- **Human Handoff**: Contact collection (planned)

### Development Notes

#### Current Limitations
- Tools are mocked (return static data)
- No conversation history persistence
- No user session management
- Limited error handling

#### Next Steps
1. Implement real WooCommerce API integration
2. Add vector search for service documentation
3. Implement calendar booking functionality
4. Add conversation history storage
5. Enhance error handling and logging
6. Add rate limiting and user authentication

### Testing Commands

#### WebSocket Testing
```bash
# Connect to WebSocket
websocat ws://localhost:3001/api/ws

# Send test message
{"type":"message","data":"What products do you have?"}
```

#### Backend Startup
```bash
cd backend
bun run dev
```

### File Structure Summary
```
backend/src/websocket/
├── index.ts          # WebSocket route setup
└── ai/
    ├── chatAgent.ts  # Main chat agent logic
    ├── llms.ts       # Language model configurations
    └── tools.ts      # Available tools and functions
```

## Frontend Implementation

### AI-SDK UI Components (ai-elements) Usage
The frontend uses the following AI-SDK UI components for a complete chat interface:

#### Core Components Available:

1. **Conversation** - Main container for messages with auto-scroll behavior
   - Usage: `<Conversation messages={messages} />`
   - Features: Auto-scrolling, message history management
   - Props: `messages`, `className`, `children`

2. **Message** - Individual message bubbles with role-based styling
   - Usage: `<Message role="user|assistant" content={content} />`
   - Features: Role-based styling, message parts rendering
   - Props: `role`, `content`, `className`

3. **PromptInput** - Advanced input form with textarea and submit functionality
   - Usage: `<PromptInput onSubmit={handleSubmit} placeholder="Type message..." />`
   - Features: Auto-expanding textarea, submit on Enter, file upload support
   - Props: `onSubmit`, `placeholder`, `disabled`, `className`

4. **Tool** - Tool call visualization with expandable sections
   - Usage: `<Tool toolCall={toolCall} />`
   - Features: Collapsible tool details, status indicators, input/output display
   - Props: `toolCall`, `className`, `expanded`

5. **Response** - Streaming text response rendering
   - Usage: `<Response content={streamingContent} />`
   - Features: Real-time text streaming, markdown support
   - Props: `content`, `isStreaming`, `className`

6. **Loader** - Loading indicators for various states
   - Usage: `<Loader type="dots|spinner|typing" />`
   - Features: Multiple animation types, customizable
   - Props: `type`, `size`, `className`

#### Additional Components:

7. **Actions** - Action buttons for message interactions
   - Usage: `<Actions actions={actionButtons} />`
   - Features: Copy, regenerate, like/dislike buttons
   - Props: `actions`, `onAction`, `className`

8. **Branch** - Message branching for alternative responses
   - Usage: `<Branch branches={alternatives} currentBranch={0} />`
   - Features: Navigate between response alternatives
   - Props: `branches`, `currentBranch`, `onBranchChange`

9. **CodeBlock** - Syntax highlighted code display
   - Usage: `<CodeBlock code={codeString} language="javascript" />`
   - Features: Syntax highlighting, copy button, line numbers
   - Props: `code`, `language`, `showLineNumbers`, `copyable`

10. **InlineCitation** - Reference links within text
    - Usage: `<InlineCitation source={citation} index={1} />`
    - Features: Hover preview, click to view source
    - Props: `source`, `index`, `className`

11. **Image** - Image display with loading states
    - Usage: `<Image src={imageUrl} alt="description" />`
    - Features: Loading placeholder, error handling, zoom
    - Props: `src`, `alt`, `className`, `onLoad`, `onError`

12. **Sources** - Source references and citations
    - Usage: `<Sources sources={sourceList} />`
    - Features: Expandable source list, clickable links
    - Props: `sources`, `className`

13. **Suggestion** - Quick action suggestions
    - Usage: `<Suggestion suggestions={quickActions} onSelect={handleSelect} />`
    - Features: Chip-style suggestions, keyboard navigation
    - Props: `suggestions`, `onSelect`, `className`

14. **Task** - Task/todo item display
    - Usage: `<Task task={taskObject} onUpdate={handleUpdate} />`
    - Features: Checkbox, status updates, progress tracking
    - Props: `task`, `onUpdate`, `showProgress`

15. **WebPreview** - Web link previews
    - Usage: `<WebPreview url={linkUrl} />`
    - Features: Auto-fetch metadata, thumbnail, description
    - Props: `url`, `className`, `showMetadata`

16. **Reasoning** - AI reasoning step display
    - Usage: `<Reasoning steps={reasoningSteps} />`
    - Features: Step-by-step thought process, expandable
    - Props: `steps`, `className`, `expandable`

#### WebSocket Integration
- **useWebSocketChat** hook in `/frontend/lib/hooks/useWebSocketChat.ts`
- Real-time message streaming
- Tool call status updates
- Connection status management
- Automatic reconnection

#### Color Scheme Applied
Based on colors.md:
- **Main accent**: #F5A623 (used for primary actions, buttons, highlights)
- **Base Color**: #0a0a0a (background)
- **Neutral Light**: #F9F9F9 (text, secondary elements)

#### Frontend File Structure
```
frontend/
├── app/
│   ├── page.tsx              # Landing page with feature overview
│   ├── chat/page.tsx         # Main chat interface
│   └── globals.css           # Custom color scheme
├── components/ai-elements/   # AI-SDK UI components
├── lib/hooks/
│   └── useWebSocketChat.ts   # WebSocket connection hook
└── components/ui/            # shadcn components
```

### Usage Instructions
1. Start backend: `cd backend && bun run dev`
2. Start frontend: `cd frontend && bun run dev`
3. Navigate to `http://localhost:3000` (or frontend port)
4. Click "Start Chatting" to access the chat interface

### Features Implemented
- Real-time WebSocket communication
- Tool call visualization
- Streaming text responses
- Connection status indicators
- Error handling and reconnection
- Responsive design with dark theme
- Color scheme from colors.md
