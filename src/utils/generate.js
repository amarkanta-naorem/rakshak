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
  return "+91" + Math.floor(Math.random() * 9000000000 + 6000000000);
}

function getRandomReason() {
  const reasons = ["Family emergency", "Medical issue", "Personal reason", "Out of town", "Health checkup",
                   "Car breakdown", "Power outage", "Internet issue", "Feeling sick", "Bad weather"];
  return reasons[Math.floor(Math.random() * reasons.length)];
}

function getRandomDateTime(baseDate) {
  const hour = Math.floor(Math.random() * 24);
  const min = Math.floor(Math.random() * 60);
  const dateTime = new Date(baseDate);
  dateTime.setUTCHours(hour, min, 0, 0);
  return dateTime;
}

function toISOStringZ(date) {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

function calculateHours(start, end) {
  let ms = end.getTime() - start.getTime();
  if (ms < 0) ms += 24 * 60 * 60 * 1000;
  return (ms / (1000 * 60 * 60)).toFixed(2);
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function generateAttendance() {
  const attendance = [];
  const today = new Date();
  const startDate = new Date("2025-01-01");

  while (startDate <= today) {
    const status = Math.random() < 0.9 ? "present" : "absent";
    const punchIn = getRandomDateTime(startDate);
    let punchOut = getRandomDateTime(startDate);
    if (punchOut <= punchIn) punchOut.setTime(punchIn.getTime() + Math.floor(Math.random() * 8 + 1) * 60 * 60 * 1000);

    attendance.push({
      date: formatDate(startDate),
      status,
      reason: status === "absent" ? getRandomReason() : "",
      punchIn: toISOStringZ(punchIn),
      punchOut: toISOStringZ(punchOut),
      totalWorkingHour: calculateHours(punchIn, punchOut),
      ambulanceNumber: `AMB${Math.floor(1000 + Math.random() * 9000)}`
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
      attendance: generateAttendance()
    });
  }
  return users;
}

const data = {
  drivers: generateUsers(50, 'DRV', 'driver'),
  emts: generateUsers(30, 'MS', 'emt')
};

console.log(JSON.stringify(data, null, 2));
