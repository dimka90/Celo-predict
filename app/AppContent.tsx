"use client";

import App from "./App";
import ProfileCreationModal from "@/components/ProfileCreationModal";
import NotificationToast from "@/components/NotificationToast";
import MiniPayDetection from "@/components/MiniPayDetection";

export default function AppContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <App>{children}</App>
      <ProfileCreationModal />
      <NotificationToast />
      <MiniPayDetection />
    </>
  );
} 