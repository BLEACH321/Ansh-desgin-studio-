import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export interface Project {
  id: string;
  title: string;
  category: string;
  type: 'interior' | 'graphics' | 'architecture';
  image: string;
  gallery: string[];
  desc: string;
  location?: string;
  year?: string;
  area?: string;
  size?: string;
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/projects.php`);
      // Map 'description' from PHP to 'desc' for frontend
      const mapped = res.data.map((p: any) => ({
        ...p,
        desc: p.description
      }));
      setProjects(mapped);
    } catch (e) {
      console.error("Error loading projects from PHP API:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const addProject = async (project: Omit<Project, 'id'>) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/projects.php`, project);
      setProjects(prev => [res.data, ...prev]);
      return res.data;
    } catch (e) {
      console.error("Error adding project via PHP:", e);
      throw e;
    }
  };

  const updateProject = async (id: string, updated: Partial<Project>) => {
    try {
      await axios.put(`${API_BASE_URL}/projects.php?id=${id}`, updated);
      setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    } catch (e) {
      console.error("Error updating project via PHP:", e);
      throw e;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/projects.php?id=${id}`);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      console.error("Error deleting project via PHP:", e);
      throw e;
    }
  };

  return { 
    projects, 
    loading,
    addProject, 
    updateProject, 
    deleteProject,
    refresh: loadProjects
  };
};
