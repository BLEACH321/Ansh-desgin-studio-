import { useState, useEffect } from 'react';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  socials: string[];
}

const DEFAULT_TEAM: TeamMember[] = [];


export const useTeam = () => {
  const [members, setMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('team_members');
    const current = saved ? JSON.parse(saved) : DEFAULT_TEAM;
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
