"use client";
import { useEffect, useState, useRef } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, parseISO, startOfDay } from "date-fns";

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
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchEmployeeAttendance = async () => {
      try {
        const res = await fetch("/UserAttendance.json");
        const data: EmployeeAttendanceData = await res.json();
        setEmployeeAttendanceData(data);
      } catch (error) {
        console.error("Failed to fetch attendance data:", error);
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

  const allEmployees: Employee[] = [...employeeAttendanceData.drivers,...employeeAttendanceData.emts,];

  const handleSelectEmployee = (id: string) => {
    setSelectedEmployeeId(id);
  };

  const roleOptions: string[] = ["Manager", "EMT", "Driver"];
  const filteredRoles: string[] = roleOptions.filter((role) => role.toLowerCase().includes(roleSearch.toLowerCase()));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Add search functionality here
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

  return (
    <div className="p-4">
      <section className="mb-4">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
                <div className="flex items-center">
                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Attendance Management</h1>
                <span className="ml-3 inline-flex items-center rounded-xl bg-[#3778E1] px-3 py-[1px] text-sm font-semibold text-white">
                    <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-white"></span>
                    Live
                </span>
                </div>
                <p className="mt-2 text-gray-600">Track, manage, and analyze employee attendance in real-time</p>
            </div>
            <div className="flex flex-shrink-0 flex-wrap gap-3">
                <button className="relative overflow-x-hidden border border-teal-950 p-1.5 text-teal-950 font-bold rounded-md inline-flex items-center group">
                <span className="relative z-10 flex items-center group-hover:text-white duration-700 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width={32} height={22} viewBox="0 0 42 32" fill="#115e59" className="w-5.5 h-5.5 me-2 group-hover:fill-white duration-700">
                    <path fill="currentColor" d="M33.958 12.988C33.531 6.376 28.933 0 20.5 0C12.787 0 6.839 5.733 6.524 13.384C2.304 14.697 0 19.213 0 22.5C0 27.561 4.206 32 9 32h6.5a.5.5 0 0 0 0-1H9c-4.262 0-8-3.972-8-8.5C1 19.449 3.674 14 9 14h1.5a.5.5 0 0 0 0-1H9c-.509 0-.99.057-1.459.139C7.933 7.149 12.486 1 20.5 1C29.088 1 33 7.739 33 14v1.5a.5.5 0 0 0 1 0v-1.509c3.019.331 7 3.571 7 8.509c0 3.826-3.691 8.5-8 8.5h-7.5c-3.238 0-4.5-1.262-4.5-4.5V12.783l4.078 4.07a.5.5 0 1 0 .708-.706l-4.461-4.452c-.594-.592-1.055-.592-1.648 0l-4.461 4.452a.5.5 0 0 0 .707.707L20 12.783V26.5c0 3.804 1.696 5.5 5.5 5.5H33c4.847 0 9-5.224 9-9.5c0-5.167-4.223-9.208-8.042-9.512" strokeWidth={1.5} stroke="currentColor" ></path>
                    </svg>
                    Bulk Upload
                </span>
                <div className="absolute inset-0 bg-teal-950 transition-transform duration-1000 transform -translate-y-full group-hover:translate-y-0 cursor-pointer"></div>
                </button>
            </div>
        </div>
      </section>
      <div className="h-[75vh] rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-2">
        <div className="flex items-center justify-between space-x-3">
          <div className="w-[20rem] h-[72vh] border border-gray-300 rounded-md flex flex-col bg-white">
                <div className="flex items-center justify-between space-x-3 p-2 w-full">
                    <div className="relative w-2/3">
                        <input id="client-name" className="peer w-full bg-transparent text-gray-700 text-sm border border-gray-300 rounded-md px-3 py-2 pr-10 transition duration-300 ease-in-out focus:outline-none focus:border-blue-500 hover:border-blue-200 shadow-sm focus:shadow" placeholder=" " value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} />
                        <label htmlFor="client-name" className={`absolute pointer-events-none bg-white px-1 left-3 text-gray-400 text-sm transition-all duration-300 ${ inputValue ? "-top-2 text-[13px] text-blue-600" : "top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400" } peer-focus:-top-2 peer-focus:text-[13px] peer-focus:text-blue-600`}>Search</label>
                    </div>
                    <div className="w-1/3 relative">
                        <div className="bg-white border border-gray-300 text-[#797979] text-sm w-full shadow-sm cursor-pointer px-3 py-2 rounded-md" onClick={() => setIsDropdownOpen(!isDropdownOpen)} tabIndex={0}>
                        <span className="flex items-center justify-between">
                            <span>{selectedRole || "Select"}</span>
                            <span className={isDropdownOpen ? "rotate-180" : ""}>
                            <svg width="12" height="6" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg" >
                                <path fillRule="evenodd" clipRule="evenodd" d="M6.28935 7.15694L0.632351 1.49994L2.04635 0.085937L6.99635 5.03594L11.9464 0.0859374L13.3604 1.49994L7.70335 7.15694C7.51582 7.34441 7.26152 7.44972 6.99635 7.44972C6.73119 7.44972 6.47688 7.34441 6.28935 7.15694Z" fill="#797979" />
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
                                <li key={index} className="p-2 hover:bg-blue-100 cursor-pointer text-sm" onClick={() => { setSelectedRole(role); setIsDropdownOpen(false); }}>{role}</li>
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
                    {allEmployees.length > 0 ? (
                        <>
                        <div className="sticky top-0 bg-white z-5 py-2 border-b border-gray-100">
                            <div className="grid grid-cols-2 font-semibold text-gray-800 text-sm px-4 select-none tracking-wider uppercase">
                                <div>Employee ID</div>
                                <div>Name</div>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100/50">
                            {allEmployees.map((emp) => {
                                const isSelected = emp.id === selectedEmployeeId;
                                return (
                                    <label key={emp.id} htmlFor={`emp-${emp.id}`} className={`grid grid-cols-2 text-sm cursor-pointer px-4 py-4 items-center transition-all duration-200 ease-in-out ${ isSelected ? "text-blue-900 font-semibold ring-1 ring-blue-400 ring-opacity-50" : "text-gray-800 hover:ring-1 hover:ring-blue-200" } rounded-lg mx-1 my-2 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:ring-opacity-75`}>
                                        <input type="radio" name="employee" id={`emp-${emp.id}`} value={emp.id} className="hidden" checked={isSelected} onChange={() => handleSelectEmployee(emp.id)}/>
                                        <div className="flex items-center space-x-3">
                                            <span className={`w-2.5 h-2.5 rounded-full ${ isSelected ? "bg-blue-500" : "bg-gray-300" } transition-colors duration-200`}></span>
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
                            <div className="divide-y divide-gray-100/50">
                                {[...Array(8)].map((_, index) => (
                                    <div key={index} className="grid grid-cols-2 text-sm py-4 items-center mx-1 my-1" >
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
                    )}
                </div>
          </div>
          <div className="w-[80rem] h-[72vh] border border-gray-300 rounded-md bg-white">
            {selectedEmployeeId ? (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-2">
                  <button className="relative overflow-x-hidden border border-[#1D6F42] py-1 px-4 text-[#1D6F42] font-bold rounded-md inline-flex items-center group">
                    <span className="relative z-10 flex items-center group-hover:text-white duration-700 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width={48} height={48} viewBox="0 0 24 24" className="w-5 h-5 me-2 group-hover:fill-white duration-700">
                        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21c.607-.59 3-2.16 3-3s-2.393-2.41-3-3m2 3h-7m-2 3c-4.714 0-7.071 0-8.536-1.465C2 18.072 2 15.715 2 11V7.944c0-1.816 0-2.724.38-3.406A3 3 0 0 1 3.538 3.38C4.22 3 5.128 3 6.944 3C8.108 3 8.69 3 9.2 3.191c1.163.436 1.643 1.493 2.168 2.542L12 7M8 7h8.75c2.107 0 3.16 0 3.917.506a3 3 0 0 1 .827.827C21.98 9.06 22 10.06 22 12v1" color="currentColor"></path>
                      </svg>
                      Export
                    </span>
                    <div className="absolute inset-0 bg-[#1D6F42] transition-transform duration-500 transform -translate-x-full group-hover:translate-x-0 cursor-pointer"></div>
                  </button>
                  <div className="relative" ref={pickerRef}>
                    <button className="flex items-center justify-between bg-white border-1 border-gray-300 rounded-lg p-1.5 text-gray-900 text-sm font-semibold focus:ring-1 focus:ring-blue-500 transition duration-300" onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 24 24" className="me-2" >
                        <path fill="#000" d="M17 14a1 1 0 1 0 0-2a1 1 0 0 0 0 2m0 4a1 1 0 1 0 0-2a1 1 0 0 0 0 2m-4-5a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0 4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-6-3a1 1 0 1 0 0-2a1 1 0 0 0 0 2m0 4a1 1 0 1 0 0-2a1 1 0 0 0 0 2"></path>
                        <path fill="#000" fillRule="evenodd" d="M7 1.75a.75.75 0 0 1 .75.75v.763c.662-.013 1.391-.013 2.193-.013h4.113c.803 0 1.532 0 2.194.013V2.5a.75.75 0 0 1 1.5 0v.827q.39.03.739.076c1.172.158 2.121.49 2.87 1.238c.748.749 1.08 1.698 1.238 2.87c.153 1.14.153 2.595.153 4.433v2.112c0 1.838 0 3.294-.153 4.433c-.158 1.172-.49 2.121-1.238 2.87c-.749.748-1.698 1.08-2.87 1.238c-1.14.153-2.595.153-4.433.153H9.945c-1.838 0-3.294 0-4.433-.153c-1.172-.158-2.121-.49-2.87-1.238c-.748-.749-1.08-1.698-1.238-2.87c-.153-1.14-.153-2.595-.153-4.433v-2.112c0-1.838 0-3.294.153-4.433c.158-1.172.49-2.121 1.238-2.87c.749-.748 1.698-1.08 2.87-1.238q.35-.046.739-.076V2.5A.75.75 0 0 1 7 1.75M5.71 4.89c-1.005.135-1.585.389-2.008.812S3.025 6.705 2.89 7.71q-.034.255-.058.539h18.336q-.024-.284-.058-.54c-.135-1.005-.389-1.585-.812-2.008s-1.003-.677-2.009-.812c-1.027-.138-2.382-.14-4.289-.14h-4c-1.907 0-3.261.002-4.29.14M2.75 12c0-.854 0-1.597.013-2.25h18.474c.013.653.013 1.396.013 2.25v2c0 1.907-.002 3.262-.14 4.29c-.135 1.005-.389 1.585-.812 2.008s-1.003.677-2.009.812c-1.027.138-2.382.14-4.289.14h-4c-1.907 0-3.261-.002-4.29-.14c-1.005-.135-1.585-.389-2.008-.812s-.677-1.003-.812-2.009c-.138-1.027-.14-2.382-.14-4.289z" clipRule="evenodd"></path>
                      </svg>
                      {months[selectedMonth]} {selectedYear}
                      <svg className={`w-5 h-5 ml-3 ${ isMonthPickerOpen ? "rotate-180" : "" }`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                      </svg>
                    </button>
                    {isMonthPickerOpen && (
                      <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl z-20 p-4">
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
                            <button key={index} className={`text-sm py-2 px-3 rounded-md ${ selectedMonth === index ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700" }`} onClick={() => handleMonthSelect(index)}>{month.slice(0, 3)}</button>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {years.map((year) => (
                            <button key={year} className={`text-sm py-1 px-4 rounded-md ${ selectedYear === year ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-500"}`} onClick={() => handleYearSelect(year)} >{year}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <table className="w-full table-fixed h-full rounded-lg overflow-hidden">
                    <thead>
                      <tr className="h-12 text-gray-700">
                        {["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((day, index) => (
                          <th key={index} className="p-2 border-y border-r border-gray-200 text-sm font-semibold">
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
                              <td key={day ? day.toISOString() : `empty-${weekIndex}-${dayIndex}`}
                                className={`border-b border-r border-gray-200 relative transition-all duration-300 hover:bg-blue-50 hover:shadow ${attendance?.status === "present" ? "bg-green-50" : attendance?.status === "absent" ? "bg-red-50" : "bg-white"}`} style={{ width: "14.2857%" }}>
                                <div className="relative h-full flex flex-col p-1">
                                  {day && (
                                    <span className={`text-sm font-semibold flex items-center justify-center`} >
                                      <span className={`${isToday ? "text-white bg-blue-800 rounded-full w-5 h-5" : "text-gray-800" }`}>{format(day, "d")}</span>
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
                                    ) : attendance?.status === "absent" && attendance?.reason ? (<p className="truncate text-red-600 font-medium">{attendance.reason}</p>) : (day && (
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
                  <p className="text-2xl font-semibold text-gray-900">View Attendance Here</p>
                  <p className="text-lg font-medium text-gray-600">Select an employee from the list on the left to view their attendance details.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}