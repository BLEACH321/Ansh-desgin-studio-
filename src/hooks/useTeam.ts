import { useState, useEffect } from 'react';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  socials: string[];
}

const DEFAULT_TEAM: TeamMember[] = [
  { id: '1', name: 'Nayan Parmar', role: 'Principal Designer', image: '/01.png', socials: ['INSTAGRAM', 'LINKEDIN'] },
  { id: '2', name: 'Ashwin Karelia', role: 'Sr. Associate Designer', image: '/ashwin.jpg', socials: ['LINKEDIN'] },
  { id: '3', name: 'Charuta Panchal', role: 'Sr. Interior Designer', image: '/charuta.jpg', socials: ['INSTAGRAM'] },
  { id: '4', name: 'Prashant Panchal', role: 'Visualizer', image: '/prashant.jpg', socials: [] },
  { id: '5', name: 'Amit Parmar', role: 'Technical Lead', image: '/amit.jpg', socials: [] },
  { id: '6', name: 'Rajesh Parmar', role: 'Site Supervisor', image: '/rajesh.png', socials: [] },
  { id: '7', name: 'Vipula Gaonkar', role: 'Sr. Interior Designer', image: '/vipula.png', socials: [] }
];


export const useTeam = () => {
  const [members, setMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('team_members');
    let current = saved ? JSON.parse(saved) : DEFAULT_TEAM;
    
    // Auto-sync: If user has empty data but we have defaults, use defaults
    if (saved && Array.isArray(current) && current.length === 0 && DEFAULT_TEAM.length > 0) {
      current = DEFAULT_TEAM;
    }

    // Auto-migrate: filter out Instagram from all members
    return current.map((m: TeamMember) => ({
      ...m,
      socials: (m.socials || []).filter(s => s !== 'INSTAGRAM')
    }));
  });

  const [deletedMembers, setDeletedMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('deleted_team_members');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('team_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('deleted_team_members', JSON.stringify(deletedMembers));
  }, [deletedMembers]);

  const addMember = (member: Omit<TeamMember, 'id'>) => {
    const newMember = { ...member, id: `member-${Date.now()}` };
    setMembers([newMember, ...members]);
  };

  const updateMember = (id: string, updated: Partial<TeamMember>) => {
    setMembers(members.map(m => m.id === id ? { ...m, ...updated } : m));
  };

  const deleteMember = (id: string) => {
    const memberToDelete = members.find(m => m.id === id);
    if (memberToDelete) {
      setDeletedMembers([memberToDelete, ...deletedMembers]);
      setMembers(members.filter(m => m.id !== id));
    }
  };

  const restoreMember = (id: string) => {
    const memberToRestore = deletedMembers.find(m => m.id === id);
    if (memberToRestore) {
      setMembers([memberToRestore, ...members]);
      setDeletedMembers(deletedMembers.filter(m => m.id !== id));
    }
  };

  const permanentlyDeleteMember = (id: string) => {
    setDeletedMembers(deletedMembers.filter(m => m.id !== id));
  };

  const restoreDefaultTeam = () => {
    setMembers(DEFAULT_TEAM);
    setDeletedMembers([]);
  };

  return { 
    members, 
    deletedMembers, 
    addMember, 
    updateMember, 
    deleteMember, 
    restoreMember, 
    permanentlyDeleteMember, 
    restoreDefaultTeam 
  };
};
