# Views Directory Structure

This directory contains all the frontend pages organized by functionality.

## Directory Structure

```
views/
├── index.html                 # Main navigation page
├── sales/                     # Sales overview page
│   ├── sales.html
│   ├── sales.css
│   └── sales.js
├── category-sales/            # Category-wise sales analysis
│   ├── category_sales.html
│   ├── category_sales.css
│   └── category_sales.js
├── daywise-sales/            # Daily sales performance
│   ├── daywise_sales.html
│   ├── daywise_sales.css
│   └── daywise_sales.js
├── upload-file/              # File upload functionality
│   ├── upload_file.html
│   ├── upload_file.css
│   ├── upload_file.js
│   └── index.html           # Alternative entry point
└── shared/                   # Shared libraries and utilities
    └── awesomplete.min.js   # Autocomplete library
```

## Pages

### Sales Overview (`/sales`)
- Main dashboard with sales analytics
- Interactive charts and data visualization
- Date range filtering

### Category Sales (`/category_sales`)
- Sales breakdown by product categories
- Category-wise performance metrics
- Autocomplete search functionality

### Daywise Sales (`/daywise_sales`)
- Daily sales performance table
- Date-specific sales data
- Navigation back to main sales view

### Upload File (`/upload_file`)
- File upload interface
- File processing and content display
- Drag & drop functionality

## Navigation

- Visit `/views/` for the main navigation page
- Each page is accessible through its respective route
- Pages include back navigation where appropriate

## File Organization

Each page follows a consistent structure:
- `*.html` - Page markup and structure
- `*.css` - Page-specific styling and responsive design
- `*.js` - Page functionality and API interactions

### Static File Serving

The Express server serves static files with the `/views/` prefix:
- CSS files are accessible at `/views/{page-folder}/{filename}.css`
- JS files are accessible at `/views/{page-folder}/{filename}.js`
- Shared resources are at `/views/shared/{filename}`

All HTML files use absolute paths starting with `/views/` to ensure proper loading regardless of the current route.

All external resources and shared utilities are placed in the `shared/` directory.