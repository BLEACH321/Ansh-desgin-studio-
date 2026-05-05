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
  const [loading, setLoading] = useState(true);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/team.php`);
      setMembers(res.data);
    } catch (e) {
      console.error("Error loading team members from PHP API:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const addMember = async (member: Omit<TeamMember, 'id'>) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/team.php`, member);
      setMembers(prev => [res.data, ...prev]);
      return res.data;
    } catch (e) {
      console.error("Error adding member via PHP:", e);
      throw e;
    }
  };

  const updateMember = async (id: string, updated: Partial<TeamMember>) => {
    try {
      await axios.put(`${API_BASE_URL}/team.php?id=${id}`, updated);
      setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updated } : m));
    } catch (e) {
      console.error("Error updating member via PHP:", e);
      throw e;
    }
  };

  const deleteMember = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/team.php?id=${id}`);
      setMembers(prev => prev.filter(m => m.id !== id));
    } catch (e) {
      console.error("Error deleting member via PHP:", e);
      throw e;
    }
  };

  return { 
    members, 
    loading,
    addMember, 
    updateMember, 
    deleteMember,
    refresh: loadMembers 
  };
};
