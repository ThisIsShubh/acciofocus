"use client";

import React, { useState, useEffect } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CustomSignUp() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return strength;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(calculatePasswordStrength(newPassword));
  };

  // Initialize CAPTCHA
  useEffect(() => {
    if (typeof window !== "undefined" && window.Clerk?.captcha) {
      window.Clerk.captcha.init({
        container: "#clerk-captcha",
        mode: "invisible",
        sitekey: process.env.NEXT_PUBLIC_CLERK_CAPTCHA_SITE_KEY,
        callback: (token) => {
          setCaptchaToken(token);
        },
      });
    }
  }, []);

  async function handleRegister(e) {
    e.preventDefault();
    if (!isLoaded) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      // Trigger CAPTCHA if available
      if (window.Clerk?.captcha) {
        window.Clerk.captcha.execute();
        
        // Wait for CAPTCHA token to be set
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const res = await signUp.create({ 
        emailAddress: email, 
        password,
        captchaToken
      });
      
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setIsVerifying(true);
    } catch (err) {
      console.error("Sign up error:", err);
      setError(err.errors?.[0]?.longMessage || "An error occurred during sign up");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    if (!isLoaded) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({ 
        code: verificationCode 
      });
      
      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError(err.errors?.[0]?.longMessage || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleSignup = async () => {
    if (!isLoaded) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard"
      });
    } catch (err) {
      console.error("OAuth error", err);
      setError(err.errors?.[0]?.longMessage || "Google sign up failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const PasswordStrengthIndicator = () => (
    <div className="w-full mt-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div 
            key={level} 
            className={`h-1 flex-1 rounded-full ${
              passwordStrength >= level ? 
                level < 3 ? "bg-yellow-500" : "bg-green-500" 
                : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <div className="text-xs mt-1 text-gray-500">
        {passwordStrength === 0 ? "Very weak" : 
         passwordStrength === 1 ? "Weak" : 
         passwordStrength === 2 ? "Medium" : 
         passwordStrength === 3 ? "Strong" : "Very strong"}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Left side - Sign-up Form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 min-h-screen">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-600 w-12 h-12 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-green-700 mb-2">
              {isVerifying ? "Verify Your Email" : "Create Your Account"}
            </h1>
            <p className="text-green-800">
              {isVerifying 
                ? "We've sent a code to your email" 
                : "Join our community of focused learners"}
            </p>
          </div>
          
          {/* Google Sign-up button */}
          {!isVerifying && (
            <button
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="mb-6 w-full bg-white border border-green-300 text-green-700 hover:bg-green-50 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign up with Google
            </button>
          )}
          
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 border-t border-gray-300"></div>
            <div className="relative bg-white px-4 text-green-500 text-sm">
              {isVerifying ? "Enter your verification code" : "Or sign up with email"}
            </div>
          </div>
          
          {/* CAPTCHA container (required by Clerk) */}
          <div id="clerk-captcha" className=""></div>
          
          {isVerifying ? (
            <form onSubmit={handleVerify}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                      required
                      maxLength={6}
                      disabled={isLoading}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-500">
                      {verificationCode.length}/6
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Check your email for the verification code
                  </p>
                </div>
                
                <button 
                  type="submit"
                  disabled={isLoading || verificationCode.length < 6}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : "Verify Account"}
                </button>
                
                <div className="text-center mt-4">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsVerifying(false);
                      setError("");
                    }}
                    className="text-sm text-green-600 hover:text-green-800 font-medium"
                  >
                    Back to sign up
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                    placeholder="you@example.com"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                      placeholder="••••••••"
                      required
                      minLength={8}
                      disabled={isLoading}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {password && <PasswordStrengthIndicator />}
                  <p className="mt-2 text-sm text-gray-500">
                    Use 8+ characters with a mix of letters, numbers & symbols
                  </p>
                </div>
                
                <button 
                  type="submit"
                  disabled={isLoading || passwordStrength < 2}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : "Create Account"}
                </button>
                
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <a href="/login" className="text-green-600 hover:text-green-800 font-medium">
                      Sign in
                    </a>
                  </p>
                </div>
              </div>
            </form>
          )}
          
          {error && (
            <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}
          
          <div className="mt-8 text-center text-gray-600 text-xs">
            <p>By signing up, you agree to our</p>
            <div className="flex justify-center gap-4 mt-1">
              <a href="#" className="text-green-600 hover:underline">Terms of Service</a>
              <a href="#" className="text-green-600 hover:underline">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Image */}
      {!isMobile && (
        <div className="hidden md:flex w-1/2 relative min-h-screen">
          <Image 
            src="/1.png" 
            alt="Students studying together"
            layout="fill"
            objectFit="cover"
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
}