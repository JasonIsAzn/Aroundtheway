# Aroundtheway - WOS Coding Standards for Next.js

## Project Overview
This project follows WOS (Web Operation System) coding standards learned in class, adapted for Next.js development with ASP.NET Core backend.

## Development Commands
- **Frontend**: `npm run dev` (Next.js development server)
- **Backend**: `dotnet watch` (ASP.NET Core with hot reload)
- **Lint**: `npm run lint` (ESLint validation)
- **Database**: Docker MySQL container on port 3307

## WOS Coding Standards for React/Next.js

### 1. Component Structure
- Use **function declarations** instead of arrow functions
```javascript
// ✅ Correct WOS Style
function RegistrationForm() {
  // component logic
}

// ❌ Avoid
const RegistrationForm = () => {
  // component logic
}
```

### 2. State Management
- Use **single useState object** for form data instead of multiple useState hooks
```javascript
// ✅ Correct WOS Style
const [formState, setFormState] = useState({
  email: "",
  password: "",
  confirmPassword: ""
});

const handleChange = (event) => {
  const { name, value } = event.target;
  setFormState((prev) => {
    return { ...prev, [name]: value };
  });
};

// ❌ Avoid multiple useState hooks
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
```

### 3. Validation Patterns
- Use **simple validation** with descriptive error messages
- **No complex regex patterns** - use basic string methods
```javascript
// ✅ Correct WOS Style
const validateEmail = (email) => {
  return email.trim() !== '' && email.includes('@') && email.includes('.');
};

const validatePassword = (password) => {
  if (password.trim().length === 0) {
    return "Password is required";
  }
  if (password.trim().length < 8) {
    return "Password must be at least 8 characters";
  }
  return "";
};

// ❌ Avoid complex regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

### 4. Form Validation Logic
- Use **switch statements** for multiple field validation
- Use **isValid boolean** pattern with descriptive messages
```javascript
// ✅ Correct WOS Style
const validateForm = () => {
  let isValid = true;
  const newErrors = {};

  // Email validation
  if (!formState.email) {
    newErrors.email = "Email is required";
    isValid = false;
  } else if (!validateEmail(formState.email)) {
    newErrors.email = "Please enter a valid email address";
    isValid = false;
  }

  setErrors(newErrors);
  return isValid;
};
```

### 5. Error Handling
- Use clear, user-friendly error messages
- Always use `.trim()` before validation
- Return empty string when validation passes
```javascript
// ✅ Correct WOS Style
if (password.trim().length < 8) {
  return "Password must be at least 8 characters";
}
```

### 6. Event Handlers
- Use single **handleChange** function for all form inputs
- Extract `name` and `value` from event.target
```javascript
// ✅ Correct WOS Style
const handleChange = (event) => {
  const { name, value } = event.target;
  setFormState((prev) => {
    return { ...prev, [name]: value };
  });
};
```

## Current Implementation Status

### ✅ Completed Features
- User Registration form (email, password, confirm password)
- User Login form (email, password)
- Email Verification page template (ready for backend integration)
- Form validation using WOS patterns
- Tailwind CSS styling
- ESLint configuration

### 🚧 Commented Out (Ready for Backend)
- Address Information fields
- Payment Information fields
- Related validation logic
- API submission data

### 📝 TODO Comments
All commented code includes `TODO:` comments for easy identification:
```javascript
/* TODO: Address validation - Uncomment when backend is ready */
/* TODO: Payment Information - Uncomment when backend is ready */
```

## File Structure
```
/Users/tamarapalmer/Aroundtheway/
├── apps/
│   ├── web/                 # Next.js Frontend
│   │   ├── src/app/
│   │   │   ├── login/page.js        # Login form
│   │   │   ├── register/page.js     # Registration form
│   │   │   ├── verify-email/page.js # Email verification
│   │   │   └── page.js             # Home page
│   │   └── package.json
│   └── api/                 # ASP.NET Core Backend
│       ├── Program.cs
│       └── appsettings.json
└── CLAUDE.md               # This file
```

## Team Responsibilities
- **Tamara (Frontend)**: React/Next.js components, forms, validation, styling
- **Jason (Backend)**: ASP.NET Core API, Entity Framework, database models

## Notes
- Forms follow the same patterns as WOS OneStateForm.jsx
- No regex validation patterns used (per WOS standards)
- Simple email validation: checks for '@' and '.' characters
- Password validation: minimum 8 characters only
- All unused code is commented out, not deleted