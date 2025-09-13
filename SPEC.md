# Backend API Specification for Frontend Engineers

## WebSocket API

### Connection Details
- **Endpoint**: `ws://localhost:3001/api/ws`
- **Protocol**: WebSocket with JSON message format
- **Framework**: Elysia.js with @elysiajs/ws

### Message Schema
```typescript
// Incoming message format
const WebSocketMessageSchema = z.object({
  type: z.string(),
  content: z.string(),
});

// Example usage:
// {"type": "message", "content": "What products do you have?"}
```

### Response Events
The backend sends different event types during a conversation:

```typescript
// 1. Response start
{ type: "message_start" }

// 2. Streaming content (multiple)
{
  type: "content_delta",
  delta: { text: string }
}

// 3. Response end
{ type: "message_end" }

// 4. Error handling
{
  type: "error",
  error: string,
  timestamp: string
}
```

### Frontend Message Types
```typescript
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
}

interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  output?: unknown;
  status: "pending" | "running" | "completed" | "error";
}
```

## AI Chat System

### Core Configuration
- **Primary Model**: GPT-5 (via AI Gateway)
- **Step Limit**: 10 steps per conversation
- **System Prompt**: "You are a helpful assistant. Use the available tools to answer questions. Only respond to questions using information from tool calls. If no relevant information is found in the tool calls, respond 'Sorry, I don't know.'"

### Available Models
```typescript
const models = {
  deepseek: "DeepSeek V3.1",
  gpt5: "GPT-5 (primary)",
  qwen: "Qwen 235B Instruct",
  gpt4o: "GPT-4o-mini",
  gptoss: "GPT-OSS 120B"
};
```

## Tools & Functions

### Current Tools

#### 1. getWooCommerceProducts
```typescript
// Input
{ name: string }

// Returns
string // Product URL and information

// Description
"When the user is requesting a product, provide a link and information about it."
```

#### 2. getServiceInfo (planned)
```typescript
// Input
{ query: string }

// Returns
string // Service information

// Description
"When asked about any specific service, call this tool to get further information about it."
```

### Planned Tools
- Calendar booking integration (cal.com)
- Human handoff with contact collection
- Vector RAG for service documents

## Data Models

### Product Schema
```typescript
interface Product {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  description: string;
  short_description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  price_html: string;
  on_sale: boolean;
  stock_quantity: number | null;
  stock_status: "instock" | "outofstock" | "onbackorder";
  manage_stock: boolean;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  images: Array<{
    id: number;
    src: string;
    name: string;
    alt: string;
    date_created: string;
    date_modified: string;
  }>;
  attributes: Array<unknown>;
  status: "draft" | "pending" | "private" | "publish";
  type: "simple" | "grouped" | "external" | "variable";
}
```

### Database Schema
```typescript
// Products table structure
interface ProductDB {
  shopId: number; // primary key
  name: string;
  price: number;
  link: string;
  categories: string; // JSON string
  downloadable: number; // 0 or 1
}
```

### Vector Search
```typescript
interface ProductPayload {
  id: string;
  title: string;
  price: number;
  category: string;
}

// Search function signature
searchDocuments(query: string, category: string): Promise<SearchResult[]>
// Returns up to 3 results
```

## API Endpoints

### WebSocket
- `ws://localhost:3001/ws` - Main chat endpoint

### HTTP Endpoints (for reference)
- `/api/force-cron` - Manual product sync trigger

## Environment Variables

### Required
```bash
GATEWAY_API_KEY=your_gateway_api_key
```

### Optional (for full functionality)
```bash
WOOCOMMERCE_API_KEY=your_woocommerce_api_key
WOOCOMMERCE_API_SECRET=your_woocommerce_api_secret
```

## Error Handling

### WebSocket Errors
```typescript
{
  type: "error",
  error: "Error message describing what went wrong",
  timestamp: "2024-01-01T12:00:00.000Z"
}
```

### Common Error Scenarios
1. **Connection Failed**: Network issues, server down
2. **Invalid Message Format**: Malformed JSON, missing fields
3. **Tool Execution Failed**: API errors, rate limits
4. **AI Model Errors**: Gateway issues, token limits

## Development Notes

### Current Limitations
- Tools return mocked data (not real API calls yet)
- No conversation history persistence
- No user session management
- Limited error handling

### Cron Jobs
- **Daily Sync**: Runs at 4 AM daily for product synchronization
- **Manual Trigger**: Available via `/api/force-cron` endpoint

### Frontend Integration Patterns

#### WebSocket Connection Management
```typescript
// Connection states
enum ConnectionState {
  CONNECTING = "connecting",
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  ERROR = "error"
}

// Message handling
const handleWebSocketMessage = (event: MessageEvent) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case "message_start":
      // Start new message
      break;
    case "content_delta":
      // Append streaming content
      break;
    case "message_end":
      // Finalize message
      break;
    case "error":
      // Handle error
      break;
  }
};
```

#### Tool Call Visualization
```typescript
// Tool call status updates
interface ToolCallUpdate {
  id: string;
  status: "pending" | "running" | "completed" | "error";
  output?: unknown;
  error?: string;
}
```

## Testing

### WebSocket Testing
```bash
# Using websocat
websocat ws://localhost:3001/ws

# Test message
{"type":"message","content":"What products do you have?"}
```

### Development Commands
```bash
# Backend
cd backend
bun run dev

# Frontend
cd frontend
cd frontend-copy
bun run dev
```

## Security Considerations

### WebSocket Security
- No authentication currently implemented
- Rate limiting not configured
- Input validation via Zod schemas

### Data Protection
- No sensitive data in responses
- Tools validate input parameters
- Error messages don't expose internal details

## Performance Notes

### Streaming Responses
- Text is streamed in real-time
- No buffering on backend
- Frontend should handle partial content gracefully

### Tool Execution
- Tools execute synchronously
- 10-step limit prevents infinite loops
- Each tool call is logged for debugging

## Future Enhancements

### Planned Features
1. Real WooCommerce API integration
2. Conversation history persistence
3. User authentication and sessions
4. Enhanced error handling
5. Rate limiting and abuse prevention
6. Multi-language support
7. File upload capabilities
8. Voice message support

### API Versioning
- No versioning currently implemented
- Breaking changes will be communicated
- Backward compatibility maintained where possible
