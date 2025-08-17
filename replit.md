# MoshUnion - Music Community Platform

## Overview

MoshUnion is a comprehensive full-stack music community platform designed for metal and rock enthusiasts. Beyond band discovery, it provides a complete social ecosystem where users can write reviews, upload concert photos, track tour dates, and connect with fellow metalheads. The platform combines modern React frontend architecture with a robust Node.js/Express backend, using PostgreSQL for reliable data persistence through Drizzle ORM.

## Recent Changes (August 17, 2025)

**AI-Powered Event Discovery System Complete**: Implemented comprehensive event discovery and ticket purchasing system using Google APIs and OpenAI. Features include:
- AI-powered event search using Google Custom Search API
- OpenAI integration for intelligent event recommendations and personalized matching
- Advanced event filtering by location, price range, genre preferences, and radius
- Real-time event insights with artist analysis, venue information, and pricing analysis
- Personalized event recommendations based on user preferences and behavior
- Direct ticket purchasing integration with external providers
- Event discovery page with modern UI and detailed event cards
- AI-generated recommendation reasons explaining why events match user preferences

**Complete React Hooks Error Resolution**: Fixed persistent React hooks error that was preventing app functionality by:
- Replacing problematic MobileFriendlyLanding component with SimpleLanding
- Creating hook-free component using inline styles to avoid React context issues
- Maintaining all visual design elements and functionality without hooks dependency
- Successfully restored app navigation and user interaction capabilities

## Recent Changes (August 17, 2025)

**Ultra Dynamic Red/Yellow/Black Theme Complete**: Transformed the entire design from cyberpunk/dystopian to an ultra dynamic red, yellow, and black color scheme. Features include:
- Complete color palette overhaul with fire-red, electric-yellow, and void-black as primary colors
- Updated all gradients to use lava-orange, amber, golden-yellow combinations
- Enhanced hero section with "CYBERPIT.SYS" and "DYSTOPIAN METAL GRID" text
- Red and yellow animated background grids with dynamic scanning lines
- Fire-red and electric-yellow floating energy orbs with enhanced blur effects
- Updated all glow effects to use red/yellow palette instead of cyan/purple
- Terminal-style interfaces with red/yellow accent colors
- Revolutionary theme: "The machine empire burns. Metal warriors rise from molten ashes."

**Complete Rebranding to MoshUnion**: Successfully rebranded the entire platform from "MetalHub" to "MoshUnion" with enhanced clickable logo functionality. Features include:
- Updated all instances of "MetalHub" to "MoshUnion" across the codebase
- Added clickable logo with individual word color-swapping animation (red to white)
- Logo navigation returns users to the landing page/bands section
- Enhanced user experience with smooth color transitions

**Hero Design Recreation Complete**: Successfully recreated the original dramatic hero-style landing page design based on user's uploaded screenshot. User confirmed this is the design to work with moving forward. Features include:
- Large hero section with dramatic typography and text shadows
- Professional navigation header with MOSHUNION branding and responsive design
- Featured bands displayed in large, image-focused cards with overlays and gradients
- Star ratings and review counts for community engagement
- Mobile-responsive typography using clamp() for optimal scaling
- Modern card-based layout matching the original aesthetic with 16:10 aspect ratios
- Preserved all authentication and search functionality

**Authentication System Implementation Complete**: Successfully implemented comprehensive user authentication with "remember me" functionality. Features include:
- Replit OAuth integration with secure session management
- Persistent login sessions with configurable duration (30-90 days)
- "Remember me" checkbox that extends session to 90 days
- User profile management with session status display
- PostgreSQL session storage for reliability
- React Query integration for state management
- Automatic session refresh and token management

**React Architecture Fixed**: Resolved React hooks integration issues by:
- Setting up proper QueryClientProvider context
- Creating authenticated API fetcher with session support
- Implementing useAuth hook for authentication state
- Building LoginPage component with session management UI
- Adding authentication status display to main app

**Mobile and Desktop Ready**: Authentication system works on both mobile and desktop with responsive design and consistent user experience.

**Background AI Integration**: Successfully implemented invisible background AI service that runs automatically without user interaction. Features include:
- Automated band recommendations based on user activity patterns
- Smart search index optimization using AI analysis
- Content curation and trend detection
- User behavior analytics for personalized experiences
- Background service runs continuously with periodic data updates

**Band Photo Integration**: Implemented object storage system for band thumbnail photos in search results. Features include:
- Cloud storage integration for band photos
- Drag & drop photo upload interface
- Real-time thumbnail updates in band database
- Public photo serving for search results
- Direct band photo management system

**Logo Animation System**: Implemented sophisticated clickable logo with sequential word animation:
- "MOSH" and "UNION" words animate independently from red to white
- 150ms animation timing between words for smooth visual effect  
- Clickable logo provides immediate navigation back to home/bands section
- Hover effects enhance user interaction feedback

**Technical Details**:
- Server: ✓ Working (curl tests successful)
- Vite: ✓ Connected with HMR
- React: ✓ Fixed hooks errors and rendering issues
- HTML: ✓ Being served correctly
- Frontend: ✓ Successfully rendering with modern design

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React SPA**: Built with React 18 using TypeScript, utilizing Vite as the build tool for fast development and optimized production builds
- **UI Components**: Leverages shadcn/ui component library with Radix UI primitives for accessible, customizable components
- **Styling**: Uses Tailwind CSS with a custom design system featuring metal/rock aesthetic with dark themes and red accent colors
- **State Management**: TanStack Query (React Query) for server state management, providing caching, synchronization, and background updates
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Express.js Server**: RESTful API server with TypeScript support
- **Database Layer**: PostgreSQL database accessed through Drizzle ORM for type-safe database operations
- **File Upload**: Multer middleware for handling image uploads with file type validation and size limits
- **Development Setup**: Vite integration for development mode with HMR support

### Data Storage Solutions
- **PostgreSQL Database**: Primary data store using Neon serverless PostgreSQL
- **Schema Design**: Four main entities:
  - **Bands**: Core entity with metadata, genres, members, albums, and social links
  - **Reviews**: User-generated content with ratings, likes, and categorization (band/album/concert reviews)
  - **Photos**: Image uploads categorized by type (live, promo, backstage, equipment)
  - **Tours**: Concert/tour information with venue, location, and date details
- **Migrations**: Drizzle Kit for database schema migrations and management

### Authentication and Authorization
- **Session-based Authentication**: Uses express-session with PostgreSQL session store (connect-pg-simple) 
- **Persistent Login**: Extended session duration to 30 days with automatic token refresh and rolling sessions
- **Replit OAuth Integration**: Full authentication flow with user profile management and "Remember Me" functionality
- **Session Management UI**: User-friendly session status display with manual refresh capabilities

### API Design
- **RESTful Endpoints**: Standard CRUD operations for all entities
- **Search Functionality**: Band search by name and genre
- **Filtering**: Photo filtering by category, tour filtering by date
- **File Upload**: Dedicated endpoints for image upload with validation
- **Error Handling**: Centralized error handling middleware with structured error responses

## External Dependencies

### Core Runtime Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver for database connectivity
- **drizzle-orm**: Type-safe ORM for PostgreSQL database operations
- **express**: Web application framework for the backend API
- **multer**: Middleware for handling multipart/form-data file uploads

### Frontend Libraries
- **@tanstack/react-query**: Server state management and data fetching
- **wouter**: Lightweight routing library for React applications
- **@radix-ui/***: Comprehensive collection of accessible UI primitives
- **react-hook-form**: Performant forms library with minimal re-renders
- **@hookform/resolvers**: Validation resolvers for React Hook Form
- **zod**: TypeScript-first schema validation

### UI and Styling
- **tailwindcss**: Utility-first CSS framework
- **shadcn/ui**: Pre-built component library based on Radix UI
- **class-variance-authority**: Utility for creating type-safe component variants
- **clsx**: Utility for constructing className strings conditionally

### Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **drizzle-kit**: Database migration and introspection tools
- **esbuild**: Fast JavaScript bundler for production builds

### Session Management
- **express-session**: Session middleware for Express applications
- **connect-pg-simple**: PostgreSQL session store for persistent sessions

### File Handling
- **date-fns**: Modern JavaScript date utility library
- **embla-carousel-react**: Carousel component for image galleries

## Recent Changes

### Application Loading Fix (August 17, 2025)
- **Fixed Critical Loading Issue**: Resolved React application not rendering by debugging authentication hook
- **Toast System Removal**: Completely removed problematic toast notification system causing React hooks errors
- **Authentication Flow**: Fixed infinite loading state in useAuth hook preventing app initialization
- **Debug Implementation**: Added comprehensive error handling and debug logging for troubleshooting
- **Mobile Compatibility**: Maintained all mobile optimization features during the debugging process

## Mobile Optimization Features

### Mobile-First Design
- **Safe Area Support**: CSS utilities for device safe areas (safe-top, safe-bottom, safe-left, safe-right)
- **Touch-Friendly Interactions**: Optimized button sizes (minimum 48px touch targets) and active states
- **Responsive Typography**: Fluid text scaling using clamp() for optimal readability across devices
- **Mobile Grid System**: Adaptive grid layouts that stack on mobile and expand on larger screens

### User Experience Enhancements
- **Mobile CSS Utilities**: Custom classes for mobile-optimized cards, buttons, and scrollbars
- **Accessibility Features**: Focus-visible states, reduced motion support, and high contrast mode
- **AI Chat Improvements**: Enhanced message bubbles with proper text wrapping and scrollable containers
- **Progressive Web App**: Service worker registration for offline capability and app-like experience

### Mobile-Specific Features
- **iOS Safari Optimization**: Input font-size set to 16px to prevent zoom on focus
- **Android Chrome Support**: Viewport meta tag and touch-action optimizations
- **Performance**: Lazy loading images and optimized mobile scrolling with custom scrollbars