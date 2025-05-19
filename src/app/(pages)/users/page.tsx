"use client"

import UsersComponent from "@/components/users/UsersComponent";

import { useState } from "react";


export default function UsersPage() {
  

  return (
    <main className="px-6 sm:px-10 py-6">
      {/* Top navigation between Users and Admins */}
      

      {/* Render component based on active page */}
       <UsersComponent /> 
    </main>
  );
}