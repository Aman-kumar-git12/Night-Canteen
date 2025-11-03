import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import UserInfoForm from "./pages/UserInfo";
import MyOrder from "./pages/MyOrder";
import { useUser } from "@clerk/clerk-react";
import supabase from "./connection/supabase-client";
import Admin from "./pages/Admin/Admin";
import ShimmerProfile from "./pages/shimmering";

function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn } = useUser();
  if (!isLoaded) return <div><ShimmerProfile/></div>;
  return isSignedIn ? children : <Navigate to="/signup" replace />;
}

function AdminRoute({ children }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkedAdmin, setCheckedAdmin] = useState(false);

  useEffect(() => {
    async function checkAdminRole() {
      if (!isLoaded || !isSignedIn || !user) {
        setCheckedAdmin(true);
        return;
      }
      
      const { data, error } = await supabase
        .from("profiles")
        .select("isAdmin")
        .eq("id", user.id)
        .single();
      console.log("App AdminRoute - Error:", error);
      
      if (data && data.isAdmin === true) {
        setIsAdmin(true);
        console.log("App AdminRoute - Admin access granted");
      } else {
        console.log("App AdminRoute - Admin access denied - isAdmin:", data?.isAdmin);
      }
      setCheckedAdmin(true);
    }
    
    checkAdminRole();
  }, [isLoaded, isSignedIn, user]);

  if (!isLoaded || !checkedAdmin) return <div><ShimmerProfile/></div>;
  if (!isSignedIn || !isAdmin) return <Navigate to="/home" replace />;
  return children;
}

function ProfileCheck({ children }) {
  const { user } = useUser();
  const [profileChecked, setProfileChecked] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkProfile() {
      if (!user) return;
      let { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (!data && user.primaryEmailAddress) {
        const email = user.primaryEmailAddress.emailAddress || user.emailAddresses[0]?.emailAddress;
        const { data: emailData } = await supabase.from("profiles").select("*").eq("email", email).single();
        if (emailData) {
          if (!emailData.id || emailData.id !== user.id) {
            await supabase.from("profiles").update({ id: user.id }).eq("email", email);
          }
          data = { ...emailData, id: user.id };
        }
      }
      if (data) {
        setHasProfile(true);
      } else {
        navigate("/user-info", { replace: true });
      }
      setProfileChecked(true);
    }
    checkProfile();
  }, [user, navigate]);

  if (!profileChecked) return <div><ShimmerProfile/></div>;
  return hasProfile ? children : null;
}

const Signup = React.lazy(() => import("./context/Signup"));

const App = () => {
  return (
    <BrowserRouter>
      <React.Suspense fallback={<div><ShimmerProfile/></div>}>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/user-info" element={
            <ProtectedRoute>
              <UserInfoForm />
            </ProtectedRoute>
          } />
          <Route path="/" element={
            <ProtectedRoute>
              <ProfileCheck>
                <LandingPage />
              </ProfileCheck>
            </ProtectedRoute>
          } />
          <Route path="/home" element={
            <ProtectedRoute>
              <ProfileCheck>
                <HomePage />
              </ProfileCheck>
            </ProtectedRoute>
          } />
          <Route path="/my-orders" element={
            <ProtectedRoute>
              <ProfileCheck>
                <MyOrder />
              </ProfileCheck>
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminRoute>
                <Admin />
              </AdminRoute>
            </ProtectedRoute>
          } />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
};

export default App;
