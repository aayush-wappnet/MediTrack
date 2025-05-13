# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```


```
Frontend File Structure for Medical Record and Prescription Fulfillment System
Below is the proposed file and folder structure for the frontend, built with React (Vite), Redux, Tailwind CSS, and TypeScript. This structure is designed to be modular, scalable, and aligned with the project's requirements.
/src
  /api
    /endpoints
      auth.ts                # API calls for authentication (login, register)
      users.ts               # API calls for user management
      patients.ts            # API calls for patient management
      doctors.ts             # API calls for doctor management
      nurses.ts              # API calls for nurse management
      appointments.ts        # API calls for appointment management
      schedules.ts           # API calls for doctor/nurse schedules
      prescriptions.ts       # API calls for prescription management
      lab-reports.ts         # API calls for lab report management
      diagnoses.ts           # API calls for diagnosis management
      audit-logs.ts          # API calls for audit log retrieval
      barcode.ts             # API calls for barcode generation/scanning
    /types
      auth.types.ts          # TypeScript interfaces for auth-related data
      users.types.ts         # TypeScript interfaces for user data
      patients.types.ts      # TypeScript interfaces for patient data
      doctors.types.ts       # TypeScript interfaces for doctor data
      nurses.types.ts        # TypeScript interfaces for nurse data
      appointments.types.ts  # TypeScript interfaces for appointment data
      schedules.types.ts     # TypeScript interfaces for schedule data
      prescriptions.types.ts # TypeScript interfaces for prescription data
      lab-reports.types.ts   # TypeScript interfaces for lab report data
      diagnoses.types.ts     # TypeScript interfaces for diagnosis data
      audit-logs.types.ts    # TypeScript interfaces for audit log data
      barcode.types.ts       # TypeScript interfaces for barcode data
    index.ts                 # Exports all API functions
    apiClient.ts             # Axios instance with base URL and auth headers

  /assets
    /images
      logo.png              # Application logo
      placeholder.png       # Placeholder images for users/patients
    /icons
      calendar.svg          # Icons for UI elements (e.g., appointments)
      prescription.svg      # Prescription-related icons
      barcode.svg           # Barcode-related icons
      ...                   # Other SVG icons
    /styles
      tailwind.css          # Tailwind CSS configuration and custom styles

  /components
    /common
      Button.tsx            # Reusable button component
      Input.tsx             # Reusable input component
      Select.tsx            # Reusable dropdown component
      Modal.tsx             # Reusable modal component
      Table.tsx             # Reusable table component for lists
      Card.tsx              # Reusable card component for dashboards
      Loader.tsx            # Loading spinner component
      Toast.tsx             # Notification/toast component
      BarcodeScanner.tsx    # Component for barcode scanning
      BarcodeDisplay.tsx    # Component to display barcode (SVG)
      PrintView.tsx         # Component for print-friendly views
    /auth
      LoginForm.tsx         # Login form component
      RegisterForm.tsx      # Registration form component
    /admin
      UserManagement.tsx    # Component for managing users
      AuditLogViewer.tsx    # Component for viewing audit logs
      ReportDashboard.tsx   # Component for global reports
    /doctor
      AppointmentManager.tsx # Component for managing appointments
      PatientHistory.tsx    # Component for viewing/editing patient history
      PrescriptionForm.tsx  # Component for issuing prescriptions
      DiagnosisForm.tsx     # Component for recording diagnoses
      LabRequestForm.tsx    # Component for ordering lab tests
    /nurse
      AppointmentQueue.tsx  # Component for managing appointment queue
      PrescriptionQueue.tsx # Component for managing prescription fulfillment
      LabReportUpload.tsx   # Component for uploading lab reports
      VitalsForm.tsx        # Component for recording patient vitals
    /patient
      AppointmentHistory.tsx # Component for viewing appointment history
      PrescriptionViewer.tsx # Component for viewing prescriptions
      LabReportViewer.tsx   # Component for viewing lab reports
      ProfileForm.tsx       # Component for updating patient profile

  /hooks
    useAuth.ts             # Custom hook for authentication state
    useApi.ts              # Custom hook for API calls with error handling
    useBarcodeScanner.ts   # Custom hook for barcode scanning functionality
    usePrint.ts            # Custom hook for handling print views
    useRole.ts             # Custom hook for role-based access control

  /layouts
    MainLayout.tsx         # Main layout with header, sidebar, and content
    AuthLayout.tsx         # Layout for auth pages (login, register)
    DashboardLayout.tsx    # Layout for role-specific dashboards

  /pages
    /auth
      Login.tsx            # Login page
      Register.tsx         # Registration page
    /admin
      Dashboard.tsx        # Admin dashboard
      Users.tsx            # User management page
      AuditLogs.tsx        # Audit logs page
      Reports.tsx          # Global reports page
    /doctor
      Dashboard.tsx        # Doctor dashboard
      Appointments.tsx     # Appointment management page
      Patients.tsx         # Patient history and management page
      Prescriptions.tsx    # Prescription issuance page
      Diagnoses.tsx        # Diagnosis entry page
      LabRequests.tsx      # Lab test request page
    /nurse
      Dashboard.tsx        # Nurse dashboard
      Appointments.tsx     # Appointment queue page
      Prescriptions.tsx    # Prescription fulfillment page
      LabReports.tsx       # Lab report upload page
      Vitals.tsx           # Vitals entry page
    /patient
      Dashboard.tsx        # Patient dashboard
      Appointments.tsx     # Appointment history and scheduling page
      Prescriptions.tsx    # Prescription viewer page
      LabReports.tsx       # Lab report viewer page
      Profile.tsx          # Patient profile page
    NotFound.tsx           # 404 page
    Unauthorized.tsx       # 403 page for unauthorized access

  /store
    /slices
      authSlice.ts         # Redux slice for authentication state
      userSlice.ts         # Redux slice for user data
      patientSlice.ts      # Redux slice for patient data
      appointmentSlice.ts  # Redux slice for appointment data
      prescriptionSlice.ts # Redux slice for prescription data
      labReportSlice.ts    # Redux slice for lab report data
      diagnosisSlice.ts    # Redux slice for diagnosis data
      auditLogSlice.ts     # Redux slice for audit log data
    index.ts               # Redux store configuration
    types.ts               # TypeScript types for Redux state

  /utils
    constants.ts           # App-wide constants (e.g., API base URL, roles)
    helpers.ts             # Utility functions (e.g., date formatting)
    validators.ts          # Form validation functions
    roleGuard.ts           # Role-based access control logic
    barcodeUtils.ts        # Barcode generation and parsing utilities

  /types
    global.types.ts        # Global TypeScript interfaces (e.g., User, Role)
    component.types.ts     # TypeScript types for component props

  App.tsx                  # Main app component with routing
  main.tsx                 # Entry point for Vite
  index.css                # Global CSS (if needed beyond Tailwind)
  vite-env.d.ts            # Vite environment types

/public
  favicon.ico              # App favicon
  index.html               # Vite HTML entry point
  manifest.json            # Web app manifest (optional)

/tailwind.config.js        # Tailwind CSS configuration
/vite.config.ts            # Vite configuration
/tsconfig.json             # TypeScript configuration
/package.json              # Project dependencies and scripts
/.eslintrc.js              # ESLint configuration
/.prettierrc               # Prettier configuration

Explanation of Key Folders and Files

/src/api: Contains API call logic using Axios, organized by endpoint groups (e.g., auth.ts, patients.ts). TypeScript types for API responses are in /api/types.
/src/assets: Stores static assets like images, icons, and Tailwind CSS configuration.
/src/components: Reusable UI components, split into common (shared) and role-specific folders (admin, doctor, nurse, patient).
/src/hooks: Custom hooks for handling authentication, API calls, barcode scanning, and printing.
/src/layouts: Layout components for consistent UI structure across pages (e.g., main layout with sidebar, auth layout).
/src/pages: Page components organized by role, mapping to routes (e.g., /admin/Dashboard.tsx).
/src/store: Redux setup with slices for managing state (e.g., authSlice.ts, patientSlice.ts).
/src/utils: Utility functions, constants, validators, and role-based access control logic.
/src/types: Global TypeScript types for shared interfaces and component props.
/public: Static files served by Vite, including the HTML entry point.
Configuration files: tailwind.config.js, vite.config.ts, tsconfig.json, etc., for setting up the development environment.

Next Steps
This structure sets the foundation for your frontend. Let me know what you'd like to work on next, such as:

Setting up the initial Vite + React + TypeScript project with Tailwind and Redux.
Creating the main layout (MainLayout.tsx) with a sidebar and role-based navigation.
Building the authentication pages (Login.tsx, Register.tsx) with API integration.
Implementing a specific role's dashboard (e.g., Admin or Doctor).
Setting up Redux for state management with an example slice (e.g., authSlice.ts).
Creating a reusable component (e.g., BarcodeScanner.tsx or Table.tsx).

Please specify the next step or any adjustments to the structure!
```
