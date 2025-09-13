# Frontend Implementation Plan for AI Chatbot

## Overview
This plan outlines the approach for implementing a complete frontend chatbot interface using AI elements components, WebSocket integration, and the specified color scheme from `colors.md`.

## Color Scheme Implementation
Based on `frontend/colors.md`:
- **Main accent**: #F5A623 (primary actions, buttons, highlights)
- **Base Color**: #0a0a0a (background)
- **Neutral Light**: #F9F9F9 (text, secondary elements)

## Core Architecture

### 1. WebSocket Integration Layer
**File**: `frontend/lib/hooks/useWebSocketChat.ts`

```typescript
interface WebSocketChatHook {
  messages: ChatMessage[];
  sendMessage: (content: string) => void;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'error';
  isStreaming: boolean;
  toolCalls: ToolCall[];
}
```

**Features**:
- Real-time WebSocket connection management
- Automatic reconnection with exponential backoff
- Message queuing during disconnection
- Tool call status tracking
- Error handling and recovery

### 2. Main Chat Interface
**File**: `frontend/app/chat/page.tsx`

#### Component Structure:
```tsx
<ChatContainer>
  <Conversation>
    <ConversationContent>
      {messages.map((message) => (
        <Message key={message.id} from={message.role}>
          <MessageContent>
            {message.toolCalls?.map((toolCall) => (
              <Tool key={toolCall.id} toolCall={toolCall} />
            ))}
            <Response isStreaming={message.isStreaming}>
              {message.content}
            </Response>
          </MessageContent>
          {message.role === 'assistant' && (
            <Actions>
              <Action onClick={handleRegenerate} label="Regenerate">
                <RefreshCcwIcon className="size-3" />
              </Action>
              <Action onClick={handleCopy} label="Copy">
                <CopyIcon className="size-3" />
              </Action>
            </Actions>
          )}
        </Message>
      ))}
    </ConversationContent>
    <ConversationScrollButton />
  </Conversation>
  
  <PromptInput onSubmit={handleSubmit}>
    <PromptInputTextarea 
      placeholder="Type your message..."
      disabled={connectionState !== 'connected'}
    />
    <PromptInputSubmit 
      status={isStreaming ? 'streaming' : 'ready'}
    />
  </PromptInput>
</ChatContainer>
```

### 3. Tool Visualization Components

#### Product Tool Display
**When tool is `getWooCommerceProducts`**:
```tsx
<Artifact>
  <ArtifactHeader>
    <ArtifactTitle>Product Search</ArtifactTitle>
    <ArtifactDescription>Searching for: {toolCall.input.name}</ArtifactDescription>
    <ArtifactActions>
      <ArtifactAction icon={ExternalLinkIcon} label="View Product" />
    </ArtifactActions>
  </ArtifactHeader>
  <ArtifactContent>
    <div className="product-result">
      <p>{toolCall.output}</p>
    </div>
  </ArtifactContent>
</Artifact>
```

#### Weather Tool Display
**When tool is `getWeather`**:
```tsx
<ChainOfThought>
  <ChainOfThoughtHeader />
  <ChainOfThoughtContent>
    <ChainOfThoughtStep
      icon={CloudIcon}
      label="Fetching weather data"
      status="complete"
    >
      <p>Location: {toolCall.input.location}</p>
      <p>Weather: {toolCall.output}</p>
    </ChainOfThoughtStep>
  </ChainOfThoughtContent>
</ChainOfThought>
```

### 4. Connection Status Indicators

#### WebSocket Status Badge
```tsx
<Badge variant={connectionState === 'connected' ? 'default' : 'secondary'}>
  {connectionState === 'connected' && <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />}
  {connectionState === 'connecting' && <Loader type="spinner" size="sm" />}
  {connectionState === 'error' && <AlertCircle className="w-3 h-3 mr-1" />}
  {connectionState}
</Badge>
```

### 5. Loading and Error States

#### Streaming Response
```tsx
<Response isStreaming={true}>
  {streamingContent}
  {isStreaming && <Loader type="typing" />}
</Response>
```

#### Error Handling
```tsx
{message.type === 'error' && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{message.error}</AlertDescription>
  </Alert>
)}
```

## Styling Implementation

### Global Styles (`frontend/app/globals.css`)
```css
:root {
  --accent: #F5A623;
  --background: #0a0a0a;
  --foreground: #F9F9F9;
  --card: #1a1a1a;
  --border: #2a2a2a;
}

.dark {
  --accent: #F5A623;
  --background: #0a0a0a;
  --foreground: #F9F9F9;
}
```

### Component Styling
- **Primary Buttons**: Use accent color #F5A623
- **Message Bubbles**: Dark background with light text
- **Tool Containers**: Subtle borders with accent highlights
- **Loading States**: Accent color for spinners and progress

## AI Elements Integration Strategy

### 1. Core Components to Use
- **Conversation**: Main message container with auto-scroll
- **Message**: Individual message bubbles with role-based styling
- **PromptInput**: Advanced input with textarea and submit functionality
- **Response**: Streaming text response rendering
- **Tool**: Tool call visualization with expandable sections
- **Actions**: Message action buttons (copy, regenerate)
- **Loader**: Various loading animations

### 2. Specialized Components
- **Artifact**: For structured tool outputs (products, documents)
- **ChainOfThought**: For multi-step reasoning processes
- **CodeBlock**: For any code snippets in responses
- **Image**: For any images in responses

### 3. Layout Components
- **Card**: For tool result containers
- **Badge**: For status indicators
- **HoverCard**: For additional information on hover

## State Management

### Message State
```typescript
interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingContent: string;
  toolCalls: ToolCall[];
  connectionState: ConnectionState;
}
```

### Tool Call State
```typescript
interface ToolCallState {
  id: string;
  name: string;
  input: Record<string, unknown>;
  output?: unknown;
  status: 'pending' | 'running' | 'completed' | 'error';
  startTime: Date;
  endTime?: Date;
}
```

## Error Handling Strategy

### 1. Connection Errors
- Display connection status badge
- Show retry button on failure
- Queue messages during disconnection

### 2. Tool Execution Errors
- Show error state in tool component
- Provide fallback UI
- Log errors for debugging

### 3. Message Errors
- Display error messages inline
- Allow message retry
- Maintain conversation flow

## Performance Optimizations

### 1. Message Rendering
- Virtual scrolling for large conversations
- Memoized message components
- Efficient re-renders during streaming

### 2. WebSocket Management
- Connection pooling
- Message batching
- Efficient JSON parsing

### 3. Tool Visualization
- Lazy load complex components
- Cache tool results
- Optimize re-renders

## Accessibility Features

### 1. Keyboard Navigation
- Tab navigation through messages
- Enter to submit messages
- Escape to cancel operations

### 2. Screen Reader Support
- ARIA labels for all interactive elements
- Live regions for streaming content
- Semantic HTML structure

### 3. Visual Accessibility
- High contrast mode support
- Focus indicators
- Resizable text

## Testing Strategy

### 1. Unit Tests
- WebSocket hook functionality
- Message parsing and formatting
- Tool call handling

### 2. Integration Tests
- Full conversation flows
- Tool execution scenarios
- Error recovery

### 3. E2E Tests
- Complete user journeys
- Cross-browser compatibility
- Performance benchmarks

## Deployment Considerations

### 1. Environment Variables
```bash
NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 2. Build Optimization
- Code splitting for large conversations
- Image optimization
- Bundle size monitoring

### 3. Monitoring
- WebSocket connection metrics
- Error tracking
- Performance monitoring

## Future Enhancements

### 1. Advanced Features
- Message branching and alternatives
- File upload support
- Voice message integration

### 2. AI Elements Extensions
- Custom tool visualizations
- Advanced reasoning displays
- Multi-modal content support

### 3. User Experience
- Conversation history
- User preferences
- Offline support

This plan provides a comprehensive foundation for building a production-ready chatbot frontend that leverages the AI elements components while maintaining excellent user experience and performance.