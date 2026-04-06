"use client";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { UserDetailContext } from "./UserDetailContext";
import { SelectedChapterIndexContext } from "./SelectedChapterIndexContext";

function provider({ children }) {
  const { user } = useUser();
  const [userDetail, setUserDetail] = useState();
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);

  useEffect(() => {
    user && CreateNewUser();
  }, [user]);

  const CreateNewUser = async () => {
    try {
      // First, get user data to check if they exist and get subscription info
      const userResult = await axios.get("/api/user");
      console.log("User data:", userResult.data);
      setUserDetail(userResult.data);
    } catch (error) {
      // If user doesn't exist, create them
      if (error.response?.status === 401) {
        const result = await axios.post("/api/user", {
          name: user?.fullName,
          email: user?.primaryEmailAddress?.emailAddress,
        });
        console.log("Created new user:", result.data);
        setUserDetail(result.data);
      } else {
        console.error("Error fetching user data:", error);
      }
    }
  };

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      <SelectedChapterIndexContext.Provider
        value={{ selectedChapterIndex, setSelectedChapterIndex }}
      >
        <div>{children}</div>
      </SelectedChapterIndexContext.Provider>
    </UserDetailContext.Provider>
  );
}

export default provider;
