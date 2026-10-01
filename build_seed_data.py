import openpyxl
import json
import hashlib

wb = openpyxl.load_workbook(r'C:\Users\sirpa\Downloads\Team Details.xlsx')
ws_part = wb['All Participants']
headers = [ws_part.cell(1, c).value for c in range(1, ws_part.max_column+1)]

rows = []
for r in range(2, ws_part.max_row+1):
    vals = [ws_part.cell(r, c).value for c in range(1, ws_part.max_column+1)]
    if any(v is not None for v in vals):
        row_dict = dict(zip(headers, vals))
        rows.append(row_dict)

print(f"Total participants read: {len(rows)}")

teams_map = {}
for p in rows:
    tid = str(p['Team ID']).strip()
    tname = str(p['Team Name']).strip()
    if tid not in teams_map:
        teams_map[tid] = {
            'id': tid,
            'teamName': tname,
            'category': str(p.get('Project Category') or 'Software').strip(),
            'paymentStatus': str(p.get('Team Payment Status') or 'Paid').strip(),
            'members': []
        }
    
    reg_no = str(p.get('Roll Number / Reg ID') or '').strip()
    email = str(p.get('Email') or '').strip().lower()
    if not email and reg_no:
        email = f"{reg_no}@klu.ac.in"
    elif email and not email.endswith('@klu.ac.in'):
        # ensure standard format if needed
        pass

    member = {
        'name': str(p.get('Participant Name') or '').strip(),
        'regNo': reg_no,
        'email': email,
        'department': str(p.get('Department') or '').strip(),
        'year': str(p.get('Year') or '').strip(),
        'role': str(p.get('Role') or 'Member').strip(),
        'phone': str(p.get('Phone') or '').strip(),
        'gender': str(p.get('Gender') or '').strip(),
        'residentType': str(p.get('Resident Type') or '').strip(),
        'hostelName': str(p.get('Hostel Name') or '').strip(),
    }
    teams_map[tid]['members'].append(member)

# Build sorted teams
sorted_team_ids = sorted(teams_map.keys(), key=lambda x: int(x.split('-')[1]) if '-' in x and x.split('-')[1].isdigit() else x)

final_teams = []
for tid in sorted_team_ids:
    t = teams_map[tid]
    # deterministic secure qrToken
    token_suffix = hashlib.md5(f"kheprix_{tid}_{t['teamName']}".encode()).hexdigest()[:8].upper()
    qr_token = f"KHX_QR_{tid}_{token_suffix}"
    team_obj = {
        'id': t['id'],
        'teamName': t['teamName'],
        'members': t['members'],
        'qrToken': qr_token,
        'createdAt': '2026-10-02T05:00:00.000Z',
        'problemStatementSubmitted': False,
        'pptSubmitted': False,
        'category': t['category'],
        'paymentStatus': t['paymentStatus']
    }
    final_teams.append(team_obj)

print(f"Generated {len(final_teams)} teams.")
for ft in final_teams:
    print(f"  {ft['id']} - {ft['teamName']} ({len(ft['members'])} members)")

# Save to KHEPRIX_Teamwise.json and write to seeded-teams.ts
with open('KHEPRIX_Teamwise.json', 'w', encoding='utf-8') as f:
    json.dump(final_teams, f, indent=2)

ts_content = f"""import {{ Team }} from "./types";

export const SEEDED_TEAMS: Team[] = {json.dumps(final_teams, indent=2)};
"""

with open('src/lib/seeded-teams.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print("Successfully written to KHEPRIX_Teamwise.json and src/lib/seeded-teams.ts")
