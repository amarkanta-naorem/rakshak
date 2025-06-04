'use client'

import React from "react";
import { useState, useRef, useEffect } from 'react';
import RakshakLogo from "@/components/Navbar/RakshakLogo";
import NotificationModal from "@/components/Modal/NotificationModal";
import SettingNavbarMenu from "@/components/Navbar/SettingNavbarMenu";
import DashboardMenu from "@/components/Sidebar/SidebarMenus/DashboardMenu";
import AttendanceMenu from "@/components/Sidebar/SidebarMenus/AttendanceMenu";
import UserProfileNavbarMenu from "@/components/Navbar/UserProfileNavbarMenu";
import NotificationNavbarMenu from "@/components/Navbar/NotificationNavbarMenu";
import ActivityHistoryModal from "@/components/Modal/ActivityHistoryModal";

export default function DashboardLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isActivityHistoryOpen, setIsActivityHistoryOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleDocumentClick = (event: MouseEvent) => {
    if ( modalRef.current && !modalRef.current.contains(event.target as Node) && !(event.target as HTMLElement).closest('#notification-icon') ) {
      setIsNotificationOpen(false);
    }
    if ( modalRef.current && !modalRef.current.contains(event.target as Node) && !(event.target as HTMLElement).closest('#activity-history-button') ) {
      setIsActivityHistoryOpen(false);
    }
  };

  useEffect(() => {
    if (isNotificationOpen || isActivityHistoryOpen) {
      document.addEventListener('mousedown', handleDocumentClick);
    } else {
      document.removeEventListener('mousedown', handleDocumentClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, [isNotificationOpen, isActivityHistoryOpen]);

  return (
    <div className="w-screen h-screen relative">
      <nav className="border-b border-[#eae4e4] flex items-center justify-between w-full h-[7vh] px-3 z-10 bg-white relative">
        <RakshakLogo />
        <div className="flex items-center space-x-6">
          <NotificationNavbarMenu isOpen={isNotificationOpen} toggle={() => setIsNotificationOpen(prev => !prev)} />
          <UserProfileNavbarMenu />
          <SettingNavbarMenu isOpen={isActivityHistoryOpen} toggle={() => setIsActivityHistoryOpen(prev => !prev)} />
        </div>
      </nav>

      {isNotificationOpen && (
        <NotificationModal modalRef={modalRef} closeModal={() => setIsNotificationOpen(false)} />
      )}

      {isActivityHistoryOpen && (
        <ActivityHistoryModal modalRef={modalRef} closeModal={() => setIsActivityHistoryOpen(false)} />
      )}


      <div className="flex flex-1">
        <aside className="border-r border-[#eae4e4] flex flex-col items-center space-y-5 w-[3.5vw] h-[93vh] py-5">
          <DashboardMenu />
          <AttendanceMenu />
        </aside>

        <main className="bg-[#f5f5f5] flex-1 p-4 h-[93vh] overflow-scroll no-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
