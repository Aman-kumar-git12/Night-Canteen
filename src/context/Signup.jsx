import React from "react";
import { SignedIn, SignedOut, SignInButton, RedirectToSignIn, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isSignedIn) {
      navigate("/", { replace: true });
    }
  }, [isSignedIn, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-6 text-orange-600">Sign In to Night Canteen</h1>
        <SignedOut>
          <SignInButton mode="modal" afterSignInUrl="/" afterSignUpUrl="/user-info" />
        </SignedOut>
        <SignedIn>
          <div className="text-lg text-green-600 font-semibold">You are signed in! Redirecting...</div>
        </SignedIn>
      </div>
    </div>
  );
}

export default Signup;
