# AI Chat Assistant for Consulting Company with E-commerce

## Overview
Project is a chat assistant on a website for a consulting company that also has an ecommerce store. It should be informative about all services and products and should be able to reference and provide links to the products using the woocommerce mcp server.

## Architecture
- **Frontend**: Next.js with AI-SDK UI components, Cloudflare Workers
- **Backend**: Hono framework on Cloudflare Workers
- **Vector Storage**: Qdrant on Cloudflare Workers
- **AI Models**: Together AI / OpenRouter integration
- **E-commerce Integration**: WooCommerce MCP Server

## Data Sources & Ingestion Pipeline
### Sources
- Website pages (services, about, contact)
- Product descriptions and specifications
- Blog posts and articles
- FAQ content
- Documentation and guides

### Ingestion Process
1. **Web Scraping**: Automated daily crawl of website content
2. **Chunking Strategy**: 
   - 1000-1500 character chunks with 200 character overlap
   - Preserve semantic boundaries (headings, paragraphs)
   - Include metadata: URL, title, last updated, content type
3. **Vector Generation**: Together AI embeddings (text-embedding-3-large)
4. **Upsert Strategy**: Incremental updates with duplicate detection

## Vector Storage Schema (Qdrant)
```typescript
interface VectorPayload {
  content: string;
  url: string;
  title: string;
  content_type: 'service' | 'product' | 'blog' | 'faq' | 'documentation';
  category?: string;
  tags: string[];
  last_updated: string;
  product_id?: number; // WooCommerce product ID
  price?: number;
  in_stock?: boolean;
}
```
- **Collection**: `consulting_chat_vectors`
- **Vector Size**: 1536 (OpenAI embeddings)
- **Distance Metric**: Cosine similarity
- **Indexing**: HNSW with ef_construct=128, M=16

## API Endpoints
### Chat Endpoints
- `POST /api/chat/stream` - Streaming chat completion
- `POST /api/chat/history` - Get conversation history
- `DELETE /api/chat/history/:id` - Clear specific conversation

### Knowledge Management
- `POST /api/knowledge/ingest` - Trigger manual ingestion
- `GET /api/knowledge/status` - Check ingestion status
- `DELETE /api/knowledge/cleanup` - Remove outdated content

### Product Integration
- `GET /api/products/search` - Search products via WooCommerce
- `GET /api/products/:id` - Get specific product details
- `GET /api/products/categories` - Get product categories

## Frontend Components
### Chat Interface
- **MessageList**: Streaming message display with tool call visualization
- **ChatInput**: Text input with file upload capability
- **ProductCards**: Rich product previews with images and pricing
- **ServiceCards**: Service information with contact CTAs
- **Sources**: Expandable source attribution

### UI Features
- Real-time streaming responses
- Tool call visualization (WooCommerce searches, knowledge retrieval)
- Context-aware suggestions
- Responsive design for mobile/desktop
- Dark/light mode support

## Model Configuration
### Primary Models
- **GPT-4o-mini**: High TPS, cost-effective for general queries
- **Qwen 235B Instruct**: Fallback for complex reasoning
- **DeepSeek V3.1**: Specialized for technical documentation

### Model Settings
- Temperature: 0.7 (balanced creativity/accuracy)
- Max tokens: 1000
- Top-p: 0.9
- Frequency penalty: 0.3

## Integration Details
### WooCommerce MCP Server
- **Endpoint**: WooCommerce REST API v3
- **Authentication**: OAuth 1.0a or API keys
- **Caching**: 5-minute cache for product data
- **Rate Limiting**: 100 requests/minute

### Error Handling
- Graceful degradation when WooCommerce unavailable
- Fallback to static product data
- User-friendly error messages
- Structured logging with Cloudflare Workers Analytics

## Security & Rate Limiting
- **Authentication**: Optional JWT for conversation persistence
- **Rate Limiting**: 10 requests/minute per IP
- **Input Validation**: Zod schemas for all inputs
- **CORS**: Restricted to company domain
- **Content Security Policy**: Strict CSP headers

## Deployment Configuration
### Environment Variables
```bash
# Qdrant
QDRANT_URL=https://your-qdrant-instance.cloudflare.net
QDRANT_API_KEY=your_api_key

# AI Models
TOGETHER_API_KEY=your_together_key
OPENROUTER_API_KEY=your_openrouter_key

# WooCommerce
WC_CONSUMER_KEY=your_wc_key
WC_CONSUMER_SECRET=your_wc_secret
WC_STORE_URL=https://your-store.com

# App
JWT_SECRET=your_jwt_secret
ENVIRONMENT=production
```

### Cloudflare Workers Configuration
- **KV Storage**: Conversation history (24-hour TTL)
- **Durable Objects**: Real-time session management
- **Cron Triggers**: Daily content ingestion at 2 AM UTC

## Monitoring & Observability
- **Cloudflare Analytics**: Request metrics, error rates
- **Custom Metrics**: Query latency, vector search accuracy
- **Alerting**: Failed ingestions, high error rates
- **Logging**: Structured JSON logs with correlation IDs

## Testing Strategy
### Unit Tests
- Vector similarity calculations
- API endpoint validation
- Error handling scenarios

### Integration Tests
- WooCommerce API connectivity
- Qdrant vector operations
- End-to-end chat flows

### Load Testing
- 100 concurrent users
- 1000 requests/minute sustained load
- Vector search performance under load

## Dependencies
- `@ai-sdk/react` - AI SDK UI components
- `@ai-sdk/openai` - OpenAI provider
- `@qdrant/js-client-rest` - Qdrant client
- `hono` - Web framework
- `zod` - Schema validation
- `together-ai` - Together AI SDK
- `date-fns` - Date utilities
- `nanoid` - Unique ID generation
