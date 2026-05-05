import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';

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

  useEffect(() => {
    // Real-time synchronization with Firestore
    const q = query(collection(db, 'team'), orderBy('name', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const membersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TeamMember[];
      setMembers(membersData);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addMember = async (member: Omit<TeamMember, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'team'), member);
      return docRef.id;
    } catch (e) {
      console.error("Error adding member to Firebase:", e);
      throw e;
    }
  };

  const updateMember = async (id: string, updated: Partial<TeamMember>) => {
    try {
      const memberRef = doc(db, 'team', id);
      await updateDoc(memberRef, updated);
    } catch (e) {
      console.error("Error updating member in Firebase:", e);
      throw e;
    }
  };

  const deleteMember = async (id: string) => {
    try {
      const memberRef = doc(db, 'team', id);
      await deleteDoc(memberRef);
    } catch (e) {
      console.error("Error deleting member from Firebase:", e);
      throw e;
    }
  };

  return { 
    members, 
    loading,
    addMember, 
    updateMember, 
    deleteMember 
  };
};
