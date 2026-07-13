import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  socials: string[];
}

export const useTeam = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [deletedMembers, setDeletedMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTeam = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/team.php?t=${Date.now()}`);
      if (res.data && Array.isArray(res.data)) {
        const cleanUrl = (url: string) => {
          if (!url) return url;
          if (url.includes('anshdesignstudio.com/uploads/') && !url.includes('api.anshdesignstudio.com')) {
            return url.replace('anshdesignstudio.com/uploads/', 'api.anshdesignstudio.com/uploads/');
          }
          return url;
        };
        setMembers(res.data.map((m: any) => ({
          ...m,
          image: cleanUrl(m.image)
        })));
      } else {
        setMembers([]);
      }
    } catch (e) {
      console.error("Error loading team:", e);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const addMember = async (member: Omit<TeamMember, 'id'>) => {
    const res = await axios.post(`${API_BASE_URL}/team.php`, member);
    await loadTeam();
    return res.data;
  };

  const updateMember = async (id: string, updated: Partial<TeamMember>) => {
    await axios.put(`${API_BASE_URL}/team.php?id=${id}`, updated);
    await loadTeam();
  };

  const deleteMember = async (id: string) => {
    const memberToDelete = members.find(m => m.id === id);
    if (memberToDelete) setDeletedMembers(prev => [memberToDelete, ...prev]);
    await axios.delete(`${API_BASE_URL}/team.php?id=${id}`);
    await loadTeam();
  };

  const restoreMember = async (id: string) => {
    const member = deletedMembers.find(m => m.id === id);
    if (member) {
      const { id: _, ...data } = member;
      await addMember(data);
      setDeletedMembers(prev => prev.filter(m => m.id !== id));
    }
  };

  const permanentlyDeleteMember = (id: string) => {
    setDeletedMembers(prev => prev.filter(m => m.id !== id));
  };

  const restoreDefaultTeam = async () => {
    // Logic to restore defaults if needed
  };

  return { 
    members, 
    deletedMembers,
    loading,
    addMember, 
    updateMember, 
    deleteMember,
    restoreMember,
    permanentlyDeleteMember,
    restoreDefaultTeam
  };
};
