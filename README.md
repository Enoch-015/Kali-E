# Kali-E Voice Assistant

Kali-E is a modern voice assistant with AI capabilities, built with Next.js and React.

## Features

- Voice-based interaction with animated visual feedback
- Calendar management
- Task management
- Note-taking
- Email integration
- Plugin marketplace
- Analytics dashboard
- Dark mode support

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository:

\`\`\`bash
git clone https://github.com/yourusername/kali-e-voice-assistant.git
cd kali-e-voice-assistant
\`\`\`

2. Install dependencies:

\`\`\`bash
npm install --legacy-peer-deps
# or
yarn install
\`\`\`

3. Start the development server:

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `/app` - Next.js App Router pages and layouts
- `/components` - Reusable React components
- `/hooks` - Custom React hooks
- `/lib` - Utility functions and libraries
- `/public` - Static assets

## Key Components

- **AnimatedBlob**: Provides visual feedback during voice interactions
- **Navigation**: Main navigation bar with access to all features
- **Assistant Page**: Main interface for voice interaction

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React (for icons)
- shadcn/ui (for UI components)

## Development

### Adding New Features

1. Create new components in the `/components` directory
2. Add new pages in the `/app` directory
3. Update navigation in `/app/assistant/navigation.tsx` if needed

### Styling

The project uses Tailwind CSS for styling. Global styles are defined in `/app/globals.css`.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
