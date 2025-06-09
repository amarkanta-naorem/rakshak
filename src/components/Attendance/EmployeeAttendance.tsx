"use client";
import { useEffect, useState, useRef } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, parseISO, startOfDay, isWithinInterval } from "date-fns";
import DateRangePicker from "../DateRangePicker";

interface Attendance {
  date: string;
  status: "present" | "absent";
  punchIn?: string;
  punchOut?: string;
  reason?: string;
}

interface Employee {
  id: string;
  name: string;
  attendance: Attendance[];
  userRole: string;
}

interface EmployeeAttendanceData {
  drivers: Employee[];
  emts: Employee[];
}

export default function EmployeeAttendance() {
  const [inputValue, setInputValue] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [roleSearch, setRoleSearch] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [employeeAttendanceData, setEmployeeAttendanceData] = useState<EmployeeAttendanceData>({ drivers: [], emts: [] });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const pickerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isBulkActionsActive, setIsBulkActionsActive] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsDropdownOpen]);

  useEffect(() => {
    const fetchEmployeeAttendance = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/UserAttendance.json");
        const data: EmployeeAttendanceData = await res.json();
        setEmployeeAttendanceData(data);
      } catch (error) {
        console.error("Failed to fetch attendance data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    const timer = setTimeout(() => {
      fetchEmployeeAttendance();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsMonthPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allEmployees: Employee[] = [...employeeAttendanceData.drivers, ...employeeAttendanceData.emts];

  // Filter employees based on name and role
  const filteredEmployees: Employee[] = allEmployees.filter((emp) => {
    const matchesName = emp.name.toLowerCase().includes(inputValue.toLowerCase());
    const matchesRole = selectedRole ? emp.userRole.toLowerCase() === selectedRole.toLowerCase() : true;
    return matchesName && matchesRole;
  });

  // Filter attendance based on selected date range for bulk actions
  const filteredAttendance = (employee: Employee): Attendance[] => {
    if (!isBulkActionsActive || !dateRange[0] || !dateRange[1]) {
      return employee.attendance; // Return all attendance if not in bulk actions or no range selected
    }
    return employee.attendance.filter((att) =>
      isWithinInterval(parseISO(att.date), { start: startOfDay(dateRange[0]!), end: startOfDay(dateRange[1]!) })
    );
  };

  const handleSelectEmployee = (id: string) => {
    setSelectedEmployeeId(id);
  };

  const roleOptions: string[] = ["Manager", "EMT", "Driver", "Customer Support"];
  const filteredRoles: string[] = roleOptions.filter((role) => role.toLowerCase().includes(roleSearch.toLowerCase()));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const filtered = allEmployees.filter((emp) => {
        const matchesName = emp.name.toLowerCase().includes(inputValue.toLowerCase());
        const matchesRole = selectedRole ? emp.userRole.toLowerCase() === selectedRole.toLowerCase() : true;
        return matchesName && matchesRole;
      });
      setSelectedEmployeeId(filtered.length > 0 ? filtered[0].id : null);
    }
  };

  const startDate: Date = startOfMonth(currentMonth);
  const endDate: Date = endOfMonth(currentMonth);
  const daysInMonth: Date[] = eachDayOfInterval({ start: startDate, end: endDate });
  const firstDayOfMonth: number = getDay(startDate);
  const weeks: (Date | null)[][] = [];
  let week: (Date | null)[] = Array(firstDayOfMonth).fill(null);

  daysInMonth.forEach((day) => {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  });
  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    weeks.push(week);
  }

  const getAttendanceForDate = (date: Date): Attendance | null => {
    const selectedEmployee = allEmployees.find((emp) => emp.id === selectedEmployeeId);
    if (!selectedEmployee) return null;
    return (selectedEmployee.attendance.find((att) => isSameDay(parseISO(att.date), startOfDay(date))) || null);
  };

  const formatTime = (isoString?: string): string => {
    if (!isoString) return "-";
    return format(parseISO(isoString), "hh:mm a");
  };

  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month);
    setCurrentMonth(new Date(selectedYear, month, 1));
    setIsMonthPickerOpen(false);
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setCurrentMonth(new Date(year, selectedMonth, 1));
    setIsMonthPickerOpen(false);
  };

  const months: string[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years: number[] = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i);
  const today = new Date();

  // Get days in the selected date range
  const getDateRangeDays = (): Date[] => {
    if (!dateRange[0] || !dateRange[1]) return [];
    return eachDayOfInterval({ start: startOfDay(dateRange[0]), end: startOfDay(dateRange[1]) });
  };

  return (
    <div className="p-4">
      <section className="mb-4">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Attendance Management</h1>
              <span className="ml-3 inline-flex items-center rounded-xl pthreadtext={#3778E1} px-3 py-[1px] text-sm font-semibold text-white">
                <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-white"></span>
                Live
              </span>
            </div>
            <p className="mt-2 text-gray-600">Track, manage, and analyze employee attendance in real-time</p>
          </div>
          
          <div className="flex flex-shrink-0 flex-wrap gap-3">
            {isBulkActionsActive ? (
              <div className="flex items-center justify-between space-x-2 mb-3">
                {/* Search Bar */}
                <div className="relative">
                  <div className="relative">
                    <input id="employee-name" className="peer w-full bg-transparent text-gray-700 text-sm border border-gray-300 rounded-md px-3 py-2 pr-10 transition duration-300 ease-in-out focus:outline-none focus:border-blue-500 hover:border-blue-200 focus:shadow" placeholder=" " value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown}/>
                    <label htmlFor="employee-name" className={`absolute pointer-events-none bg-gradient-to-br from-gray-50 to-gray-100 px-1 left-3 text-gray-400 text-sm transition-all duration-300 ${inputValue ? "-top-2 text-[13px] text-blue-600" : "top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400"} peer-focus:-top-2 peer-focus:text-[13px] peer-focus:text-blue-600`}>Search</label>
                  </div>
                  <span className="absolute inset-y-0 right-2.5 flex items-center text-gray-400 peer-focus:text-blue-600 peer-placeholder-shown:text-gray-400">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-inherit">
                      <path d="M7.66659 13.9999C11.1644 13.9999 13.9999 11.1644 13.9999 7.66659C13.9999 4.16878 11.1644 1.33325 7.66659 1.33325C4.16878 1.33325 1.33325 4.16878 1.33325 7.66659C1.33325 11.1644 4.16878 13.9999 7.66659 13.9999Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14.6666 14.6666L13.3333 13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-4">
                  <button className="relative overflow-x-hidden w-[10rem] border border-[#1D6F42] py-1 px-4 text-[#1D6F42] font-bold rounded-md inline-flex items-center group">
                    <span className="relative z-10 flex items-center group-hover:text-white duration-700 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width={48} height={48} viewBox="0 0 24 24" className="w-5 h-5 me-2 group-hover:fill-white duration-700">
                        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21c.607-.59 3-2.16 3-3s-2.393-2.41-3-3m2 3h-7m-2 3c-4.714 0-7.071 0-8.536-1.465C2 18.072 2 15.715 2 11V7.944c0-1.816 0-2.724.38-3.406A3 3 0 0 1 3.538 3.38C4.22 3 5.128 3 6.944 3C8.108 3 8.69 3 9.2 3.191c1.163.436 1.643 1.493 2.168 2.542L12 7M8 7h8.75c2.107 0 3.16 0 3.917.506a3 3 0 0 1 .827.827C21.98 9.06 22 10.06 22 12v1" color="currentColor"></path>
                      </svg>
                      Export
                    </span>
                    <div className="absolute inset-0 bg-[#1D6F42] transition-transform duration-500 transform -translate-x-full group-hover:translate-x-0 cursor-pointer"></div>
                  </button>
                  <DateRangePicker setDateRange={setDateRange} />
                </div>
              </div>
            ) : (
              <div className="relative" ref={pickerRef}>
                <button className="flex items-center justify-between bg-white border border-cyan-800 focus:border-transparent outline-none focus:outline-none focus-visible:outline-none rounded-lg p-1.5 text-cyan-800 text-sm font-semibold focus:ring-1 focus:ring-blue-500 transition duration-300" onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 24 24" className="me-2" >
                    <path fill="#155e75" d="M17 14a1 1 0 1 0 0-2a1 1 0 0 0 0 2m0 4a1 1 0 1 0 0-2a1 1 0 0 0 0 2m-4-5a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0 4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-6-3a1 1 0 1 0 0-2a1 1 0 0 0 0 2m0 4a1 1 0 1 0 0-2a1 1 0 0 0 0 2"></path>
                    <path fill="#155e75" fillRule="evenodd" d="M7 1.75a.75.75 0 0 1 .75.75v.763c.662-.013 1.391-.013 2.193-.013h4.113c.803 0 1.532 0 2.194.013V2.5a.75.75 0 0 1 1.5 0v.827q.39.03.739.076c1.172.158 2.121.49 2.87 1.238c.748.749 1.08 1.698 1.238 2.87c.153 1.14.153 2.595.153 4.433v2.112c0 1.838 0 3.294-.153 4.433c-.158 1.172-.49 2.121-1.238 2.87c-.749.748-1.698 1.08-2.87 1.238c-1.14.153-2.595.153-4.433.153H9.945c-1.838 0-3.294 0-4.433-.153c-1.172-.158-2.121-.49-2.87-1.238c-.748-.749-1.08-1.698-1.238-2.87c-.153-1.14-.153-2.595-.153-4.433v-2.112c0-1.838 0-3.294.153-4.433c.158-1.172.49-2.121 1.238-2.87c.749-.748 1.698-1.08 2.87-1.238q.35-.046.739-.076V2.5A.75.75 0 0 1 7 1.75M5.71 4.89c-1.005.135-1.585.389-2.008.812S3.025 6.705 2.89 7.71q-.034.255-.058.539h18.336q-.024-.284-.058-.54c-.135-1.005-.389-1.585-.812-2.008s-1.003-.677-2.009-.812c-1.027-.138-2.382-.14-4.289-.14h-4c-1.907 0-3.261.002-4.29.14M2.75 12c0-.854 0-1.597.013-2.25h18.474c.013.653.013 1.396.013 2.25v2c0 1.907-.002 3.262-.14 4.29c-.135 1.005-.389 1.585-.812 2.008s-1.003.677-2.009.812c-1.027.138-2.382.14-4.289.14h-4c-1.907 0-3.261-.002-4.29-.14c-1.005-.135-1.585-.389-2.008-.812s-.677-1.003-.812-2.009c-.138-1.027-.14-2.382-.140-4.289z" clipRule="evenodd"></path>
                  </svg>
                  {months[selectedMonth]} {selectedYear}
                  <svg className={`w-5 h-5 ml-3 ${isMonthPickerOpen ? "rotate-180" : ""}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                {isMonthPickerOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-cyan-600 rounded-xl shadow-2xl z-20 p-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-base font-bold text-gray-800"> Select Month & Year </span>
                      <button onClick={() => setIsMonthPickerOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {months.map((month, index) => (
                        <button key={index} className={`text-sm py-2 px-3 rounded-md ${selectedMonth === index ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700"}`} onClick={() => handleMonthSelect(index)}>{month.slice(0, 3)}</button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {years.map((year) => (
                        <button key={year} className={`text-sm py-1 px-4 rounded-md ${selectedYear === year ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-500" }`} onClick={() => handleYearSelect(year)}>{year}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <button className="self-start relative overflow-x-hidden border border-indigo-600 p-1 ps-3 text-indigo-600 font-bold rounded-md inline-flex items-center group" onClick={() => setIsBulkActionsActive(!isBulkActionsActive)}>
              <span className="relative z-10 flex items-center group-hover:text-white duration-700 cursor-pointer">
                Bulk Actions
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" className="w-5 h-5 ms-2 group-hover:fill-white duration-700 rotate-90">
                  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a1 1 0 1 0 2 0a1 1 0 1 0-2 0m7 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0m7 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0"></path>
                </svg>
              </span>
              <div className="absolute inset-0 bg-indigo-600 transition-transform duration-500 transform -translate-x-full group-hover:translate-x-0 cursor-pointer"></div>
            </button>
          </div>
        </div>
      </section>

      {isBulkActionsActive ? (
       <div className="h-[75vh] rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-2">
          <div className="h-[72vh] bg-white border border-gray-50 shadow rounded-md overflow-hidden">
            <div className="h-full w-full overflow-auto no-scrollbar">
              <div className="min-w-max">
                <div className="flex sticky top-0 z-10 bg-white">
                  <div className="flex items-center justify-center border-r border-b border-gray-300 w-[10rem] min-w-[10rem] h-[5.5rem] px-2 sticky top-0 left-0 z-50 bg-white">
                    <span className="text-sm font-semibold text-gray-800">Employee Info.</span>
                  </div>
                  <div className="flex">
                    {getDateRangeDays().length > 0 ? (
                      getDateRangeDays().map((day, index) => (
                        <div
                          key={index}
                          className="flex flex-col items-center justify-center border-r border-b border-gray-200 w-[12rem] min-w-[12rem] h-[5.5rem] px-2 bg-white"
                        >
                          <span className="text-sm font-semibold text-gray-800">
                            {format(day, "MMM d, yyyy")}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center border-r border-b border-gray-200 w-[12rem] min-w-[12rem] h-[5.5rem] px-2 bg-white">
                        <span className="text-sm font-semibold text-gray-800">
                          Select a date range
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex">
                  <div className="flex flex-col sticky left-0 bg-white border-r border-gray-300">
                    {allEmployees.map((employee) => (
                      <div
                        key={employee.id}
                        className="flex flex-col items-center justify-center border-b border-gray-200 w-[10rem] min-w-[10rem] h-[5.5rem] bg-white"
                      >
                        <h1 className="text-sm text-center font-medium w-full px-2 truncate">
                          {employee.name}
                        </h1>
                        <p className="text-sm text-gray-600">{employee.id}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col">
                    {allEmployees.map((employee) => (
                      <div key={employee.id} className="flex">
                        {getDateRangeDays().length > 0 ? (
                          getDateRangeDays().map((day, dayIndex) => {
                            const attendance = filteredAttendance(employee).find((att) =>
                              isSameDay(parseISO(att.date), startOfDay(day))
                            );
                            return (
                              <div
                                key={dayIndex}
                                className={`flex flex-col justify-center border-r border-b border-gray-300 w-[12rem] min-w-[12rem] h-[5.5rem] px-2 ${
                                  attendance?.status === "present"
                                    ? "bg-green-50"
                                    : attendance?.status === "absent"
                                    ? "bg-red-50"
                                    : "bg-white"
                                }`}
                              >
                                {attendance?.status === "present" ? (
                                  <>
                                    <div className="grid grid-cols-3 text-gray-800 text-xs text-center mb-1">
                                      <div>In</div>
                                      <div className="text-center text-gray-400">|</div>
                                      <div>Out</div>
                                    </div>
                                    <div className="grid grid-cols-3 text-gray-900 text-xs font-medium text-center">
                                      <div>{formatTime(attendance.punchIn)}</div>
                                      <div className="text-center text-gray-400">|</div>
                                      <div>{formatTime(attendance.punchOut)}</div>
                                    </div>
                                  </>
                                ) : attendance?.status === "absent" ? (
                                  <div className="flex items-center justify-center">
                                    <div className="text-xs font-medium text-center">
                                      {attendance.reason}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center">
                                    <div className="text-xs font-medium text-center">-</div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="flex flex-col justify-center border-r border-b border-gray-300 w-[12rem] min-w-[12rem] h-[5.5rem] px-2 bg-white">
                            <div className="flex items-center justify-center">
                              <div className="text-xs font-medium text-center">-</div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-[75vh] rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-2">
        <div className="flex items-center justify-between space-x-3">
          <div className="w-[20rem] h-[72vh] border border-gray-300 rounded-md flex flex-col bg-white">
            <div className="flex items-center justify-between space-x-2 p-2 w-full">
              <div className="relative w-2/3">
                <div className="relative">
                  <input id="employee-name" className="peer w-full bg-transparent text-gray-700 text-sm border border-gray-300 rounded-md px-3 py-2 pr-10 transition duration-300 ease-in-out focus:outline-none focus:border-blue-500 hover:border-blue-200 shadow focus:shadow" placeholder=" " value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown}/>
                  <label htmlFor="employee-name" className={`absolute pointer-events-none bg-white px-1 left-3 text-gray-400 text-sm transition-all duration-300 ${inputValue ? "-top-2 text-[13px] text-blue-600" : "top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400"} peer-focus:-top-2 peer-focus:text-[13px] peer-focus:text-blue-600`}>Search</label>
                </div>
                <span className="absolute inset-y-0 right-2.5 flex items-center text-gray-400 peer-focus:text-blue-600 peer-placeholder-shown:text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-inherit">
                    <path d="M7.66659 13.9999C11.1644 13.9999 13.9999 11.1644 13.9999 7.66659C13.9999 4.16878 11.1644 1.33325 7.66659 1.33325C4.16878 1.33325 1.33325 4.16878 1.33325 7.66659C1.33325 11.1644 4.16878 13.9999 7.66659 13.9999Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14.6666 14.6666L13.3333 13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
              <div className="w-1/3 relative" ref={dropdownRef}>
                <div className="bg-white border border-gray-300 text-[#797979] text-sm w-full shadow cursor-pointer px-1.5 py-2 rounded-md" onClick={() => setIsDropdownOpen(!isDropdownOpen)} tabIndex={0}>
                  <span className="flex items-center justify-between">
                    <span className="truncate">{selectedRole || "Select"}</span>
                    <span className={isDropdownOpen ? "rotate-180" : ""}>
                      <svg width="12" height="6" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M6.28935 7.15694L0.632351 1.49994L2.04635 0.085937L6.99635 5.03594L11.9464 0.0859374L13.3604 1.49994L7.70335 7.15694C7.51582 7.34441 7.26152 7.44972 6.99635 7.44972C6.73119 7.44972 6.47688 7.34441 6.28935 7.15694Z" fill="#797979"/>
                      </svg>
                    </span>
                  </span>
                </div>
                {isDropdownOpen && (
                  <div className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow mt-1 w-full">
                    <input type="text" placeholder="Search..." className="w-full p-1.5 border-b border-gray-300 text-sm text-gray-500 outline-none" value={roleSearch} onChange={(e) => setRoleSearch(e.target.value)}/>
                    <ul className="overflow-y-auto no-scrollbar max-h-44">
                      {filteredRoles.length > 0 ? (
                        filteredRoles.map((role, index) => (
                          <li key={index} className="p-2 hover:bg-blue-100 cursor-pointer text-sm" onClick={() => { setSelectedRole(role); setIsDropdownOpen(false); setRoleSearch(""); }}>{role}</li>
                        ))
                      ) : (
                        <li className="p-2 text-gray-500 text-sm">No roles found</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="px-2 h-[63vh] overflow-y-auto no-scrollbar">
              {isLoading ? (
                <div className="h-[60vh] overflow-y-auto no-scrollbar">
                  <div className="divide-y divide-gray-100/50">
                    {[...Array(8)].map((_, index) => (
                      <div key={index} className="grid grid-cols-2 text-sm py-4 items-center mx-1 my-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-gray-200 animate-pulse"></div>
                          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="flex items-center">
                          <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : filteredEmployees.length > 0 ? (
                <>
                  <div className="sticky top-0 bg-white z-5 py-2 border-b border-gray-100">
                    <div className="grid grid-cols-2 font-semibold text-gray-800 text-sm px-4 select-none tracking-wider">
                      <div>Employee ID</div>
                      <div>Name</div>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-100/50">
                    {filteredEmployees.map((emp) => {
                      const isSelected = emp.id === selectedEmployeeId;
                      return (
                        <label key={emp.id} htmlFor={`emp-${emp.id}`} className={`grid grid-cols-2 text-sm cursor-pointer px-4 py-4 items-center transition-all duration-200 ease-in-out ${ isSelected ? "text-blue-900 font-semibold ring-1 ring-blue-400 ring-opacity-50" : "text-gray-800 hover:ring-1 hover:ring-blue-200" } rounded-lg mx-1 my-2 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:ring-opacity-75`} >
                          <input type="radio" name="employee" id={`emp-${emp.id}`} value={emp.id} className="hidden" checked={isSelected} onChange={() => handleSelectEmployee(emp.id)}/>
                          <div className="flex items-center space-x-3">
                            <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? "bg-blue-500" : "bg-gray-300"} transition-colors duration-200`}></span>
                            <span className="font-medium">{emp.id}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="truncate font-normal">{emp.name}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="h-[60vh] overflow-y-auto no-scrollbar">
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <div>
                      <svg width="219" height="204" viewBox="0 0 119 104" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M30.71 8.04999V12.35" stroke="#BABABA" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M28.55 10.2H32.8601" stroke="#BABABA" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M79.66 35.17C71.2899 35.17 62.77 34.83 54.7999 32.61C46.9799 30.44 39.7999 26.23 33.3999 21.36C29.2099 18.19 25.3999 15.66 19.9599 16.04C14.638 16.328 9.54874 18.3153 5.43995 21.71C-1.48005 27.77 -0.440053 39 2.32995 46.86C6.48995 58.73 19.1499 67 29.9099 72.35C42.34 78.56 56 82.17 69.6899 84.24C81.6899 86.07 97.1099 87.39 107.51 79.56C117.06 72.35 119.68 55.91 117.34 44.81C116.772 41.5309 115.026 38.5721 112.43 36.49C105.72 31.58 95.7099 34.86 88.1699 35.02C85.3699 35.08 82.52 35.15 79.66 35.17Z" fill="#F2F2F2"/>
                        <path d="M66.1199 2.18998C66.6611 2.18998 67.0999 1.75122 67.0999 1.20998C67.0999 0.668741 66.6611 0.22998 66.1199 0.22998C65.5787 0.22998 65.1399 0.668741 65.1399 1.20998C65.1399 1.75122 65.5787 2.18998 66.1199 2.18998Z" fill="#CFCFCF"/>
                        <path d="M15.2 78.5V82.8" stroke="#BABABA" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M13.05 80.65H17.35" stroke="#BABABA" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M59.5801 103.7C79.8545 103.7 96.2901 102.675 96.2901 101.41C96.2901 100.145 79.8545 99.12 59.5801 99.12C39.3057 99.12 22.8701 100.145 22.8701 101.41C22.8701 102.675 39.3057 103.7 59.5801 103.7Z" fill="#F2F2F2"/>
                        <path d="M89.0899 76.88H25.6799C25.2555 76.8797 24.8363 76.7872 24.4512 76.609C24.0661 76.4307 23.7243 76.1709 23.4495 75.8476C23.1746 75.5243 22.9733 75.1451 22.8594 74.7363C22.7456 74.3275 22.7218 73.8989 22.7899 73.48L30.8999 24.3C31.0095 23.6155 31.3598 22.9926 31.8878 22.5435C32.4157 22.0943 33.0867 21.8484 33.7799 21.85H97.1899C97.6139 21.85 98.0329 21.9424 98.4176 22.1208C98.8024 22.2991 99.1436 22.5591 99.4177 22.8827C99.6918 23.2062 99.8921 23.5856 100.005 23.9944C100.117 24.4033 100.14 24.8317 100.07 25.25L91.9999 74.43C91.8876 75.1187 91.5324 75.7444 90.9986 76.1939C90.4648 76.6433 89.7877 76.8867 89.0899 76.88Z" fill="#D2D2D2"/>
                        <path d="M57.75 25.74C58.7407 24.3499 60.1816 23.345 61.8285 22.8957C63.4754 22.4464 65.2269 22.5803 66.7864 23.2747C68.3458 23.9691 69.6172 25.1813 70.3852 26.7058C71.1531 28.2304 71.3703 29.9736 71 31.64" stroke="#BABABA" strokeWidth="0.68" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M75.75 24.23C76.3188 24.23 76.78 23.7688 76.78 23.2C76.78 22.6311 76.3188 22.17 75.75 22.17C75.1811 22.17 74.72 22.6311 74.72 23.2C74.72 23.7688 75.1811 24.23 75.75 24.23Z" fill="#BABABA"/>
                        <path d="M60.83 17.57C61.3989 17.57 61.86 17.1089 61.86 16.54C61.86 15.9712 61.3989 15.51 60.83 15.51C60.2612 15.51 59.8 15.9712 59.8 16.54C59.8 17.1089 60.2612 17.57 60.83 17.57Z" fill="#BABABA"/>
                        <path d="M88.81 76.86H25.09C24.3147 76.8574 23.572 76.5475 23.0247 75.9983C22.4773 75.4491 22.17 74.7054 22.17 73.93V29C22.1607 28.6102 22.2293 28.2225 22.3717 27.8596C22.5142 27.4966 22.7276 27.1657 22.9996 26.8863C23.2715 26.607 23.5965 26.3846 23.9554 26.2324C24.3144 26.0802 24.7001 26.0012 25.09 26H48.3C48.8386 26.002 49.3662 26.1524 49.8249 26.4346C50.2836 26.7169 50.6556 27.1201 50.9 27.6L54.21 34.08C54.4536 34.5606 54.8254 34.9645 55.2843 35.2468C55.7432 35.5292 56.2712 35.6791 56.81 35.68H88.81C89.5845 35.68 90.3272 35.9876 90.8748 36.5352C91.4224 37.0829 91.73 37.8256 91.73 38.6V73.93C91.73 74.7054 91.4227 75.4491 90.8754 75.9983C90.3281 76.5475 89.5854 76.8574 88.81 76.86Z" fill="white" stroke="#BABABA" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M78.9999 37.21C75.3188 37.208 71.7197 38.2978 68.658 40.3415C65.5963 42.3852 63.2094 45.291 61.7994 48.6914C60.3893 52.0917 60.0193 55.8339 60.7363 59.4445C61.4532 63.0552 63.2248 66.3721 65.8271 68.9757C68.4294 71.5794 71.7453 73.3528 75.3556 74.0717C78.9658 74.7906 82.7082 74.4226 86.1093 73.0144C89.5104 71.6061 92.4175 69.2208 94.4628 66.1602C96.5082 63.0996 97.5999 59.5012 97.5999 55.82C97.5999 50.8861 95.6406 46.1541 92.1527 42.6643C88.6648 39.1745 83.9338 37.2127 78.9999 37.21Z" fill="white" stroke="#BABABA" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M92.24 69.32L97.2 74.28" stroke="#BABABA" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M96.6393 71.8701L95.0984 73.4821C94.4076 74.2046 94.4334 75.3504 95.156 76.0411L108.529 88.8248C109.251 89.5155 110.397 89.4897 111.088 88.7672L112.629 87.1552C113.319 86.4326 113.294 85.2869 112.571 84.5961L99.1984 71.8125C98.4758 71.1217 97.3301 71.1475 96.6393 71.8701Z" fill="#D2D2D2"/>
                        <path d="M106.54 1.21002V5.52002" stroke="#BABABA" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M104.38 3.37H108.69" stroke="#BABABA" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="flex flex-col items-center space-y-3">
                      <p className="text-2xl text-[#939090]">No employee found</p>
                      <p className="text-sm text-[#939090] flex flex-col items-center justify-center">
                        <span>Looks like there’s no one by that name.</span>
                        <span>Try a different search!</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="w-[80rem] h-[72vh] border border-gray-300 rounded-md bg-white">
            {selectedEmployeeId ? (
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <table className="w-full table-fixed h-full rounded-lg overflow-hidden">
                    <thead>
                      <tr className="h-12 text-gray-700">
                        {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, index) => (
                          <th key={index} className="p-2 border-b border-r border-gray-200 text-sm font-semibold">
                            <span className="xl:block lg:block md:block sm:block hidden">{day}</span>
                            <span className="xl:hidden lg:hidden md:hidden sm:hidden block">{day.slice(0, 3)}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {weeks.map((week, weekIndex) => (
                        <tr key={weekIndex} className="text-center h-[calc((100%-3rem)/6)]">
                          {week.map((day, dayIndex) => {
                            const attendance = day ? getAttendanceForDate(day) : null;
                            const isToday = day && isSameDay(day, today);
                            return (
                              <td key={day ? day.toISOString() : `empty-${weekIndex}-${dayIndex}`} className={`border-b border-r border-gray-200 relative transition-all duration-300 hover:bg-blue-50 hover:shadow ${attendance?.status === "present" ? "bg-green-50" : attendance?.status === "absent" ? "bg-red-50" : "bg-white" }`} style={{ width: "14.2857%"}}>
                                <div className="relative h-full flex flex-col p-1">
                                  {day && (
                                    <span className="text-sm font-semibold flex items-center justify-center">
                                      <span className={`${isToday ? "text-white bg-blue-800 rounded-full w-5 h-5" : "text-gray-800"}`}>{format(day, "d")}</span>
                                    </span>
                                  )}
                                  <div className="flex-grow pt-4 text-xs text-gray-700">
                                    {attendance?.status === "present" ? (
                                      <>
                                        <div className="grid grid-cols-3 text-gray-800 text-xs select-none">
                                          <div>In</div>
                                          <div className="text-center text-gray-400"></div>
                                          <div>Out</div>
                                        </div>
                                        <div className="grid grid-cols-3 text-gray-900 text-xs select-none">
                                          <div>{formatTime(attendance.punchIn)}</div>
                                          <div className="text-center text-gray-400"></div>
                                          <div>{formatTime(attendance.punchOut)}</div>
                                        </div>
                                      </>
                                    ) : attendance?.status === "absent" && attendance?.reason ? (
                                      <p className="truncate text-red-600 font-medium">{attendance.reason}</p>
                                    ) : (day && (
                                        <div>
                                          <p className="truncate text-blue-600 font-medium">- -</p>
                                          <p className="truncate text-blue-600 font-medium">- -</p>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div>
                  <svg width="319" height="305" viewBox="0 0 119 105" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M79.66 36.42C71.29 36.42 62.7699 36.08 54.7999 33.86C46.9799 31.69 39.7999 27.48 33.3999 22.61C29.2099 19.44 25.3999 16.92 19.9599 17.3C14.6335 17.5916 9.54234 19.5901 5.43995 23C-1.48005 29 -0.440053 40.23 2.32995 48.12C6.48995 60 19.1499 68.23 29.9099 73.61C42.3399 79.82 55.9999 83.42 69.6899 85.5C81.6899 87.32 97.1099 88.65 107.51 80.81C117.06 73.61 119.68 57.17 117.34 46.07C116.773 42.7879 115.027 39.8257 112.43 37.74C105.72 32.84 95.7099 36.11 88.1699 36.28C85.3699 36.34 82.52 36.41 79.66 36.42Z" fill="#F2F2F2"/>
                    <path d="M59.18 104.95C79.4543 104.95 95.89 103.925 95.89 102.66C95.89 101.395 79.4543 100.37 59.18 100.37C38.9056 100.37 22.47 101.395 22.47 102.66C22.47 103.925 38.9056 104.95 59.18 104.95Z" fill="#F2F2F2"/>
                    <path d="M6.54006 72.43C7.0813 72.43 7.52006 71.9912 7.52006 71.45C7.52006 70.9087 7.0813 70.47 6.54006 70.47C5.99882 70.47 5.56006 70.9087 5.56006 71.45C5.56006 71.9912 5.99882 72.43 6.54006 72.43Z" fill="#CFCFCF"/>
                    <path d="M48.78 84.86V89.17" stroke="#BABABA" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M46.6299 87.02H50.9299" stroke="#BABABA" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M100.41 17.08H17.9401C15.8083 17.08 14.0801 18.8081 14.0801 20.94V77.51C14.0801 79.6418 15.8083 81.37 17.9401 81.37H100.41C102.542 81.37 104.27 79.6418 104.27 77.51V20.94C104.27 18.8081 102.542 17.08 100.41 17.08Z" fill="white" stroke="#BABABA" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M92.11 34.1801H26.23C24.7057 34.1801 23.47 35.4157 23.47 36.9401V72.8901C23.47 74.4144 24.7057 75.6501 26.23 75.6501H92.11C93.6343 75.6501 94.87 74.4144 94.87 72.8901V36.9401C94.87 35.4157 93.6343 34.1801 92.11 34.1801Z" fill="white" stroke="#BABABA" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M104.27 27.91V21C104.271 20.4923 104.173 19.9892 103.979 19.5198C103.786 19.0503 103.502 18.6236 103.143 18.2641C102.785 17.9046 102.359 17.6194 101.89 17.4248C101.421 17.2302 100.918 17.13 100.41 17.13H17.9401C17.4323 17.13 16.9296 17.2302 16.4606 17.4248C15.9916 17.6194 15.5657 17.9046 15.2071 18.2641C14.8486 18.6236 14.5644 19.0503 14.371 19.5198C14.1776 19.9892 14.0788 20.4923 14.0801 21V28L104.27 27.91Z" fill="#D2D2D2"/>
                    <path d="M41.1799 10.59V23.04" stroke="#BABABA" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M77.1799 10.59V23.04" stroke="#BABABA" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M90.5501 11.42C91.0913 11.42 91.5301 10.9812 91.5301 10.44C91.5301 9.89872 91.0913 9.45996 90.5501 9.45996C90.0088 9.45996 89.5701 9.89872 89.5701 10.44C89.5701 10.9812 90.0088 11.42 90.5501 11.42Z" fill="#CFCFCF"/>
                    <path d="M29.3101 12.2799C29.8513 12.2799 30.2901 11.8412 30.2901 11.2999C30.2901 10.7587 29.8513 10.3199 29.3101 10.3199C28.7688 10.3199 28.3301 10.7587 28.3301 11.2999C28.3301 11.8412 28.7688 12.2799 29.3101 12.2799Z" fill="#CFCFCF"/>
                    <path d="M54.3899 4.81006V9.11006" stroke="#BABABA" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M52.24 6.95996H56.54" stroke="#BABABA" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9.31006 0.930054V5.23005" stroke="#BABABA" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7.15991 3.07996H11.4699" stroke="#BABABA" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M46.6699 54.1511C47.3064 56.9914 48.8912 59.5302 51.1632 61.3495C53.4353 63.1688 56.2592 64.16 59.1699 64.16C62.0806 64.16 64.9045 63.1688 67.1766 61.3495C69.4487 59.5302 71.0335 56.9914 71.6699 54.1511" stroke="#BABABA" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M73.3 49.2401C74.2831 49.2401 75.08 48.4431 75.08 47.4601C75.08 46.477 74.2831 45.6801 73.3 45.6801C72.317 45.6801 71.52 46.477 71.52 47.4601C71.52 48.4431 72.317 49.2401 73.3 49.2401Z" fill="#BABABA"/>
                    <path d="M45.05 49.2401C46.0331 49.2401 46.83 48.4431 46.83 47.4601C46.83 46.477 46.0331 45.6801 45.05 45.6801C44.067 45.6801 43.27 46.477 43.27 47.4601C43.27 48.4431 44.067 49.2401 45.05 49.2401Z" fill="#BABABA"/>
                  </svg>
                </div>
                <div className="flex flex-col items-center space-y-3">
                    <p className="text-2xl text-[#939090]">View Attendance Here</p>
                    <p className="text-lg text-[#939090]">Select an employee from the list on the left to view their attendance details.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );
}