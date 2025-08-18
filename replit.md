# MoshUnion - Music Community Platform

## Overview
MoshUnion is a comprehensive full-stack music community platform designed for metal and rock enthusiasts. It provides a complete social ecosystem for band discovery, user reviews, concert photo uploads, tour date tracking, and connecting with other metalheads. The platform aims to be a central hub for the metal and rock community, combining modern frontend architecture with a robust backend for reliable data persistence.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React SPA**: Built with React 18, TypeScript, and Vite for fast development.
- **UI Components**: Uses shadcn/ui with Radix UI primitives for accessible and customizable components.
- **Styling**: Tailwind CSS with a custom design system featuring metal/rock aesthetic using dark themes and red/yellow accent colors.
- **State Management**: TanStack Query (React Query) for server state management.
- **Routing**: Wouter for lightweight client-side routing.
- **Forms**: React Hook Form with Zod validation for type-safe form handling.
- **UI/UX Decisions**: Features an ultra dynamic red, yellow, and black theme, dramatic typography, large image-focused cards, and a sophisticated clickable logo with word animation. The hero section design is based on a user-provided screenshot.
- **Mobile Optimization**: Advanced mobile-first design with comprehensive touch mechanics, safe area support for notched devices, enhanced touch feedback with scale animations, responsive typography using `clamp()`, adaptive grid layouts, touch-action manipulation, swipe gesture support, iOS Safari optimization, and Android Chrome support. Features mobile-specific CSS classes, touch targets sized for accessibility, and comprehensive viewport configuration.

### Backend Architecture
- **Express.js Server**: RESTful API server with TypeScript support.
- **Database Layer**: PostgreSQL database accessed through Drizzle ORM for type-safe operations.
- **File Upload**: Multer middleware for handling image uploads.
- **AI Functionality**: Invisible background AI services for automated band recommendations, smart search index optimization, content curation, trend detection, and user behavior analytics.

### Data Storage Solutions
- **PostgreSQL Database**: Primary data store using Neon serverless PostgreSQL.
- **Schema Design**: Core entities include Bands, Reviews, Photos, Tours, plus proximity matching tables (userLocations, proximityMatches) for location-based social features.
- **Migrations**: Drizzle Kit for database schema migrations.

### Authentication and Authorization
- **Session-based Authentication**: Uses `express-session` with PostgreSQL session store (`connect-pg-simple`).
- **Persistent Login**: Extended session duration with automatic token refresh.
- **Replit OAuth Integration**: Full authentication flow with user profile management and "Remember Me" functionality.
- **Session Management UI**: User-friendly session status display.
- **Hierarchical Admin System**: Comprehensive permission-based admin system with exclusive super admin access for Durantoss and granular privilege granting for specific administrative functions.

### API Design
- **RESTful Endpoints**: Standard CRUD operations for all entities.
- **Search Functionality**: Band search by name and genre, enhanced tour search with smart suggestions, search history, and real-time filtering.
- **Filtering**: Photo filtering by category, tour filtering by date, location, price range, genre, radius, and date range.
- **File Upload**: Dedicated endpoints for image upload with validation, including cloud storage integration for band photos.
- **Error Handling**: Centralized error handling middleware.
- **Proximity Matching**: Location-based user discovery with privacy controls and venue-specific matching for concert attendees.

### System Design Choices
- **Multi-Platform Event Discovery**: Integrates SeatGeek, Ticketmaster, and Bandsintown APIs for comprehensive event data.
- **AI-Powered Ranking**: Utilizes OpenAI for intelligent event recommendations and personalized matching.
- **Smart Demo Mode**: Provides informative demo events when API keys are not configured.
- **Background AI Integration**: AI services run continuously without user interaction for recommendations and analysis.
- **Deployment Ready**: Comprehensive error handling and health monitoring system for reliable production deployment.

## Recent Development Progress
- **Secure Messaging System**: Successfully implemented end-to-end encrypted messaging with RSA-2048 + AES-256-GCM encryption demonstration
- **Mobile-Optimized Social Hub**: Comprehensive mobile-first design with touch-friendly interface, responsive navigation, and safe area support
- **React Compatibility**: Resolved all React hooks compatibility issues with stable, hook-free component architecture
- **Testing Infrastructure**: Created dedicated messaging test page with live demonstration of secure messaging features
- **Cross-Platform Navigation**: Fully functional navigation system with mobile-responsive design
- **Mobile Compatibility Achievement**: Messaging interface now working perfectly on mobile devices using simplified component architecture (August 18, 2025)
- **Concert Proximity Matching**: Successfully implemented complete proximity-based social connection system with GPS location detection, privacy controls, and mobile-optimized touch interactions (August 18, 2025)
- **Navigation Loop Fix**: Completely resolved mobile navigation trapping issue by fixing URL parameter handling in App component, eliminating infinite loops that prevented users from leaving messaging interface (August 18, 2025)
- **Unified Social Experience**: Successfully combined Social Hub and The Pit into one comprehensive "The Pit" tab with tappable panels, integrated Community Feed, discussions, and activity streams while maintaining all button functionality (August 18, 2025)
- **Professional Interface Cleanup**: Completed comprehensive emoji removal from entire application for clean, professional appearance (August 18, 2025)
- **Interactive MoshUnion Branding**: Restored color-swapping animation for MoshUnion logo where MOSH and UNION words swap between red and white colors when clicked, creating engaging interactive branding experience on landing page (August 18, 2025)
- **Landing Page Redesign**: Fixed App component to render updated MobileFriendlyLanding component instead of old QuickFix component, ensuring the redesigned landing page with section panels and real-time updates is properly displayed (August 18, 2025)
- **Dynamic Loading Screen**: Updated loading screen to match red and white design scheme with 10 randomized metal-themed loading messages that change each app startup, replacing neon theme with professional metal aesthetic (August 18, 2025)
- **Mobile Optimization & Enhanced Touch Mechanics**: Comprehensive mobile-first optimization with responsive design, enhanced touch feedback, safe area support for notched devices, mobile-specific CSS classes, touch-action manipulation, scale effects on touch interactions, adaptive typography, and mobile-optimized grid layouts (August 18, 2025)
- **Hierarchical Admin Permission System**: Successfully implemented comprehensive admin privilege management with exclusive super admin access for Durantoss and granular permission granting system for 7 specific admin privileges (user management, content moderation, band management, tour management, review moderation, photo moderation, messaging moderation) - tested and working perfectly in production (August 18, 2025)
- **Complete Tours Feature Implementation**: Successfully built comprehensive tour discovery system with database integration, Google Search API, and responsive frontend display. Database contains 10+ upcoming tours from major metal bands (SLEEP TOKEN, GHOST, LORNA SHORE, BAD OMENS, SPIRITBOX) at iconic venues (Madison Square Garden, Wembley Stadium, Red Rocks Amphitheatre). Fixed missing getUpcomingTours method in DatabaseStorage class, implemented proper date filtering with Drizzle ORM, enhanced API responses with band information, and created responsive tour cards with venue details and ticket links - fully functional and tested (August 18, 2025)
- **Events Discovery Migration to Tours**: Successfully migrated all Events Discovery functionality into unified Tours & Events section with AI-enhanced search capabilities. Integrated multi-platform APIs (SeatGeek, Ticketmaster, Bandsintown) with OpenAI-powered recommendations into Tours page. Created comprehensive EnhancedToursPage with tabbed interface showing both database tours and intelligent discovery results. Removed duplicate Events Discovery section and updated all navigation references. Tours now includes confirmed database tours plus real-time AI-powered event discovery with advanced filtering, genre selection, price ranges, and location-based search - deployment ready (August 18, 2025)

## Deployment Status
- **Production Ready**: Full error handling, database connectivity testing, and health monitoring implemented.
- **Health Check Endpoint**: Available at `/health` for deployment monitoring and load balancer integration.
- **Robust Startup Process**: Environment validation, database testing, and graceful error handling.
- **External Access Configuration**: Server configured for 0.0.0.0 binding to support external deployment links.

## External Dependencies

### Core Runtime Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver.
- **drizzle-orm**: Type-safe ORM for PostgreSQL.
- **express**: Backend API framework.
- **multer**: Middleware for file uploads.

### Frontend Libraries
- **@tanstack/react-query**: Server state management and data fetching.
- **wouter**: Lightweight routing library for React.
- **@radix-ui/***: Accessible UI primitives.
- **react-hook-form**: Performant forms library.
- **@hookform/resolvers**: Validation resolvers for React Hook Form.
- **zod**: TypeScript-first schema validation.

### UI and Styling
- **tailwindcss**: Utility-first CSS framework.
- **shadcn/ui**: Pre-built component library.
- **class-variance-authority**: Utility for type-safe component variants.
- **clsx**: Utility for constructing className strings.

### Session Management
- **express-session**: Session middleware.
- **connect-pg-simple**: PostgreSQL session store.

### File Handling
- **date-fns**: JavaScript date utility library.
- **embla-carousel-react**: Carousel component.

### Third-Party APIs for Event Discovery
- **SeatGeek API**: For real concert data.
- **Ticketmaster API**: For major venue events.
- **Bandsintown API**: For artist-specific tour dates.
- **OpenAI**: For AI-powered event ranking and recommendations.