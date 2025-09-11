"use client"
import React, { useEffect, useState } from 'react'
import TreeNode, { type MemberNode as Member } from '../components/TreeNode'
import { useRouter } from 'next/navigation'

// Member type is imported from TreeNode

const FamilyTree = () => {
    const router = useRouter()
    const [root, setRoot] = useState<Member | null>(null)
    const [members, setMembers] = useState<Member[]>([])

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

          const resRoot = await fetch('/api/member/root', { headers: { Authorization: `Bearer ${token}` } })
          if (!mounted) return
          if (resRoot.status === 401 || resRoot.status === 403) {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token')
            }
            router.replace('/login')
            return
          }
          if (resRoot.ok) {
            const data = await resRoot.json()
            setRoot(data?.root ?? null)
          }

          const resMembers = await fetch('/api/member', { headers: { Authorization: `Bearer ${token}` } })
          if (!mounted) return
          if (resMembers.ok) {
            const data = await resMembers.json()
            const list: Member[] = Array.isArray(data?.members) ? data.members : []
            setMembers(list.filter(m => m.relation !== 'self'))
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

    // Precompute nothing here; TreeNode will handle spouse/parents/children

  return (
    <div className='min-h-screen py-10 px-4'>
      <div className='flex flex-col items-center gap-6'>
        {root && (
          <TreeNode current={root} all={[root, ...members]} />
        )}
      </div>
    </div>
  )
}

export default FamilyTree
