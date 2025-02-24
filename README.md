# Document Q&A Frontend

Next.js application providing the user interface for Document Q&A system.

## Features

- Document upload interface
- Natural language question input
- Real-time answer streaming
- Performance metrics dashboard
- Multiple model selection
- Error handling and feedback

## Quick Start

### Development Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run development server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8001
```

### Building

```bash
npm run build
npm start
```

## Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy

## Development

- Built with Next.js 14
- Uses TailwindCSS for styling
- TypeScript for type safety
- Component library with shadcn/ui

## Testing

```bash
# Run tests
npm test

# Run linting
npm run lint
```
