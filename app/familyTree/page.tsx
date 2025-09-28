'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MemberCard from '../components/MemberCard';

export interface MemberData {
  _id: string;
  name: string;
  imageUrl?: string;
  relation?: string;
}

const FamilyTree = () => {
  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('/api/member/root', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch member data');
        }

        const responseData = await response.json();
        console.log("API Response:", responseData);
        
        // Extract the root member data from the response
        const rootMember = responseData.root;
        console.log("Root member:", rootMember);
        
        setMember({
          _id: rootMember._id,
          name: rootMember.name,
          imageUrl: rootMember.imageUrl,
          relation: rootMember.relation
        });
      } catch (error) {
        console.error('Error fetching member data:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [router]);

  const handleAddMember = () => {
    console.log('Add member:', member?._id);
  };

  const handleEdit = () => {
    console.log('Edit member:', member?._id);
  };

  const handleDelete = () => {
    console.log('Delete member:', member?._id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse">
          <div className="h-64 w-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!member) {
    return null;
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <MemberCard
        name={member.name}
        imageUrl={member.imageUrl}
        relation={member.relation}
        memberId={member._id}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddMember={handleAddMember}
      />
    </div>
  );
};

export default FamilyTree;
