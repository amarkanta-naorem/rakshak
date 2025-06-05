import EmployeeAttendance from "@/components/Attendance/EmployeeAttendance";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Attendance",
  description: "Learn more about Rakshak",
};

export default function AttendancePage() {
  return (<EmployeeAttendance />);
}
