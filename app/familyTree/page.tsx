"use client"
import React, { useEffect, useState } from 'react'
import FamilyTree, { type RawMember } from '../components/FamilyTree'
import { useRouter } from 'next/navigation'

const FamilyTreePage = () => {
  const router = useRouter()
  const [members, setMembers] = useState<RawMember[]>([])

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        if (!token) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
          }
          router.replace('/login')
          return
        }

        // Ensure root exists (server will create if missing)
        const resRoot = await fetch('/api/member/root', { headers: { Authorization: `Bearer ${token}` } })
        if (!mounted) return
        if (resRoot.status === 401 || resRoot.status === 403) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
          }
          router.replace('/login')
          return
        }

        // Fetch all members (includes root)
        const resMembers = await fetch('/api/member', { headers: { Authorization: `Bearer ${token}` } })
        if (!mounted) return
        if (resMembers.ok) {
          const data = await resMembers.json()
          const list: RawMember[] = Array.isArray(data?.members) ? data.members : []
          setMembers(list)
        }
      } catch {
        // ignore
      }
    }

    load()

    const handler = () => { load() }
    if (typeof window !== 'undefined') {
      window.addEventListener('member:changed', handler)
    }

    return () => {
      mounted = false
      if (typeof window !== 'undefined') {
        window.removeEventListener('member:changed', handler)
      }
    }
  }, [router])

  return (
    <div className='min-h-screen py-10 px-4'>
      <div className='flex flex-col items-center gap-6'>
        <FamilyTree rawMembers={members} />
      </div>
    </div>
  )
}

export default FamilyTreePage
