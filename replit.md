# MetalHub - Music Community Platform

## Overview

MetalHub is a full-stack web application built for metal and rock music enthusiasts. It serves as a community platform where users can discover bands, write reviews, upload photos, and track tour information. The application features a modern React frontend with a Node.js/Express backend, utilizing PostgreSQL for data persistence through Drizzle ORM.

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