import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { initialProjects } from '../data/initialProjects';

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
  const [deletedProjects, setDeletedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/projects.php?t=${Date.now()}`);
      if (res.data && Array.isArray(res.data)) {
        const cleanUrl = (url: string) => {
          if (!url) return url;
          if (url.startsWith('data:')) return url;
          const uploadsIdx = url.indexOf('uploads/');
          if (uploadsIdx !== -1) {
            return `${API_BASE_URL}/${url.substring(uploadsIdx)}`;
          }
          return url;
        };
        setProjects(res.data.map((p: any) => ({ 
          ...p, 
          desc: p.description || '',
          image: cleanUrl(p.image),
          gallery: Array.isArray(p.gallery) ? p.gallery.map(cleanUrl) : []
        })));
      } else {
        setProjects([]);
      }
    } catch (e) {
      console.error("Error loading projects:", e);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const addProject = async (project: Omit<Project, 'id'>) => {
    const res = await axios.post(`${API_BASE_URL}/projects.php`, project);
    await loadProjects();
    return res.data;
  };

  const updateProject = async (id: string, updated: Partial<Project>) => {
    await axios.post(`${API_BASE_URL}/projects.php?id=${id}&action=update`, updated);
    await loadProjects();
  };

  const deleteProject = async (id: string) => {
    const projectToDelete = projects.find(p => p.id === id);
    if (projectToDelete) setDeletedProjects(prev => [projectToDelete, ...prev]);
    await axios.post(`${API_BASE_URL}/projects.php?id=${id}&action=delete`);
    await loadProjects();
  };

  const restoreProject = async (project: Project) => {
    const { id: _, ...data } = project;
    await addProject(data);
    setDeletedProjects(prev => prev.filter(p => p.id !== project.id));
  };

  const permanentlyDeleteProject = (id: string) => {
    setDeletedProjects(prev => prev.filter(p => p.id !== id));
  };

  return { 
    projects, 
    deletedProjects,
    loading,
    addProject, 
    updateProject, 
    deleteProject,
    restoreProject,
    permanentlyDeleteProject
  };
};
