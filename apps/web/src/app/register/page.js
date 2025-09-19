"use client";

import { useState } from "react";

function RegistrationForm() {
  const [formState, setFormState] = useState({
    email: "",
    password: "",
    confirmPassword: ""
    /* TODO: Uncomment when backend is ready
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    creditCardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: ""
    */
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormState((prev) => {
      return { ...prev, [name]: value };
    });

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

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

  const validateForm = () => {
    let isValid = true;

    // Clear previous errors
    setErrors({});

    const newErrors = {};

    // Email validation
    if (!formState.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(formState.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation
    const passwordError = validatePassword(formState.password);
    if (passwordError) {
      newErrors.password = passwordError;
      isValid = false;
    }

    // Confirm password validation
    if (!formState.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formState.password !== formState.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    /* TODO: Address validation - Uncomment when backend is ready
    if (!formState.address) {
      newErrors.address = "Street address is required";
      isValid = false;
    }

    if (!formState.city) {
      newErrors.city = "City is required";
      isValid = false;
    }

    if (!formState.state) {
      newErrors.state = "State is required";
      isValid = false;
    }

    if (!formState.zipCode) {
      newErrors.zipCode = "ZIP code is required";
      isValid = false;
    }

    if (!formState.country) {
      newErrors.country = "Country is required";
      isValid = false;
    }
    */

    /* TODO: Credit card validation - Uncomment when backend is ready
    if (!formState.creditCardNumber) {
      newErrors.creditCardNumber = "Credit card number is required";
      isValid = false;
    }

    if (!formState.expiryDate) {
      newErrors.expiryDate = "Expiry date is required";
      isValid = false;
    }

    if (!formState.cvv) {
      newErrors.cvv = "CVV is required";
      isValid = false;
    }

    if (!formState.cardholderName) {
      newErrors.cardholderName = "Cardholder name is required";
      isValid = false;
    }
    */

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formState.email,
          password: formState.password
          /* TODO: Add when backend is ready
          address: {
            street: formState.address,
            city: formState.city,
            state: formState.state,
            zipCode: formState.zipCode,
            country: formState.country
          },
          creditCard: {
            number: formState.creditCardNumber,
            expiryDate: formState.expiryDate,
            cvv: formState.cvv,
            cardholderName: formState.cardholderName
          }
          */
        }),
      });

      if (response.ok) {
        alert('Registration successful!');
      } else {
        const errorData = await response.json();
        if (errorData.message?.includes('email already exists')) {
          setErrors({ email: 'This email is already registered' });
        } else {
          alert('Registration failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join Aroundtheway to access shopping features
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Account Information</h3>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formState.email}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formState.password}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formState.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* TODO: Address Information - Uncomment when backend is ready
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Street Address *
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formState.address}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="123 Main St"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}
              </div>
            </div>
            */}

            {/* TODO: Payment Information - Uncomment when backend is ready
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Payment Information</h3>
              <div>
                <label htmlFor="creditCardNumber" className="block text-sm font-medium text-gray-700">
                  Credit Card Number *
                </label>
                <input
                  id="creditCardNumber"
                  name="creditCardNumber"
                  type="text"
                  value={formState.creditCardNumber}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="1234 5678 9012 3456"
                />
                {errors.creditCardNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.creditCardNumber}</p>
                )}
              </div>
            </div>
            */}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in here
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegistrationForm;