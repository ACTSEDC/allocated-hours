/**
 * Utility to parse and feed data from a single master Excel/Google Sheet
 * into Students, Events, Hour Records, and Overview views.
 */

export function detectColumns(headers = []) {
  const findMatch = (patterns) => {
    for (const p of patterns) {
      const match = headers.find(h => p.test(h.trim()));
      if (match) return match;
    }
    return null;
  };

  const studentNameCol = findMatch([
    /^student\s*name$/i,
    /^full\s*name$/i,
    /^name$/i,
    /student.*name/i,
    /member.*name/i,
    /^student$/i,
  ]);

  const studentIdCol = findMatch([
    /^student\s*id$/i,
    /^roll\s*(no|num|number)?$/i,
    /^registration\s*(no|number)?$/i,
    /^id$/i,
    /student.*id/i,
  ]);

  const deptCol = findMatch([
    /^department$/i,
    /^dept$/i,
    /^branch$/i,
    /^course$/i,
    /^major$/i,
  ]);

  const emailCol = findMatch([
    /^email(\s*id)?$/i,
    /^mail$/i,
    /email/i,
  ]);

  const eventNameCol = findMatch([
    /^event\s*name$/i,
    /^event$/i,
    /^activity$/i,
    /^session$/i,
    /^program$/i,
    /^workshop$/i,
    /event.*title/i,
    /event/i,
  ]);

  const dateCol = findMatch([
    /^event\s*date$/i,
    /^date$/i,
    /date/i,
    /time/i,
  ]);

  const hoursCol = findMatch([
    /^allocated\s*hours?$/i,
    /^hours?$/i,
    /^duration(\s*hours?)?$/i,
    /^credits?$/i,
    /^points?$/i,
    /^pts$/i,
    /hours?/i,
  ]);

  const statusCol = findMatch([
    /^status$/i,
    /^attendance$/i,
    /^approval$/i,
  ]);

  return {
    studentNameCol,
    studentIdCol,
    deptCol,
    emailCol,
    eventNameCol,
    dateCol,
    hoursCol,
    statusCol,
  };
}

/**
 * Aggregate unique students from the single sheet
 */
export function extractStudentsFromSingleSheet(headers = [], rows = []) {
  const cols = detectColumns(headers);
  const nameCol = cols.studentNameCol || cols.studentIdCol;
  if (!nameCol) return { isAggregated: false, headers, rows };

  const studentMap = new Map();

  for (const row of rows) {
    const rawKey = (cols.studentIdCol && row[cols.studentIdCol]) || row[nameCol];
    if (!rawKey || String(rawKey).trim() === '') continue;
    const key = String(rawKey).trim().toLowerCase();

    if (!studentMap.has(key)) {
      studentMap.set(key, {
        id: cols.studentIdCol ? (row[cols.studentIdCol] || '-') : '-',
        name: cols.studentNameCol ? (row[cols.studentNameCol] || row[nameCol] || '-') : (row[nameCol] || '-'),
        department: cols.deptCol ? (row[cols.deptCol] || '-') : '-',
        email: cols.emailCol ? (row[cols.emailCol] || '-') : '-',
        totalHours: 0,
        eventCount: 0,
        events: new Set(),
      });
    }

    const student = studentMap.get(key);

    // Sum hours
    if (cols.hoursCol && row[cols.hoursCol]) {
      const h = parseFloat(row[cols.hoursCol]);
      if (!isNaN(h)) {
        student.totalHours += h;
      }
    }

    // Track events
    if (cols.eventNameCol && row[cols.eventNameCol]) {
      const ev = String(row[cols.eventNameCol]).trim();
      if (ev) {
        student.events.add(ev);
        student.eventCount = student.events.size;
      }
    } else {
      student.eventCount += 1;
    }
  }

  const aggregatedHeaders = ['Student Name'];
  if (cols.studentIdCol) aggregatedHeaders.push('Student ID');
  if (cols.deptCol) aggregatedHeaders.push('Department');
  if (cols.emailCol) aggregatedHeaders.push('Email');
  aggregatedHeaders.push('Events Attended', 'Total Hours Allocated');

  const aggregatedRows = Array.from(studentMap.values()).map(s => {
    const obj = {
      'Student Name': s.name,
      'Events Attended': s.eventCount,
      'Total Hours Allocated': Math.round(s.totalHours * 100) / 100,
    };
    if (cols.studentIdCol) obj['Student ID'] = s.id;
    if (cols.deptCol) obj['Department'] = s.department;
    if (cols.emailCol) obj['Email'] = s.email;
    return obj;
  });

  return {
    isAggregated: true,
    headers: aggregatedHeaders,
    rows: aggregatedRows,
    totalStudents: aggregatedRows.length,
    cols,
  };
}

/**
 * Aggregate unique events from the single sheet
 */
export function extractEventsFromSingleSheet(headers = [], rows = []) {
  const cols = detectColumns(headers);
  const evCol = cols.eventNameCol;
  if (!evCol) return { isAggregated: false, headers, rows };

  const eventMap = new Map();

  for (const row of rows) {
    const rawKey = row[evCol];
    if (!rawKey || String(rawKey).trim() === '') continue;
    const key = String(rawKey).trim().toLowerCase();

    if (!eventMap.has(key)) {
      eventMap.set(key, {
        name: String(rawKey).trim(),
        date: cols.dateCol ? (row[cols.dateCol] || '-') : '-',
        totalHours: 0,
        participants: new Set(),
      });
    }

    const ev = eventMap.get(key);

    // Sum hours
    if (cols.hoursCol && row[cols.hoursCol]) {
      const h = parseFloat(row[cols.hoursCol]);
      if (!isNaN(h)) {
        ev.totalHours += h;
      }
    }

    // Track participants
    const studentIdentifier = (cols.studentIdCol && row[cols.studentIdCol]) || 
                              (cols.studentNameCol && row[cols.studentNameCol]);
    if (studentIdentifier) {
      ev.participants.add(String(studentIdentifier).trim());
    }
  }

  const aggregatedHeaders = ['Event Name'];
  if (cols.dateCol) aggregatedHeaders.push('Date');
  aggregatedHeaders.push('Total Attendees', 'Total Hours Logged');

  const aggregatedRows = Array.from(eventMap.values()).map(e => {
    const obj = {
      'Event Name': e.name,
      'Total Attendees': e.participants.size,
      'Total Hours Logged': Math.round(e.totalHours * 100) / 100,
    };
    if (cols.dateCol) obj['Date'] = e.date;
    return obj;
  });

  return {
    isAggregated: true,
    headers: aggregatedHeaders,
    rows: aggregatedRows,
    totalEvents: aggregatedRows.length,
    cols,
  };
}

/**
 * Compute summary statistics from the single sheet
 */
export function computeSingleSheetStats(headers = [], rows = []) {
  const cols = detectColumns(headers);
  const students = extractStudentsFromSingleSheet(headers, rows);
  const events = extractEventsFromSingleSheet(headers, rows);

  let totalHours = 0;
  if (cols.hoursCol) {
    for (const r of rows) {
      const h = parseFloat(r[cols.hoursCol]);
      if (!isNaN(h)) {
        totalHours += h;
      }
    }
  }

  return {
    totalRecords: rows.length,
    uniqueStudents: students.isAggregated ? students.totalStudents : 0,
    uniqueEvents: events.isAggregated ? events.totalEvents : 0,
    totalHours: Math.round(totalHours * 100) / 100,
    avgHoursPerStudent: students.isAggregated && students.totalStudents > 0 
      ? Math.round((totalHours / students.totalStudents) * 10) / 10 
      : 0,
    cols,
  };
}

