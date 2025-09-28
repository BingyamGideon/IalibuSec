# Ialibu Secondary School Management System

## Overview

A comprehensive school management system built with React TypeScript, Express backend, and MySQL database integration. The system serves Ialibu Secondary School with complete authentication, student management, grade tracking, attendance management, and administrative tools. It features role-based dashboards for administrators and staff members with real-time data synchronization and intelligent fallback to localStorage when database connections are unavailable.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18 with TypeScript**: Modern React SPA with full type safety
- **Vite Build System**: Fast development and optimized production builds
- **React Router 6**: Client-side routing with SPA mode for seamless navigation
- **Tailwind CSS + Radix UI**: Responsive design with pre-built accessible components
- **Component Structure**: Organized into pages (routes), reusable UI components, and hooks for state management

### Backend Architecture
- **Hybrid API System**: Express.js server for development with PHP backend for XAMPP production deployment
- **Smart Fallback Pattern**: Automatically switches between API calls and localStorage based on environment
- **RESTful Endpoints**: Complete CRUD operations for all entities (students, attendance, grades, finance, staff)
- **Role-based Access Control**: Separate permissions for admin and staff users with secure session management

### Authentication System
- **Multi-tier Authentication**: Username/password with session management and automatic expiry
- **Role-based Dashboards**: Admin dashboard (full system access) and Staff dashboard (teaching-focused features)
- **User Management**: Admin can create, edit, and manage system users with different permission levels
- **Registration Workflow**: Secure user invitation system with token-based account activation

### Data Management
- **Unified Database Design**: Single MySQL database serving both admin and staff dashboards for real-time synchronization
- **Papua New Guinea Education Standards**: Built-in grading system (D: 85-100, C: 70-84, UP: 55-69, P: 40-54, F: <40)
- **Advanced Assessment System**: Multiple assessment components with weighted calculations (Weekly Tests 20%, Projects 25%, Assignments 20%, Take-Home Tests 15%, Open-Book Tests 10%, End-of-Term Tests 10%)
- **Smart Data Storage**: Primary MySQL with localStorage fallback for cloud environments

### Key Features
- **Student Management**: Complete profiles for grades 9-12, classes A-H with guardian information
- **Attendance Tracking**: Daily attendance recording with status tracking and historical reports
- **Grade Management**: Individual assessment score editing, batch entry, and automatic calculations
- **Financial Management**: School fees tracking, payment records, and outstanding balance monitoring
- **Report Generation**: Automated report cards with PDF export functionality using jsPDF and html2canvas
- **Audit System**: Complete activity logging for accountability and system monitoring

## External Dependencies

### Core Framework Dependencies
- **React 18** with TypeScript support for modern frontend development
- **Express.js** for API server functionality
- **Vite** for build tooling and development server

### UI and Styling
- **Radix UI** components for accessible, unstyled UI primitives
- **Tailwind CSS** for utility-first styling with custom theming
- **Lucide React** for consistent iconography throughout the application

### Data and State Management
- **TanStack Query** for server state management and caching
- **React Router** for client-side routing and navigation
- **React Hook Form** with Zod validation for form handling

### Document Generation
- **jsPDF** for PDF generation of reports and documents
- **html2canvas** for converting HTML elements to images for PDF embedding

### Development and Testing
- **Vitest** for unit testing and test coverage
- **TypeScript** for type safety and developer experience
- **ESLint** and **Prettier** for code quality and formatting

### Database Integration
- **MySQL** as primary database with XAMPP for local development
- **PHP** backend for XAMPP deployment compatibility
- **localStorage** fallback for cloud environments where database connections aren't available

### Production Deployment
- **XAMPP** compatibility for local school server deployment
- **Netlify/Vercel** support for cloud hosting with localStorage fallback
- **Static file serving** for production builds with proper routing configuration