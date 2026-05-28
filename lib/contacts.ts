// Generated from TANC Contacts.csv.
export const ENGINEER_CONTACTS = [
  { name: 'Shelton Bryant', email: 'sheltonbryant@lsu.edu' },
  { name: 'Azim Ashraf', email: 'aashraf@lsu.edu' },
  { name: 'Jody Mills', email: 'jmills@lsu.edu' },
  { name: 'Michael Raymond', email: 'mraymond@lsu.edu' },
  { name: 'Zachary Morales', email: 'zmorales@lsu.edu' },
  { name: 'Taylor Cranford', email: 'tcranf3@lsu.edu' },
  { name: 'TANC Staff', email: 'tanc@lsu.edu' },
] as const

export type EngineerContact = (typeof ENGINEER_CONTACTS)[number]
