"use client";

import { useState } from "react";

function UserProfile() {
  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    cardNumber: "",
    cardHolderName: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email) => {
    return email.trim() !== '' && email.includes('@') && email.includes('.');
  };

  const validateRequired = (value, fieldName) => {
    if (!value || value.trim().length === 0) {
      return `${fieldName} is required`;
    }
    return "";
  };

  const validateCreditCard = (cardNumber) => {
    if (!cardNumber || cardNumber.trim().length === 0) return "";
    const cleaned = cardNumber.replace(/\D/g, '');
    if (cleaned.length < 13 || cleaned.length > 19) {
      return "Please enter a valid credit card number";
    }
    return "";
  };

  const validateCVV = (cvv) => {
    if (!cvv || cvv.trim().length === 0) return "";
    const cleaned = cvv.replace(/\D/g, '');
    if (cleaned.length < 3 || cleaned.length > 4) {
      return "CVV must be 3 or 4 digits";
    }
    return "";
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormState((prev) => {
      return { ...prev, [name]: value };
    });

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    const firstNameError = validateRequired(formState.firstName, "First name");
    if (firstNameError) {
      newErrors.firstName = firstNameError;
      isValid = false;
    }

    const lastNameError = validateRequired(formState.lastName, "Last name");
    if (lastNameError) {
      newErrors.lastName = lastNameError;
      isValid = false;
    }

    if (!formState.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(formState.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    const cardError = validateCreditCard(formState.cardNumber);
    if (cardError) {
      newErrors.cardNumber = cardError;
      isValid = false;
    }

    const cvvError = validateCVV(formState.cvv);
    if (cvvError) {
      newErrors.cvv = cvvError;
      isValid = false;
    }

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
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formState.firstName.trim(),
          lastName: formState.lastName.trim(),
          email: formState.email.trim().toLowerCase(),
          phoneNumber: formState.phoneNumber.trim(),
          address: formState.address.trim(),
          city: formState.city.trim(),
          state: formState.state.trim(),
          zipCode: formState.zipCode.trim(),
          country: formState.country.trim(),
          cardNumber: formState.cardNumber.replace(/\D/g, ''),
          cardHolderName: formState.cardHolderName.trim(),
          expiryMonth: formState.expiryMonth,
          expiryYear: formState.expiryYear,
          cvv: formState.cvv.replace(/\D/g, '')
        }),
      });

      if (response.ok) {
        alert('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        if (errorData.message?.includes('email already exists')) {
          setErrors({ email: 'This email address is already in use' });
        } else {
          alert('Profile update failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert('Profile update failed. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
            <p className="mt-1 text-sm text-gray-600">
              Update your account information and preferences
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formState.firstName}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formState.lastName}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <div className="mt-1 relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formState.email}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your email address"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-xs text-gray-500">Email verification status would go here</span>
                  </div>
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div className="mt-4">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formState.phoneNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Address Information</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Street Address
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formState.address}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your street address"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={formState.city}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                      State/Province
                    </label>
                    <input
                      id="state"
                      name="state"
                      type="text"
                      value={formState.state}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="State"
                    />
                  </div>

                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                      ZIP/Postal Code
                    </label>
                    <input
                      id="zipCode"
                      name="zipCode"
                      type="text"
                      value={formState.zipCode}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="ZIP Code"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <input
                    id="country"
                    name="country"
                    type="text"
                    value={formState.country}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your country"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="cardHolderName" className="block text-sm font-medium text-gray-700">
                    Cardholder Name
                  </label>
                  <input
                    id="cardHolderName"
                    name="cardHolderName"
                    type="text"
                    value={formState.cardHolderName}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Name on card"
                  />
                </div>

                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                    Card Number
                  </label>
                  <input
                    id="cardNumber"
                    name="cardNumber"
                    type="text"
                    value={formState.cardNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                  />
                  {errors.cardNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="expiryMonth" className="block text-sm font-medium text-gray-700">
                      Expiry Month
                    </label>
                    <select
                      id="expiryMonth"
                      name="expiryMonth"
                      value={formState.expiryMonth}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Month</option>
                      <option value="01">01</option>
                      <option value="02">02</option>
                      <option value="03">03</option>
                      <option value="04">04</option>
                      <option value="05">05</option>
                      <option value="06">06</option>
                      <option value="07">07</option>
                      <option value="08">08</option>
                      <option value="09">09</option>
                      <option value="10">10</option>
                      <option value="11">11</option>
                      <option value="12">12</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="expiryYear" className="block text-sm font-medium text-gray-700">
                      Expiry Year
                    </label>
                    <select
                      id="expiryYear"
                      name="expiryYear"
                      value={formState.expiryYear}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Year</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                      <option value="2028">2028</option>
                      <option value="2029">2029</option>
                      <option value="2030">2030</option>
                      <option value="2031">2031</option>
                      <option value="2032">2032</option>
                      <option value="2033">2033</option>
                      <option value="2034">2034</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                      CVV
                    </label>
                    <input
                      id="cvv"
                      name="cvv"
                      type="text"
                      value={formState.cvv}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="123"
                      maxLength="4"
                    />
                    {errors.cvv && (
                      <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default UserProfile;