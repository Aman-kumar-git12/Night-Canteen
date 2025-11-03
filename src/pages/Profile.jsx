import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import supabase from "../connection/supabase-client";
import { ShimmerProfile } from "./shimmering";

export function Profile() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      setLoading(true);
      // Try to fetch by Clerk user ID first
      let { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      // If not found, try by email
      if (!data && user.primaryEmailAddress) {
        const email = user.primaryEmailAddress.emailAddress || user.emailAddresses[0]?.emailAddress;
        const { data: emailData } = await supabase.from("profiles").select("*").eq("email", email).single();
        if (emailData) data = emailData;
      }
      setProfile(data);
      setLoading(false);
    }
    if (isSignedIn) fetchProfile();
  }, [user, isSignedIn]);

  if (!isLoaded || loading) return <ShimmerProfile />;
  if (!isSignedIn || !user) return <div>Please sign in</div>;
  if (!profile) return <div className="text-center text-gray-500">No profile information found.</div>;

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
      <img
        src={user.imageUrl}
        alt={profile.full_name || "Avatar"}
        className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-orange-400 shadow-lg"
      />
      <h2 className="mt-4 text-2xl font-bold text-orange-700">{profile.full_name}</h2>
      <p className="text-gray-600 mb-2">{profile.email}</p>
      <div className="grid grid-cols-2 gap-4 text-left mt-6">
        <div>
          <div className="text-xs text-gray-400">Age</div>
          <div className="font-semibold text-gray-800">{profile.age || "-"}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Gender</div>
          <div className="font-semibold text-gray-800">{profile.gender || "-"}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Phone</div>
          <div className="font-semibold text-gray-800">{profile.phone || "-"}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Year</div>
          <div className="font-semibold text-gray-800">{profile.year || "-"}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Room No</div>
          <div className="font-semibold text-gray-800">{profile.room_no || "-"}</div>
        </div>
      </div>
    </div>
  );
}