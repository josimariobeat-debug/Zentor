import React from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="flex bg-white text-neutral-900 min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}
