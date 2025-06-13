function pad(num, size) {
  return num.toString().padStart(size, '0');
}

function getRandomName() {
  const firstNames = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Krishna", "Aryan", "Sai", "Anaya", "Diya", "Meera"];
  const lastNames = ["Sharma", "Verma", "Reddy", "Naidu", "Kumar", "Yadav", "Patel", "Joshi", "Gupta", "Mishra"];
  return firstNames[Math.floor(Math.random() * firstNames.length)] + ' ' +
         lastNames[Math.floor(Math.random() * lastNames.length)];
}

function getRandomPhoneNumber() {
  return "+91" + Math.floor(Math.random() * 4000000000 + 6000000000);
}

function getRandomReason() {
  const reasons = [
    "Family emergency", "Medical issue", "Personal reason", "Out of town",
    "Health checkup", "Car breakdown", "Power outage", "Internet issue",
    "Feeling sick", "Bad weather"
  ];
  return reasons[Math.floor(Math.random() * reasons.length)];
}

function getRandomAmbulanceNumber() {
  const stateCodes = ["DL", "HR", "UP", "PB", "UK"];
  const state = stateCodes[Math.floor(Math.random() * stateCodes.length)];
  const region = String(Math.floor(Math.random() * 99 + 1)).padStart(2, '0');
  const number = Math.floor(Math.random() * 9000 + 1000);
  return `${state} ${region}AMB${number}`;
}

function calculateHours(start, end) {
  let diff = end.getTime() - start.getTime();
  if (diff < 0) diff += 24 * 60 * 60 * 1000;
  return +(diff / (1000 * 60 * 60)).toFixed(2);
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function toISOStringZ(date) {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function getStatus(punchIn, punchOut, shiftHours) {
  const worked = calculateHours(punchIn, punchOut);
  if (worked === 0) return "absent";
  if (worked >= shiftHours * 0.9) {
    return Math.random() < 0.9 ? "present" : "late";
  }
  if (worked >= shiftHours * 0.75) {
    return Math.random() < 0.7 ? "late" : "first_half_day_leave";
  }
  if (worked >= shiftHours * 0.5) {
    return Math.random() < 0.7 ? "first_half_day_leave" : "second_half_day_leave";
  }
  if (worked >= shiftHours * 0.25) {
    return Math.random() < 0.7 ? "second_half_day_leave" : "short_leave";
  }
  return "short_leave";
}

function generateAttendance(role) {
  const attendance = [];
  const today = new Date();
  const startDate = new Date("2025-01-01");

  while (startDate <= today) {
    const shiftStart = new Date(startDate);
    shiftStart.setUTCHours(8, 0, 0, 0);
    const shiftHours = role === 'driver' ? 24 : 12;
    const shiftEnd = new Date(shiftStart.getTime() + shiftHours * 60 * 60 * 1000);

    let punchIn = new Date(shiftStart.getTime() + Math.floor(Math.random() * 60) * 60 * 1000);  // 0–60 min late
    let punchOut = new Date(shiftEnd.getTime() - Math.floor(Math.random() * 60) * 60 * 1000);   // 0–60 min early

    if (Math.random() < 0.05) {  // Absent
      punchIn = new Date(shiftStart);
      punchOut = new Date(shiftStart);
    }

    const totalHours = calculateHours(punchIn, punchOut);
    const status = getStatus(punchIn, punchOut, shiftHours);
    const reason = status === "present" ? "" : getRandomReason();

    attendance.push({
      date: formatDate(startDate),
      status,
      reason,
      punchIn: toISOStringZ(punchIn),
      punchOut: toISOStringZ(punchOut),
      totalWorkingHour: totalHours,
      ambulanceNumber: getRandomAmbulanceNumber()
    });

    startDate.setDate(startDate.getDate() + 1);
  }

  return attendance;
}

function generateUsers(count, prefix, role) {
  const users = [];
  for (let i = 1; i <= count; i++) {
    users.push({
      id: prefix + pad(i, 5),
      name: getRandomName(),
      phoneNumber: getRandomPhoneNumber(),
      userRole: role,
      attendance: generateAttendance(role)
    });
  }
  return users;
}

// MAIN
const data = {
  drivers: generateUsers(50, "DRV", "driver"),
  emts: generateUsers(50, "MS", "emt")
};

console.log(JSON.stringify(data, null, 2));
