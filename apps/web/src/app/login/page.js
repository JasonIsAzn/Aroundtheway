"use client";

import { login } from "@/lib/auth.client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { googleLogin } from "@/lib/auth.client";

function Login() {
  const router = useRouter();

  const [formState, setFormState] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email) => {
    return email.trim() !== "" && email.includes("@") && email.includes(".");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormState((prev) => {
      return { ...prev, [name]: value };
    });

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formState.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formState.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formState.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(formState);
      console.log(res);
      router.push("/");
    } catch (err) {
      if (err.status === 401) {
        setErrors({
          email: "Invalid email or password",
          password: "Invalid email or password",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onGoogleSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential;
      if (!idToken) throw new Error("Missing Google credential");

      const user = await googleLogin(idToken);
      console.log("Logged in via Google:", user);

      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert(`Google login failed: ${err.message || "Unknown error"}`);
    }
  };

  const onGoogleError = () => {
    alert("Google login failed");
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Welcome back to Aroundtheway
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
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
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formState.password}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center"></div>

              <div className="text-sm">
                <a
                  href="/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <a
                  href="/register"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign up here
                </a>
              </p>
            </div>
          </form>
        </div>

        <GoogleLogin onSuccess={onGoogleSuccess} onError={onGoogleError} />
      </div>
    </main>
  );
}

export default Login;
