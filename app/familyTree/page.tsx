"use client"
import React, { useEffect, useState } from 'react'
import MemberCard from '../components/card'
import { useRouter } from 'next/navigation'

interface UserDataProps {
    name: string;
    imageUrl: string;
}

const FamilyTree = () => {
    const router = useRouter()
    const [user, setUser] = useState<UserDataProps | null>(null)

    useEffect(() => {
      let mounted = true
      ;(async () => {
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
          if (!token) {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token')
            }
            router.replace('/login')
            return
          }
          const res = await fetch('/api/user', { headers: { Authorization: `Bearer ${token}` } })
          if (!mounted) return
          if (res.status === 401 || res.status === 403) {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token')
            }
            router.replace('/login')
          }
          if (res.ok) {
            const data = await res.json()
            const u = data?.user
            setUser({ name: u?.name ?? "", imageUrl: u?.imageUrl ?? "" })
          }
        } catch {
          // ignore
        }
      })()
      return () => { mounted = false }
    }, [router])

  return (
    <div className='flex justify-center items-center h-screen'>
      <MemberCard
  name={user?.name || ""}
  imageUrl={user?.imageUrl || ""}
  onEdit={() => console.log("edit")}
  onDelete={() => console.log("delete")}
  onAdd={() => console.log("add member")}
/>
    </div>
  )
}

export default FamilyTree
