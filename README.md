# Household Income & Expense Tracker

A comprehensive web application for tracking household finances with bank statement matching capabilities. Built with React, TypeScript, and modern web technologies.

![Expense Tracker](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.x-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-blue.svg)

## Features

### 🏠 **Core Financial Tracking**

- **Income & Expense Management**: Add, edit, and delete financial transactions with detailed categorization
- **Multi-Period Analysis**: View summaries for daily, weekly, monthly, or yearly periods
- **Smart Categories**: Pre-defined categories for both income and expenses with custom options
- **Real-time Calculations**: Automatic net income calculations and financial insights

### 🏦 **Bank Statement Matching**

- **CSV Upload**: Import bank statements in CSV format
- **Intelligent Matching**: Automatically match recorded transactions with bank data
- **Discrepancy Detection**: Identify unmatched transactions and potential issues
- **Match Reports**: Generate detailed reports of matching results
- **Data Validation**: Comprehensive validation of imported bank data

### 📊 **Advanced Reporting & Analytics**

- **Interactive Charts**: Bar charts, line graphs, and pie charts for financial visualization
- **Category Analysis**: Detailed breakdown of spending by category with percentages
- **Trend Analysis**: Track financial patterns over time
- **Export Capabilities**: Download data as CSV or generate summary reports
- **Financial Insights**: Automated insights about spending patterns and savings rates

### 🔐 **Security & User Management**

- **Secure Authentication**: User registration and login system
- **Local Storage**: Client-side data persistence for privacy
- **Session Management**: Secure user session handling
- **Data Protection**: All sensitive data stored locally on user's device

### 📱 **Modern User Experience**

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark Mode Support**: Automatic dark/light theme switching
- **Intuitive Navigation**: Clean, modern interface with easy navigation
- **Real-time Feedback**: Toast notifications for user actions
- **Accessibility**: ARIA labels and keyboard navigation support

## Technology Stack

### Frontend Framework

- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Full type safety and better developer experience
- **Vite**: Fast build tool and development server

### Styling & UI

- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible, unstyled UI components
- **Lucide React**: Beautiful, customizable icons
- **Framer Motion**: Smooth animations and transitions

### Data Visualization

- **Recharts**: Responsive chart library for React
- **Custom Charts**: Bar charts, line graphs, and pie charts

### Form Management

- **React Hook Form**: Performant forms with minimal re-renders
- **Zod**: TypeScript-first schema validation

### Routing & Navigation

- **React Router**: Client-side routing for single-page application

### Development Tools

- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Vitest**: Unit testing framework

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Family_Finance_Tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage Guide

### 1. **Getting Started**

- Create an account or sign in with demo credentials
- The application uses local storage, so your data stays on your device

### 2. **Adding Transactions**

- Click "Add Transaction" on the dashboard or transactions page
- Select income or expense type
- Choose a category and enter amount, date, and description
- Save the transaction

### 3. **Bank Statement Matching**

- Navigate to the "Bank Matching" page
- Upload your bank statement CSV file
- The format should include: Date, Description, Amount, Balance, Reference
- Click "Start Matching" to compare with your recorded transactions
- Review matched, unmatched, and discrepancy results
- Download detailed reports

### 4. **Viewing Reports**

- Go to the "Reports" page for comprehensive financial analysis
- Switch between different time periods (daily, weekly, monthly, yearly)
- View interactive charts and category breakdowns
- Export data as CSV or download summary reports

### 5. **Managing Data**

- Edit or delete transactions from the transactions page
- Use filters to search and sort your financial data
- Export your data for external analysis

## CSV Format for Bank Statements

Your bank statement CSV should follow this format:

```csv
Date,Description,Amount,Balance,Reference
01/15/2024,"Grocery Store",-85.50,1234.50,REF123
01/16/2024,"Salary Deposit",2500.00,3734.50,SAL456
```

### Required Columns:

- **Date**: Transaction date (MM/DD/YYYY or DD/MM/YYYY)
- **Description**: Transaction description or merchant name
- **Amount**: Transaction amount (positive for credits, negative for debits)
- **Balance**: Account balance after transaction
- **Reference**: Bank reference number (optional)

## Data Storage

The application uses browser localStorage for data persistence:

- **Transactions**: All your financial records
- **User Data**: Account information (locally stored)
- **Bank Data**: Uploaded bank statements (temporary)
- **Settings**: Application preferences

## Browser Compatibility

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Performance Features

- **Code Splitting**: Lazy loading for optimal performance
- **Optimized Builds**: Minified and compressed production builds
- **Responsive Images**: Adaptive image loading
- **Local Storage**: Fast data access without server calls

## Security Considerations

- All data is stored locally on the user's device
- No sensitive information is transmitted to external servers
- Bank statement data is processed client-side
- User passwords are handled securely (demo environment)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run typecheck    # TypeScript type checking
npm run format.fix   # Format code with Prettier
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, cards, etc.)
│   ├── Navigation.tsx   # App navigation
│   ├── Chart.tsx       # Chart components
│   └── ...
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Transactions.tsx # Transaction management
│   ├── BankMatching.tsx # Bank statement matching
│   ├── Reports.tsx     # Financial reports
│   └── Login.tsx       # Authentication
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
│   ├── storage.ts      # Data storage utilities
│   ├── bankMatching.ts # Bank matching logic
│   └── analytics.ts    # Financial calculations
├── types/              # TypeScript type definitions
└── App.tsx            # Main application component
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, questions, or feature requests, please open an issue in the repository.

---

**Built with ❤️ using React and TypeScript**
