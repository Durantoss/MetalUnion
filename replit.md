# MoshUnion - Music Community Platform

## Overview
MoshUnion is a comprehensive full-stack music community platform for metal and rock enthusiasts. It provides a social ecosystem for band discovery, user reviews, concert photo uploads, tour date tracking, and connecting with other fans. The platform aims to be a central hub for the metal and rock community, combining modern frontend architecture with a robust backend for reliable data persistence. Its business vision is to be the go-to platform for metal and rock fans globally, offering a unique blend of community features and comprehensive event discovery, with significant market potential in a niche but passionate community.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Technology Stack**: React 18, TypeScript, Vite.
- **UI/UX**: shadcn/ui with Radix UI for components, Tailwind CSS for styling with a custom dark theme featuring red/yellow accents.
- **Design Principles**: Ultra dynamic red, yellow, and black theme, dramatic typography, large image-focused cards, sophisticated clickable logo with word animation, and mobile-first design with comprehensive touch mechanics, safe area support, and responsive layouts.
- **State Management**: TanStack Query for server state.
- **Routing**: Wouter.
- **Forms**: React Hook Form with Zod validation.

### Backend Architecture
- **Server**: Express.js with TypeScript.
- **Database**: PostgreSQL via Drizzle ORM.
- **File Upload**: Multer for image uploads.
- **AI Integration**: Invisible background AI services for automated band recommendations, smart search optimization, content curation, trend detection, and user behavior analytics.

### Data Storage Solutions
- **Primary Database**: Neon serverless PostgreSQL.
- **Schema**: Core entities include Bands, Reviews, Photos, Tours, and proximity matching tables for location-based features.
- **Migrations**: Drizzle Kit.

### Authentication and Authorization
- **Authentication**: Session-based using `express-session` and `connect-pg-simple`.
- **Features**: Persistent login, Replit OAuth integration, "Remember Me" functionality, and a user-friendly session management UI.
- **Authorization**: Hierarchical admin system with exclusive super admin access and granular privilege granting.

### API Design
- **Endpoints**: RESTful API for CRUD operations, search, filtering, and file uploads.
- **Search & Filtering**: Band search, enhanced tour search with suggestions, history, and real-time filtering; photo filtering by category, tour filtering by date, location, price, genre, radius.
- **Proximity Matching**: Location-based user discovery with privacy controls and venue-specific matching.
- **Error Handling**: Centralized error handling middleware.

### System Design Choices
- **Event Discovery**: Multi-platform event data integration from SeatGeek, Ticketmaster, and Bandsintown APIs.
- **AI-Powered Recommendations**: OpenAI for intelligent event recommendations and personalized matching.
- **Smart Demo Mode**: Provides informative demo events when API keys are not configured for production readiness.
- **Background AI**: AI services operate continuously without user interaction for recommendations and analysis.
- **Deployment**: Comprehensive error handling and health monitoring for reliable production deployment.

## External Dependencies

### Core Runtime Dependencies
- `@neondatabase/serverless`: Neon PostgreSQL serverless driver.
- `drizzle-orm`: Type-safe ORM for PostgreSQL.
- `express`: Backend API framework.
- `multer`: Middleware for file uploads.

### Frontend Libraries
- `@tanstack/react-query`: Server state management and data fetching.
- `wouter`: Lightweight routing library for React.
- `@radix-ui/*`: Accessible UI primitives.
- `react-hook-form`: Performant forms library.
- `@hookform/resolvers`: Validation resolvers for React Hook Form.
- `zod`: TypeScript-first schema validation.

### UI and Styling
- `tailwindcss`: Utility-first CSS framework.
- `shadcn/ui`: Pre-built component library.
- `class-variance-authority`: Utility for type-safe component variants.
- `clsx`: Utility for constructing className strings.

### Session Management
- `express-session`: Session middleware.
- `connect-pg-simple`: PostgreSQL session store.

### File Handling
- `date-fns`: JavaScript date utility library.
- `embla-carousel-react`: Carousel component.

### Third-Party APIs for Event Discovery
- `SeatGeek API`: For real concert data.
- `Ticketmaster API`: For major venue events.
- `Bandsintown API`: For artist-specific tour dates.
- `OpenAI`: For AI-powered event ranking and recommendations.