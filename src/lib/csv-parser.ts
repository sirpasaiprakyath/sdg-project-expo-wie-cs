import Papa from 'papaparse';
import { Team, TeamMember } from './types';
import { SEEDED_TEAMS } from './seeded-teams';

export interface CSVRow {
  'Team ID'?: string;
  'Team ID '?: string;
  'TeamID'?: string;
  'team_id'?: string;
  'Team Name'?: string;
  'Team Name '?: string;
  'team_name'?: string;

  'Student 1 Name'?: string;
  'Student 1 Registration Number'?: string;
  'Student 1 Email'?: string;
  'Student 1 Department'?: string;
  'Student 1 Year'?: string;

  'Student 2 Name'?: string;
  'Student 2 Registration Number'?: string;
  'Student 2 Email'?: string;
  'Student 2 Department'?: string;
  'Student 2 Year'?: string;

  'Student 3 Name'?: string;
  'Student 3 Registration Number'?: string;
  'Student 3 Email'?: string;
  'Student 3 Department'?: string;
  'Student 3 Year'?: string;

  'Student 4 Name'?: string;
  'Student 4 Registration Number'?: string;
  'Student 4 Email'?: string;
  'Student 4 Department'?: string;
  'Student 4 Year'?: string;

  [key: string]: any;
}

export interface CSVParseResult {
  teams: Team[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateTeamIds: string[];
  duplicateEmails: string[];
  missingDataCount: number;
  errors: string[];
}

export function parseTeamsCSV(csvString: string): CSVParseResult {
  const parsed = Papa.parse<CSVRow>(csvString, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (header) => header.trim(),
  });

  const teams: Team[] = [];
  const seenTeamIds = new Set<string>();
  const seenEmails = new Set<string>();
  const duplicateTeamIds: string[] = [];
  const duplicateEmails: string[] = [];
  const errors: string[] = [];

  let validRows = 0;
  let invalidRows = 0;
  let missingDataCount = 0;

  parsed.data.forEach((row, index) => {
    const rawTeamId = row['Team ID'] || row['TeamID'] || row['team_id'] || row['Team ID '];
    const rawTeamName = row['Team Name'] || row['team_name'] || row['Team Name '];

    if (!rawTeamId || !rawTeamName) {
      invalidRows++;
      missingDataCount++;
      errors.push(`Row ${index + 1}: Missing Team ID or Team Name.`);
      return;
    }

    const teamId = rawTeamId.trim();
    const teamName = rawTeamName.trim();

    if (seenTeamIds.has(teamId)) {
      duplicateTeamIds.push(teamId);
      errors.push(`Row ${index + 1}: Duplicate Team ID "${teamId}".`);
    } else {
      seenTeamIds.add(teamId);
    }

    const members: TeamMember[] = [];

    // Extract up to 4 members
    for (let i = 1; i <= 4; i++) {
      const nameKey = `Student ${i} Name`;
      const regKey = `Student ${i} Registration Number`;
      const emailKey = `Student ${i} Email`;
      const deptKey = `Student ${i} Department`;
      const yearKey = `Student ${i} Year`;

      const name = (row[nameKey] || row[`Student${i}_Name`] || '').toString().trim();
      const regNo = (row[regKey] || row[`Student${i}_RegNo`] || '').toString().trim();
      const email = (row[emailKey] || row[`Student${i}_Email`] || '').toString().trim().toLowerCase();
      const department = (row[deptKey] || row[`Student${i}_Dept`] || '').toString().trim();
      const year = (row[yearKey] || row[`Student${i}_Year`] || '').toString().trim();

      if (name || regNo || email) {
        if (email) {
          if (seenEmails.has(email)) {
            duplicateEmails.push(email);
          } else {
            seenEmails.add(email);
          }
        }

        members.push({
          name: name || `Student ${i}`,
          regNo: regNo || `23KLU${Math.floor(1000 + Math.random() * 9000)}`,
          email: email || `student${i}.${teamId.toLowerCase()}@klu.ac.in`,
          department: department || 'CSE',
          year: year || '3rd Year',
        });
      }
    }

    if (members.length === 0) {
      invalidRows++;
      missingDataCount++;
      errors.push(`Row ${index + 1} (${teamId}): No student members found.`);
      return;
    }

    validRows++;

    const secureHash = Math.random().toString(36).substring(2, 10).toUpperCase();
    const qrToken = `SDG_QR_${teamId}_${secureHash}`;

    teams.push({
      id: teamId, // EXACT Team ID preserved
      teamName,
      members,
      qrToken,
      createdAt: new Date().toISOString(),
      problemStatementSubmitted: false,
      pptSubmitted: false,
    });
  });

  return {
    teams,
    totalRows: parsed.data.length,
    validRows,
    invalidRows,
    duplicateTeamIds: Array.from(new Set(duplicateTeamIds)),
    duplicateEmails: Array.from(new Set(duplicateEmails)),
    missingDataCount,
    errors,
  };
}

export function generateSampleTeamsCSV(): string {
  const sampleRows = SEEDED_TEAMS.map((t) => {
    const row: Record<string, string> = {
      'Team ID': t.id,
      'Team Name': t.teamName,
    };

    t.members.forEach((m, idx) => {
      const num = idx + 1;
      row[`Student ${num} Name`] = m.name;
      row[`Student ${num} Registration Number`] = m.regNo;
      row[`Student ${num} Email`] = m.email;
      row[`Student ${num} Department`] = m.department;
      row[`Student ${num} Year`] = m.year;
    });

    return row;
  });

  return Papa.unparse(sampleRows);
}
